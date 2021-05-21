import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import ArrowForward from "@material-ui/icons/ArrowForward";
import Person from "@material-ui/icons/Person";
import EventIcon from "@material-ui/icons/Event";
import { Link } from "react-router-dom";
import { list, sync_events } from "./api-event.js";
import auth from "./../auth/auth-helper";
import { Snackbar } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import SyncIcon from "@material-ui/icons/Sync";
import EventsTable from "./EventsTable";

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
  const classes = useStyles();
  const [events, setEvents] = useState([]);
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [displayMoreButton, setMoreButton] = useState(false);
  const [displayLessButton, setLessButton] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    // currently we call `list` and pass it a signal,
    // and it returns ALL the events data available
    // but we want it return a subset (most recent 20, e.g.)
    // as well as a `nextLink` or an idea of what page that was,
    // so we can return the next page of events...

    // or, we could do a "See more" feature where
    // we make the page longer and longer as we need.
    // this way the page still has access to all events,
    // it's just a matter of what we display.
    list(signal).then((data) => {
      if (data && data.error) {
        console.log(data.error);
      } else {
        console.log(`setting events to`);

        setEvents(data);
        if (data.length > 10) {
          const tempArray = data.slice(0, 10);
          setVisibleEvents(tempArray);
          setMoreButton(true);
        } else {
          setVisibleEvents(data);
        }
      }
    });

    return function cleanup() {
      abortController.abort();
    };
  }, []);

  const handleMoreButtonClick = () => {
    // find 10 more recent events that aren't already displayed
    // the newLen is either current length + 10 or the max, whichever is smaller
    const newLen =
      visibleEvents.length + 10 <= events.length
        ? visibleEvents.length + 10
        : events.length;
    const newEvents = events.slice(0, newLen);

    // add them to setVisibleEvents
    setVisibleEvents(newEvents);

    // hide the more button if there aren't any more events to show,
    // these are all the events
    if (newEvents.length > 10) {
      setLessButton(true);
    }
    if (newEvents.length === events.length) {
      setMoreButton(false);
    }
  };

  const handleLessButtonClick = () => {
    const newLen = Math.max(visibleEvents.length - 10, 10);
    const newEvents = events.slice(0, newLen);
    setVisibleEvents(newEvents);
    if (newEvents.length <= 10) {
      setLessButton(false);
    }
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

  return (
    <Paper className={classes.root} elevation={4}>
      <Snackbar
        message={snackbarMessage}
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={2000}
      />
      <Typography variant="h6" className={classes.title}>
        All Events
      </Typography>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        startIcon={<SyncIcon />}
        onClick={handleSyncEventsClick}
      >
        Sync Events
      </Button>
      <EventsTable rows={events} />
      <List dense>
        {visibleEvents.map((item, i) => {
          return (
            <Link to={"/event/" + item._id} key={i}>
              <ListItem button>
                <ListItemAvatar>
                  <Avatar>
                    <EventIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={new Date(item.created).toDateString()} />
                <ListItemText
                  primary={(item.property && item.property.street) || ""}
                />
                <ListItemText primary={item.source || ""} />
                <ListItemSecondaryAction>
                  <IconButton>
                    <ArrowForward />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </Link>
          );
        })}
      </List>
      {displayMoreButton && (
        <Button onClick={handleMoreButtonClick} color="secondary">
          {" "}
          More{" "}
        </Button>
      )}
      {displayLessButton && (
        <Button onClick={handleLessButtonClick} color="secondary">
          {" "}
          Less{" "}
        </Button>
      )}
    </Paper>
  );
}
