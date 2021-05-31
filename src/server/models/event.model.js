const mongoose = require("mongoose");
const EventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: false,
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
  personId: {
    type: Number,
    required: false,
  },
  type: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: false,
  },
  processed: {
    type: Boolean,
    required: true,
    default: false,
  },
  processedAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  noteId: {
    type: Number,
    required: false,
  },
  source: {
    type: String,
    required: false,
  },
  propertyId: {
    type: Number,
    required: false,
  },
  property: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  person: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  isNewLead: {
    type: Boolean,
    required: false,
  },
  isZillowEvent: {
    type: Boolean,
    required: false,
  },
});
module.exports = mongoose.model("Event", EventSchema);
