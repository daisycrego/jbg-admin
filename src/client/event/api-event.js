const fetch = require("node-fetch");

const list = async (signal) => {
  try {
    let response = await fetch("/api/events/", {
      method: "GET",
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

const update = async (params, credentials, event) => {
  try {
    // add userId as a parameter or somehow access userId from the route!
    let response = await fetch(`/api/events/${params.eventId}`, {
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
    let response = await fetch("/api/events/" + params.eventId, {
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

const sync_events = async (credentials, signal) => {
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

const exportToCSV = async (credentials, signal) => {
  console.log(`api-event: exportToCSV`);
  try {
    let response = await fetch("/api/events/download", {
      method: "GET",
      signal: signal,
      headers: {
        Accept: "text/csv",
        "Content-Type": "text/csv",
        Authorization: "Bearer " + credentials.t,
      },
    });
    console.log(`response`);
    console.log(response);
    return response;
  } catch (err) {
    console.log(err);
  }
};

export { list, read, update, exportToCSV, sync_events };
