const fetch = require("node-fetch");

const list = async (signal, options) => {
  try {
    let response = await fetch(`/api/events/search`, {
      method: "POST",
      signal: signal,
      body: JSON.stringify(options),
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

const update = async (params, credentials, event) => {
  try {
    // add userId as a parameter or somehow access userId from the route!
    let response = await fetch(`/api/event/${params.eventId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: JSON.stringify(event),
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

const read = async (params, credentials, signal) => {
  try {
    let response = await fetch("/api/event/" + params.eventId, {
      method: "GET",
      signal: signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

const sync_leads = async (credentials, signal) => {
  try {
    let response = await fetch("/api/events/sync", {
      method: "GET",
      signal: signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

export { list, read, update, sync_leads };
