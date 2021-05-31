export default ({ markup, css }) => {
  return `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
          >
          <title>JBG Admin</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,300,400">
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
          <style>
              a{
                text-decoration: none;
                color: #061d95
              }
          </style>
        </head>
        <body style="margin:0">
          <div id="root">${markup}</div>
          <style id="jss-server-side">${css}</style>
          <script type="text/javascript" src="/dist/bundle.js"></script>
          <script async>
          
// Store for all of the jobs in progress
let jobs = {};

// Kick off a new job by POST-ing to the server
async function addJob() {
  let body = {
    eventId: 'dc6d4d68-f27a-4940-bd10-e60b4fe3b5dc',
    eventCreated: '2021-05-30T21:46:02+00:00',
    event: 'eventsCreated',
    resourceIds: [ 90490 ],
    uri: 'https://api.followupboss.com/v1/events/90490'
  };
  
  let res = await fetch("api/events/fub/callback/", 
  { 
    method: "POST", 
    headers: { 
      Accept: "application/json",
      "Content-Type": "application/json",
    }, 
    body: JSON.stringify(body) 
  });
  let job = await res.json();
  jobs[job.id] = { id: job.id, state: "queued" };
  render();
}

// Fetch updates for each job
async function updateJobs() {
  for (let id of Object.keys(jobs)) {
    let res = await fetch('/job/'+id);
    let result = await res.json();
    if (!!jobs[id]) {
      jobs[id] = result;
    }
    render();
  }
}

// Delete all stored jobs
function clear() {
  jobs = {};
  render();
}

// Update the UI
function render() {
  let s = "";
  for (let id of Object.keys(jobs)) {
    s += renderJob(jobs[id]);
  }

  // For demo simplicity this blows away all of the existing HTML and replaces it,
  // which is very inefficient. In a production app a library like React or Vue should
  // handle this work
  document.querySelector("#job-summary").innerHTML = s;
}

// Renders the HTML for each job object
function renderJob(job) {
  let progress = job.progress || 0;
  let color = "bg-light-purple";

  if (job.state === "completed") {
    color = "bg-purple";
    progress = 100;
  } else if (job.state === "failed") {
    color = "bg-dark-red";
    progress = 100;
  }

  return document
    .querySelector("#job-template")
    .innerHTML.replace("{{id}}", job.id)
    .replace("{{state}}", job.state)
    .replace("{{color}}", color)
    .replace("{{progress}}", progress);
}

// Attach click handlers and kick off background processes
window.onload = function () {
  document.querySelector("#add-job").addEventListener("click", addJob);
  document.querySelector("#clear").addEventListener("click", clear);

  setInterval(updateJobs, 200);
};

          </script>
        </body>
        <script type="text/template" id="job-template">
    <div class="flex flex-column ma2">
      <div class="flex justify-between mb2">
        <div class='mt2 mb1'><span class="hk-label">Job ID:</span> {{id}}</div>
        <div class='mt2 mb1'><span class="hk-label">State:</span> {{state}}</div>
      </div>
      <div class="w-100 br1 shadow-inner-1 bg-light-silver">
        <span class="db h1 br1 {{color}}" style="width: {{progress}}%;"></span>
      </div>
    </div>
  </script>
  <div class="main-content flex flex-column justify-center items-center w-100 mt4">
    <div class='br2 flex flex-column items-center pv3'>
      <div class='f1 mt2 mb1'>Create long-running jobs</div>
      <div class='flex mt2'>
        <a href='#' id="add-job" class='f2 link purple ph2 pv1 ba b--purple br1 mr4'>Add Job</a>
        <a href='#' id="clear" class='f2 link purple ph2 pv1 ba b--purple br1'>Clear</a>
      </div>
    </div>
    <div id="job-summary" class="w-80 f3"></div>
    <div class="h6 flex flex-column justify-end">
      <div class="shadow-3 pa4 tc f3">
        <span class="hk-label">Tip:</span> Jobs not running? Be sure to run <code class="pre">heroku ps:scale worker=1</code>
      </div>
    </div>
  </div>
      </html>`;
};
