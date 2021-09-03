import React, { useState } from "react";
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
import FilterableHeaderCell from "./FilterableHeaderCell";
import EnhancedTableCell from "./EnhancedTableCell";
import EnhancedDatePicker from "./EnhancedDatePicker";
import { tableAttr } from "../../lib/table";
import CSVDownloadButton from "./CSVDownloadButton";
import SyncButton from "./SyncButton";
import SearchBar from "./SearchBar";
import { useHistory } from "react-router-dom";

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
  listItem: {
    listStyleType: "none",
    height: "10em",
    overflow: "scroll",
    overflowX: "hidden",
  },
}));

function EnhancedTableHead({
  classes,
  queryState,
  updateQueryState,
  columnsMetadata,
  filterCategories,
}) {
  return (
    <TableHead>
      <TableRow>
        {columnsMetadata.map((columnMetadata) => {
          if (columnMetadata.attr.includes(tableAttr.FILTERABLE)) {
            return (
              <TableCell
                key={columnMetadata.name}
                align={"center"}
                padding={"normal"}
              >
                {columnMetadata.title}
                <FilterableHeaderCell
                  classes={classes}
                  columnMetadata={columnMetadata}
                  queryState={queryState}
                  updateQueryState={updateQueryState}
                  filterOptions={filterCategories[columnMetadata.name]}
                />
              </TableCell>
            );
          } else {
            return (
              <TableCell
                key={columnMetadata.name}
                align={"center"}
                padding={"normal"}
              >
                {columnMetadata.title}
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
  const searchColumns = props.columnsMetadata && props.columnsMetadata.length ? props.columnsMetadata.filter(
    (columnMetadata) => columnMetadata.search
  ) : [];
  let history = useHistory();

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

          {searchColumns ? (
            <SearchBar
              classes={classes}
              searchText={props.queryState.searchText}
              searchTitle={
                searchColumns.length && searchColumns[0].searchTitle
                  ? searchColumns[0].searchTitle
                  : ""
              }
              updateSearchText={(newSearchText) => {
                let newQueryState = { ...props.queryState };
                newQueryState.searchText = newSearchText;
                newQueryState.searchField =
                  searchColumns.length && searchColumns[0].searchField
                    ? searchColumns[0].searchField
                    : "";
                for (let columnMetadata of props.columnsMetadata) {
                  if (
                    newQueryState.categories &&
                    newQueryState.categories[columnMetadata.categoriesName] &&
                    newQueryState.categories[columnMetadata.categoriesName]
                      .active
                  ) {
                    newQueryState.categories[
                      columnMetadata.categoriesName
                    ].active = null;
                  }
                }
                newQueryState.page = 0;
                props.updateQueryState(newQueryState);
              }}
            />
          ) : null}

          <Button
            className={classes.button}
            onClick={() => {history.push(props.redirectTo); history.go();}}
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

export default function EnhancedTable({
  rows,
  totalRows,
  filterCategories,
  queryState,
  updateQueryState,
  title,
  isLoading,
  columnsMetadata,
  CSVParser,
  handleSync,
  syncTitle,
  handleQueryReset,
  createSnackbarAlert,
  redirectTo,
}) {
  const classes = useStyles();
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const [updatingColumn, setUpdatingColumn] = useState(null);
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
            columnsMetadata={columnsMetadata}
            queryState={queryState}
            updateQueryState={updateQueryState}
            CSVParser={CSVParser}
            handleSync={handleSync}
            syncTitle={syncTitle}
            handleQueryReset={handleQueryReset}
            createSnackbarAlert={createSnackbarAlert}
            redirectTo={redirectTo}
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
                columnsMetadata={columnsMetadata}
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
                      {columnsMetadata.map((columnMetadata, index) => (
                        <EnhancedTableCell
                          key={`enhanced-${index}-${row._id}`}
                          options={filterCategories[columnMetadata.name]}
                          columnMetadata={columnMetadata}
                          row={row}
                          index={index}
                          classes={classes}
                          isUpdatingCell={
                            columnMetadata.attr.includes(tableAttr.UPDATABLE) &&
                            updatingRowId &&
                            updatingRowId === row._id &&
                            updatingColumn === columnMetadata.name
                          }
                          updatingCellState={
                            columnMetadata.attr.includes(tableAttr.UPDATABLE) &&
                            updatingRowId &&
                            updatingRowId === row._id && 
                            updatingColumn === columnMetadata.name
                              ? updatingRowState
                              : null
                          }
                          updateRowState={setUpdatingRowState}
                          updateRowId={setUpdatingRowId}
                          updateColumn={setUpdatingColumn}
                          redirectTo={redirectTo}
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
