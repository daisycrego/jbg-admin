import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { list, update, sync_leads } from "./api-lead.js";
import auth from "./../auth/auth-helper";
import EnhancedTable from "../components/EnhancedTable";
import { tableAttr, tableDataTypes } from "../../lib/table";
import { LeadCSVParser as CSVParser } from "../../lib/leadCsvParser";
import { Snackbar } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    margin: theme.spacing(5),
  },
  title: {
    margin: `${theme.spacing(4)}px 0 ${theme.spacing(2)}px`,
    color: theme.palette.openTitle,
  },
  button: {
    margin: theme.spacing(1),
  },
}));

export default function LeadsPage({
  queryState,
  initialQueryState,
  updateQueryState,
}) {
  const jwt = auth.isAuthenticated();
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const setupFilterCategories = () => {
    const columns = generateColumnDesc();
    let filterCategories = {};
    for (let column of columns) {
      if (column.attr.includes(tableAttr.FILTERABLE)) {
        filterCategories[column.name] = [];
      }
    }
    return filterCategories;
  };

  const generateHandleUpdate = (type) => {
    switch (type) {
      case "fub":
        return (newStage, lead) => {
          update(
            {
              leadId: lead._id,
            },
            {
              t: jwt.token,
            },
            {
              stage: newStage,
            }
          ).then((data) => {
            if (data && data.error) {
              console.log(data.error);
            }
          });
        };
      case "zillow":
        return (newStage, lead) => {
          update(
            {
              leadId: lead._id,
            },
            {
              t: jwt.token,
            },
            {
              zillowStage: newStage,
            }
          ).then((data) => {
            if (data && data.error) {
              console.log(data.error);
            }
          });
        };
    }
  };

  const generateColumnDesc = () => {
    return [
      {
        name: "name",
        title: "Name",
        type: tableDataTypes.STRING,
        attr: [],

        categoriesName: null,
      },
      {
        name: "phone",
        title: "Phone",
        type: tableDataTypes.STRING,
        attr: [],

        categoriesName: null,
      },
      {
        name: "email",
        title: "Email",
        type: tableDataTypes.STRING,
        attr: [],

        categoriesName: null,
      },
      {
        name: "created",
        title: "Created",
        type: tableDataTypes.DATE,
        attr: [],

        categoriesName: null,
      },
      {
        name: "source",
        title: "Source",
        type: tableDataTypes.STRING,
        attr: [tableAttr.FILTERABLE],

        categoriesName: "sources",
      },
      {
        name: "stage",
        title: "FUB Stage",
        type: tableDataTypes.STRING,
        attr: [tableAttr.FILTERABLE, tableAttr.UPDATABLE],

        categoriesName: "fubStages",
        updateHandler: generateHandleUpdate("fub"),
      },
      {
        name: "zillowStage",
        title: "Zillow Stage",
        type: tableDataTypes.STRING,
        attr: [tableAttr.FILTERABLE, tableAttr.UPDATABLE],

        categoriesName: "zillowStages",
        updateHandler: generateHandleUpdate("zillow"),
      },
      {
        name: "id",
        title: "More",
        type: tableDataTypes.LINK,
        attr: [],

        categoriesName: null,
        endpoint: "/lead",
      },
    ];
  };

  const [filterCategories, setFilterCategories] = useState(
    setupFilterCategories
  );

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const [redirectToSignin, setRedirectToSignin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createSnackbarAlert = (message) => {
    setSnackbar({ message, open: true });
  };

  const handleQueryReset = () => {
    updateQueryState(initialQueryState);
  };

  const handleSyncLeads = async () => {
    const jwt = auth.isAuthenticated();
    const credentials = { t: jwt.token };
    const abortController = new AbortController();
    const signal = abortController.signal;
    setSnackbar({ message: "Syncing with Follow Up Boss...", open: true });
    const result = await sync_leads(credentials, signal);
    if (result.message) {
      // { error: "You have reached the rate limit for number of requ…oss.com/reference#rate-limiting for more details."}
      // send to a notify/snackbars
      setSnackbar({ message: result.message, open: true });
    } else if (result.error) {
      setSnackbar({ open: true, message: result.error });
    } else {
      setSnackbar({ open: true, message: result });
    }
  };

  const prepareLeads = (leads) => {
    if (!leads || !leads.length) {
      return [];
    }

    const filteredLeads = leads.map((lead) => ({
      ...lead,
      phone:
        lead.phones && lead.phones.length && lead.phones[0]
          ? lead.phones[0].value
          : null,
      email:
        lead.emails && lead.emails.length && lead.emails[0]
          ? lead.emails[0].value
          : null,
    }));

    return filteredLeads;
  };

  useEffect(() => {
    if (!jwt) {
      setRedirectToSignin(true);
      return;
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

    setIsLoading(true);

    list(signal, queryState).then((data) => {
      if (data && data.error) {
        console.log(data.error);
        setIsLoading(false);
        setRedirectToSignin(true);
      } else {
        setIsLoading(false);
        setRows(prepareLeads(data.leads));
        let newFilterCategories = { ...filterCategories };
        for (let column of generateColumnDesc()) {
          if (column.attr.includes(tableAttr.FILTERABLE)) {
            newFilterCategories[column.name] = data[column.categoriesName];
          }
        }
        setFilterCategories(newFilterCategories);
      }
    });

    return function cleanup() {
      abortController.abort();
    };
  }, [queryState]);

  if (redirectToSignin) {
    return <Redirect to="/signin" />;
  }
  return (
    <Paper className={classes.root} elevation={4}>
      <Snackbar
        message={snackbar.message}
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        autoHideDuration={2000}
      />
      <EnhancedTable
        title={"Follow-Up Boss Leads"}
        isLoading={isLoading}
        rows={rows}
        filterCategories={filterCategories}
        columns={generateColumnDesc()}
        queryState={queryState}
        updateQueryState={updateQueryState}
        tableDataTypes={tableDataTypes}
        CSVParser={CSVParser}
        syncTitle={"Leads"}
        handleSync={handleSyncLeads}
        handleQueryReset={handleQueryReset}
        createSnackbarAlert={createSnackbarAlert}
      />
    </Paper>
  );
}
