import React, { useState } from "react";
import { Paper, IconButton, Button, Box, Tooltip } from "@material-ui/core";
import {
  CheckBoxOutlineBlank,
  CheckBox,
  ArrowDropDown,
  ArrowDropUp,
  DoneAll,
  ClearAll,
  Refresh,
} from "@material-ui/icons";
import _ from "lodash";

const CheckboxListItem = ({
  category,
  queryState,
  updateQueryState,
  column,
}) => {
  const handleCheckboxClick = (category, add, column) => {
    let newQueryState = { ...queryState };
    if (add) {
      newQueryState.categories[column.categoriesName].active.push(category);
    } else {
      newQueryState.categories[column.categoriesName].active.splice(
        newQueryState.categories[column.categoriesName].active.indexOf(
          category
        ),
        1
      );
    }
    newQueryState.page = 0;
    updateQueryState(newQueryState);
  };

  const checkbox = (column) => {
    if (
      queryState.categories &&
      column.categoriesName in queryState.categories
    ) {
      if (
        queryState.categories[column.categoriesName].active.includes(category)
      ) {
        return (
          <IconButton
            onClick={() => handleCheckboxClick(category, false, column)}
          >
            <CheckBox />
          </IconButton>
        );
      } else {
        return (
          <IconButton
            onClick={() => handleCheckboxClick(category, true, column)}
          >
            <CheckBoxOutlineBlank />
          </IconButton>
        );
      }
    }
  };

  return (
    <li key={category}>
      {checkbox(column)}
      {category}
    </li>
  );
};

export default function TableFilterList({
  classes,
  column,
  queryState,
  updateQueryState,
  filterOptions,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen ? (
        <Tooltip title="Hide">
          <Button onClick={() => setIsOpen(false)}>
            <ArrowDropUp />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip title="Apply filters">
          <Button onClick={() => setIsOpen(true)}>
            <ArrowDropDown />
          </Button>
        </Tooltip>
      )}

      {isOpen && (
        <Paper>
          <Box>
            <>
              <Tooltip title="Select all">
                <IconButton
                  onClick={() => {
                    let newQueryState = { ...queryState };
                    newQueryState.categories[column.categoriesName].active =
                      filterOptions;
                    newQueryState.page = 0;
                    updateQueryState(newQueryState);
                  }}
                >
                  <DoneAll />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear all">
                <IconButton
                  onClick={() => {
                    let newQueryState = { ...queryState };
                    newQueryState.categories[column.categoriesName].active = [];
                    newQueryState.page = 0;
                    updateQueryState(newQueryState);
                  }}
                >
                  <ClearAll />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset to default">
                <IconButton
                  onClick={() => {
                    let newQueryState = { ...queryState };
                    newQueryState.categories[column.categoriesName].active =
                      queryState.categories[column.categoriesName].default;
                    newQueryState.page = 0;
                    updateQueryState(newQueryState);
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </>
            <ul className={classes.listItem}>
              {filterOptions.map((category) => (
                <CheckboxListItem
                  key={category}
                  column={column}
                  queryState={queryState}
                  updateQueryState={updateQueryState}
                  category={category}
                />
              ))}
            </ul>
          </Box>
        </Paper>
      )}
    </>
  );
}
