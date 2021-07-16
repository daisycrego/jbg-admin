import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import EventIcon from "@material-ui/icons/Event";
import {
  Paper,
  List,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
} from "@material-ui/core";
import auth from "./../auth/auth-helper";
import { read } from "./api-event.js";
import { Redirect } from "react-router-dom";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

const useStyles = makeStyles((theme) => ({
  root: theme.mixins.gutters({
    maxWidth: 600,
    margin: "auto",
    padding: theme.spacing(3),
    marginTop: theme.spacing(5),
  }),
  title: {
    marginTop: theme.spacing(3),
    color: theme.palette.protectedTitle,
  },
}));

export default function Event({ match }) {
  const classes = useStyles();
  const [event, setEvent] = useState({});
  const [redirectToSignin, setRedirectToSignin] = useState(false);
  const [redirectToEvents, setRedirectToEvents] = useState(false);
  const jwt = auth.isAuthenticated();

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    read(
      {
        eventId: match.params.eventId,
      },
      { t: jwt.token },
      signal
    ).then((data) => {
      if (data && data.error) {
        setRedirectToSignin(true);
      } else {
        data.message = data.message.match(/.{1,50}/g);
        if (data.property && data.property.url) {
          data.property.url = data.property.url.match(/.{1,50}/g);
        }
        setEvent(data);
      }
    });

    return function cleanup() {
      abortController.abort();
    };
  }, [match.params.eventId]);

  const handleReturnToSearch = () => {
    setRedirectToEvents(true);
  };

  if (redirectToSignin) {
    return <Redirect to="/signin" />;
  } else if (redirectToEvents) {
    return <Redirect to="/" />;
  }
  // prettier-ignore
  return (
    <>
    <Button
      onClick={handleReturnToSearch}
      variant="contained"
      color="primary"
      className={classes.button}
      startIcon={<ArrowBackIcon />}
    >
      Back to search results</Button>
    <Paper className={classes.root} elevation={4}>
      <Typography variant="h6" className={classes.title}>
        Event
      </Typography>
      <List dense>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <EventIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={event.name} secondary={event.name} />{" "}
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary={`ID (FUB)`} secondary={event._id} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Person ID:`} secondary={event.personId} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Property URL:`} secondary={<a target="_blank" href={event.property?.url}>{event.property?.url}</a>}/>
        </ListItem>
        <ListItem>
          <ListItemText primary={`Message:`} secondary={event.message} />
        </ListItem>

        <ListItem>
          <ListItemText
            primary={"Created:"} secondary={new Date(event.created).toDateString()}
          />
        </ListItem>
        <ListItem style={{ wordWrap: "break-word" }} >
          <ListItemText
            primary={"Raw JSON:"} secondary={<pre>{JSON.stringify(event, undefined, 2)}</pre>}
          />
        
        </ListItem>
      </List>
    </Paper>
    </>
  );
}
