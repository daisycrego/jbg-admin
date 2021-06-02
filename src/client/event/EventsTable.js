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

import options from "../../lib/constants";
import { update } from "./api-event";
import auth from "./../auth/auth-helper";

const actions = [
  {
    name: "update status",
  },
];

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}
/*
const rows = [
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Donut", 452, 25.0, 51, 4.9),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
  createData("Honeycomb", 408, 3.2, 87, 6.5),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Jelly Bean", 375, 0.0, 94, 0.0),
  createData("KitKat", 518, 26.0, 65, 7.0),
  createData("Lollipop", 392, 0.2, 98, 0.0),
  createData("Marshmallow", 318, 0, 81, 2.0),
  createData("Nougat", 360, 19.0, 9, 37.0),
  createData("Oreo", 437, 18.0, 63, 4.0),
];
*/
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
    id: "property",
    numeric: false,
    disablePadding: true,
    label: "Property address",
  },
  { id: "created", numeric: true, disablePadding: false, label: "Created" },
  { id: "source", numeric: true, disablePadding: false, label: "Source" },
  { id: "actions", numeric: true, disablePadding: false, label: "Actions" },
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
          Events
        </Typography>
      }

      {
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
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
}));

export default function EventsTable({ rows }) {
  const jwt = auth.isAuthenticated();
  console.log(`EventsTable`);
  console.log(`jwt`);
  console.log(jwt);
  const classes = useStyles();
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("created");

  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [updatingRow, setUpdatingRow] = React.useState(null);
  const [status, setStatus] = React.useState("");

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
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

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleUpdateStatusClick = (rowId, rowStatus) => {
    console.log(`handleUpdateStatusClick`);
    console.log(rowId);
    setUpdatingRow(rowId);
    setStatus(rowStatus);
  };

  const handleStatusSelectUpdate = (e) => {
    setStatus(e.target.value);
  };

  const handleStatusSelectSubmit = (rowId, status, event) => {
    let eventCopy = event;
    eventCopy.status = status;
    console.log(`handleStatusSelectSubmit`);
    console.log(`rowId: ${rowId}`);
    console.log(`status: ${status}`);
    //const jwt = auth.isAuthenticated();
    console.log(`jwt:`);
    console.log(jwt);
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
      console.log(data);
      if (data && data.error) {
        //setValues({ ...values, error: data.error });
      } else {
        //setValues({ ...values, eventId: data._id, redirectToEvent: true });
      }
    });
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
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
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
                        {actions.map((action) => {
                          if (updatingRow && row._id === updatingRow) {
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
                                <Button
                                  onClick={() =>
                                    handleStatusSelectSubmit(
                                      row._id,
                                      status,
                                      row
                                    )
                                  }
                                  variant="contained"
                                  color="secondary"
                                  startIcon={<SaveIcon />}
                                />
                              </>
                            );
                          } else {
                            return (
                              <Button
                                key={`status_button_${row._id}`}
                                onClick={() =>
                                  handleUpdateStatusClick(row._id, row.status)
                                }
                              >
                                {action.name}
                                <Edit key={`edit_icon_${row._id}`} />
                              </Button>
                            );
                          }
                        })}
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
          count={rows.length}
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
