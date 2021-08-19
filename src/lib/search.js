import { zillowStatusOptions, booleanOptions } from "../lib/constants";

const initialLeadSearchState = {
  page: 0,
  pageSize: 10,
  order: "desc",
  orderBy: "created",
  startDate: null,
  endDate: null,
  categories: {
    sources: {
      all: [],
      active: ["Zillow Flex"],
      default: ["Zillow Flex"],
    },
    fubStages: {
      all: [],
      active: [],
      default: [],
    },
    zillowStages: {
      all: [],
      active: [],
      default: [],
    },
  },
};

const initialEventSearchState = {
  page: 0,
  pageSize: 10,
  categories: {
    sources: {
      active: ["Zillow Flex"],
      all: [],
      default: ["Zillow Flex"],
    },
    statuses: {
      active: zillowStatusOptions,
      all: zillowStatusOptions,
      default: zillowStatusOptions,
    },
    isPossibleZillowExemption: {
      active: [booleanOptions.true, booleanOptions.false],
      all: [booleanOptions.true, booleanOptions.false],
      default: [booleanOptions.true, booleanOptions.false],
    },
  },
  order: "desc",
  orderBy: "created",
  startDate: null,
  endDate: null,
  searchText: "",
};

module.exports = {
  initialEventSearchState,
  initialLeadSearchState,
};
