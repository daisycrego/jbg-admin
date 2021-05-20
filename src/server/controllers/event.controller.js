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
    let events = await Event.find().select("name email updated created");
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
  events.forEach(async (event) => {
    console.log(
      `Processing event: ${event.id}, created: ${event.created}, updated: ${event.updated}`
    );
    // TODO
    // if both created and updated are > 7 days ago, ignore the event
    console.log(event.created);
    console.log(new Date(event.created) < new Date() - 7); // this date is less than a week old, good to go!
    const lessThanWeekOld = new Date(event.created) < new Date() - 7;
    if (!lessThanWeekOld) {
      console.log(`The event is > 7 days old, skipping`);
      return false;
    }

    const existingEvent = await Event.find({ id: event.id });
    if (!existingEvent.length) {
      const newEvent = new Event(event);
      try {
        await newEvent.save();
      } catch (err) {
        console.log(err);
      }
    }
  });
  return continueReading;
};

const syncEvents = async (req, res) => {
  const BASIC_AUTHORIZATION = config.basicAuth;
  let url = "https://api.followupboss.com/v1/events?limit=1&offset=0";
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${
        BASIC_AUTHORIZATION ||
        "MmM1OTRjYTI0M2QwZDliMDhlNDYyNzE0MjE4MmQ0YzMyMmZjYWU6Cg=="
      }`,
    },
  };

  try {
    const result = await fetch(url, options);
    const eventsData = await result.json();
    let continueFetching = true;
    if (eventsData.events.length) {
      console.log(
        `Fetched the following events: ${eventsData.events.map((x) => x.id)}`
      );
      continueFetching = await addNewEvents(eventsData.events);
      console.log(
        `Processed those events using addNewEvents(), which returned ${continueFetching}`
      );
      url = eventsData._metadata.nextLink;
    }

    while (continueFetching && eventsData._metadata.nextLink) {
      const result = await fetch(url, options);
      const newEventsData = await result.json();

      if (newEventsData.errorMessage) {
        return res.status(400).json({
          error: newEventsData.errorMessage,
        });
      }
      console.log(newEventsData);
      if (
        newEventsData &&
        newEventsData.events &&
        newEventsData.events.length
      ) {
        console.log(
          `Fetched the following events: ${newEventsData.events.map(
            (x) => x.id
          )}`
        );
        url = newEventsData._metadata.nextLink;
        continueFetching = await addNewEvents(newEventsData.events);
        console.log(
          `Processed those events using addNewEvents(), which returned ${continueFetching}`
        );
      } else {
        continueFetching = false;
      }
    }
  } catch (err) {
    console.log(`error: ${err}`);
  }
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
