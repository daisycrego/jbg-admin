const fetch = require("node-fetch");
const config = require("./config/config");

const fubGET = async (endpoint) => {
  const BASIC_AUTHORIZATION = config.basicAuth;
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${BASIC_AUTHORIZATION}`,
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  console.log(`Sending a POST to ${endpoint}`);

  const eventData = fetch(endpoint, options)
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      console.log(json);
      return json;
    });
  console.log(`returning eventData from fubGET`);
  console.log(eventData);
  return eventData;
};

const fubPOST = async (endpoint, body) => {
  return {};
};

module.exports = {
  fubGET,
  fubPOST,
};
