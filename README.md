# jbg-admin
Admin app for Jill Biggs Group follow-up boss event management

## View Deployed Version
https://jbg-admin.herokuapp.com

## Run Locally
- Define environment vars in `.env`:
```
BASIC_AUTHORIZATION=
JWT_SECRET=
MONGODB_URI=
REDIS_URL=
SMTP_PASS=
SMTP_USER=
```

- Run the frontend:
```bash
git clone https://github.com/daisycrego/jbg-admin.git
cd jbg-admin/src
yarn 
yarn development
```

- Run the backend (requires separate terminal window, this is a separate worker process for processing webhook events): 
```bash
node worker.js
```

## Overview

### 1. Events
- Events table allows admin to keep track of property inquiries, and to disposition property inquiries that were flagged as possible Zillow Flex Exemptions. 
- FUB API's `eventCreated` webhook: We have set up a webhook with FUB's API s.t. every time a property inquiry event occurs on FUB, we receive a request with the `eventId`. Every new event is pushed to a Redis-based work queue for further processing. In a separate worker process, we pop events off the work queue and request the full Event and Person data from the FUB API. With all of this data we can determine if this is a possible zillow flex exemption. If this is a possible zillow flex exemption, send an email alert to the admins. Whether this is an exemption or not, we save the Event data in our own db. 
- `Sync Events` feature: Used to get the events data back in sync in the with FUB API, should the webhook go down.
- `Export to CSV` feature

### 2. Leads
- Leads table allows admin to keep track of Zillow Stage and FUB Stage side-by-side. The FUB data is retrieved from the FUB API, and the Zillow data is to be manually input by an admin. 
- `Sync Leads` feature: Used to keep the system in sync, expected to be run once a week by an admin. Sends an email alert to the team once the sync is done. Works by paging through all of the FUB `/person` API data and creating/updating `Lead`s in the database as needed. 
- `Export to CSV` feature

### 3. Auth
- Only users with a `jillbiggsgroup` domain name can make accounts. 
