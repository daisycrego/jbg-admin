import Event from "../models/event.model";
import extend from "lodash/extend";
import errorHandler from "./../helpers/dbErrorHandler";
import fetch from "node-fetch";
import config from "../../config/config";

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
  try {
    let events = await Event.find().select(
      "id updated created source property"
    );
    res.json(events);
  } catch (err) {
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
  console.log(`addNewEvents(): Processing events ${events.map((x) => x.id)}`);
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

    const today = new Date();
    const two_days_ago = today.getTime() - 1000 * 2 * (60 * 60 * 24);
    const created = new Date(eventObj.created);
    const oldData = created.getTime() < two_days_ago;

    if (oldData) {
      console.log(`The event is > 2 days old, skipping`);
      return false;
    } else {
      console.log(`Less than 2 days old, processing...`);
    }

    const existingEvent = await Event.find({ id: eventObj.id });
    if (!existingEvent.length) {
      const newEvent = new Event(eventObj);
      try {
        await newEvent.save();
      } catch (err) {
        console.log(err);
      }
    }
  }

  return continueReading;
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
      console.log(result);
      console.log(result.status);
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

export default {
  create,
  eventById,
  read,
  list,
  remove,
  update,
  syncEvents,
};
