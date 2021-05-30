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
      "X-System": "jbg-admin",
    },
  };
  try {
    const result = await fetch(url, options);
    const parsedResult = await result.json();
    if (parsedResult.webhooks) {
      return parsedResult.webhooks;
    } else {
      throw new Error(
        parsedResult.errorMessage ? parsedResult.errorMessage : parsedResult
      );
    }
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
  const url = "https://api.followupboss.com/v1/webhooks";
  const BASIC_AUTHORIZATION = config.basicAuth;
  const data = {
    event: "eventsCreated",
    url: "https://jbg-admin.herokuapp.com/api/events/fub/callback",
  };
  const body = JSON.stringify(data);
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${BASIC_AUTHORIZATION}`,
      "X-System": "jbg-admin",
      "Content-Type": "application/json; charset=utf-8",
    },
    body: body,
  };
  try {
    const result = await fetch(url, options);
    const parsedResult = await result.json();
    console.log(parsedResult);
    if (parsedResult.event === "eventsCreated") {
      console.log(
        `${parsedResult.event} webhook created, events data will be posted to ${parsedResult.url}`
      );
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const setupEventsWebhook = () => {
  // Check if the webhook exists
  // If the webhook doesn't exist, create it
  fetchWebhooks().then(createWebhook);
};
