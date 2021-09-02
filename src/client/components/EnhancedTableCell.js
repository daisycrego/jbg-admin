import React, { useEffect, useState } from "react";
import { tableAttr, tableDataTypes } from "../../lib/table";
import {
  TableCell,
  IconButton,
  Button,
  Select,
  MenuItem,
  Tooltip,
} from "@material-ui/core";
import { Edit, Check, Cancel, ArrowForward } from "@material-ui/icons";
import { Link, useHistory } from "react-router-dom";

export default function EnhancedTableCell(props) {
  const {
    options,
    row,
    columnMetadata,
    index,
    classes,
    updateRowState,
    updateRowId,
    isUpdatingCell,
    redirectTo,
  } = props;

  const [updatingCellState, setUpdatingCellState] = useState(
    props.updatingCellState
  );
  
  const handleUpdatableChange = (e) => {
    setUpdatingCellState(e.target.value);
  };

  const handleUpdatableClick = (rowId, newState) => {
    setUpdatingCellState(newState);
    updateRowState(newState);
    updateRowId(rowId);
  };

  let history = useHistory();

  if (columnMetadata.attr.includes(tableAttr.UPDATABLE)) {
    if (isUpdatingCell) {
      return (
        <TableCell key={`cell-${row._id}`}>
          <Select
            labelId={`${columnMetadata.name}-select`}
            id={`${columnMetadata.name}_select_${row._id}`}
            value={updatingCellState ? updatingCellState : ""}
            key={`select_${row._id}`}
            onChange={(e) => handleUpdatableChange(e)}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <Tooltip title="Save changes">
            <IconButton
              aria-label="save"
              color="primary"
              onClick={(e) => {
                columnMetadata.updateHandler(updatingCellState, row);
                setUpdatingCellState(e.target.value);
                updateRowId(null);
                history.push(redirectTo);
                history.go();
              }}
            >
              <Check />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel changes">
            <IconButton
              aria-label="cancel"
              color="primary"
              onClick={() => {
                handleUpdatableClick(row._id, updatingCellState);
                updateRowId(null);
              }}
            >
              <Cancel />
            </IconButton>
          </Tooltip>
        </TableCell>
      );
    } else {
      return (
        <TableCell key={`cell-${row._id}`}>
          <Tooltip title={`Update ${columnMetadata.name}`}>
            <Button
              key={`${columnMetadata.name}_button_${row._id}`}
              onClick={() => 
                handleUpdatableClick(row._id, row[columnMetadata.name])
              }
            >
              {row[columnMetadata.name]}
              <Edit key={`edit_icon_${row._id}`} />
            </Button>
          </Tooltip>
        </TableCell>
      );
    }
  }
  const labelId = `enhanced-table-checkbox-${row._id}`;
  switch (columnMetadata.type) {
    case tableDataTypes.STRING:
      return (
        <TableCell
          component="th"
          id={labelId}
          scope="row"
          align="center"
          padding="normal"
          key={`${labelId}-${index}`}
        >
          {row[columnMetadata.name] ? row[columnMetadata.name] : ""}
        </TableCell>
      );
    case tableDataTypes.LINK:
      return (
        <TableCell
          key={`${labelId}-${index}`}
          align={"center"}
          padding={"normal"}
        >
          <Tooltip title="More data">
            <Link to={`${columnMetadata.endpoint}/${row._id}`} key={row._id}>
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
      );
    case tableDataTypes.BOOLEAN:
      return (
        <TableCell
          component="th"
          id={labelId}
          scope="row"
          align="center"
          padding="normal"
          key={`${labelId}-${index}`}
        >
          {row[columnMetadata.name] ? "YES" : "NO"}
        </TableCell>
      );

    case tableDataTypes.DATE:
      return (
        <TableCell
          component="th"
          id={labelId}
          scope="row"
          align="center"
          padding="normal"
          key={`${labelId}-${index}`}
        >
          {`${new Date(row[columnMetadata.name]).toDateString()} ${new Date(
            row[columnMetadata.name]
          ).toLocaleTimeString()}`}
        </TableCell>
      );
  }
}