import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// Check for hot module replacement to determine whether to call render or hydrate
// This avoids the console warning:
// Warning: Expected server HTML to contain a matching <div> in <div>.
// https://lifesaver.codes/answer/warning-expected-server-html-to-contain-a-matching-div-in-div
const render = () => {
  const renderMethod = !!module.hot ? ReactDOM.render : ReactDOM.hydrate;
  renderMethod(<App />, document.getElementById("root"));
};

render();
