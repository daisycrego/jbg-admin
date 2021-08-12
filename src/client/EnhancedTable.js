import React, { useEffect, useState } from "react";
import { lighten, makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Typography,
  Paper,
  Button,
} from "@material-ui/core";
import {
  DateRange,
  Clear,
  ExpandLess,
  EventAvailable,
  ArrowRightAlt,
} from "@material-ui/icons";
import _ from "lodash";
import auth from "./auth/auth-helper";
import TableFilterList from "./TableFilterList";
import EnhancedTableCell from "./EnhancedTableCell";
import EnhancedDatePicker from "./EnhancedDatePicker";
import { tableAttr, tableDataTypes } from "../lib/table";
import CSVDownloadButton from "./CSVDownloadButton";
import SyncButton from "./SyncButton";
import SearchBar from "./SearchBar";

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

function EnhancedTableHead(props) {
  const { classes, queryState, updateQueryState, columns } = props;

  return (
    <TableHead>
      <TableRow>
        {columns.map((columnCell) => {
          if (columnCell.attr.includes(tableAttr.FILTERABLE)) {
            return (
              <TableCell
                key={columnCell.name}
                align={"center"}
                padding={"normal"}
              >
                {columnCell.title}
                <TableFilterList
                  classes={classes}
                  column={columnCell}
                  queryState={queryState}
                  updateQueryState={updateQueryState}
                />
              </TableCell>
            );
          } else {
            return (
              <TableCell
                key={columnCell.name}
                align={"center"}
                padding={"normal"}
              >
                {columnCell.title}
              </TableCell>
            );
          }
        })}
      </TableRow>
    </TableHead>
  );
}

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
  searchField: {
    display: "flex",
    flexDirection: "column",
  },
  searchBar: {
    flex: "3 2 100%",
    flexDirection: "row",
    display: "flex",
  },
  button: {
    paddingLeft: 20,
    paddingRight: 20,
    marginRight: 1,
    marginLeft: 1,
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();

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
            {props.title}
          </Typography>
          <SearchBar
            classes={classes}
            searchText={props.queryState.searchText}
            updateSearchText={(newSearchText) =>
              props.updateQueryState({
                ...props.queryState,
                searchText: newSearchText,
              })
            }
          />
          <EnhancedDatePicker
            startDate={props.startDate}
            endDate={props.endDate}
            queryState={props.queryState}
            updateQueryState={props.updateQueryState}
            classes={classes}
          />
          <CSVDownloadButton
            Parser={props.CSVParser}
            classes={classes}
            rows={props.rows}
          />
          <SyncButton
            classes={classes}
            handleSync={props.handleSync}
            name="Event"
          />
        </>
      }
    </Toolbar>
  );
};

const rowSlice = (rows, page, pageSize) => {
  if (!rows) {
    return [];
  }
  return rows.slice(page * pageSize, page * pageSize + pageSize);
};

export default function EnhancedTable({
  rows,
  queryState,
  updateQueryState,
  title,
  isLoading,
  columns,
  CSVParser,
  handleSync,
}) {
  const jwt = auth.isAuthenticated();
  const classes = useStyles();
  const [currentPageRows, setCurrentPageRows] = useState([]);
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const [updatingRowState, setUpdatingRowState] = useState(null);

  useEffect(() => {
    const newCurrentPageRows = rowSlice(
      rows,
      queryState.page,
      queryState.pageSize
    );
    setCurrentPageRows(newCurrentPageRows);
  }, [rows]);

  const emptyRows =
    queryState.Size -
    Math.min(
      queryState.pageSize,
      rows.length - queryState.page * queryState.pageSize
    );

  const handleChangePage = (event, newPage) => {
    updateQueryState({ ...queryState, page: newPage });
    const newActiveRows = rows.slice(
      newPage * queryState.pageSize,
      newPage * queryState.pageSize + queryState.pageSize
    );
    setCurrentPageRows(newActiveRows);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    const newPage = 0;
    const newActiveRows = rows.slice(
      newPage * newRowsPerPage,
      newPage * newRowsPerPage + newRowsPerPage
    );
    updateQueryState({ ...queryState, pageSize: newRowsPerPage, page: 0 });
    setCurrentPageRows(newActiveRows);
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          title={title}
          rows={rows}
          queryState={queryState}
          updateQueryState={updateQueryState}
          CSVParser={CSVParser}
          handleSync={handleSync}
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
              columns={columns}
              queryState={queryState}
              updateQueryState={updateQueryState}
            />

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell>
                    <h2>Loading...</h2>
                  </TableCell>
                </TableRow>
              ) : null}
              {currentPageRows.map((row) => {
                return (
                  <TableRow hover tabIndex={-1} key={row._id}>
                    {columns.map((column, index) => (
                      <EnhancedTableCell
                        key={`enhanced-${index}-${row._id}`}
                        options={column.categories}
                        column={column}
                        row={row}
                        index={index}
                        classes={classes}
                        isUpdatingCell={
                          column.attr.includes(tableAttr.UPDATABLE) &&
                          updatingRowId &&
                          updatingRowId === row._id
                        }
                        updatingCellState={
                          column.attr.includes(tableAttr.UPDATABLE) &&
                          updatingRowId &&
                          updatingRowId === row._id
                            ? updatingRowState
                            : null
                        }
                        updateRowState={setUpdatingRowState}
                        updateRowId={setUpdatingRowId}
                      />
                    ))}
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
          count={rows.length}
          rowsPerPage={queryState.pageSize}
          page={queryState.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
