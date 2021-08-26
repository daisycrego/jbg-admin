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
  columnMetadata,
}) => {
  const handleCheckboxClick = (category, add, columnMetadata) => {
    let newQueryState = { ...queryState };
    if (add) {
      newQueryState.categories[columnMetadata.categoriesName].active.push(
        category
      );
    } else {
      newQueryState.categories[columnMetadata.categoriesName].active.splice(
        newQueryState.categories[columnMetadata.categoriesName].active.indexOf(
          category
        ),
        1
      );
    }
    newQueryState.page = 0;
    updateQueryState(newQueryState);
  };

  const checkbox = (columnMetadata) => {
    if (
      queryState.categories &&
      columnMetadata.categoriesName in queryState.categories
    ) {
      if (
        queryState.categories[columnMetadata.categoriesName].active.includes(
          category
        )
      ) {
        return (
          <IconButton
            onClick={() => handleCheckboxClick(category, false, columnMetadata)}
          >
            <CheckBox />
          </IconButton>
        );
      } else {
        return (
          <IconButton
            onClick={() => handleCheckboxClick(category, true, columnMetadata)}
          >
            <CheckBoxOutlineBlank />
          </IconButton>
        );
      }
    }
  };

  return (
    <li key={category}>
      {checkbox(columnMetadata)}
      {category}
    </li>
  );
};

export default function FilterableHeaderCell({
  classes,
  columnMetadata,
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
                    newQueryState.categories[
                      columnMetadata.categoriesName
                    ].active = filterOptions;
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
                    newQueryState.categories[
                      columnMetadata.categoriesName
                    ].active = [];
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
                    newQueryState.categories[
                      columnMetadata.categoriesName
                    ].active =
                      queryState.categories[
                        columnMetadata.categoriesName
                      ].default;
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
                  columnMetadata={columnMetadata}
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
