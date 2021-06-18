import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { list, read, sync_leads } from "./api-lead.js";
import auth from "./../auth/auth-helper";
import { Snackbar } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import SyncIcon from "@material-ui/icons/Sync";
import LeadsTable from "./LeadsTable";
import { Redirect, Link } from "react-router-dom";

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

export default function Leads() {
  const jwt = auth.isAuthenticated();
  const classes = useStyles();
  const [leads, setLeads] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [redirectToSignin, setRedirectToSignin] = useState(false);

  useEffect(() => {
    console.log(`<Leads /> --> useEffect: The frontend <Leads /> component needs all of the current
    leads data to pass down to <LeadsTable/>. To do this, it fetches from the 
    leads api (one of our internal APIs).`);
    if (!jwt) {
      setRedirectToSignin(true);
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

    list(signal)
      .then((data) => {
        console.log(`<Leads /> --> useEffect: These are the results of the internal fetch
        to the leads api:`);
        console.log(data);
        if (data && data.error) {
          console.log(
            `<Leads /> --> useEffect: The fetch from the internal lead api failed:`
          );
          console.log(data.error);
          setRedirectToSignin(true);
        } else {
          console.log(`<Leads /> fetched the leads data:`);
          console.log(data);
          setLeads(data ? data : []);
        }
      })
      .catch((err) => console.log(err));

    return function cleanup() {
      abortController.abort();
    };
  }, []);

  const handleSyncLeadsClick = async () => {
    const jwt = auth.isAuthenticated();
    const credentials = { t: jwt.token };
    const abortController = new AbortController();
    const signal = abortController.signal;
    setSnackbarMessage("Syncing with FUB /leads API...");
    setSnackbarOpen(true);
    const result = await sync_leads(credentials, signal);
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
      {
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          startIcon={<SyncIcon />}
          onClick={() => {
            if (
              confirm(
                `Are you sure you want to sync all leads? This could take some time...`
              )
            ) {
              handleSyncLeadsClick();
            }
          }}
        >
          Sync Leads
        </Button>
      }
      <LeadsTable rows={leads} />
    </Paper>
  );
}
