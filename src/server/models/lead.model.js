const mongoose = require("mongoose");
//const { zillowStageOptions } = require("../../lib/constants");
const LeadSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false,
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
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
  source: {
    type: String,
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
    required: false,
    default: null,
  },
  processed: {
    type: Boolean,
    required: true,
    default: false,
  },
  processedAt: {
    type: Date,
    required: false,
  },
});
module.exports = mongoose.model("Lead", LeadSchema);
