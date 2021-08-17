import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  Tooltip,
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
  Delete,
} from "@material-ui/icons";

import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import LuxonUtils from "@date-io/luxon"; // peer date library for MUI date picker
import _ from "lodash";
import { CSVLink } from "react-csv";

import { update } from "./api-lead";
import auth from "./../auth/auth-helper";
import { LeadCSVParser } from "../../lib/leadCsvParser";

const headCells = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Name",
  },
  {
    id: "phone",
    numeric: false,
    disablePadding: true,
    label: "Phone",
  },
  {
    id: "email",
    numeric: false,
    disablePadding: true,
    label: "Email",
  },
  { id: "created", numeric: true, disablePadding: false, label: "Created" },
  { id: "source", numeric: true, disablePadding: false, label: "Source" },
  { id: "fubStage", numeric: true, disablePadding: false, label: "FUB Stage" },
  {
    id: "zillowStage",
    numeric: true,
    disablePadding: false,
    label: "Zillow Stage",
  },
  { id: "more", numeric: true, disablePadding: false, label: "More" },
];

function EnhancedTableHead(props) {
  const {
    classes,
    onRequestSort,
    openFilter,
    onSourceFilterClick,
    onZillowStageFilterClick,
    onFubStageFilterClick,
    onSelectAllSources,
    onClearSources,
    onResetSources,
    sources,
    fubStages,
    zillowStages,
    zillowStageOptions,
    onCheckboxClick,
    onSelectAllFubStages,
    onSelectAllZillowStages,
    onClearFubStages,
    onClearZillowStages,
    onResetFubStages,
    onResetZillowStages,
    onFubStageCheckboxClick,
    onZillowStageCheckboxClick,
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
            {["created"].includes(headCell.id) ? (
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
            {headCell.id === "fubStage" &&
              (!openFilter || openFilter !== "fubStage") && (
                <Button onClick={onFubStageFilterClick}>
                  <ArrowDropDown />
                </Button>
              )}
            {headCell.id === "fubStage" && openFilter === "fubStage" && (
              <Button onClick={onFubStageFilterClick}>
                <ArrowDropUp />
              </Button>
            )}
            {headCell.id === "fubStage" && openFilter === "fubStage" && (
              <Box border={1}>
                {headCell.id === "fubStage" && openFilter === "fubStage" && (
                  <>
                    <IconButton onClick={() => onSelectAllFubStages(true)}>
                      <DoneAll />
                    </IconButton>
                    <IconButton onClick={() => onClearFubStages(false)}>
                      <ClearAll />
                    </IconButton>
                    <IconButton onClick={() => onResetFubStages(null)}>
                      <Refresh />
                    </IconButton>
                  </>
                )}
                {headCell.id === "fubStage" && openFilter === "fubStage" && (
                  <ul className={classes.listItem}>
                    {fubStages.map((stage) => (
                      <li key={stage}>
                        {queryState.activeFubStages &&
                        queryState.activeFubStages.includes(stage) ? (
                          <IconButton
                            onClick={() => onFubStageCheckboxClick(stage)}
                          >
                            <CheckBox />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={() => onFubStageCheckboxClick(stage)}
                          >
                            <CheckBoxOutlineBlank />
                          </IconButton>
                        )}
                        {stage}
                      </li>
                    ))}
                  </ul>
                )}
              </Box>
            )}
            {headCell.id === "zillowStage" &&
              (!openFilter || openFilter !== "zillowStage") && (
                <Button onClick={onZillowStageFilterClick}>
                  <ArrowDropDown />
                </Button>
              )}
            {headCell.id === "zillowStage" && openFilter === "zillowStage" && (
              <Button onClick={onZillowStageFilterClick}>
                <ArrowDropUp />
              </Button>
            )}
            {headCell.id === "zillowStage" && openFilter === "zillowStage" && (
              <Box border={1}>
                {headCell.id === "zillowStage" && openFilter === "zillowStage" && (
                  <>
                    <IconButton onClick={() => onSelectAllZillowStages(true)}>
                      <DoneAll />
                    </IconButton>
                    <IconButton onClick={() => onClearZillowStages(false)}>
                      <ClearAll />
                    </IconButton>
                    <IconButton onClick={() => onResetZillowStages(null)}>
                      <Refresh />
                    </IconButton>
                  </>
                )}
                {headCell.id === "zillowStage" && openFilter === "zillowStage" && (
                  <ul className={classes.listItem}>
                    {zillowStages.map((stage) => (
                      <li key={stage}>
                        {queryState.activeZillowStages &&
                        queryState.activeZillowStages.includes(stage) ? (
                          <IconButton
                            onClick={() => onZillowStageCheckboxClick(stage)}
                          >
                            <CheckBox />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={() => onZillowStageCheckboxClick(stage)}
                          >
                            <CheckBoxOutlineBlank />
                          </IconButton>
                        )}
                        {stage}
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

  const csv = LeadCSVParser.generateCSV(props.rows);

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
            Follow-Up Boss Leads
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
            onClick={props.handleSyncLeadsClick}
          >
            Sync Leads
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

export default function LeadsTable({
  activeRows,
  currentPageRows,
  sources,
  fubStages,
  zillowStages,
  zillowStageOptions,
  isLoading,
  openFilter,
  createSnackbarAlert,
  handleSyncLeadsClick,
  queryState,
  updateQueryState,
  handleUpdate,
}) {
  const jwt = auth.isAuthenticated();
  const classes = useStyles();
  const [showSourceSelect, setShowSourceSelect] = useState(false);
  const [updatingRow, setUpdatingRow] = useState(null);
  const [updatingStage, setUpdatingStage] = useState(null);
  const [zillowStage, setZillowStage] = useState("");
  const [fubStage, setFubStage] = useState("");
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
      case "fubStage":
        if (openFilter === "fubStage") {
          handleUpdate(null, "filter");
        } else {
          handleUpdate("fubStage", "filter");
        }
        break;
      case "zillowStage":
        if (openFilter === "zillowStage") {
          handleUpdate(null, "filter");
        } else {
          handleUpdate("zillowStage", "filter");
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
      case "fub_stage":
        handleUpdate(0, "page");
        handleUpdate(newValues, "fubStage");
        break;
      case "zillow_stage":
        handleUpdate(0, "page");
        handleUpdate(newValues, "zillowStage");
        break;
      default:
        break;
    }
  };

  const emptyRows =
    queryState.Size -
    Math.min(
      queryState.pageSize,
      activeRows ? activeRows.length : 0 - queryState.page * queryState.pageSize
    );

  const handleUpdateStageClick = (rowId, rowStatus, stageType) => {
    if (rowId === updatingRow && rowStatus === updatingStage) {
      return;
    }

    switch (stageType) {
      case "fub":
        setUpdatingRow(rowId);
        setUpdatingStage("fub");
        setFubStage(rowStatus);
        setShowSourceSelect(!showSourceSelect);
        break;
      case "zillow":
        setUpdatingRow(rowId);
        setUpdatingStage("zillow");
        setZillowStage(rowStatus);
        setShowSourceSelect(!showSourceSelect);
        break;
    }
  };

  const handleStageSelectUpdate = (e, stageType) => {
    switch (stageType) {
      case "zillow":
        setZillowStage(e.target.value);
        break;
      case "fub":
        setFubStage(e.target.value);
        break;
    }
  };

  const handleStageSelectSubmit = (rowId, stage, lead, stageType) => {
    let leadCopy = lead;
    switch (stageType) {
      case "zillow":
        leadCopy.zillowStage = stage ? stage : null;
        // make a fetch to the API to update the stage for this lead
        update(
          {
            leadId: lead._id,
          },
          {
            t: jwt.token,
          },
          {
            zillowStage: stage,
          }
        ).then((data) => {
          if (data && data.error) {
            console.log(data.error);
            setZillowStage(lead.stage);
            setUpdatingRow(null);
            setUpdatingStage(null);
          } else {
            setUpdatingRow(null);
            setUpdatingStage(null);
            setZillowStage(data.stage);
          }
        });
        break;
      case "fub":
        leadCopy.stage = stage ? stage : null;
        // make a fetch to the API to update the stage for this lead
        update(
          {
            leadId: lead._id,
          },
          {
            t: jwt.token,
          },
          {
            stage: stage,
          }
        ).then((data) => {
          if (data && data.error) {
            console.log(data.error);
            setFubStage(lead.stage);
            setUpdatingRow(null);
            setUpdatingStage(null);
          } else {
            setUpdatingRow(null);
            setUpdatingStage(null);
            setFubStage(data.stage);
          }
        });
        break;
    }
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

  const handleStageCheckboxClick = (stage, stageType) => {
    let newActiveStages;
    switch (stageType) {
      case "zillowStage":
        if (
          queryState.activeZillowStages &&
          queryState.activeZillowStages.includes(stage)
        ) {
          newActiveStages = queryState.activeZillowStages.filter(
            (activeStage) => activeStage != stage
          );
        } else {
          if (queryState.activeZillowStages) {
            newActiveStages = [...queryState.activeZillowStages, stage];
          } else {
            newActiveStages = [stage];
          }
        }
        handleUpdate(0, "page");
        handleUpdate(newActiveStages, "zillowStage");
        break;
      case "fubStage":
        if (
          queryState.activeFubStages &&
          queryState.activeFubStages.includes(stage)
        ) {
          newActiveStages = queryState.activeFubStages.filter(
            (activeStage) => activeStage != stage
          );
        } else {
          if (queryState.activeFubStages) {
            newActiveStages = [...queryState.activeFubStages, stage];
          } else {
            newActiveStages = [stage];
          }
        }
        handleUpdate(0, "page");
        handleUpdate(newActiveStages, "fubStage");
        break;
    }
  };

  const selectRowState = (row, stageType) => {
    let stage;
    if (row._id === updatingRow && stageType === updatingStage) {
      switch (stageType) {
        case "zillow":
          stage = zillowStage
            ? zillowStage
            : row.zillowStage
            ? row.zillowStage
            : "";
          break;
        case "fub":
          stage = fubStage ? fubStage : row.stage ? row.stage : "";
          break;
        default:
          stage = "";
          break;
      }
    } else {
      switch (stageType) {
        case "zillow":
          stage = row.zillowStage ? row.zillowStage : "";
          break;
        case "fub":
          stage = row.stage ? row.stage : "";
          break;
        default:
          stage = "";
          break;
      }
    }
    return stage;
  };

  const data = (row, stageType, menuOptions) => {
    if (
      showSourceSelect &&
      updatingRow &&
      row._id === updatingRow &&
      stageType === updatingStage
    ) {
      return (
        <>
          <Select
            labelId="status-select"
            id={`status_select_${row._id}`}
            value={selectRowState(row, stageType)}
            key={`select_${row._id}`}
            onChange={(e) => handleStageSelectUpdate(e, stageType)}
          >
            {menuOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <IconButton
            aria-label="save"
            color="primary"
            onClick={(e) =>
              handleStageSelectSubmit(
                row._id,
                stageType === "zillow" ? zillowStage : fubStage,
                row,
                stageType
              )
            }
          >
            <Tooltip title="Save changes">
              <Check />
            </Tooltip>
          </IconButton>
          <IconButton
            aria-label="cancel"
            color="primary"
            onClick={() => {
              console.log(`a`);
              handleUpdateStageClick(
                row._id,
                selectRowState(row, stageType),
                stageType
              );
            }}
          >
            <Tooltip title="Cancel changes">
              <Cancel />
            </Tooltip>
          </IconButton>
          <IconButton
            aria-label="delete"
            color="primary"
            onClick={() => {
              console.log(`b`);
              handleUpdateStageClick(row._id, "", updatingStage);
            }}
          >
            <Tooltip title="Clear Stage">
              <Delete />
            </Tooltip>
          </IconButton>
        </>
      );
    } else {
      return (
        <Tooltip title="Edit">
          <Button
            key={`status_button_${row._id}`}
            onClick={() => {
              console.log(`c`);
              handleUpdateStageClick(
                row._id,
                selectRowState(row, stageType),
                stageType
              );
            }}
          >
            {selectRowState(row, stageType)}
            <Edit key={`edit_icon_${row._id}`} />
          </Button>
        </Tooltip>
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
          handleSyncLeadsClick={handleSyncLeadsClick}
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
              fubStages={fubStages}
              zillowStages={zillowStages}
              onCheckboxClick={handleCheckboxClick}
              onFubStageCheckboxClick={(e) =>
                handleStageCheckboxClick(e, "fubStage")
              }
              onZillowStageCheckboxClick={(e) =>
                handleStageCheckboxClick(e, "zillowStage")
              }
              onSelectAllSources={() => handleSelect("source", sources)}
              onClearSources={() => handleSelect("source", [])}
              onResetSources={() => handleSelect("source", sources)}
              onFubStageFilterClick={() => handleFilterClick("fubStage")}
              onZillowStageFilterClick={() => handleFilterClick("zillowStage")}
              onSelectAllFubStages={() => handleSelect("fubStage", fubStages)}
              onSelectAllZillowStages={() =>
                handleSelect("zillowStage", zillowStages)
              }
              onClearFubStages={() => handleSelect("fubStage", [])}
              onClearZillowStages={() => handleSelect("zillowStage", [])}
              onResetFubStages={() => handleSelect("fubStage", fubStages)}
              onResetZillowStages={() =>
                handleSelect("zillowStage", zillowStages)
              }
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
                      {row.name ? row.name : ""}
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      align={"center"}
                      padding={"normal"}
                    >
                      {row.phones && row.phones.length
                        ? row.phones[0].value
                        : ""}
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      align={"center"}
                      padding={"normal"}
                    >
                      {row.emails && row.emails.length
                        ? row.emails[0].value
                        : ""}
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
                      {data(row, "fub", fubStages)}
                    </TableCell>
                    <TableCell align={"center"} padding={"normal"}>
                      {data(row, "zillow", zillowStageOptions)}
                    </TableCell>
                    <TableCell align={"center"} padding={"normal"}>
                      <Tooltip title="More">
                        <Link to={"/lead/" + row._id} key={row._id}>
                          <IconButton
                            color="primary"
                            variant="contained"
                            className={classes.button}
                          >
                            <ArrowForward />
                          </IconButton>
                        </Link>
                      </Tooltip>
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
