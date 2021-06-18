import React from "react";
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

const MainRouter = () => {
  return (
    <div>
      <Menu />
      <Switch>
        <Route exact path="/" component={Events} />
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
