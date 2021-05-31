const mongoose = require("mongoose");
const LogSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: false,
  },
  eventCreated: {
    type: Date,
  },
  event: {
    type: String,
  },
  resourceIds: {
    type: [Number],
  },
  uri: {
    type: String,
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  personId: {
    type: Number,
    required: false,
  },
  personData: {
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
  isPossibleZillowExemption: {
    type: Boolean,
    required: false,
  },
  errorMessage: {
    type: String,
    required: false,
  },
});
module.exports = mongoose.model("Log", LogSchema);
