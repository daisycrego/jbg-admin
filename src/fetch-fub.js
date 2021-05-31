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

  const eventData = fetch(endpoint, options)
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      return json;
    });
  return eventData;
};

const fubPOST = async (endpoint, body) => {
  return {};
};

module.exports = {
  fubGET,
  fubPOST,
};
