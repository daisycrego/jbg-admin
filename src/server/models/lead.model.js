const mongoose = require("mongoose");
const zillowStageOptions = require("../../lib/zillowStageOptions");
const LeadSchema = new mongoose.Schema({
  personId: {
    type: String,
    required: false,
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
  createdVia: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  lastActivity: {
    type: Date,
    required: false,
  },
  price: {
    type: Number,
    required: false,
  },
  stage: {
    type: String,
    required: false,
  },
  stageId: {
    type: Number,
    required: false,
  },
  source: {
    type: String,
    required: false,
  },
  sourceId: {
    type: Number,
    required: false,
  },
  sourceUrl: {
    type: String,
    required: false,
  },
  delayed: {
    type: Boolean,
    required: false,
  },
  contacted: {
    type: Number,
    required: false,
  },
  price: {
    type: Number,
    required: false,
  },
  assignedLenderId: {
    type: Number,
    required: false,
  },
  assignedLenderName: {
    type: String,
    required: false,
  },
  assignedUserId: {
    type: Number,
    required: false,
  },
  assignedPondId: {
    type: Number,
    required: false,
  },
  assignedTo: {
    type: String,
    required: false,
  },
  tags: [
    {
      type: String,
      required: false,
    },
  ],
  emails: [
    {
      type: mongoose.Mixed,
      required: false,
    },
  ],
  phones: [
    {
      type: mongoose.Mixed,
      required: false,
    },
  ],
  addresses: [
    {
      type: mongoose.Mixed,
      required: false,
    },
  ],
  picture: {
    type: mongoose.Mixed,
    required: false,
  },
  socialData: [
    {
      type: mongoose.Mixed,
      required: false,
    },
  ],
  claimed: {
    type: Boolean,
    required: false,
  },
  firstToClaimOffer: {
    type: Boolean,
    required: false,
  },
  collaborators: [
    {
      type: mongoose.Mixed,
      required: false,
    },
  ],
  teamLeaders: [
    {
      type: mongoose.Mixed,
      required: false,
    },
  ],
  pondMembers: [
    {
      type: mongoose.Mixed,
      required: false,
    },
  ],
  isZillowLead: {
    type: Boolean,
    required: false,
  },
  zillowStage: {
    type: String,
    enum: zillowStageOptions,
    required: false,
    default: "No stage",
  },
});
module.exports = mongoose.model("Lead", LeadSchema);
