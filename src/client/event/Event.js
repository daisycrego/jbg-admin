import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import EventIcon from "@material-ui/icons/Event";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Edit from "@material-ui/icons/Edit";
import Divider from "@material-ui/core/Divider";
import DeleteEvent from "./DeleteEvent";
import auth from "./../auth/auth-helper";
import { read } from "./api-event.js";
import { Redirect, Link } from "react-router-dom";

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

  if (redirectToSignin) {
    return <Redirect to="/signin" />;
  }
  // prettier-ignore
  return (
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
          {auth.isAuthenticated().user && (
            <ListItemSecondaryAction>
              <Link to={"/event/edit/" + event._id}>
                <IconButton aria-label="Edit" color="primary">
                  <Edit />
                </IconButton>
              </Link>
              <DeleteEvent eventId={event._id} />
            </ListItemSecondaryAction>
          )}
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary={`ID (FUB)`} secondary={event._id} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Person ID:`} secondary={event.personId} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Property URL:`} secondary={<a href={event.property?.url}>{event.property?.url}</a>}/>
        </ListItem>
        <ListItem>
          <ListItemText primary={`Message:`} secondary={event.message} />
        </ListItem>

        <ListItem>
          <ListItemText
            primary={"Created:"} secondary={new Date(event.created).toDateString()}
          />
        </ListItem>
        <ListItem style={{ wordWrap: "break-word" }}>
          <pre>{JSON.stringify(event, undefined, 2)}</pre>
        </ListItem>
      </List>
    </Paper>
  );
}
