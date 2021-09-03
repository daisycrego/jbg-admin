import Lead from "../models/lead.model";
import extend from "lodash/extend";
import errorHandler from "./../helpers/dbErrorHandler";
import fetch from "node-fetch";
import config from "../../config/config";
import Queue from "bull";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { zillowStageOptions } from "../../lib/constants";
const nodemailer = require("nodemailer");

const create = async (req, res) => {
  const lead = new Lead(req.body);
  try {
    await lead.save();
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
 * Load lead and append to req.
 */
const leadById = async (req, res, next, id) => {
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
    let lead = await Lead.findById(id);
    if (!lead)
      return res.status("400").json({
        error: "lead not found",
      });
    req.lead = lead;
    console.log(lead);
    next();
  } catch (err) {
    return res.status("400").json({
      error: "Could not retrieve lead",
    });
  }
};

const read = (req, res) => {
  return res.json(req.lead);
};

const list = async (req, res) => {
  let activeSources = null;
  let activeZillowStages = null;
  let activeFubStages = null;
  let startDate = null;
  let endDate = null;
  let order = null;
  let orderBy = null;
  let pageSize = null;
  let pageNumber = null;
  try {
    activeSources = req.body.categories.sources.active;
    activeZillowStages = req.body.categories.zillowStages.active;
    activeFubStages = req.body.categories.fubStages.active;
    startDate = req.body.startDate;
    endDate = req.body.endDate;
    order = req.body.order;
    orderBy = req.body.orderBy; // only current option is `created`
    pageSize = req.body.pageSize;
    pageNumber = req.body.page;
  } catch (TypeError) {}

  let queryObj = {};
  let leads;
  try {
    let startDateOnly = startDate ? new Date(startDate) : new Date(0);
    let endDateOnly = endDate ? new Date(endDate) : new Date();
    startDateOnly = startDateOnly.toLocaleDateString();
    startDateOnly = new Date(startDateOnly);
    endDateOnly.setDate(endDateOnly.getDate() + 1);
    endDateOnly = endDateOnly.toLocaleDateString();
    endDateOnly = new Date(endDateOnly);

    if (activeZillowStages && activeZillowStages.length) {
      if (activeFubStages) {
        queryObj = {
          source: activeSources,
          stage: activeFubStages,
          zillowStage: activeZillowStages,
          created: {
            $gte: startDateOnly,
            $lt: endDateOnly,
          },
        };
      } else {
        queryObj = {
          source: activeSources,
          zillowStage: activeZillowStages,
          created: {
            $gte: startDateOnly,
            $lt: endDateOnly,
          },
        };
      }
    } else if (activeFubStages && activeFubStages.length) {
      queryObj = {
        source: activeSources,
        stage: activeFubStages,
        created: {
          $gte: startDateOnly,
          $lt: endDateOnly,
        },
      };
    } else if (activeSources && activeSources.length) {
      queryObj = {
        source: activeSources,
        created: {
          $gte: startDateOnly,
          $lt: endDateOnly,
        },
      };
    } else {
      queryObj = {
        created: {
          $gte: startDateOnly,
          $lt: endDateOnly,
        },
      };

      const searchText = req.body.searchText;
      const searchField = req.body.searchField;
      if (searchText) {
        queryObj[searchField] = searchText ? searchText.trim() : "";
      }
    }

    leads = await Lead.find(queryObj)
      .sort({
        created: order === "desc" ? -1 : 1,
      })
      .skip(pageSize * pageNumber)
      .limit(pageSize);

    const totalLeads = await Lead.find(queryObj).countDocuments();

    const allSources = await Lead.distinct("source");
    const allFubStages = await Lead.distinct("stage");

    res.json({
      leads: leads ? leads : [],
      totalLeads: totalLeads,
      sources: allSources,
      fubStages: allFubStages,
      zillowStages: zillowStageOptions,
    });
  } catch (err) {
    console.log(err.name);
    console.log(err);
    if (err.name === "MongoError") {
      leads = await Lead.find(matchObj);
    }

    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const update = async (req, res) => {
  try {
    let lead = req.lead;
    lead = extend(lead, req.body);
    lead.updated = Date.now();
    await lead.save();
    res.json(lead);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const remove = async (req, res) => {
  try {
    let lead = req.lead;
    let deletedLead = await lead.remove();
    res.json(deletedLead);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const addNewLeads = async (leads) => {
  if (!leads || !leads.length) {
    console.log(
      `addNewLeads(): !leads or !leads.length, leads: ${leads}, returning FALSE`
    );
    return false;
  }
  let continueReading = true;

  for (const leadObj of leads) {
    if (!leadObj) {
      continue;
    }

    console.log(
      `Processing lead: ${leadObj.id}, created: ${leadObj.created}, updated: ${leadObj.updated}`
    );

    const existingLead = await Lead.find({ id: leadObj.id });
    if (!existingLead.length) {
      const newLead = new Lead(leadObj);
      try {
        await newLead.save();
      } catch (err) {
        console.log(err);
      }
    } else {
      await Lead.findOneAndUpdate({ id: leadObj.id }, { $set: leadObj });
      /*
      // update everything BUT zillowStage
      existingLead.updated = leadObj.updated;
      existingLead.created = leadObj.created;
      existingLead.name = leadObj.name;
      existingLead.firstName = leadObj.firstName;
      existingLead.lastName = leadObj.lastName;
      existingLead.lastActivity = leadObj.lastActivity;
      existingLead.price = leadObj.price;
      existingLead.stage = leadObj.stage;
      existingLead.source = leadObj.source;
      existingLead.delayed = leadObj.delayed;
      existingLead.contacted = leadObj.contacted;
      existingLead.assignedLenderId = leadObj.assignedLenderId;
      existingLead.assignedLenderName = leadObj.assignedLenderName;
      existingLead.assignedUserId = leadObj.assignedUserId;
      existingLead.assignedPondId = leadObj.assignedPondId;
      existingLead.assignedTo = leadObj.assignedTo;
      existingLead.tags = leadObj.tags;
      existingLead.emails = leadObj.emails;
      existingLead.phones = leadObj.phones;
      existingLead.addresses = leadObj.addresses;
      existingLead.picture = leadObj.picture;
      existingLead.socialData = leadObj.socialData;
      existingLead.claimed = leadObj.claimed;
      existingLead.firstToClaimOffer = leadObj.firstToClaimOffer;
      existingLead.collaborators = leadObj.collaborators;
      existingLead.teamLeaders = leadObj.teamLeaders;
      existingLead.pondMembers = leadObj.pondMembers;
      existingLead.processed = true;
      existingLead.processedAt = new Date();
      await existingLead.save();
      */
    }
  }

  return continueReading;
};

const syncLeadsHelper = async (url) => {
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
    const leadsData = await result.json();
    if (leadsData.errorMessage) {
      console.log(
        `Got an errorMessage rather than leads data from FUB, here's the rest of the result:`
      );
      if (result.status === 429) {
        console.log(
          "Too Many Requests! Checking the retry-after from the headers:"
        );
      }
      // wait for retry-after seconds and then `continue` in the while loop, which will result in the query being run again for the same URL
      setTimeout(() => {
        syncLeadsHelper(url);
      }, result.headers.get("retry-after") * 1000);
    }
    if (leadsData.people && leadsData.people.length) {
      console.log(
        `Fetched the following leads: ${leadsData.people.map((x) => x.id)}`
      );
      const continueFetching = await addNewLeads(leadsData.people);
      console.log(
        `Processed those leads using addNewLeads(), which returned ${continueFetching}`
      );
      if (continueFetching) {
        url = leadsData._metadata.nextLink;
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

const syncLeads = async (req, res) => {
  console.log(`syncLeads`);
  // Prepare an authenticated request for the FUB API with a starting URL
  // Rather than use a while loop, use some kind of helper function or recursion!
  // Try to make a fetch from the FUB API
  // If the response
  let currentUrl = "https://api.followupboss.com/v1/people?limit=100&offset=0";
  currentUrl = await syncLeadsHelper(currentUrl);
  while (currentUrl) {
    // update the currentUrl or exit the while loop
    currentUrl = await syncLeadsHelper(currentUrl);
  }

  let smtpTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const text = `Leads Synced with FUB`;
  const html = `
  <div>
  <h2> Leads Synced with FUB </h2>
  <p><a href="https://jbg-admin.herokuapp.com/leads">View leads</a></p>
  </div>
  `

  try {
    // send mail with defined transport object
    let info = await smtpTransporter.sendMail({
      from: '"cregodev7@gmail.com', // sender address
      to: "daisycrego@gmail.com, cregodev7@gmail.com, dan@jillbiggsgroup.com, support@jillbiggsgroup.com", // list of receivers
      subject: "FUB Leads Sync - Done", // Subject line
      text: text, // plain text body
      html: html, // html body
    });
  } catch (err) {
    console.log(err);
  }



  res.status(200).json({
    message: "Sync done",
  });
};

// Connect to a local redis intance locally, and the Heroku-provided URL in production
//let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Create / Connect to a named work queue
//let workQueue = new Queue("work", REDIS_URL);

export default {
  create,
  leadById,
  read,
  list,
  remove,
  update,
  syncLeads,
};
