import React, { useState } from "react";
import { Route, Switch } from "react-router-dom";
import Users from "./user/Users";
import EventsPage from "./event/EventsPage";
import Signup from "./user/Signup";
import Event from "./event/Event";
import Lead from "./lead/Lead";
import Leads from "./lead/Leads";
import Signin from "./auth/Signin";
import EditProfile from "./user/EditProfile";
import Profile from "./user/Profile";
import PrivateRoute from "./auth/PrivateRoute";
import Menu from "./core/Menu";
import {
  zillowStatusOptions,
  zillowStageOptions,
  booleanOptions,
} from "../lib/constants";

const initialLeadSearchState = {
  page: 0,
  pageSize: 10,
  activeSources: ["Zillow Flex"],
  activeFubStages: null,
  activeZillowStages: null,
  order: "desc",
  orderBy: "created",
  startDate: null,
  endDate: null,
};

const initialEventSearchState = {
  page: 0,
  pageSize: 10,
  categories: {
    sources: {
      active: ["Zillow Flex"],
      all: null,
      default: ["Zillow Flex"],
    },
    statuses: {
      active: zillowStatusOptions,
      all: null,
      default: zillowStatusOptions,
    },
    isPossibleZillowExemption: {
      active: [booleanOptions.true, booleanOptions.false],
      all: [booleanOptions.true, booleanOptions.false],
      default: [booleanOptions.true, booleanOptions.false],
    },
  },
  order: "desc",
  orderBy: "created",
  startDate: null,
  endDate: null,
  searchText: "",
};

const initialEventStateCopy = { ...initialEventSearchState };

const MainRouter = () => {
  const [eventSearchState, setEventSearchState] = useState(
    initialEventSearchState
  );

  const [leadSearchState, setLeadSearchState] = useState(
    initialLeadSearchState
  );

  return (
    <div>
      <Menu />
      <Switch>
        <Route
          exact
          path="/"
          render={(props) => (
            <EventsPage
              {...props}
              queryState={eventSearchState}
              initialQueryState={initialEventStateCopy}
              updateQueryState={setEventSearchState}
            />
          )}
        />
        <Route
          path="/leads"
          render={(props) => (
            <Leads
              {...props}
              queryState={leadSearchState}
              setQueryState={setLeadSearchState}
            />
          )}
        />
        <Route path="/users" component={Users} />
        <Route path="/signup" component={Signup} />
        <Route path="/signin" component={Signin} />
        <PrivateRoute path="/user/edit/:userId" component={EditProfile} />
        <Route path="/user/:userId" component={Profile} />
        <Route path="/event/:eventId" component={Event} />
        <Route path="/lead/:leadId" component={Lead} />
      </Switch>
    </div>
  );
};

export default MainRouter;
