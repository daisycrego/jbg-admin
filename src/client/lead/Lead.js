import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
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
import {
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
} from "@material-ui/icons";

import auth from "./../auth/auth-helper";
import { read } from "./api-lead.js";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 600,
    margin: "auto",
    padding: theme.spacing(3),
    marginTop: theme.spacing(5),
  },
  title: {
    marginTop: theme.spacing(3),
    color: theme.palette.protectedTitle,
  },
}));

export default function Lead({ match }) {
  const classes = useStyles();
  const [lead, setLead] = useState({});
  const [redirectToSignin, setRedirectToSignin] = useState(false);
  const [redirectToEvents, setRedirectToEvents] = useState(false);
  const jwt = auth.isAuthenticated();

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    read(
      {
        leadId: match.params.leadId,
      },
      { t: jwt.token },
      signal
    ).then((data) => {
      if (data && data.error) {
        setRedirectToSignin(true);
      } else {
        //data.message = data.message.match(/.{1,50}/g);
        if (data.property && data.property.url) {
          data.property.url = data.property.url.match(/.{1,50}/g);
        }
        setLead(data);
      }
    });

    return function cleanup() {
      abortController.abort();
    };
  }, [match.params.leadId]);

  const handleReturnToSearch = () => {
    setRedirectToEvents(true);
  };

  if (redirectToSignin) {
    return <Redirect to="/signin" />;
  } else if (redirectToEvents) {
    return <Redirect to="/leads" />;
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
      style={{margin:10}}
    >
      Back to search results</Button>
    <Paper className={classes.root} elevation={4}>
      <Typography variant="h6" className={classes.title}>
        Lead
      </Typography>
      <List dense>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={lead.name} secondary={lead.name} />{" "}
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary={`ID (FUB)`} secondary={lead._id} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Phone #1:`} secondary={lead.phones && lead.phones.length ? lead.phones[0].value : ''} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Email #1:`} secondary={lead.emails && lead.emails.length ? lead.emails[0].value : ''} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Address #1:`} secondary={lead.addresses && lead.addresses.length ? lead.addresses[0].value : ''} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`FUB Stage:`} secondary={lead.stage} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Zillow Stage:`} secondary={lead.zillowStage} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Source:`} secondary={lead.source}/>
        </ListItem>
        <ListItem>
          <ListItemText primary={`Source URL:`} secondary={lead.sourceUrl ? <a target="_blank" href={lead.sourceUrl}>{lead.sourceUrl}</a> : ''}/>
        </ListItem>
        <ListItem>
          <ListItemText
            primary={"Created:"} secondary={new Date(lead.created).toDateString()}
          />
        </ListItem>
      </List>
    </Paper>
    </>
  );
}
