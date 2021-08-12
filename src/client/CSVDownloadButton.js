import React from "react";
import { Button } from "@material-ui/core";
import { GetApp } from "@material-ui/icons";
import { CSVLink } from "react-csv";

export default function CSVDownloadButton({ Parser, classes, rows }) {
  const csv = Parser.generateCSV(rows);

  return (
    <Button variant="contained" color="primary" className={classes.button}>
      <CSVLink
        style={{ color: "inherit", display: "flex", alignItems: "center" }}
        data={csv}
      >
        <GetApp />
        Download .csv
      </CSVLink>
    </Button>
  );
}
