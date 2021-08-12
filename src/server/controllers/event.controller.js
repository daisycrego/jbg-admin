import extend from "lodash/extend";
import fetch from "node-fetch";
import Queue from "bull";
import jwt from "jsonwebtoken";

import Event from "../models/event.model";
import errorHandler from "./../helpers/dbErrorHandler";
import config from "../../config/config";
import User from "../models/user.model";

const create = async (req, res) => {
  const event = new Event(req.body);
  try {
    await event.save();
    return res.status(200).json({
      message: "Successfully signed up!",
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};
/**
 * Load event and append to req.
 */
const eventById = async (req, res, next, id) => {
  try {
    const userId = jwt.verify(
      req.headers.authorization.split(" ")[1],
      config.jwtSecret
    );
    let user = await User.findById(userId);
    req.profile = user;
  } catch (err) {
    console.log(err);
    return res.status("400").json({
      error: "Could not retrieve user",
    });
  }
  try {
    let event = await Event.findById(id);
    if (!event)
      return res.status("400").json({
        error: "event not found",
      });
    req.event = event;
    next();
  } catch (err) {
    return res.status("400").json({
      error: "Could not retrieve event",
    });
  }
};

const read = (req, res) => {
  return res.json(req.event);
};

const list = async (req, res) => {
  const activeSources = req.body.categories.sources.active;
  const activeStatuses = req.body.categories.statuses.active;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  const order = req.body.order;

  // orderBy not currently used because it only ever has 1 value: created
  const orderBy = req.body.orderBy;
  let events;
  try {
    if (startDate || endDate) {
      let startDateOnly = startDate ? new Date(startDate) : new Date(0);
      startDateOnly = startDateOnly.toLocaleDateString();
      startDateOnly = new Date(startDateOnly);

      let endDateOnly = endDate ? new Date(endDate) : new Date();
      endDateOnly.setDate(endDateOnly.getDate() + 1);
      endDateOnly = endDateOnly.toLocaleDateString();
      endDateOnly = new Date(endDateOnly);

      events = await Event.find({
        source: activeSources,
        status: activeStatuses,
        created: {
          $gte: startDateOnly,
          $lt: endDateOnly,
        },
      }).sort({
        created: order === "desc" ? -1 : 1,
      });
    } else {
      let queryObj;
      if (
        activeSources &&
        activeStatuses &&
        activeSources.length &&
        activeStatuses.length
      ) {
        queryObj = {
          source: activeSources,
          status: activeStatuses,
        };
      } else if (activeSources && activeSources.length) {
        queryObj = {
          source: activeSources,
          status: [],
        };
      } else if (activeStatuses && activeStatuses.length) {
        queryObj = {
          status: activeStatuses,
          source: [],
        };
      } else {
        queryObj = {
          status: [],
          source: [],
        };
      }

      console.log(`events api`);
      console.log(`queryObj`);
      console.log(queryObj);

      const searchText = req.body.searchText;
      if (searchText) {
        queryObj = {
          ...queryObj,
          "property.street": searchText ? searchText.trim() : "",
        };
        events = await Event.find(queryObj)
          .find()
          .sort({
            created: order === "desc" ? -1 : 1,
          });
      } else {
        events = await Event.find(queryObj).sort({
          created: order === "desc" ? -1 : 1,
        });
      }
    }

    const allSources = await Event.distinct("source");
    const allStatuses = await Event.distinct("status");

    res.json({
      events: events,
      sources: allSources,
      statuses: allStatuses,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const update = async (req, res) => {
  try {
    let event = req.event;
    event = extend(event, req.body);
    event.updated = Date.now();
    await event.save();
    res.json(event);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const remove = async (req, res) => {
  try {
    let event = req.event;
    let deletedEvent = await event.remove();
    res.json(deletedEvent);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const addNewEvents = async (events) => {
  if (!events || !events.length) {
    console.log(
      `addNewEvents(): !events or !events.length, events: ${events}, returning FALSE`
    );
    return false;
  }
  let continueReading = true;

  for (const eventObj of events) {
    if (!eventObj) {
      continue;
    }

    console.log(
      `Processing event: ${eventObj.id}, created: ${eventObj.created}, updated: ${eventObj.updated}`
    );

    //const today = new Date();
    //const two_weeks_ago = today.getTime() - 1000 * 14 * (60 * 60 * 24);
    //const created = new Date(eventObj.created);
    //const oldData = created.getTime() < two_weeks_ago;

    // if the data already exists in the database,

    /*
    // or if the data is > 14 days old, stop searching
    if (oldData) {
      console.log(`The event is > 2 weeks old, skipping`);
      return false;
    } else {
      console.log(`Less than 2 weeks old, processing...`);
    }
    */

    const existingEvent = await Event.find({ id: eventObj.id });
    if (!existingEvent.length) {
      const newEvent = new Event(eventObj);
      try {
        await newEvent.save();
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log(`event ${eventObj.id} exists, skipping...`);
    }
  }

  return true;
};

const syncEventsHelper = async (url) => {
  const BASIC_AUTHORIZATION = config.basicAuth;
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${BASIC_AUTHORIZATION}`,
    },
  };
  try {
    const result = await fetch(url, options);
    const eventsData = await result.json();
    if (eventsData.errorMessage) {
      console.log(
        `Got an errorMessage rather than events data from FUB, here's the rest of the result:`
      );
      if (result.status === 429) {
        console.log(
          "Too Many Requests! Checking the retry-after from the headers:"
        );
      }
      // wait for retry-after seconds and then `continue` in the while loop, which will result in the query being run again for the same URL
      setTimeout(() => {
        syncEventsHelper(url);
      }, result.headers.get("retry-after") * 1000);
    }
    if (eventsData.events && eventsData.events.length) {
      console.log(
        `Fetched the following events: ${eventsData.events.map((x) => x.id)}`
      );
      const continueFetching = await addNewEvents(eventsData.events);
      console.log(
        `Processed those events using addNewEvents(), which returned ${continueFetching}`
      );
      if (continueFetching) {
        url = eventsData._metadata.nextLink;
        return url;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (err) {
    console.log(`error: ${err}`);
    return false;
  }
};

const syncEvents = async (req, res) => {
  // Prepare an authenticated request for the FUB API with a starting URL
  // Rather than use a while loop, use some kind of helper function or recursion!
  // Try to make a fetch from the FUB API
  // If the response
  let currentUrl = "https://api.followupboss.com/v1/events?limit=100&offset=0";
  currentUrl = await syncEventsHelper(currentUrl);
  while (currentUrl) {
    // update the currentUrl or exit the while loop
    currentUrl = await syncEventsHelper(currentUrl);
  }

  res.status(200).json({
    message: "Sync done",
  });
};

// Connect to a local redis intance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Create / Connect to a named work queue
let workQueue = new Queue("work", REDIS_URL);

const createEventsWebhookCallback = (req, res) => {
  // This would be where you could pass arguments to the job
  // Ex: workQueue.add({ url: 'https://www.heroku.com' })
  // Docs: https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueadd
  let job;
  workQueue.add(req.body).then((result) => (job = result));
  res.sendStatus(200);
};

export default {
  create,
  eventById,
  read,
  list,
  remove,
  update,
  syncEvents,
  createEventsWebhookCallback,
};
