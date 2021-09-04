let throng = require("throng");
let Queue = require("bull");
let Event = require("./server/models/event.model");
let Log = require("./server/models/log.model");
const { fubGET } = require("./lib/fetch-fub");
const nodemailer = require("nodemailer");
const { connect } = require("./db");

let smtpTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function isDateBeforeToday(date) {
  const now = new Date();
  return date.getUTCDate() < now.getUTCDate();
}

// connect to the database
connect();

// Connect to redis instance
let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// https://devcenter.heroku.com/articles/node-concurrency
let workers = process.env.WEB_CONCURRENCY || 2;

// The maximum number of jobs each worker should process at once. Tuning: If each job is mostly waiting on network
// responses it can be much higher. If each job is CPU-intensive, it might need to be much lower.
let maxJobsPerWorker = 50;

function start() {
  // Connect to the redis work queue
  let workQueue = new Queue("work", REDIS_URL);

  // Worker - each job:
  // 1.) Checks if the Event has already been processed. If yes, generates a Log and stops processing.
  // 2.) Checks if the Event represents a possible Zillow Flex exemption. (Queries FUB API for the Person Data, checks if this is a New Lead from Zillow Flex). If yes, sends an alert email to the support admins.
  // 3.) Creates an Event doc with all event data (eventId, etc) and processing data (isPossibleZillowExemption, etc.). Generates a Log of the processing outcome.
  workQueue.process(maxJobsPerWorker, async (job) => {
    if (!job.data || !job.data.uri) {
      console.log(`Missing job data or event URI.`);
      return;
    }

    const existingEvents = await Event.find({
      eventId: job.data.eventId,
    }).countDocuments();

    let personData;
    let isNewLead;
    let isZillowFlexEvent;
    let isPossibleZillowExemption;
    let isPossibleDuplicateAlert = false;

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

          isNewLead = !isDateBeforeToday(leadCreatedDate);
          if (isNewLead) {
            console.log(`This is a new lead, created: ${leadCreatedDate}`);
          } else {
            console.log(
              `This is an existing lead, created: ${leadCreatedDate}`
            );
          }

          const isZillowFlexEvent = eventData.source
            .toLowerCase()
            .includes("zillow flex")
            ? true
            : false;

          if (isZillowFlexEvent && !isNewLead) {
            console.log(
              `Possible Zillow Flex Exemption -> 
              Checking for duplicate before sending email alert`
            );

            isPossibleZillowExemption = true;

            const existingLogs = await Log.find({ personId: personData.id });
            if (existingLogs.length) {
              let threeDaysAgo = new Date();
              threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
              const recentAlertsSent = existingLogs.length
                ? existingLogs.filter(
                    (log) =>
                      log.isPossibleZillowExemption === true &&
                      log.processedAt > threeDaysAgo
                  )
                : [];
              if (recentAlertsSent.length) {
                isPossibleDuplicateAlert = true;
                isPossibleZillowExemption = false;
              }
            }

            if (!isPossibleDuplicateAlert) {
              const text = `Possible Zillow Flex Exemption Identified
                  Zillow Property URL: ${eventData.property.url}
                  FUB URL: https://jillkbiggs.followupboss.com/2/people/view/${eventData.personId}
                  Zillow Premier Agent URL: ${personData.sourceUrl}
                  View this lead on FUB: https://jillkbiggs.followupboss.com/2/people/view/${eventData.personId}
              `;

              const html = `
              <div>
                  <h2> Possible Zillow Flex Exemption Identified </h2>
                  <p> Zillow Property URL: ${eventData.property.url} </p>
                  <p> FUB URL: https://jillkbiggs.followupboss.com/2/people/view/${eventData.personId} </p>
                  <p> Zillow Premier Agent URL: ${personData.sourceUrl} </p>
                  <p> <a href="https://jillkbiggs.followupboss.com/2/people/view/${eventData.personId}" target="_blank">View this lead on FUB</a> </p>
              </div>
              `;

              try {
                // send mail with defined transport object
                let info = await smtpTransporter.sendMail({
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
              console.log(
                `Duplicate alert detected, not sending an email for this event:`
              );
              console.log(eventData);
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
            event.propertyId = eventData.property
              ? eventData.property.id
              : null;
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
          errorMessage: `This event already exists in our DB, skipping it`,
        });
        log.save();
      } catch (err) {
        console.log(err);
      }
      console.log(`This event already exists in our DB, skipping it`);
    }
    progress = 100;
    job.progress(progress);

    return { status: "Event processed successfully" };
  });
}

// Initialize the clustered worker process
// https://devcenter.heroku.com/articles/node-concurrency
throng({ workers, start });
