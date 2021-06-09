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
            <TableSortLabel
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
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

  return (
    <Toolbar>
      {
        <Typography
          className={classes.title}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Follow-Up Boss Events
        </Typography>
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
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        <EnhancedTableToolbar />
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
