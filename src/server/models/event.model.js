const mongoose = require("mongoose");
const { zillowStatusOptions } = require("../../lib/constants");
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
  isZillowFlexEvent: {
    type: Boolean,
    required: false,
  },
  isPossibleZillowExemption: {
    type: Boolean,
    required: false,
  },
  status: {
    type: String,
    enum: zillowStatusOptions,
    required: true,
    default: "No action",
  },
});
module.exports = mongoose.model("Event", EventSchema);
