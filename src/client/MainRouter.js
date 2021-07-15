import React, { useState, createContext, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import Users from "./user/Users";
import Events from "./event/Events";
import Signup from "./user/Signup";
import Event from "./event/Event";
import Leads from "./lead/Leads";
import Signin from "./auth/Signin";
import EditProfile from "./user/EditProfile";
import Profile from "./user/Profile";
import PrivateRoute from "./auth/PrivateRoute";
import Menu from "./core/Menu";
import zillowStatusOptions from "../lib/constants";
import { START_DATE } from "@datepicker-react/styled";

const page = 0;
const pageSize = 10;
const activeSources = ["Zillow Flex"];
const activeStatuses = zillowStatusOptions;
const order = "desc";
const orderBy = "created";
const initialState = {
  page: page,
  pageSize: pageSize,
  activeSources: activeSources,
  activeStatuses: activeStatuses,
  order: order,
  orderBy: orderBy,
  startDate: null,
  endDate: null,
};

const MainRouter = () => {
  const [pageSize, setPageSize] = useState(initialState.pageSize);
  const [page, setPage] = useState(initialState.page);
  const [order, setOrder] = useState(initialState.order);
  const [orderBy, setOrderBy] = useState(initialState.orderBy);
  const [activeSources, setActiveSources] = useState(
    initialState.activeSources
  );
  const [activeStatuses, setActiveStatuses] = useState(
    initialState.activeStatuses
  );

  const [pickerState, setPickerState] = useState({
    startDate: null,
    endDate: null,
  });
  //const [startDate, setStartDate] = useState(null);
  //const [endDate, setEndDate] = useState(null);

  return (
    <div>
      <Menu />
      <Switch>
        <Route
          exact
          path="/"
          render={(props) => (
            <Events
              {...props}
              pageSize={pageSize}
              setPageSize={setPageSize}
              page={page}
              setPage={setPage}
              activeSources={activeSources}
              setActiveSources={setActiveSources}
              activeStatuses={activeStatuses}
              setActiveStatuses={setActiveStatuses}
              order={order}
              setOrder={setOrder}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
              pickerState={pickerState}
              updatePickerState={(e) => {
                console.log(
                  `<Events/>'s updatePickerState calls <MainRouter/>'s setPickerState`
                );
                console.log(e);
                setPickerState(e);
              }}
            />
          )}
        />
        <Route path="/leads" component={Leads} />
        <Route path="/users" component={Users} />
        <Route path="/signup" component={Signup} />
        <Route path="/signin" component={Signin} />
        <PrivateRoute path="/user/edit/:userId" component={EditProfile} />
        <Route path="/user/:userId" component={Profile} />
        <Route path="/event/:eventId" component={Event} />
      </Switch>
    </div>
  );
};

export default MainRouter;
