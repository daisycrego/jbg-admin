import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { list, sync_events } from "./api-event.js";
import auth from "./../auth/auth-helper";
import { Snackbar } from "@material-ui/core";
import EventsTable from "./EventsTable";
import { Redirect } from "react-router-dom";
import zillowStatusOptions from "../../lib/constants";
import { Datepicker, START_DATE } from "@datepicker-react/styled";
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

export default function Events({
  pageSize,
  setPageSize,
  page,
  setPage,
  order,
  setOrder,
  orderBy,
  setOrderBy,
  activeSources,
  setActiveSources,
  activeStatuses,
  setActiveStatuses,
  pickerState,
  updatePickerState,
}) {
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
  //const [focusedDateInput, setFocusedDateInput] = useState(START_DATE);

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
        setEvents(data.events);
        setCurrentPageRows(
          data.events
            ? data.events.slice(page * pageSize, page * pageSize + pageSize)
            : []
        );
        setSources(data.sources);
        setStatuses(data.statuses);
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
      activeSources: activeSources,
      activeStatuses: activeStatuses,
      order: order,
      orderBy: orderBy,
      startDate: pickerState.startDate,
      endDate: pickerState.endDate,
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
            ? data.events.slice(page * pageSize, page * pageSize + pageSize)
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
        const newOrderEvents = stableSort(
          events,
          getComparator(newData, orderBy)
        );
        setEvents(newOrderEvents);
        break;
      case "orderBy":
        setOrderBy(newData);
        const newOrderByEvents = stableSort(
          events,
          getComparator(order, newData)
        );
        setEvents(newOrderByEvents);
        break;
      case "currentPageRows":
        setCurrentPageRows(newData);
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
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        startIcon={<SyncIcon />}
        onClick={handleSyncEventsClick}
      >
        Sync Events
      </Button>
      <EventsTable
        pickerState={pickerState}
        updatePickerState={(e) => {
          console.log(
            `<EventsTable/>'s updatePickerState calling <Events/>'s setPickerState`
          );
          setPickerState(e);
        }}
        isLoading={isLoading}
        activeRows={events}
        currentPageRows={currentPageRows}
        updateCurrentPageRows={(e) => handleUpdate(e, "currentPageRows")}
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
        openFilter={openFilter}
        updateOpenFilter={handleUpdateOpenFilter}
      />
    </Paper>
  );
}
