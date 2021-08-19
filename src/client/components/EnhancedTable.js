import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
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
import { Refresh } from "@material-ui/icons";
import TableFilterList from "./TableFilterList";
import EnhancedTableCell from "./EnhancedTableCell";
import EnhancedDatePicker from "./EnhancedDatePicker";
import { tableAttr } from "../../lib/table";
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
                  filterOptions={props.filterCategories[columnCell.name]}
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
  title: {
    flex: "1 1 100%",
  },
  button: {
    paddingLeft: 30,
    paddingRight: 30,
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
            updateSearchText={(newSearchText) => {
              let newQueryState = { ...props.queryState };
              newQueryState.searchText = newSearchText;
              for (let column of props.columns) {
                if (
                  newQueryState.categories &&
                  newQueryState.categories[column.categoriesName] &&
                  newQueryState.categories[column.categoriesName].active
                ) {
                  newQueryState.categories[column.categoriesName].active = null;
                }
              }
              console.log(`updateSearchText`);
              console.log(newQueryState);
              newQueryState.page = 0;
              props.updateQueryState(newQueryState);
            }}
          />
          <Button
            className={classes.button}
            onClick={props.handleQueryReset}
            startIcon={<Refresh />}
          >
            Reset Search
          </Button>
          <EnhancedDatePicker
            startDate={props.startDate}
            endDate={props.endDate}
            queryState={props.queryState}
            updateQueryState={props.updateQueryState}
            classes={classes}
            createSnackbarAlert={props.createSnackbarAlert}
          />
          <CSVDownloadButton
            Parser={props.CSVParser}
            classes={classes}
            rows={props.rows}
          />
          <SyncButton
            classes={classes}
            handleSync={props.handleSync}
            name={`${props.syncTitle}`}
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
  totalRows,
  filterCategories,
  queryState,
  updateQueryState,
  title,
  isLoading,
  columns,
  CSVParser,
  handleSync,
  syncTitle,
  handleQueryReset,
  createSnackbarAlert,
}) {
  const classes = useStyles();
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const [updatingRowState, setUpdatingRowState] = useState(null);

  const emptyRows =
    queryState.Size -
    Math.min(
      queryState.pageSize,
      rows.length - queryState.page * queryState.pageSize
    );

  const handleChangePage = (event, newPage) => {
    updateQueryState({ ...queryState, page: newPage });
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    updateQueryState({ ...queryState, pageSize: newRowsPerPage, page: 0 });
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          title={title}
          rows={rows}
          columns={columns}
          queryState={queryState}
          updateQueryState={updateQueryState}
          CSVParser={CSVParser}
          handleSync={handleSync}
          syncTitle={syncTitle}
          handleQueryReset={handleQueryReset}
          createSnackbarAlert={createSnackbarAlert}
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
              rows={rows}
              filterCategories={filterCategories}
            />

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell>
                    <h2>Loading...</h2>
                  </TableCell>
                </TableRow>
              ) : null}
              {rows.map((row) => {
                return (
                  <TableRow hover tabIndex={-1} key={row._id}>
                    {columns.map((column, index) => (
                      <EnhancedTableCell
                        key={`enhanced-${index}-${row._id}`}
                        options={filterCategories[column.name]}
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
          count={totalRows}
          rowsPerPage={queryState.pageSize}
          page={queryState.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
