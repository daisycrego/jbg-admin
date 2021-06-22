import React from "react";
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
} from "@material-ui/icons";

import { Link } from "react-router-dom";
import options from "../../lib/constants";
import { update } from "./api-event";
import auth from "./../auth/auth-helper";
import _ from "lodash";

import GetAppIcon from "@material-ui/icons/GetApp";
import { CSVLink } from "react-csv";
const { Parser } = require("json2csv");

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

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
    order,
    orderBy,
    onRequestSort,
    openFilter,
    onSourceFilterClick,
    onStatusFilterClick,
    onSelectAllSources,
    onClearSources,
    onResetSources,
    sources,
    activeSources,
    statuses,
    activeStatuses,
    onCheckboxClick,
    onSelectAllStatuses,
    onClearStatuses,
    onResetStatuses,
    onStatusCheckboxClick,
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
            padding={"default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {["propertyStreet", "created"].includes(headCell.id) ? (
              <TableSortLabel
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === "desc"
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
                        {activeSources.includes(source) ? (
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
                        {activeStatuses.includes(status) ? (
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
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
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

  const fields = [
    "_id",
    "eventId",
    "type",
    "created",
    "source",
    "message",
    "status",
    "processed",
    "processedAt",
    "isNewLead",
    "isPossibleZillowExemption",
    "isZillowEvent",
    "propertyId",
    "propertyStreet",
    "propertyCity",
    "propertyState",
    "propertyZipcode",
    "propertyMlsNumber",
    "propertyPrice",
    "propertyForRent",
    "propertyUrl",
    "propertyType",
    "propertyBedrooms",
    "propertyBathrooms",
    "propertyArea",
    "propertyLot",
    "propertyLat",
    "propertyLong",
    "personCreated",
    "personUpdated",
    "personId",
    "personName",
    "personCreatedVia",
    "personLastActivity",
    "personStage",
    "personStageId",
    "personSource",
    "personSourceId",
    "personSourceUrl",
    "personDelayed",
    "personContacted",
    "personPrice",
    "personAssignedLenderId",
    "personAssignedLenderName",
    "personAssignedUserId",
    "personAssignedPondId",
    "personAssignedTo",
    "personTags",
    "personEmails",
    "personPhones",
    "personAddresses",
    "personCollaborators",
    "personTeamLeaders",
    "personPondMembers",
  ];
  const opts = { fields };
  const parser = new Parser(opts);
  const flattenedRows = props.rows.map((row) => {
    row.propertyStreet = row.property ? row.property.street : null;
    row.propertyCity = row.property ? row.property.city : null;
    row.propertyState = row.property ? row.property.state : null;
    row.propertyZipcode = row.property ? row.property.code : null;
    row.propertyMlsNumber = row.property ? row.property.mlsNumber : null;
    row.propertyPrice = row.property ? row.property.price : null;
    row.propertyForRent = row.property ? row.property.forRent : null;
    row.propertyUrl = row.property ? row.property.url : null;
    row.propertyType = row.property ? row.property.type : null;
    row.propertyBedrooms = row.property ? row.property.bedrooms : null;
    row.propertyBathrooms = row.property ? row.property.bathrooms : null;
    row.propertyArea = row.property ? row.property.area : null;
    row.propertyLot = row.property ? row.property.lot : null;
    row.propertyLat = row.property ? row.property.lat : null;
    row.propertyLong = row.property ? row.property.long : null;
    row.personCreated = row.property ? row.person.created : null;
    row.personUpdated = row.property ? row.person.updated : null;
    row.personName = row.property ? row.person.name : null;
    row.personCreatedVia = row.property ? row.person.createdVia : null;
    row.personLastActivity = row.property ? row.person.lastActivity : null;
    row.personStage = row.property ? row.person.stage : null;
    row.personStageId = row.property ? row.person.stageId : null;
    row.personSource = row.property ? row.person.source : null;
    row.personSourceId = row.property ? row.person.sourceId : null;
    row.personSourceUrl = row.property ? row.person.sourceUrl : null;
    row.personDelayed = row.property ? row.person.delayed : null;
    row.personContacted = row.property ? row.person.contacted : null;
    row.personPrice = row.property ? row.person.price : null;
    row.personAssignedLenderId = row.property
      ? row.person.assignedLenderId
      : null;
    row.personAssignedLenderName = row.property
      ? row.person.assignedLenderName
      : null;
    row.personAssignedUserId = row.property ? row.person.assignedUserId : null;
    row.personAssignedPondId = row.property ? row.person.assignedPondId : null;
    row.personAssignedTo = row.property ? row.person.assignedTo : null;
    row.personTags = row.property ? row.person.tags : null;
    row.personEmails = row.property ? row.person.emails : null;
    row.personPhones = row.property ? row.person.phones : null;
    row.personAddresses = row.property ? row.person.addresses : null;
    row.personCollaborators = row.property ? row.person.collaborators : null;
    row.personTeamLeaders = row.property ? row.person.teamLeaders : null;
    row.personPondMembers = row.property ? row.person.pondMembers : null;
    return row;
  });

  const csv = parser.parse(flattenedRows);

  //const csv = parser.parse(props.rows);

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

          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<GetAppIcon />}
          >
            <CSVLink style={{ color: "inherit" }} data={csv}>
              Download CSV
            </CSVLink>
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

export default function EventsTable({ rows }) {
  const jwt = auth.isAuthenticated();
  const classes = useStyles();
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("created");
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [activeRows, setActiveRows] = React.useState([]);
  const [currentPageRows, setCurrentPageRows] = React.useState([]);
  const [sources, setSources] = React.useState([]);
  const [openFilter, setOpenFilter] = React.useState(null);
  const [showSourceSelect, setShowSourceSelect] = React.useState(false);
  const [activeSources, setActiveSources] = React.useState(["Zillow Flex"]);
  const [statuses, setStatuses] = React.useState([]);
  const [activeStatuses, setActiveStatuses] = React.useState([]);

  const [updatingRow, setUpdatingRow] = React.useState(null);
  const [status, setStatus] = React.useState("");

  React.useEffect(() => {
    const allSources = rows.map((row) => row.source).filter((x) => x);
    const allStatuses = rows.map((row) => row.status).filter((x) => x);
    const uniqueSources = _.uniq(allSources);
    const uniqueStatuses = _.uniq(allStatuses);

    // Extract property.street from property object (for sorting)
    const rowsWithPropertyStreet = rows.map((event) => {
      if (event.property && event.property.street) {
        event.propertyStreet = event.property.street;
      } else {
        event.propertyStreet = "";
      }
      return event;
    });
    const rowsWithActiveSource = rowsWithPropertyStreet.filter((row) =>
      activeSources.includes(row.source)
    );
    const rowsWithActiveStatusAndSource = rowsWithActiveSource.filter((row) =>
      uniqueStatuses.includes(row.status)
    );

    const active = stableSort(
      rowsWithActiveStatusAndSource,
      getComparator(order, orderBy)
    ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    setSources(uniqueSources);
    setActiveRows(rowsWithActiveSource);
    setStatuses(uniqueStatuses);
    setActiveStatuses(uniqueStatuses);
    setCurrentPageRows(active);
  }, [rows, order]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    const newOrderBy = property;
    const rowsWithActiveSource = rows.filter((row) =>
      activeSources.includes(row.source)
    );
    const activeRows = stableSort(
      rowsWithActiveSource,
      getComparator(newOrder, newOrderBy)
    );
    setActiveRows(activeRows);
    setCurrentPageRows(
      activeRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    );
    setOrder(newOrder);
    setOrderBy(newOrderBy);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    const newActiveRows = activeRows.slice(
      newPage * rowsPerPage,
      newPage * rowsPerPage + rowsPerPage
    );
    setCurrentPageRows(newActiveRows);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    const newActiveRows = activeRows.slice(
      page * newRowsPerPage,
      page * newRowsPerPage + newRowsPerPage
    );
    setRowsPerPage(newRowsPerPage);
    setCurrentPageRows(newActiveRows);
  };

  const handleSourceFilterClick = () => {
    if (openFilter === "source") {
      setOpenFilter(null);
    } else {
      setOpenFilter("source");
    }
  };

  const handleStatusFilterClick = () => {
    if (openFilter === "status") {
      setOpenFilter(null);
    } else {
      setOpenFilter("status");
    }
  };

  const handleSelectAllSources = () => {
    setActiveSources(sources);
    setPage(0);

    // Extract property.street from property object (for sorting)
    const rowsWithPropertyStreet = rows.map((event) => {
      if (event.property && event.property.street) {
        event.propertyStreet = event.property.street;
      } else {
        event.propertyStreet = "";
      }
      return event;
    });
    const rowsWithActiveSource = rowsWithPropertyStreet.filter((row) =>
      sources.includes(row.source)
    );
    const rowsWithActiveStatusAndSource = rowsWithActiveSource.filter((row) =>
      activeStatuses.includes(row.status)
    );
    const active = stableSort(
      rowsWithActiveStatusAndSource,
      getComparator(order, orderBy)
    ).slice(0, rowsPerPage);
    setActiveRows(rowsWithActiveSource);
    setCurrentPageRows(active);
  };

  const handleSelectAllStatuses = () => {
    setActiveStatuses(statuses);
    setPage(0);

    // Extract property.street from property object (for sorting)
    const rowsWithPropertyStreet = rows.map((event) => {
      if (event.property && event.property.street) {
        event.propertyStreet = event.property.street;
      } else {
        event.propertyStreet = "";
      }
      return event;
    });
    const rowsWithActiveStatus = rowsWithPropertyStreet.filter((row) =>
      statuses.includes(row.status)
    );
    const rowsWithActiveStatusAndSource = rowsWithActiveStatus.filter((row) =>
      activeSources.includes(row.source)
    );
    const active = stableSort(
      rowsWithActiveStatusAndSource,
      getComparator(order, orderBy)
    ).slice(0, rowsPerPage);
    setActiveRows(rowsWithActiveStatus);
    setCurrentPageRows(active);
  };

  const handleClearStatuses = () => {
    setActiveStatuses([]);
    setPage(0);
    setActiveRows([]);
    setCurrentPageRows([]);
  };

  const handleResetStatuses = () => {
    setActiveStatuses(statuses);
    setPage(0);
    // Extract property.street from property object (for sorting)
    const rowsWithPropertyStreet = rows.map((event) => {
      if (event.property && event.property.street) {
        event.propertyStreet = event.property.street;
      } else {
        event.propertyStreet = "";
      }
      return event;
    });
    const rowsWithActiveStatus = rowsWithPropertyStreet.filter((row) =>
      activeStatuses.includes(row.status)
    );
    const rowsWithActiveStatusAndSource = rowsWithActiveStatus.filter((row) =>
      activeSources.includes(row.source)
    );
    const active = stableSort(
      rowsWithActiveStatusAndSource,
      getComparator(order, orderBy)
    ).slice(0, rowsPerPage);
    setActiveRows(rowsWithActiveStatus);
    setCurrentPageRows(active);
  };

  const onClearSources = () => {
    setActiveSources([]);
    setPage(0);
    setActiveRows([]);
    setCurrentPageRows([]);
  };

  const onResetSources = () => {
    const defaultSources = ["Zillow Flex"];
    setActiveSources(defaultSources);
    setPage(0);
    // Extract property.street from property object (for sorting)
    const rowsWithPropertyStreet = rows.map((event) => {
      if (event.property && event.property.street) {
        event.propertyStreet = event.property.street;
      } else {
        event.propertyStreet = "";
      }
      return event;
    });
    const rowsWithActiveSource = rowsWithPropertyStreet.filter((row) =>
      defaultSources.includes(row.source)
    );
    const rowsWithActiveStatusAndSource = rowsWithActiveStatus.filter((row) =>
      activeStatuses.includes(row.status)
    );
    const active = stableSort(
      rowsWithActiveStatusAndSource,
      getComparator(order, orderBy)
    ).slice(0, rowsPerPage);
    setActiveRows(rowsWithActiveSource);
    setCurrentPageRows(active);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

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
    if (activeSources.includes(source)) {
      newActiveSources = activeSources.filter(
        (activeSource) => activeSource != source
      );
    } else {
      newActiveSources = [...activeSources, source];
    }
    setActiveSources(newActiveSources);
    const rowsWithActiveSource = rows.filter((row) =>
      newActiveSources.includes(row.source)
    );
    const newActiveRows = stableSort(
      rowsWithActiveSource,
      getComparator(order, orderBy)
    );
    const newPage = 0;
    setActiveRows(newActiveRows);
    setCurrentPageRows(
      newActiveRows.slice(
        newPage * rowsPerPage,
        newPage * rowsPerPage + rowsPerPage
      )
    );
    setPage(0);
  };

  const handleStatusCheckboxClick = (status) => {
    let newActiveStatuses;
    if (activeStatuses.includes(status)) {
      newActiveStatuses = activeStatuses.filter(
        (activeStatus) => activeStatus != status
      );
    } else {
      newActiveStatuses = [...activeStatuses, status];
    }
    setActiveStatuses(newActiveStatuses);
    const rowsWithActiveStatus = rows.filter((row) =>
      newActiveStatuses.includes(row.status)
    );
    const newActiveRows = stableSort(
      rowsWithActiveStatus,
      getComparator(order, orderBy)
    );
    const newPage = 0;
    setActiveRows(newActiveRows);
    setCurrentPageRows(
      newActiveRows.slice(
        newPage * rowsPerPage,
        newPage * rowsPerPage + rowsPerPage
      )
    );
    setPage(0);
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
        <EnhancedTableToolbar rows={rows} />

        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              onSourceFilterClick={handleSourceFilterClick}
              openFilter={openFilter}
              sources={sources}
              activeSources={activeSources}
              statuses={statuses}
              activeStatuses={activeStatuses}
              onCheckboxClick={handleCheckboxClick}
              onStatusCheckboxClick={handleStatusCheckboxClick}
              onSelectAllSources={handleSelectAllSources}
              onClearSources={onClearSources}
              onResetSources={onResetSources}
              onStatusFilterClick={handleStatusFilterClick}
              onSelectAllStatuses={handleSelectAllStatuses}
              onClearStatuses={handleClearStatuses}
              onResetStatuses={handleResetStatuses}
            />
            <TableBody>
              {currentPageRows.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow hover tabIndex={-1} key={row._id}>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      align={"center"}
                      padding={"default"}
                    >
                      {row.property ? row.property.street : ""}
                    </TableCell>
                    <TableCell align={"center"} padding={"default"}>
                      {`${new Date(row.created).toDateString()} ${new Date(
                        row.created
                      ).toLocaleTimeString()}`}
                    </TableCell>
                    <TableCell align={"center"} padding={"default"}>
                      {row.source}
                    </TableCell>
                    <TableCell align={"center"} padding={"default"}>
                      {data(row)}
                    </TableCell>
                    <TableCell align={"center"} padding={"default"}>
                      {row.isPossibleZillowExemption ? "YES" : "NO"}
                    </TableCell>
                    <TableCell align={"center"} padding={"default"}>
                      <Link to={"/event/" + row._id} key={row._id}>
                        <IconButton>
                          <ArrowForward />
                        </IconButton>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
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
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
