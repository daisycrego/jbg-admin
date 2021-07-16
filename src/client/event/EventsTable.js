import React, { useState } from "react";
import PropTypes from "prop-types";
import { lighten, makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  IconButton,
  Button,
  Select,
  MenuItem,
  Box,
} from "@material-ui/core";
import {
  Edit,
  Check,
  Cancel,
  CheckBoxOutlineBlank,
  CheckBox,
  ArrowForward,
  ArrowDropDown,
  ArrowDropUp,
  DoneAll,
  ClearAll,
  Refresh,
  DateRange,
  GetApp,
  Clear,
  Sync,
  ExpandLess,
  EventAvailable,
  ArrowRightAlt,
} from "@material-ui/icons";
import { Link } from "react-router-dom";
import options from "../../lib/constants";
import { update } from "./api-event";
import auth from "./../auth/auth-helper";
import _ from "lodash";
import GetAppIcon from "@material-ui/icons/GetApp";
import { CSVLink } from "react-csv";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import LuxonUtils from "@date-io/luxon"; // peer date library for MUI date picker
import ClearIcon from "@material-ui/icons/Clear";
import SyncIcon from "@material-ui/icons/Sync";
import DateRangeIcon from "@material-ui/icons/DateRange";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import ArrowRightAltIcon from "@material-ui/icons/ArrowRightAlt";
import { CSVParser } from "../../lib/csvParser";

const headCells = [
  {
    id: "propertyStreet",
    numeric: false,
    disablePadding: true,
    label: "Property address",
  },
  { id: "created", numeric: true, disablePadding: false, label: "Created" },
  { id: "source", numeric: true, disablePadding: false, label: "Source" },
  { id: "status", numeric: true, disablePadding: false, label: "Status" },
  {
    id: "exemption",
    numeric: false,
    disablePadding: false,
    label: "Possible Zillow Flex exemption?",
  },
  { id: "more", numeric: true, disablePadding: false, label: "More" },
];

