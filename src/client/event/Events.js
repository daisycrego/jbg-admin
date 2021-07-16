import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { list, sync_events } from "./api-event.js";
import auth from "./../auth/auth-helper";
import { Snackbar } from "@material-ui/core";
import EventsTable from "./EventsTable";
import { Redirect } from "react-router-dom";
import Button from "@material-ui/core/Button";
import SyncIcon from "@material-ui/icons/Sync";

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

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function Events(props) {
  const jwt = auth.isAuthenticated();
  const classes = useStyles();
  const [events, setEvents] = useState([]);
  const [currentPageRows, setCurrentPageRows] = React.useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [redirectToSignin, setRedirectToSignin] = useState(false);
  const [sources, setSources] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);

  const createSnackbarAlert = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const updateEvents = (
    newActiveSources = ["Zillow Flex"],
    newActiveStatuses = null,
    newOrder = "desc",
    newOrderBy = "created",
    newStartDate = null,
    newEndDate = null
  ) => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const options = {
      activeSources: newActiveSources,
      activeStatuses: newActiveStatuses,
      order: newOrder,
      orderBy: newOrderBy,
      startDate: newStartDate,
      endDate: newEndDate,
    };

    setIsLoading(true);
    list(signal, options).then((data) => {
      if (data && data.error) {
        console.log(data.error);
        setIsLoading(false);
        handleUpdateOpenFilter(null);
        set;
        setRedirectToSignin(true);
      } else {
        setEvents(data ? data.events : []);
        setCurrentPageRows(
          data & data.events
            ? data.events.slice(
                props.page * props.pageSize,
                props.page * props.pageSize + props.pageSize
              )
            : []
        );
        setSources(data ? data.sources : []);
        setStatuses(data ? data.statuses : []);
        setIsLoading(false);
        handleUpdateOpenFilter(null);
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
      activeSources: props.activeSources,
      activeStatuses: props.activeStatuses,
      order: props.order,
      orderBy: props.orderBy,
      startDate: props.pickerState.startDate,
      endDate: props.pickerState.endDate,
    };
    setIsLoading(true);
    list(signal, options).then((data) => {
      if (data && data.error) {
        console.log(data.error);
        setIsLoading(false);
        setRedirectToSignin(true);
      } else {
        setIsLoading(false);
        setEvents(data.events);
        setCurrentPageRows(
          data.events
            ? data.events.slice(
                props.page * props.pageSize,
                props.page * props.pageSize + props.pageSize
              )
            : []
        );
        setSources(data.sources);
        setStatuses(data.statuses);
      }
    });

    return function cleanup() {
      abortController.abort();
    };
  }, []);

  const handleUpdateOpenFilter = (newState) => {
    setOpenFilter(newState);
  };

  const confirmSyncEventsClick = () => {
    const continueSync = confirm(
      "Are you sure you need to sync the events? Only do this when the system has gone out of sync."
    );
    if (!continueSync) {
      return;
    }
    handleSyncEventsClick();
  };

  const handleSyncEventsClick = async () => {
    const jwt = auth.isAuthenticated();
    const credentials = { t: jwt.token };
    const abortController = new AbortController();
    const signal = abortController.signal;
    setSnackbarMessage("Syncing with FUB /events API...");
    setSnackbarOpen(true);
    const result = await sync_events(credentials, signal);
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
    props.setPage(newPage);
  };

  const handleUpdatePageSize = (newPageSize) => {
    props.setPageSize(newPageSize);
  };

  const handleUpdate = (newData, type) => {
    switch (type) {
      case "source":
        props.setActiveSources(newData);
        updateEvents(
          newData, // new activeSources
          props.activeStatuses,
          props.order,
          props.orderBy,
          props.pickerState.startDate,
          props.pickerState.endDate
        );
        break;
      case "status":
        props.setActiveStatuses(newData);
        updateEvents(
          props.activeSources,
          newData, // new activeStatuses
          props.order,
          props.orderBy,
          props.pickerState.startDate,
          props.pickerState.endDate
        );
        break;
      case "order":
        props.setOrder(newData);
        const newOrderEvents = stableSort(
          events,
          getComparator(newData, props.orderBy)
        );
        setEvents(newOrderEvents);
        break;
      case "orderBy":
        props.setOrderBy(newData);
        const newOrderByEvents = stableSort(
          events,
          getComparator(props.order, newData)
        );
        setEvents(newOrderByEvents);
        break;
      case "currentPageRows":
        setCurrentPageRows(newData);
        break;
      case "datePicker":
        props.updatePickerState(newData);
        updateEvents(
          props.activeSources,
          props.activeStatuses,
          props.order,
          props.orderBy,
          newData.startDate,
          newData.endDate
        );
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

      <EventsTable
        handleSyncEventsClick={confirmSyncEventsClick}
        pickerState={props.pickerState}
        updatePickerState={(e) => handleUpdate(e, "datePicker")}
        isLoading={isLoading}
        activeRows={events}
        currentPageRows={currentPageRows}
        updateCurrentPageRows={(e) => handleUpdate(e, "currentPageRows")}
        page={props.page}
        pageSize={props.pageSize}
        updatePage={handleUpdatePage}
        updatePageSize={handleUpdatePageSize}
        sources={sources}
        statuses={statuses}
        activeSources={props.activeSources}
        activeStatuses={props.activeStatuses}
        updateActiveSources={(e) => handleUpdate(e, "source")}
        updateActiveStatuses={(e) => handleUpdate(e, "status")}
        order={props.order}
        updateOrder={(e) => handleUpdate(e, "order")}
        orderBy={props.orderBy}
        updateOrderBy={(e) => handleUpdate(e, "orderBy")}
        openFilter={openFilter}
        updateOpenFilter={handleUpdateOpenFilter}
        createSnackbarAlert={createSnackbarAlert}
      />
    </Paper>
  );
}
