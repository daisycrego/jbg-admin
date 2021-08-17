import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { list, update, sync_events } from "./api-event.js";
import auth from "./../auth/auth-helper";
import EnhancedTable from "../EnhancedTable";
import { tableAttr, tableDataTypes } from "../../lib/table";
import { stableSort } from "../../lib/sort";
import { CSVParser } from "../../lib/csvParser";
import { Snackbar } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    margin: theme.spacing(5),
  },
  title: {
    margin: `${theme.spacing(4)}px 0 ${theme.spacing(2)}px`,
    color: theme.palette.openTitle,
  },
  button: {
    margin: theme.spacing(1),
  },
}));

export default function EventsPage({
  queryState,
  initialQueryState,
  updateQueryState,
}) {
  const jwt = auth.isAuthenticated();
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const [filterCategories, setFilterCategories] = useState({
    sources: [],
    statuses: [],
    isPossibleZillowExemption: ["YES", "NO"],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const [redirectToSignin, setRedirectToSignin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createSnackbarAlert = (message) => {
    setSnackbar({ message, open: true });
  };

  const handleQueryReset = () => {
    updateQueryState(initialQueryState);
  };

  const handleStatusUpdate = (newStatus, event) => {
    let eventCopy = event;
    eventCopy.status = newStatus;
    // make a fetch to the API to update the status for this event
    update(
      {
        eventId: event._id,
      },
      {
        t: jwt.token,
      },
      {
        status: newStatus,
      }
    ).then((data) => {
      if (data && data.error) {
        console.log(data.error);
      }
    });
  };

  const handleSyncEvents = async () => {
    const jwt = auth.isAuthenticated();
    const credentials = { t: jwt.token };
    const abortController = new AbortController();
    const signal = abortController.signal;
    setSnackbar({ message: "Syncing with Follow Up Boss...", open: true });
    const result = await sync_events(credentials, signal);
    if (result.message) {
      // { error: "You have reached the rate limit for number of requ…oss.com/reference#rate-limiting for more details."}
      // send to a notify/snackbar
      setSnackbar({ message: result.message, open: true });
    } else if (result.error) {
      setSnackbar({ open: true, message: result.error });
    } else {
      setSnackbar({ open: true, message: result });
    }
  };

  const generateColumnDesc = () => {
    return [
      {
        name: "propertyStreet",
        title: "Property address",
        type: tableDataTypes.STRING,
        attr: [],
        categories: null,
        categoriesName: null,
      },
      {
        name: "created",
        title: "Created",
        type: tableDataTypes.DATE,
        attr: [],
        categories: null,
        categoriesName: null,
      },
      {
        name: "source",
        title: "Source",
        type: tableDataTypes.STRING,
        attr: [tableAttr.FILTERABLE],
        categories: filterCategories.sources, // if null, base the filter options on the available data (eg distinct values are the categories)
        categoriesName: "sources", // queryState.categories[categoriesName] will have the `all`, `default`, and `active` arrays for the current query state
      },
      {
        name: "status",
        title: "Status",
        type: tableDataTypes.STRING,
        attr: [tableAttr.FILTERABLE, tableAttr.UPDATABLE],
        categories: filterCategories.statuses,
        categoriesName: "statuses",
        updateHandler: handleStatusUpdate,
      },
      {
        name: "isPossibleZillowExemption",
        title: "Possible Zillow Flex exemption?",
        type: tableDataTypes.BOOLEAN,
        attr: [],
        categories: null,
        categoriesName: null,
      },
      {
        name: "id",
        title: "More",
        type: tableDataTypes.LINK,
        attr: [],
        categories: null,
        categoriesName: null,
      },
    ];
  };

  const prepareEvents = (events) => {
    if (!events || !events.length) {
      return [];
    }
    const filteredEvents = events.map((event) => {
      event.propertyStreet = event.property ? event.property.street : "";
      return event;
    });
    return filteredEvents;
  };

  useEffect(() => {
    if (!jwt) {
      setRedirectToSignin(true);
      return;
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

    setIsLoading(true);

    list(signal, queryState).then((data) => {
      if (data && data.error) {
        console.log(data.error);
        setIsLoading(false);
        setRedirectToSignin(true);
      } else {
        setIsLoading(false);
        setRows(prepareEvents(data.events));
        setFilterCategories({
          sources: data.sources,
          statuses: data.statuses,
        });
      }
    });

    return function cleanup() {
      abortController.abort();
    };
  }, [queryState]);

  if (redirectToSignin) {
    return <Redirect to="/signin" />;
  }
  return (
    <Paper className={classes.root} elevation={4}>
      <Snackbar
        message={snackbar.message}
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        autoHideDuration={2000}
      />
      <EnhancedTable
        title={"Follow-Up Boss Events"}
        isLoading={isLoading}
        rows={rows}
        columns={generateColumnDesc()}
        queryState={queryState}
        updateQueryState={updateQueryState}
        tableDataTypes={tableDataTypes}
        CSVParser={CSVParser}
        handleSync={handleSyncEvents}
        handleQueryReset={handleQueryReset}
        createSnackbarAlert={createSnackbarAlert}
      />
    </Paper>
  );
}
