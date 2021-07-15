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
import { update } from "./api-lead";
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
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Name",
  },
  { id: "created", numeric: true, disablePadding: false, label: "Created" },
  { id: "source", numeric: true, disablePadding: false, label: "Source" },
  { id: "stage", numeric: true, disablePadding: false, label: "FUB Stage" },
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
    order,
    orderBy,
    onRequestSort,
    openFilter,
    onSourceFilterClick,
    onStageFilterClick,
    onSelectAllSources,
    onClearSources,
    onResetSources,
    sources,
    activeSources,
    stages,
    activeStages,
    onCheckboxClick,
    onSelectAllStages,
    onClearStages,
    onResetStage,
    onStageCheckboxClick,
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

            {headCell.id === "stage" &&
              (!openFilter || openFilter !== "stage") && (
                <Button onClick={onStageFilterClick}>
                  <ArrowDropDown />
                </Button>
              )}
            {headCell.id === "stage" && openFilter === "stage" && (
              <Button onClick={onStageFilterClick}>
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
            {headCell.id === "stage" && openFilter === "stage" && (
              <Box border={1}>
                {headCell.id === "stage" && openFilter === "stage" && (
                  <>
                    <IconButton onClick={() => onSelectAllStages(true)}>
                      <DoneAll />
                    </IconButton>
                    <IconButton onClick={() => onClearStages(false)}>
                      <ClearAll />
                    </IconButton>
                    <IconButton onClick={() => onResetStage(null)}>
                      <Refresh />
                    </IconButton>
                  </>
                )}
                {headCell.id === "stage" && openFilter === "stage" && (
                  <ul className={classes.listItem}>
                    {stages.map((stage) => (
                      <li key={stage}>
                        {activeStages.includes(stage) ? (
                          <IconButton
                            onClick={() => onStageCheckboxClick(stage)}
                          >
                            <CheckBox />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={() => onStageCheckboxClick(stage)}
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

  const fields = ["_id", "personId", "name", "created", "source", "stage"];
  const opts = { fields };
  const parser = new Parser(opts);
  const csv = parser.parse(props.rows);

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
            Leads
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

export default function LeadsTable({ rows }) {
  console.log(`<LeadsTable />`);
  console.log(`rows:`);
  console.log(rows);

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
  const [activeSources, setActiveSources] = React.useState([
    "Zillow Flex",
    "Zillow",
  ]); // TODO - Change to
  const [stages, setStages] = React.useState([]);
  const [activeStages, setActiveStages] = React.useState([]);

  const [updatingRow, setUpdatingRow] = React.useState(null);
  const [stage, setStage] = React.useState("");

  React.useEffect(() => {
    const allSources = rows.map((row) => row.source).filter((x) => x);
    const allStages = rows.map((row) => row.stage).filter((x) => x);
    const uniqueSources = _.uniq(allSources);
    const uniqueStages = _.uniq(allStages);
    console.log(`sources:`);
    console.log(uniqueSources);
    console.log(`stages:`);
    console.log(uniqueStages);

    const rowsWithActiveSource = rows.filter((row) =>
      activeSources.includes(row.source)
    );
    console.log(`rowsWithActiveStageAndSource`);
    const rowsWithActiveStageAndSource = rowsWithActiveSource.filter((row) =>
      uniqueStages.includes(row.stage)
    );
    console.log(rowsWithActiveStageAndSource);

    const active = stableSort(
      rowsWithActiveStageAndSource,
      getComparator(order, orderBy)
    ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    setSources(uniqueSources);
    setActiveRows(rowsWithActiveSource);
    setStages(uniqueStages);
    setActiveStages(uniqueStages);
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

  const handleChangePage = (newPage) => {
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

  const handleStageFilterClick = () => {
    if (openFilter === "stage") {
      setOpenFilter(null);
    } else {
      setOpenFilter("stage");
    }
  };

  const handleSelectAllSources = () => {
    setActiveSources(sources);
    setPage(0);

    const rowsWithActiveSource = rows.filter((row) =>
      sources.includes(row.source)
    );
    const rowsWithActiveStageAndSource = rowsWithActiveSource.filter((row) =>
      activeStages.includes(row.stage)
    );
    const active = stableSort(
      rowsWithActiveStageAndSource,
      getComparator(order, orderBy)
    ).slice(0, rowsPerPage);
    setActiveRows(rowsWithActiveSource);
    setCurrentPageRows(active);
  };

  const handleSelectAllStages = () => {
    setActiveStages(stages);
    setPage(0);

    const rowsWithActiveStage = rows.filter((row) =>
      stages.includes(row.stage)
    );
    const rowsWithActiveStageAndSource = rowsWithActiveStage.filter((row) =>
      activeSources.includes(row.source)
    );
    const active = stableSort(
      rowsWithActiveStageAndSource,
      getComparator(order, orderBy)
    ).slice(0, rowsPerPage);
    setActiveRows(rowsWithActiveStage);
    setCurrentPageRows(active);
  };

  const handleClearStages = () => {
    setActiveStages([]);
    setPage(0);
    setActiveRows([]);
    setCurrentPageRows([]);
  };

  const handleResetStage = () => {
    setActiveStages(stages);
    setPage(0);
    // Extract property.street from property object (for sorting)
    const rowsWithActiveStage = rows.filter((row) =>
      activeStages.includes(row.stage)
    );
    const rowsWithActiveStageAndSource = rowsWithActiveStage.filter((row) =>
      activeSources.includes(row.source)
    );
    const active = stableSort(
      rowsWithActiveStageAndSource,
      getComparator(order, orderBy)
    ).slice(0, rowsPerPage);
    setActiveRows(rowsWithActiveStage);
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

    const rowsWithActiveSource = rows.filter((row) =>
      defaultSources.includes(row.source)
    );
    const rowsWithActiveStageAndSource = rowsWithActiveStage.filter((row) =>
      activeStages.includes(row.stage)
    );
    const active = stableSort(
      rowsWithActiveStageAndSource,
      getComparator(order, orderBy)
    ).slice(0, rowsPerPage);
    setActiveRows(rowsWithActiveSource);
    setCurrentPageRows(active);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleUpdateStageClick = (rowId, rowStage) => {
    setUpdatingRow(rowId);
    setStage(rowStage);
    setShowSourceSelect(!showSourceSelect);
  };

  const handleStageSelectUpdate = (e) => {
    setStage(e.target.value);
  };

  const handleStageSelectSubmit = (rowId, stage, event) => {
    let eventCopy = event;
    eventCopy.stage = stage;
    // make a fetch to the API to update the stage for this lead
    update(
      {
        eventId: event._id,
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
        setStage(lead.stage);
        setUpdatingRow(null);
      } else {
        setUpdatingRow(null);
        setStage(data.stage);
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

  const handleStageCheckboxClick = (stage) => {
    let newActiveStages;
    if (activeStages.includes(stage)) {
      newActiveStages = activeStages.filter(
        (activeStage) => activeStage != stage
      );
    } else {
      newActiveStages = [...activeStages, stage];
    }
    setActiveStages(newActiveStages);
    const rowsWithActiveStage = rows.filter((row) =>
      newActiveStages.includes(row.stage)
    );
    const newActiveRows = stableSort(
      rowsWithActiveStage,
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

  // source row
  const data = (row) => {
    if (showSourceSelect && updatingRow && row._id === updatingRow) {
      return (
        <>
          <Select
            labelId="stage-select"
            id={`stage_select_${row._id}`}
            value={stage}
            key={`select_${row._id}`}
            onChange={(e) => handleStageSelectUpdate(e)}
          >
            {options.zillowStages.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <IconButton
            aria-label="save"
            color="primary"
            onClick={() => handleStageSelectSubmit(row._id, stage, row)}
          >
            <Check />
          </IconButton>
          <IconButton
            aria-label="cancel"
            color="primary"
            onClick={() => handleUpdateStageClick(row._id, stage)}
          >
            <Cancel />
          </IconButton>
        </>
      );
    } else {
      return (
        <Button
          key={`stage_button_${row._id}`}
          onClick={() => handleUpdateStageClick(row._id, row.stage)}
        >
          {row.stage}
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
              stages={stages}
              activeStages={activeStages}
              onCheckboxClick={handleCheckboxClick}
              onStageCheckboxClick={handleStageCheckboxClick}
              onSelectAllSources={handleSelectAllSources}
              onClearSources={onClearSources}
              onResetSources={onResetSources}
              onStageFilterClick={handleStageFilterClick}
              onSelectAllStages={handleSelectAllStages}
              onClearStages={handleClearStages}
              onResetStage={handleResetStage}
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
                      padding={"normal"}
                    >
                      {row.name ? row.name : `${row.firstName} ${row.lastName}`}
                    </TableCell>
                    <TableCell align={"center"} padding={"normal"}>
                      {`${new Date(row.created).toDateString()} ${new Date(
                        row.created
                      ).toLocaleTimeString()}`}
                    </TableCell>

                    <TableCell align={"center"} padding={"normal"}>
                      {data(row)}
                    </TableCell>
                    <TableCell align={"center"} padding={"normal"}>
                      {row.stage}
                    </TableCell>
                    <TableCell align={"center"} padding={"normal"}>
                      {row.zillowStage}
                    </TableCell>
                    <TableCell align={"center"} padding={"normal"}>
                      <Link to={"/lead/" + row._id} key={row._id}>
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
