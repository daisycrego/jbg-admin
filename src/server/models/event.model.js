import mongoose from "mongoose";
import crypto from "crypto";
const EventSchema = new mongoose.Schema({
  id: {
    type: Number,
    trim: true,
    required: true,
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
  noteId: {
    type: Number,
    required: false,
  },
  source: {
    type: String,
    required: false,
  },
  property: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
});

export default mongoose.model("Event", EventSchema);
