import React, { useState } from "react";
import { Tooltip, Typography, Button } from "@material-ui/core";
import {
  DateRange,
  Clear,
  ExpandLess,
  EventAvailable,
  ArrowRightAlt,
} from "@material-ui/icons";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import LuxonUtils from "@date-io/luxon"; // peer date library for MUI date picker

export default function EnhancedDatePicker(props) {
  const { queryState, updateQueryState, classes } = props;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(props.startDate);
  const [endDate, setEndDate] = useState(props.endDate);

  const handleDatesChange = (data, type) => {
    switch (type) {
      case "start":
        if (endDate && data > endDate) {
          props.createSnackbarAlert("Start date must come before end date");
          return;
        }
        setStartDate(data);
        break;
      case "end":
        if (startDate && data < startDate) {
          props.createSnackbarAlert("End date must come after start date");
          return;
        }
        setEndDate(data);
        break;
    }
  };

  return (
    <>
      {showDatePicker ? (
        <div style={{ backgroundColor: "#f5f5f5", padding: "1em" }}>
          <div style={{ display: "flex", marginBottom: 5 }}>
            <Tooltip title="Hide">
              <Button
                color="primary"
                variant="contained"
                className={classes.button}
                onClick={() => setShowDatePicker(false)}
                style={{ marginRight: 1 }}
              >
                <ExpandLess />
              </Button>
            </Tooltip>
            {(startDate || endDate) && (
              <Tooltip title="Clear dates">
                <Button
                  color="primary"
                  variant="contained"
                  className={classes.button}
                  startIcon={<Clear />}
                  style={{ marginLeft: 1 }}
                  onClick={(e) => {
                    setStartDate(null);
                    setEndDate(null);
                    setShowDatePicker(false);
                    updateQueryState({
                      ...queryState,
                      startDate: null,
                      endDate: null,
                    });
                  }}
                >
                  Clear Dates
                </Button>
              </Tooltip>
            )}
          </div>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <div>
              <Typography>from: </Typography>
              <DatePicker
                value={startDate ? startDate : null}
                onChange={(e) => handleDatesChange(e, "start")}
              />
            </div>
            <div style={{ marginBottom: 5 }}>
              <Typography>to: </Typography>
              <DatePicker
                value={endDate ? endDate : null}
                onChange={(e) => handleDatesChange(e, "end")}
              />
            </div>
            <Tooltip title="Apply changes">
              <Button
                color="primary"
                variant="contained"
                className={classes.button}
                startIcon={<EventAvailable />}
                onClick={() =>
                  updateQueryState({
                    ...queryState,
                    startDate: startDate,
                    endDate: endDate,
                  })
                }
              >
                Apply Changes
              </Button>
            </Tooltip>
          </MuiPickersUtilsProvider>
        </div>
      ) : (
        <Tooltip title="Filter by date">
          <Button
            onClick={(e) => setShowDatePicker(true)}
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<DateRange />}
          >
            {startDate || endDate ? (
              <>
                <Typography>
                  {" "}
                  {startDate ? startDate.toLocaleString() : ""}{" "}
                </Typography>
                <ArrowRightAlt />
                <Typography>
                  {" "}
                  {endDate ? endDate.toLocaleString() : ""}{" "}
                </Typography>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {"Filter Dates"}
              </div>
            )}
          </Button>
        </Tooltip>
      )}
    </>
  );
}
