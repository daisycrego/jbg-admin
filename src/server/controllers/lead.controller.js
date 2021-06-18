import Lead from "../models/lead.model";
import extend from "lodash/extend";
import errorHandler from "./../helpers/dbErrorHandler";
import fetch from "node-fetch";
import config from "../../config/config";
import Queue from "bull";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

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
  console.log(`Express server: /api/leads GET request received, this is the frontend requesting Lead data
  from the backend.`);
  try {
    // Available fields: https://docs.followupboss.com/reference#people-get
    // stage == FUB API Stage
    /*let leads = await Lead.find().select(
      "personId updated created firstName lastName name price source isZillowLead stage zillowStage stageId sourceId sourceUrl delayed contacted price tags emails phones addresses socialData collaborators teamLeaders pondMembers"
    );*/
    let leads = await Lead.find().select(
      "personId updated created firstName lastName name price source isZillowLead stage zillowStage stageId sourceId sourceUrl delayed contacted price tags emails phones addresses socialData collaborators teamLeaders pondMembers"
    );
    res.json(leads);
  } catch (err) {
    console.log(err);
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
      // TODO: if there is an existing lead, update the data (all of the fields, not just stage)
    } else {
      await existingLead.update(leadObj);
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

  res.status(200).json({
    message: "Sync done",
  });
};

// Connect to a local redis intance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Create / Connect to a named work queue
let workQueue = new Queue("work", REDIS_URL);

const createLeadsWebhookCallback = (req, res) => {
  // This would be where you could pass arguments to the job
  // Ex: workQueue.add({ url: 'https://www.heroku.com' })
  // Docs: https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueadd
  let job;
  workQueue.add(req.body).then((result) => (job = result));
  res.sendStatus(200);
};

export default {
  create,
  leadById,
  read,
  list,
  remove,
  update,
  syncLeads,
  createLeadsWebhookCallback,
};
