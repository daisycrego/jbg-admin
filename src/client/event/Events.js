import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { list, read, sync_events } from "./api-event.js";
import auth from "./../auth/auth-helper";
import { Snackbar } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import SyncIcon from "@material-ui/icons/Sync";
import EventsTable from "./EventsTable";
import { Redirect, Link } from "react-router-dom";
import zillowStatusOptions from "../../lib/constants";

const useStyles = makeStyles((theme) => ({
  root: theme.mixins.gutters({
    padding: theme.spacing(1),
    margin: theme.spacing(5),
  }),
  title: {
    margin: `${theme.spacing(4)}px 0 ${theme.spacing(2)}px`,
    color: theme.palette.openTitle,
  },
  button: {
    margin: theme.spacing(1),
  },
}));

export default function Events() {
  const jwt = auth.isAuthenticated();
  const classes = useStyles();
  const [events, setEvents] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [redirectToSignin, setRedirectToSignin] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sources, setSources] = React.useState([]);
  const [activeSources, setActiveSources] = React.useState(["Zillow Flex"]);
  const [statuses, setStatuses] = React.useState([]);
  const [activeStatuses, setActiveStatuses] =
    React.useState(zillowStatusOptions);
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("created");

  const updateEvents = (
    newActiveSources = ["Zillow Flex"],
    newActiveStatuses = null,
    newOrder = "desc",
    newOrderBy = "created"
  ) => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const options = {
      activeSources: newActiveSources,
      activeStatuses: newActiveStatuses,
      order: newOrder,
      orderBy: newOrderBy,
    };

    list(signal, options).then((data) => {
      if (data && data.error) {
        console.log(data.error);
        setRedirectToSignin(true);
      } else {
        setEvents(data.events);
        setSources(data.sources);
        setStatuses(data.statuses);
      }
    });
  };

  useEffect(() => {
    if (!jwt) {
      setRedirectToSignin(true);
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

    const options = {
      activeSources: activeSources,
      activeStatuses: activeStatuses,
      order: order,
      orderBy: orderBy,
    };

    list(signal, options).then((data) => {
      if (data && data.error) {
        console.log(data.error);
        setRedirectToSignin(true);
      } else {
        setEvents(data.events);
        setSources(data.sources);
        setStatuses(data.statuses);
      }
    });

    return function cleanup() {
      abortController.abort();
    };
  }, []);

  const handleSyncEventsClick = async () => {
    const jwt = auth.isAuthenticated();
    const credentials = { t: jwt.token };
    const abortController = new AbortController();
    const signal = abortController.signal;
    setSnackbarMessage("Syncing with FUB /events API...");
    setSnackbarOpen(true);
    const result = await sync_events(credentials, signal);
    console.log(result);
    if (result.message) {
      // { error: "You have reached the rate limit for number of requ…oss.com/reference#rate-limiting for more details."}
      // send to a notify/snackbar
      setSnackbarMessage(result.message);
      setSnackbarOpen(true);
    } else if (result.error) {
      setSnackbarMessage(result.error);
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage(result);
      setSnackbarOpen(true);
    }
  };

  const handleUpdatePage = (newPage) => {
    setPage(newPage);
  };

  const handleUpdatePageSize = (newPageSize) => {
    setPageSize(newPageSize);
  };

  const handleUpdate = (newData, type) => {
    switch (type) {
      case "source":
        setActiveSources(newData);
        updateEvents(
          newData, // new activeSources
          activeStatuses,
          order,
          orderBy
        );
        break;
      case "status":
        setActiveStatuses(newData);
        updateEvents(
          activeSources,
          newData, // new activeStatuses
          order,
          orderBy
        );
        break;
      case "order":
        setOrder(newData);
        updateEvents(activeSources, activeStatuses, newData, orderBy);
        break;
      case "orderBy":
        setOrderBy(newData);
        updateEvents(activeSources, activeStatuses, order, newData);
        break;
      default:
        break;
    }
  };

  if (redirectToSignin) {
    return <Redirect to="/signin" />;
  }
  return (
    <Paper className={classes.root} elevation={4}>
      <Snackbar
        message={snackbarMessage}
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={2000}
      />
      {/*
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        startIcon={<SyncIcon />}
        onClick={handleSyncEventsClick}
      >
        Sync Events
      </Button>
      */}
      <EventsTable
        rows={events}
        jwt={jwt}
        page={page}
        pageSize={pageSize}
        updatePage={handleUpdatePage}
        updatePageSize={handleUpdatePageSize}
        sources={sources}
        statuses={statuses}
        activeSources={activeSources}
        activeStatuses={activeStatuses}
        updateActiveSources={(e) => handleUpdate(e, "source")}
        updateActiveStatuses={(e) => handleUpdate(e, "status")}
        order={order}
        updateOrder={(e) => handleUpdate(e, "order")}
        orderBy={orderBy}
        updateOrderBy={(e) => handleUpdate(e, "orderBy")}
      />
    </Paper>
  );
}
