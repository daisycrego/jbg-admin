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
    console.log(parsedResult.webhooks);
    const requiredWebhooks = [
      "eventsCreated"
    ];
    const activeWebhooks =
      parsedResult.webhooks && parsedResult.webhooks.length
        ? parsedResult.webhooks.map((item) => item.event)
        : [];
    const missingWebhooks = requiredWebhooks.filter(
      (webhook) => !activeWebhooks.includes(webhook)
    );
    console.log(`missingWebhooks`);
    console.log(missingWebhooks);
    if (!missingWebhooks.length) {
      return {
        error: null,
        missingWebhooks: [],
      };
    } else {
      /*throw new Error(
        parsedResult.errorMessage ? parsedResult.errorMessage : parsedResult
      );*/
      return {
        error: `Missing the following webhooks: ${missingWebhooks}`,
        missingWebhooks,
      };
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};

const webhookUrl = (webhookType) => {
  switch (webhookType) {
    case "eventsCreated":
      return `https://jbg-admin.herokuapp.com/api/events/fub/callback/`;
    case "peopleCreated":
      return `https://jbg-admin.herokuapp.com/api/leads/fub/callback/created`;
    case "peopleStageUpdated":
      return `https://jbg-admin.herokuapp.com/api/leads/fub/callback/updated`;
  }
};

const createWebhook = async (webhookType) => {
  const url = "https://api.followupboss.com/v1/webhooks";
  const BASIC_AUTHORIZATION = config.basicAuth;
  const data = {
    event: webhookType,
    url: webhookUrl(webhookType),
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
    if (parsedResult.event === webhookType) {
      console.log(
        `${parsedResult.event} webhook created, data will be posted to ${parsedResult.url}`
      );
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const setupWebhooks = async () => {
  // Check if the webhook exists
  // If the webhook doesn't exist, create it
  const result = await fetchWebhooks();
  if (result.missingWebhooks.length) {
    result.missingWebhooks.forEach((webhookType) => createWebhook(webhookType));
  }
};
