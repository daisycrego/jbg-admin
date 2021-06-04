import React from "react";
import PropTypes from "prop-types";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import FilterListIcon from "@material-ui/icons/FilterList";
import Button from "@material-ui/core/Button";
import ArrowForward from "@material-ui/icons/ArrowForward";
import { Link } from "react-router-dom";
import Edit from "@material-ui/icons/Edit";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

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
  const { classes, order, orderBy, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={"default"}
            padding={"left"}
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
            {headCell.id === "source" && (
              <Button onClick={props.onSourceFilterClick}>
                <FilterListIcon />
              </Button>
            )}
            {headCell.id === "source" && props.showSourceFilters && (
              <ul className={classes.listItem}>
                {props.sources.map((source) => (
                  <li key={source}>
                    {props.activeSources.includes(source) ? (
                      <IconButton>
                        <CheckBoxIcon />
                      </IconButton>
                    ) : (
                      <IconButton>
                        <CheckBoxOutlineBlankIcon />
                      </IconButton>
                    )}
                    {source}
                  </li>
                ))}
              </ul>
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
  rowCount: PropTypes.number.isRequired,
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
  const [sources, setSources] = React.useState([]);
  const [showSourceSelect, setShowSourceSelect] = React.useState(false);
  const [activeSources, setActiveSources] = React.useState(["Zillow Flex"]);

  const [updatingRow, setUpdatingRow] = React.useState(null);
  const [status, setStatus] = React.useState("");

  const [showSourceFilters, setShowSourceFilters] = React.useState(false);

  React.useEffect(() => {
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
    const activeRows = stableSort(
      rowsWithActiveSource,
      getComparator(order, orderBy)
    ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const allSources = rows.map((row) => row.source).filter((x) => x);
    const uniqueSources = _.uniq(allSources);
    setSources(uniqueSources);
    setActiveRows(activeRows);
  }, [rows, order]);

  const handleRequestSort = (event, property) => {
    console.log(`handleRequestSort: property: ${property}`);
    const isAsc = orderBy === property && order === "asc";
    console.log(`isAsc: ${isAsc}`);
    const newOrder = isAsc ? "desc" : "asc";
    const newOrderBy = property;
    const rowsWithActiveSource = rows.filter((row) =>
      activeSources.includes(row.source)
    );
    const activeRows = stableSort(
      rowsWithActiveSource,
      getComparator(newOrder, newOrderBy)
    ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    console.log(`updating activeRows`);
    setActiveRows(activeRows);
    setOrder(newOrder);
    setOrderBy(newOrderBy);
    console.log(activeRows);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const handleSourceFilterClick = () => {
    setShowSourceFilters(!showSourceFilters);
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
        //setValues({ ...values, error: data.error });
      } else {
        //setValues({ ...values, eventId: data._id, redirectToEvent: true });
      }
    });
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
            <SaveIcon />
          </IconButton>
          <IconButton
            aria-label="cancel"
            color="primary"
            onClick={() => handleUpdateStatusClick(row._id, status)}
          >
            <CancelIcon />
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
              rowCount={rows.length}
              showSourceFilters={showSourceFilters}
              sources={sources}
              activeSources={activeSources}
            />
            <TableBody>
              {activeRows.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow hover tabIndex={-1} key={row._id}>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      align={"default"}
                      padding={"left"}
                    >
                      {row.property ? row.property.street : ""}
                    </TableCell>
                    <TableCell align={"default"} padding={"left"}>
                      {`${new Date(row.created).toDateString()} ${new Date(
                        row.created
                      ).toLocaleTimeString()}`}
                    </TableCell>
                    <TableCell align={"default"} padding={"left"}>
                      {row.source}
                    </TableCell>
                    <TableCell align={"default"} padding={"left"}>
                      {data(row)}
                    </TableCell>
                    <TableCell align={"default"} padding={"left"}>
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
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </div>
  );
}
