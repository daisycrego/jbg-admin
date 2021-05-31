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

function start() {
  // Connect to the named work queue
  let workQueue = new Queue("work", REDIS_URL);

  workQueue.process(maxJobsPerWorker, async (job) => {
    // This is an example job that just slowly reports on progress
    // while doing no work. Replace this with your own job logic.
    if (!job.data || !job.data.uri) {
      console.log(`Missing job data or event URI.`);
      return;
    }

    const existingEvents = await Event.find({
      eventId: job.data.eventId,
    }).countDocuments();

    if (!existingEvents) {
      try {
        let personData;
        let isNewLead;
        let isZillowEvent;
        let isPossibleZillowExemption;

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
            console.log(
              `This is an existing lead, created: ${leadCreatedDate}`
            );
          }

          const isZillowEvent = eventData.source
            .toLowerCase()
            .includes("zillow")
            ? true
            : false;

          if (isZillowEvent && !isNewLead) {
            console.log(`Possible Zillow Exemption -> Sending email alert`);

            isPossibleZillowExemption = true;

            const text = `Possible Zillow Exemption Identified
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
            `;

            const html = `
            <div>
                <h2> Possible Zillow Exemption Identified </h2>
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
                    <li> Property URL: ${eventData.property.url} </li>
                </ul>


                <h3> Person Details </h3>
                <ul>
                <li> Person ID: ${personData.id} </li>
                <li> Created: ${personData.created} </li>
                <li> Updated: ${personData.updated} </li>
                <li> Created via: ${personData.createdVia} </li>
                <li> Last activity: ${personData.lastActivity} </li>
                <li> Name: ${personData.name} </li>
                <li> Emails: ${personData.emails} </li>
                <li> Phones: ${personData.phones} </li>
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
                to: "daisycrego@gmail.com, cregodev7@gmail.com", // list of receivers
                subject: "Possible Zillow Exemption", // Subject line
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
            event.isZillowEvent = isZillowEvent;
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
            isZillowEvent: isZillowEvent,
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
  });
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });
