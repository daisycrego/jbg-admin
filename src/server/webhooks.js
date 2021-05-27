import fetch from "node-fetch";
import config from "../config/config";

const fetchWebhooks = async () => {
  const url = "https://api.followupboss.com/v1/webhooks";
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
    const parsedResult = await result.json();
    console.log(parsedResult);
    return parsedResult.webhooks;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const createWebhook = async (webhooks) => {
  if (webhooks.length) {
    return;
  }

  console.log(`Creating a webhook because one doesn't exist`);
  const url = "https://api.followupboss.com/v1/webhooks?system=jbgadmin";
  const BASIC_AUTHORIZATION = config.basicAuth;
  const data = {
    event: "eventsCreated",
    url: "https://jbgadmin.herokuapp.com/api/events/fub/callback",
  };
  const body = JSON.stringify(data);
  console.log(`body:`);
  console.log(body);
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${BASIC_AUTHORIZATION}`,
      "X-System": "jbgadmin",
      "Content-Type": "application/json; charset=utf-8",
    },
    body: body,
  };
  try {
    const result = await fetch(url, options);
    const parsedResult = await result.json();
    console.log(parsedResult);
    return parsedResult;
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const setupEventsWebhook = () => {
  console.log("Set up eventsCreated webhook");

  // Check if the webhook exists

  fetchWebhooks().then(createWebhook);

  // If the webhook doesn't exist, create it
};
