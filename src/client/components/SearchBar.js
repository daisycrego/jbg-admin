import React, { useState } from "react";
import { Input, Button, Tooltip } from "@material-ui/core";
import { Search, HighlightOff } from "@material-ui/icons";

export default function SearchBar(props) {
  const { updateSearchText } = props;
  const [searchText, setSearchText] = useState(props.searchText);

  return (
    <div style={{ width: "50%" }}>
      <form
        style={{
          display: "flex",
          width: "100%",
        }}
      >
        <Input
          onInput={(e) => setSearchText(e.target.value)}
          placeholder={`${props.searchTitle}...`}
          autoComplete="off"
        >
          {props.searchText}
        </Input>
        <Tooltip title="Search">
          <Button
            onClick={() => updateSearchText(searchText)}
            startIcon={<Search />}
          />
        </Tooltip>
      </form>
      {props.searchText && (
        <Button
          startIcon={<HighlightOff />}
          onClick={() => {
            updateSearchText("");
            setSearchText("");
          }}
        >
          {props.searchText}
        </Button>
      )}
    </div>
  );
}
