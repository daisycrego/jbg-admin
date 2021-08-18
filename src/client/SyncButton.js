import React from "react";
import { Button } from "@material-ui/core";
import { Sync } from "@material-ui/icons";

export default function SyncButton({ classes, handleSync, name }) {
  const confirmSync = () => {
    const continueSync = confirm(
      "Are you sure you need to sync? Only do this when the system has gone out of date."
    );
    if (!continueSync) {
      return;
    }
    handleSync();
  };
  return (
    <Button
      variant="contained"
      color="primary"
      className={classes.button}
      startIcon={<Sync />}
      onClick={confirmSync}
    >
      SYNC {name}
    </Button>
  );
}
