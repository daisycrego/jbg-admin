let throng = require("throng");
let Queue = require("bull");
let Event = require("./server/models/event.model");
let Log = require("./server/models/log.model");
const config = require("./config/config");
const mongoose = require("mongoose");
const { fubGET } = require("./fetch-fub");
const nodemailer = require("nodemailer");
const { connect } = require("./db");

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // generated ethereal user
    pass: process.env.SMTP_PASS, // generated ethereal password
  },
});

function isDateBeforeToday(date) {
  const now = new Date();
  return date.getUTCDate() < now.getUTCDate();
}

// connect to the database
connect();

// Connect to a local redis instance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
let workers = process.env.WEB_CONCURRENCY || 2;

// The maximum number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
let maxJobsPerWorker = 50;

const processLead = async (job) => {
  const existingLeads = await Lead.find({
    id: job.data.eventId,
  }).countDocuments();
  let leadData;
  if (!existingLeads) {
    try {
      const lead = new Lead({
        id: job.data.eventId,
        resourceIds: job.data.resourceIds,
        uri: job.data.uri,
        processed: false,
      });
      await lead.save();
      leadData = await fubPersonGET(lead.uri);
      if (personData) {
        try {
          lead.updated = personData.updated;
          lead.created = personData.created;
          lead.name = personData.name;
          lead.firstName = personData.firstName;
          lead.lastName = personData.lastName;
          lead.lastActivity = personData.lastActivity;
          lead.price = personData.price;
          lead.stage = personData.stage;
          lead.source = personData.source;
          lead.delayed = personData.delayed;
          lead.contacted = personData.contacted;
          lead.assignedLenderId = personData.assignedLenderId;
          lead.assignedLenderName = personData.assignedLenderName;
          lead.assignedUserId = personData.assignedUserId;
          lead.assignedPondId = persnData.assignedPondId;
          lead.assignedTo = personData.assignedTo;
          lead.tags = personData.tags;
          lead.emails = personData.emails;
          lead.phones = personData.phones;
          lead.addresses = personData.addresses;
          lead.picture = personData.picture;
          lead.socialData = personData.socialData;
          lead.claimed = personData.claimed;
          lead.firstToClaimOffer = personData.firstToClaimOffer;
          lead.collaborators = personData.collaborators;
          lead.teamLeaders = personData.teamLeaders;
          lead.pondMembers = personData.pondMembers;
          lead.processed = true;
          lead.processedAt = new Date();
          lead.save();
        } catch (err) {
          console.log(err);
          console.log(`Error updating the lead`);
        }
      } else {
        console.log(
          `Failed to fetch additional lead data for lead ${job.data.eventId} from ${job.data.uri}.`
        );
      }

      try {
        const log = new Log({
          eventId: job.data.eventId,
          eventCreated: lead.created,
          resourceIds: job.data.resourceIds,
          uri: job.data.uri,
          eventData: leadData,
          personId: leadData.id,
          personData: personData ? personData : null,
          isNewLead: isNewLead,
          isZillowFlexEvent: isZillowFlexEvent,
          isPossibleZillowExemption: isPossibleZillowExemption,
        });
        await log.save();
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return { status: "Lead processed successfully" };
};

const processEvent = async (job) => {
  const existingEvents = await Event.find({
    eventId: job.data.eventId,
  }).countDocuments();

  let personData;
  let isNewLead;
  let isZillowFlexEvent;
  let isPossibleZillowExemption;

  if (!existingEvents) {
    try {
      const event = new Event({
        eventId: job.data.eventId,
        resourceIds: job.data.resourceIds,
        uri: job.data.uri,
        processed: false,
      });
      await event.save();
      const eventData = await fubGET(job.data.uri);
      if (eventData) {
        // ask Dan if he wants to also maintain the leads in our own database...

        personData = await fubGET(
          `https://api.followupboss.com/v1/people/${eventData.personId}`
        );

        let leadCreatedDate;
        try {
          leadCreatedDate = new Date(personData.created.split("T")[0]);
        } catch (err) {
          console.log(err);
          leadCreatedDate = new Date(personData.created);
        }

        // How to create a test date using the same date formatting
        /*
        const dateString = "2021-05-31T21:46:02+00:00".split("T")[0];
        console.log(`dateString: ${dateString}`);
        const testLeadCreatedDate = new Date(dateString);
        */

        isNewLead = !isDateBeforeToday(leadCreatedDate);
        if (isNewLead) {
          console.log(`This is a new lead, created: ${leadCreatedDate}`);
        } else {
          console.log(`This is an existing lead, created: ${leadCreatedDate}`);
        }

        const isZillowFlexEvent = eventData.source
          .toLowerCase()
          .includes("zillow flex")
          ? true
          : false;

        if (isZillowFlexEvent && !isNewLead) {
          console.log(`Possible Zillow Flex Exemption -> Sending email alert`);

          isPossibleZillowExemption = true;

          const text = `Possible Zillow Flex Exemption Identified
              Zillow Property URL: ${eventData.property.url}
              FUB URL: https://jillkbiggs.followupboss.com/2/people/view/${eventData.personId}
              Zillow Premier Agent URL: ${personData.sourceUrl}

              Event Details:
              Event ID: ${event.eventId}
              Resource IDs: ${event.resourceIds}
              Event URI: ${event.resourceIds}
              Event type: ${eventData.type}
              Event source: ${eventData.source}
              Property id: ${eventData.property.id}
              Property street: ${eventData.property.street}
              Property city: ${eventData.property.city}
              Property state: ${eventData.property.state}
              Property zipcode: ${eventData.property.code}
              Property MLS: ${eventData.property.mlsNumber}
              Property Price: ${eventData.property.price}
              Property for Rent: ${eventData.property.forRent}
              Property URL: ${eventData.property.url}

              Person Details:
              Person ID: ${personData.id}
              Created: ${personData.created}
              Updated: ${personData.updated}
              Created via: ${personData.createdVia}
              Last activity: ${personData.lastActivity}
              Name: ${personData.name}
              Emails: ${personData.emails}
              Phones: ${personData.phones}
              Stage: ${personData.stage}
              Source: ${personData.source}
              Source URL: ${personData.sourceUrl}
              Price: ${personData.price}
              Assigned to: ${personData.assignedTo}
              View this lead on FUB: https://jillkbiggs.followupboss.com/2/people/view/${eventData.personId}
          `;

          const html = `
          <div>
              <h2> Possible Zillow Flex Exemption Identified </h2>
              <p> Zillow Property URL: ${eventData.property.url} </p>
              <p> FUB URL: https://jillkbiggs.followupboss.com/2/people/view/${eventData.personId} </p>
              <p> Zillow Premier Agent URL: ${personData.sourceUrl} </p>
              <h3> Event Details </h3>
              <ul>
                  <li> Event ID: ${event.eventId} </li>
                  <li> Event type: ${eventData.type} </li>
                  <li> Event source: ${eventData.source} </li>
                  <li> Property id: ${eventData.property.id} </li>
                  <li> Property street: ${eventData.property.street} </li>
                  <li> Property city: ${eventData.property.city} </li>
                  <li> Property state: ${eventData.property.state} </li>
                  <li> Property zipcode: ${eventData.property.code} </li>
                  <li> Property MLS: ${eventData.property.mlsNumber} </li>
                  <li> Property Price: ${eventData.property.price} </li>
                  <li> Property for Rent: ${eventData.property.forRent} </li>
              </ul>


              <h3> Person Details </h3>
              <ul>
              <li> Person ID: ${personData.id} </li>
              <li> Created: ${personData.created} </li>
              <li> Updated: ${personData.updated} </li>
              <li> Created via: ${personData.createdVia} </li>
              <li> Last activity: ${personData.lastActivity} </li>
              <li> Name: ${personData.name} </li>
              <li> Stage: ${personData.stage} </li>
              <li> Source: ${personData.source} </li>
              <li> Source URL: ${personData.sourceUrl} </li>
              <li> Price: ${personData.price} </li>
              <li> Assigned to: ${personData.assignedTo} </li>
              
              </ul>
          </div>
          `;

          try {
            // send mail with defined transport object
            let info = await transporter.sendMail({
              from: '"cregodev7@gmail.com', // sender address
              to: "daisycrego@gmail.com, cregodev7@gmail.com, dan@jillbiggsgroup.com, support@jillbiggsgroup.com", // list of receivers
              subject: "Possible Zillow Flex", // Subject line
              text: text, // plain text body
              html: html, // html body
            });
          } catch (err) {
            console.log(err);
          }
        } else {
          isPossibleZillowExemption = false;
          console.log(
            `No Zillow Exemption identified, still saving the event data.`
          );
        }

        try {
          event.isNewLead = isNewLead;
          event.isZillowFlexEvent = isZillowFlexEvent;
          event.isPossibleZillowExemption = isPossibleZillowExemption;
          event.source = eventData.source;
          event.created = eventData.created;
          event.personId = eventData.personId;
          event.person = personData;
          event.property = eventData.property;
          event.type = eventData.type;
          event.message = eventData.message;
          event.propertyId = eventData.property.id;
          event.processed = true;
          event.processedAt = new Date();
          event.save();
        } catch (err) {
          console.log(err);
          console.log(`Error updating the event`);
        }
      } else {
        console.log(
          `Failed to fetch additional event data for event ${job.data.eventId} from ${job.data.uri}.`
        );
      }

      try {
        const log = new Log({
          eventId: event.eventId,
          eventCreated: event.created,
          resourceIds: job.data.resourceIds,
          uri: job.data.uri,
          eventData: eventData,
          personId: eventData.personId,
          personData: personData ? personData : null,
          isNewLead: isNewLead,
          isZillowFlexEvent: isZillowFlexEvent,
          isPossibleZillowExemption: isPossibleZillowExemption,
        });
        await log.save();
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    try {
      const log = new Log({
        eventId: job.data.eventId,
        eventCreated: job.data.eventCreated,
        resourceIds: job.data.resourceIds,
        uri: job.data.uri,
        errorMessage: `This event already exists in our DB, skipping it!`,
      });
      log.save();
    } catch (err) {
      console.log(err);
    }
    console.log(`This event already exists in our DB, skipping it!`);
  }
  progress = 100;
  job.progress(progress);

  // A job can return values that will be stored in Redis as JSON
  // This return value is unused
  return { status: "Event processed successfully" };
};

function start() {
  // Connect to the named work queue
  let workQueue = new Queue("work", REDIS_URL);

  workQueue.process(maxJobsPerWorker, async (job) => {
    if (!job.data || !job.data.uri) {
      console.log(`Missing job data or event URI.`);
      return;
    }

    try {
      switch (job.data.event) {
        case "eventCreated":
          await processEvent(job);
          break;
        case "peopleCreated":
          await processLead(job);
          break;
      }
    } catch (err) {
      console.log(err);
    }
  });
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });
