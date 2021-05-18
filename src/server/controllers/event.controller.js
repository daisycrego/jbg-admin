import Event from "../models/event.model";
import extend from "lodash/extend";
import errorHandler from "./../helpers/dbErrorHandler";

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

export default {
  create,
  eventById,
  read,
  list,
  remove,
  update,
};
