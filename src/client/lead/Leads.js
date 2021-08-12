import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { Snackbar } from "@material-ui/core";

import { list, sync_leads } from "./api-lead.js";
import auth from "./../auth/auth-helper";
import LeadsTable from "./LeadsTable";
import { zillowStageOptions } from "../../lib/constants";

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

export default function Leads({ queryState, setQueryState }) {
  const jwt = auth.isAuthenticated();
  const classes = useStyles();
  const [allRows, setAllRows] = useState([]);
  const [currentPageRows, setCurrentPageRows] = React.useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [redirectToSignin, setRedirectToSignin] = useState(false);
  const [sources, setSources] = useState([]);
  const [fubStages, setFubStages] = useState([]);
  const [zillowStages, setZillowStages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);

  const createSnackbarAlert = (message) => {
    setSnackbar({ message, open: true });
  };

  const updateLeads = (initialState) => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    setIsLoading(true);
    list(signal, initialState).then((data) => {
      if (data && data.error) {
        console.log(data.error);
        setIsLoading(false);
        handleUpdate(null, "filter");
        set;
        setRedirectToSignin(true);
      } else {
        setAllRows(data ? data.leads : []);
        const page =
          data && data.leads
            ? data.leads.slice(
                queryState.page * queryState.pageSize,
                queryState.page * queryState.pageSize + queryState.pageSize
              )
            : [];
        setCurrentPageRows(page);
        setSources(data.sources ? data.sources : []);
        setFubStages(data.fubStages ? data.fubStages : []);
        setZillowStages(
          data.zillowStages ? data.zillowStages : zillowStageOptions
        );
        setIsLoading(false);
        handleUpdate(null, "filter");
      }
    });
  };

  useEffect(() => {
    if (!jwt) {
      setRedirectToSignin(true);
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
        setAllRows(data ? data.leads : []);
        setCurrentPageRows(
          data.leads
            ? data.leads.slice(
                queryState.page * queryState.pageSize,
                queryState.page * queryState.pageSize + queryState.pageSize
              )
            : []
        );
        setSources(data.sources);
        setFubStages(data.fubStages);
        setZillowStages(
          data.zillowStages ? data.zillowStages : zillowStageOptions
        );
      }
    });

    return function cleanup() {
      abortController.abort();
    };
  }, []);

  const confirmSyncLeadsClick = () => {
    const continueSync = confirm(
      "Are you sure you need to sync the leads? Only do this when the system has gone out of sync."
    );
    if (!continueSync) {
      return;
    }
    handleSyncLeadsClick();
  };

  const handleSyncLeadsClick = async () => {
    const jwt = auth.isAuthenticated();
    const credentials = { t: jwt.token };
    const abortController = new AbortController();
    const signal = abortController.signal;
    setSnackbar({ message: "Syncing with Follow Up Boss...", open: true });
    const result = await sync_leads(credentials, signal);
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

  const handleUpdate = (newData, type) => {
    switch (type) {
      case "page":
        setQueryState({ ...queryState, page: newData });
        break;
      case "pageSize":
        setQueryState({ ...queryState, pageSize: newData, page: 0 });
        break;
      case "source":
        setQueryState({ ...queryState, activeSources: newData, page: 0 });
        updateLeads({
          ...queryState,
          activeSources: newData,
        });
        break;
      case "zillowStage":
        setQueryState({ ...queryState, activeZillowStages: newData, page: 0 });
        updateLeads({
          ...queryState,
          activeZillowStages: newData,
        });
        break;
      case "fubStage":
        setQueryState({ ...queryState, activeFubStages: newData, page: 0 });
        updateLeads({
          ...queryState,
          activeFubStages: newData,
        });
        break;
      case "order":
        setQueryState({ ...queryState, order: newData });
        const newOrderLeads = stableSort(
          allRows,
          getComparator(newData, queryState.orderBy)
        );
        setAllRows(newOrderLeads);
        break;
      case "orderBy":
        setQueryState({ ...queryState, orderBy: newData });
        const newOrderByLeads = stableSort(
          allRows,
          getComparator(queryState.order, newData)
        );
        setAllRows(newOrderByLeads);
        break;
      case "currentPageRows":
        setCurrentPageRows(newData);
        break;
      case "datePicker":
        setQueryState({
          ...queryState,
          startDate: newData.startDate,
          endDate: newData.endDate,
        });
        updateLeads({
          ...queryState,
          startDate: newData.startDate,
          endDate: newData.endDate,
        });
        break;
      case "filter":
        setOpenFilter(newData);
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
        message={snackbar.message}
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        autoHideDuration={2000}
      />

      <LeadsTable
        handleSyncLeadsClick={confirmSyncLeadsClick}
        isLoading={isLoading}
        activeRows={allRows}
        currentPageRows={currentPageRows}
        sources={sources}
        fubStages={fubStages}
        zillowStages={zillowStages}
        zillowStageOptions={zillowStageOptions}
        openFilter={openFilter}
        createSnackbarAlert={createSnackbarAlert}
        queryState={queryState}
        updateQueryState={(e) => handleUpdate(e, "datePicker")}
        handleUpdate={handleUpdate}
      />
    </Paper>
  );
}
