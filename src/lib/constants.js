const zillowStatusOptions = [
  "No action",
  "No action needed",
  "Notified Zillow",
  "Zillow Approves Exemption",
  "Zillow Rejected Exemption",
];

const zillowStageOptions = [
  "New",
  "Attempted contact",
  "Spoke with customer",
  "Appointment set",
  "Met with customer",
  "Showing homes",
  "Submitting offers",
  "Under contract",
  "Sale closed",
  "Nurture",
  "Rejected",
  "",
];

const booleanOptions = {
  true: "YES",
  false: "NO",
};

module.exports = {
  zillowStatusOptions,
  zillowStageOptions,
  booleanOptions,
};
