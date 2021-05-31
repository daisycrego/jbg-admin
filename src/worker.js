console.log(`worker process :)`);

let throng = require("throng");
let Queue = require("bull");
let Event = require("./server/models/event.model");
const fetch = require("node-fetch");
const config = require("./config/config");
const mongoose = require("mongoose");
const { fubGET } = require("./fetch-fub");

function isDateBeforeToday(date) {
  console.log(`isDateBeforeToday(): ${date.getUTCDate()}`);
  const now = new Date();
  console.log(`now.getUTCDate():`);
  console.log(now.getUTCDate());
  console.log(`date.getUTCDate() < now.getUTCDate()`);
  console.log(date.getUTCDate() < now.getUTCDate());
  return date.getUTCDate() < now.getUTCDate();
}

// Connection URL
mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("error", () => {
  throw new Error(`unable to connect to database: ${config.mongoUri}`);
});

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
  console.log(`worker process: start() running...`);
  // Connect to the named work queue
  let workQueue = new Queue("work", REDIS_URL);

  workQueue.process(maxJobsPerWorker, async (job) => {
    console.log(`Initiating a job in the worker process`);
    console.log(`job.data:`);
    console.log(job.data);
    console.log(`THis should print`);
    // This is an example job that just slowly reports on progress
    // while doing no work. Replace this with your own job logic.
    if (!job.data || !job.data.uri) {
      console.log(`Missing job data or event URI.`);
      return;
    }

    // do the work here
    console.log(`Event model`);
    console.log(Event);

    const existingEvents = await Event.find({
      eventId: job.data.eventId,
    }).countDocuments();

    console.log(`count: ${existingEvents}`);
    /*
    // Error - this is hanging, not returning ever from here...
    await Event.find({}, function (err, docs) {
      if (!err) {
        console.log(docs);
      } else {
        throw err;
      }
    });
    */

    //let existingEvent = await Event.find({ eventId: job.data.eventId });
    //console.log(`existingEvent`);
    //console.log(existingEvent);
    if (!existingEvents) {
      try {
        const event = new Event({
          eventId: job.data.eventId,
          resourceIds: job.data.resourceIds,
          uri: job.data.uri,
          processed: false,
        });
        await event.save();
        console.log("Saved some initial event data");
        const BASIC_AUTHORIZATION = config.basicAuth;
        const options = {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Basic ${BASIC_AUTHORIZATION}`,
            "Content-Type": "application/json; charset=utf-8",
          },
        };

        const eventData = await fubGET(job.data.uri);
        if (eventData) {
          // fetch person data
          // use source, isNewLead boolean, personId, and property (Object) from the Event object
          // fetch person using personId from FUB API to determine if this is a new lead
          // could ask Dan if he wants to also maintain the leads in our own database...
          console.log(`Event Data:`);
          console.log(eventData);

          const personData = await fubGET(
            `https://api.followupboss.com/v1/people/${eventData.personId}`
          );
          console.log(`personData:`);
          console.log(personData);
          // if person created before today, isNewLead==True

          let leadCreatedDate;
          try {
            leadCreatedDate = new Date(personData.created.split("T")[0]);
          } catch (err) {
            console.log(err);
            leadCreatedDate = new Date(personData.created);
          }

          /*
          const dateString = "2021-05-31T21:46:02+00:00".split("T")[0];
          console.log(`dateString: ${dateString}`);
          const testLeadCreatedDate = new Date(dateString);
          */

          const isNewLead = !isDateBeforeToday(leadCreatedDate);
          if (isNewLead) {
            console.log(`This is a new lead, created: ${leadCreatedDate}`);
          } else {
            console.log(
              `This is an existing lead, created: ${leadCreatedDate}`
            );
          }

          console.log(`eventData.source
          .toLowerCase()`);
          console.log(eventData.source.toLowerCase());

          console.log(`eventData.source
          .toLowerCase()
          .includes("zillow")`);
          console.log(eventData.source.toLowerCase().includes("zillow"));
          const isZillowEvent = eventData.source
            .toLowerCase()
            .includes("zillow")
            ? true
            : false;

          if (isZillowEvent && !isNewLead) {
            console.log(`Possible Zillow Exemption -> Send email alert`);
          } else {
            console.log(
              `No Zillow Exemption identified, saving the event data`
            );
          }

          try {
            event.isNewLead = isNewLead;
            event.isZillowEvent = isZillowEvent;
            event.source = eventData.source;
            event.created = eventData.created;
            event.personId = eventData.personId;
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
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log(`This event already exists in our DB, skipping it!`);
    }
    // check if the event already exists
    // define the status of the event -> newLead, existingLead
    // send an alert if the status of the event === existingLead && source == Zillow or Zillow Flex
    // create a new Event object
    /* 
    incoming job.data will look like this:
    {
        eventId: 'dc6d4d68-f27a-4940-bd10-e60b4fe3b5dc',
        eventCreated: '2021-05-30T21:46:02+00:00',
        event: 'eventsCreated',
        resourceIds: [ 90490 ],
        uri: 'https://api.followupboss.com/v1/events/90490'
    }
    */

    progress = 100;
    job.progress(progress);

    // A job can return values that will be stored in Redis as JSON
    // This return value is unused in this demo application.
    return { value: "This will be stored" };
  });
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });
