const { Parser } = require("json2csv");

class LeadCSVParser {
  static generateCSV(rows) {
    // Fields to use for CSV export
    const fields = [
      "_id",
      "updated",
      "created",
      "name",
      "firstName",
      "lastName",
      "lastActivity",
      "price",
      "stage",
      "source",
      "delayed",
      "contacted",
      "assignedLenderId",
      "assignedLenderName",
      "assignedUserId",
      "assignedPondId",
      "assignedTo",
      "tags",
      "emails",
      "phones",
      "addresses",
      "picture",
      "socialData",
      "claimed",
      "firstToClaimOffer",
      "collaborators",
      "teamLeaders",
      "pondMembers",
      "processed",
      "processedAt",
    ];

    // Prepare CSV export - flatten all the Events objects
    const opts = { fields };
    const parser = new Parser(opts);
    // Convert flattened rows to CSV
    const csv = parser.parse(rows);

    return csv;
  }
}

module.exports = { LeadCSVParser };