function EnhancedTableHead(props) {
  const {
    classes,
    onRequestSort,
    openFilter,
    onSourceFilterClick,
    onStatusFilterClick,
    onSelectAllSources,
    onClearSources,
    onResetSources,
    sources,
    statuses,
    onCheckboxClick,
    onSelectAllStatuses,
    onClearStatuses,
    onResetStatuses,
    onStatusCheckboxClick,
    queryState,
    updateQueryState,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={"center"}
            padding={"normal"}
            sortDirection={
              queryState.orderBy === headCell.id ? queryState.order : false
            }
          >
            {["propertyStreet", "created"].includes(headCell.id) ? (
              <TableSortLabel
                direction={
                  queryState.orderBy === headCell.id ? queryState.order : "asc"
                }
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {queryState.orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {queryState.order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </span>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}

            {headCell.id === "status" &&
              (!openFilter || openFilter !== "status") && (
                <Button onClick={onStatusFilterClick}>
                  <ArrowDropDown />
                </Button>
              )}
            {headCell.id === "status" && openFilter === "status" && (
              <Button onClick={onStatusFilterClick}>
                <ArrowDropUp />
              </Button>
            )}
            {headCell.id === "source" &&
              (!openFilter || openFilter !== "source") && (
                <Button onClick={onSourceFilterClick}>
                  <ArrowDropDown />
                </Button>
              )}
            {headCell.id === "source" && openFilter === "source" && (
              <Button onClick={onSourceFilterClick}>
                <ArrowDropUp />
              </Button>
            )}
            {headCell.id === "source" && openFilter === "source" && (
              <Box border={1}>
                {headCell.id === "source" && openFilter === "source" && (
                  <>
                    <IconButton onClick={() => onSelectAllSources(true)}>
                      <DoneAll />
                    </IconButton>
                    <IconButton onClick={() => onClearSources(false)}>
                      <ClearAll />
                    </IconButton>
                    <IconButton onClick={() => onResetSources(null)}>
                      <Refresh />
                    </IconButton>
                  </>
                )}
                {headCell.id === "source" && openFilter === "source" && (
                  <ul className={classes.listItem}>
                    {sources.map((source) => (
                      <li key={source}>
                        {queryState.activeSources.includes(source) ? (
                          <IconButton onClick={() => onCheckboxClick(source)}>
                            <CheckBox />
                          </IconButton>
                        ) : (
                          <IconButton onClick={() => onCheckboxClick(source)}>
                            <CheckBoxOutlineBlank />
                          </IconButton>
                        )}
                        {source}
                      </li>
                    ))}
                  </ul>
                )}
              </Box>
            )}
            {headCell.id === "status" && openFilter === "status" && (
              <Box border={1}>
                {headCell.id === "status" && openFilter === "status" && (
                  <>
                    <IconButton onClick={() => onSelectAllStatuses(true)}>
                      <DoneAll />
                    </IconButton>
                    <IconButton onClick={() => onClearStatuses(false)}>
                      <ClearAll />
                    </IconButton>
                    <IconButton onClick={() => onResetStatuses(null)}>
                      <Refresh />
                    </IconButton>
                  </>
                )}
                {headCell.id === "status" && openFilter === "status" && (
                  <ul className={classes.listItem}>
                    {statuses.map((status) => (
                      <li key={status}>
                        {queryState.activeStatuses.includes(status) ? (
                          <IconButton
                            onClick={() => onStatusCheckboxClick(status)}
                          >
                            <CheckBox />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={() => onStatusCheckboxClick(status)}
                          >
                            <CheckBoxOutlineBlank />
                          </IconButton>
                        )}
                        {status}
                      </li>
                    ))}
                  </ul>
                )}
              </Box>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  queryState: PropTypes.object.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: "1 1 100%",
  },
  sourceFilters: {
    border: "solid",
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();

  const csv = CSVParser.generateCSV(props.rows);

  return (
    <Toolbar>
      {
        <>
          <Typography
            className={classes.title}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Follow-Up Boss Events
          </Typography>
          <>
            {props.showDatePicker ? (
              <div style={{ backgroundColor: "#f5f5f5", padding: "1em" }}>
                <div style={{ display: "flex", marginBottom: 5 }}>
                  <Button
                    color="primary"
                    variant="contained"
                    className={classes.button}
                    onClick={() => props.setShowDatePicker(false)}
                    style={{ marginRight: 1 }}
                  >
                    <ExpandLess />
                  </Button>
                  {(props.startDate || props.endDate) && (
                    <Button
                      color="primary"
                      variant="contained"
                      className={classes.button}
                      startIcon={<Clear />}
                      style={{ marginLeft: 1 }}
                      onClick={(e) => {
                        const newPickerState = {
                          startDate: null,
                          endDate: null,
                        };
                        /*
                  props.updateQueryState({
                    ...props.queryState,
                    newPickerState,
                  });
                  */
                        props.setStartDate(null);
                        props.setEndDate(null);
                        props.setShowDatePicker(false);
                        props.handleUpdate(newPickerState, "datePicker");
                      }}
                    >
                      Clear Dates
                    </Button>
                  )}
                </div>
                <MuiPickersUtilsProvider utils={LuxonUtils}>
                  <div>
                    <Typography>from: </Typography>
                    <DatePicker
                      value={props.startDate}
                      onChange={(e) => props.handleDatesChange(e, "start")}
                    />
                  </div>
                  <div style={{ marginBottom: 5 }}>
                    <Typography>to: </Typography>
                    <DatePicker
                      value={props.endDate}
                      onChange={(e) => props.handleDatesChange(e, "end")}
                    />
                  </div>
                  <Button
                    color="primary"
                    variant="contained"
                    className={classes.button}
                    startIcon={<EventAvailable />}
                    onClick={() =>
                      props.updateQueryState({
                        ...props.queryState,
                        startDate: props.startDate,
                        endDate: props.endDate,
                      })
                    }
                  >
                    Apply Changes
                  </Button>
                </MuiPickersUtilsProvider>
              </div>
            ) : (
              <Button
                onClick={(e) => props.setShowDatePicker(true)}
                variant="contained"
                color="primary"
                className={classes.button}
                style={{
                  marginRight: 2,
                  padding: 5,
                  paddingRight: 20,
                  paddingLeft: 20,
                }}
              >
                {props.startDate || props.endDate ? (
                  <>
                    <Typography>
                      {" "}
                      {props.startDate
                        ? props.startDate.toLocaleString()
                        : ""}{" "}
                    </Typography>
                    <ArrowRightAlt />
                    <Typography>
                      {" "}
                      {props.endDate ? props.endDate.toLocaleString() : ""}{" "}
                    </Typography>
                  </>
                ) : (
                  <>
                    <DateRange />
                    Set Dates
                  </>
                )}
              </Button>
            )}
          </>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            style={{
              marginRight: 3,
              marginLeft: 3,
              paddingRight: 5,
              paddingLeft: 5,
            }}
          >
            <CSVLink style={{ color: "inherit", display: "flex" }} data={csv}>
              <GetApp />
              Download CSV
            </CSVLink>
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<Sync />}
            onClick={props.handleSyncEventsClick}
          >
            Sync Events
          </Button>
        </>
      }
    </Toolbar>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  listItem: {
    listStyleType: "none",
    height: "10em",
    overflow: "scroll",
    overflowX: "hidden",
  },
}));

export default function EventsTable({
  activeRows,
  currentPageRows,
  sources,
  statuses,
  isLoading,
  openFilter,
  createSnackbarAlert,
  handleSyncEventsClick,
  queryState,
  updateQueryState,
  handleUpdate,
}) {
  const jwt = auth.isAuthenticated();
  const classes = useStyles();
  const [showSourceSelect, setShowSourceSelect] = useState(false);
  const [updatingRow, setUpdatingRow] = useState(null);
  const [status, setStatus] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(queryState.startDate);
  const [endDate, setEndDate] = useState(queryState.endDate);

  const handleRequestSort = (event, property) => {
    const isAsc = queryState.orderBy === property && queryState.order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    const newOrderBy = property;
    handleUpdate(newOrder, "order");
    handleUpdate(newOrderBy, "orderBy");
  };

  const handleDatesChange = (data, type) => {
    switch (type) {
      case "start":
        if (endDate && data > endDate) {
          createSnackbarAlert("Start date must come before end date");
          return;
        }
        setStartDate(data);
        break;
      case "end":
        if (startDate && data < startDate) {
          createSnackbarAlert("End date must come after start date");
          return;
        }
        setEndDate(data);
        break;
    }
  };

  const handleChangePage = (event, newPage) => {
    handleUpdate(newPage, "page");
    const newActiveRows = activeRows.slice(
      newPage * queryState.pageSize,
      newPage * queryState.pageSize + queryState.pageSize
    );
    handleUpdate(newActiveRows, "currentPageRows");
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    const newPage = 0;
    const newActiveRows = activeRows.slice(
      newPage * newRowsPerPage,
      newPage * newRowsPerPage + newRowsPerPage
    );
    handleUpdate(newRowsPerPage, "pageSize");
    handleUpdate(newActiveRows, "currentPageRows");
  };

  const handleFilterClick = (type) => {
    switch (type) {
      case "source":
        if (openFilter === "source") {
          handleUpdate(null, "filter");
        } else {
          handleUpdate("source", "filter");
        }
        break;
      case "status":
        if (openFilter === "status") {
          handleUpdate(null, "filter");
        } else {
          handleUpdate("status", "filter");
        }
        break;
      default:
        break;
    }
  };

  const handleSelect = (type, newValues) => {
    switch (type) {
      case "source":
        handleUpdate(0, "page");
        handleUpdate(newValues, "source");
        break;
      case "status":
        handleUpdate(0, "page");
        handleUpdate(newValues, "status");
        break;
      default:
        break;
    }
  };

  const emptyRows =
    queryState.Size -
    Math.min(
      queryState.pageSize,
      activeRows.length - queryState.page * queryState.pageSize
    );

  const handleUpdateStatusClick = (rowId, rowStatus) => {
    setUpdatingRow(rowId);
    setStatus(rowStatus);
    setShowSourceSelect(!showSourceSelect);
  };

  const handleStatusSelectUpdate = (e) => {
    setStatus(e.target.value);
  };

  const handleStatusSelectSubmit = (rowId, status, event) => {
    let eventCopy = event;
    eventCopy.status = status;
    // make a fetch to the API to update the status for this event
    update(
      {
        eventId: event._id,
      },
      {
        t: jwt.token,
      },
      {
        status: status,
      }
    ).then((data) => {
      if (data && data.error) {
        console.log(data.error);
        setStatus(event.status);
        setUpdatingRow(null);
      } else {
        setUpdatingRow(null);
        setStatus(data.status);
      }
    });
  };

  const handleCheckboxClick = (source) => {
    let newActiveSources;
    if (queryState.activeSources.includes(source)) {
      newActiveSources = queryState.activeSources.filter(
        (activeSource) => activeSource != source
      );
    } else {
      newActiveSources = [...queryState.activeSources, source];
    }
    handleUpdate(0, "page");
    handleUpdate(newActiveSources, "source");
  };

  const handleStatusCheckboxClick = (status) => {
    let newActiveStatuses;
    if (queryState.activeStatuses.includes(status)) {
      newActiveStatuses = queryState.activeStatuses.filter(
        (activeStatus) => activeStatus != status
      );
    } else {
      newActiveStatuses = [...queryState.activeStatuses, status];
    }
    handleUpdate(0, "page");
    handleUpdate(newActiveStatuses, "status");
  };

  const data = (row) => {
    if (showSourceSelect && updatingRow && row._id === updatingRow) {
      return (
        <>
          <Select
            labelId="status-select"
            id={`status_select_${row._id}`}
            value={status}
            key={`select_${row._id}`}
            onChange={(e) => handleStatusSelectUpdate(e)}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <IconButton
            aria-label="save"
            color="primary"
            onClick={() => handleStatusSelectSubmit(row._id, status, row)}
          >
            <Check />
          </IconButton>
          <IconButton
            aria-label="cancel"
            color="primary"
            onClick={() => handleUpdateStatusClick(row._id, status)}
          >
            <Cancel />
          </IconButton>
        </>
      );
    } else {
      return (
        <Button
          key={`status_button_${row._id}`}
          onClick={() => handleUpdateStatusClick(row._id, row.status)}
        >
          {row.status}
          <Edit key={`edit_icon_${row._id}`} />
        </Button>
      );
    }
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          rows={activeRows}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          startDate={startDate}
          endDate={endDate}
          handleDatesChange={handleDatesChange}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          createSnackbarAlert={createSnackbarAlert}
          handleSyncEventsClick={handleSyncEventsClick}
          queryState={queryState}
          updateQueryState={updateQueryState}
          handleUpdate={handleUpdate}
        />

        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={"medium"}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              queryState={queryState}
              onRequestSort={handleRequestSort}
              onSourceFilterClick={() => handleFilterClick("source")}
              openFilter={openFilter}
              sources={sources}
              statuses={statuses}
              onCheckboxClick={handleCheckboxClick}
              onStatusCheckboxClick={handleStatusCheckboxClick}
              onSelectAllSources={() => handleSelect("source", sources)}
              onClearSources={() => handleSelect("source", [])}
              onResetSources={() => handleSelect("source", sources)}
              onStatusFilterClick={() => handleFilterClick("status")}
              onSelectAllStatuses={() => handleSelect("status", statuses)}
              onClearStatuses={() => handleSelect("status", [])}
              onResetStatuses={() => handleSelect("status", statuses)}
            />

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell>
                    <h2>Loading...</h2>
                  </TableCell>
                </TableRow>
              ) : null}
              {currentPageRows.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow hover tabIndex={-1} key={row._id}>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      align={"center"}
                      padding={"normal"}
                    >
                      {row.property ? row.property.street : ""}
                    </TableCell>
                    <TableCell align={"center"} padding={"normal"}>
                      {`${new Date(row.created).toDateString()} ${new Date(
                        row.created
                      ).toLocaleTimeString()}`}
                    </TableCell>
                    <TableCell align={"center"} padding={"normal"}>
                      {row.source}
                    </TableCell>
                    <TableCell align={"center"} padding={"normal"}>
                      {data(row)}
                    </TableCell>
                    <TableCell align={"center"} padding={"normal"}>
                      {row.isPossibleZillowExemption ? "YES" : "NO"}
                    </TableCell>
                    <TableCell align={"center"} padding={"normal"}>
                      <Link to={"/event/" + row._id} key={row._id}>
                        <IconButton
                          color="primary"
                          variant="contained"
                          className={classes.button}
                        >
                          <ArrowForward />
                        </IconButton>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={activeRows.length}
          rowsPerPage={queryState.pageSize}
          page={queryState.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
