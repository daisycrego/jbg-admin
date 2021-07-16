const { Parser } = require("json2csv");

class CSVParser {
  static generateCSV(rows) {
    // Fields to use for CSV export
    const fields = [
      "_id",
      "eventId",
      "type",
      "created",
      "source",
      "message",
      "status",
      "processed",
      "processedAt",
      "isNewLead",
      "isPossibleZillowExemption",
      "isZillowEvent",
      "propertyId",
      "propertyStreet",
      "propertyCity",
      "propertyState",
      "propertyZipcode",
      "propertyMlsNumber",
      "propertyPrice",
      "propertyForRent",
      "propertyUrl",
      "propertyType",
      "propertyBedrooms",
      "propertyBathrooms",
      "propertyArea",
      "propertyLot",
      "propertyLat",
      "propertyLong",
      "personCreated",
      "personUpdated",
      "personId",
      "personName",
      "personCreatedVia",
      "personLastActivity",
      "personStage",
      "personStageId",
      "personSource",
      "personSourceId",
      "personSourceUrl",
      "personDelayed",
      "personContacted",
      "personPrice",
      "personAssignedLenderId",
      "personAssignedLenderName",
      "personAssignedUserId",
      "personAssignedPondId",
      "personAssignedTo",
      "personTags",
      "personEmails",
      "personPhones",
      "personAddresses",
      "personCollaborators",
      "personTeamLeaders",
      "personPondMembers",
    ];

    // Prepare CSV export - flatten all the Events objects
    const opts = { fields };
    const parser = new Parser(opts);
    const flattenedRows = rows.map((row) => {
      row.propertyStreet = row.property ? row.property.street : null;
      row.propertyCity = row.property ? row.property.city : null;
      row.propertyState = row.property ? row.property.state : null;
      row.propertyZipcode = row.property ? row.property.code : null;
      row.propertyMlsNumber = row.property ? row.property.mlsNumber : null;
      row.propertyPrice = row.property ? row.property.price : null;
      row.propertyForRent = row.property ? row.property.forRent : null;
      row.propertyUrl = row.property ? row.property.url : null;
      row.propertyType = row.property ? row.property.type : null;
      row.propertyBedrooms = row.property ? row.property.bedrooms : null;
      row.propertyBathrooms = row.property ? row.property.bathrooms : null;
      row.propertyArea = row.property ? row.property.area : null;
      row.propertyLot = row.property ? row.property.lot : null;
      row.propertyLat = row.property ? row.property.lat : null;
      row.propertyLong = row.property ? row.property.long : null;
      row.personCreated = row.person ? row.person.created : null;
      row.personUpdated = row.person ? row.person.updated : null;
      row.personName = row.person ? row.person.name : null;
      row.personCreatedVia = row.person ? row.person.createdVia : null;
      row.personLastActivity = row.person ? row.person.lastActivity : null;
      row.personStage = row.person ? row.person.stage : null;
      row.personStageId = row.person ? row.person.stageId : null;
      row.personSource = row.person ? row.person.source : null;
      row.personSourceId = row.person ? row.person.sourceId : null;
      row.personSourceUrl = row.person ? row.person.sourceUrl : null;
      row.personDelayed = row.person ? row.person.delayed : null;
      row.personContacted = row.person ? row.person.contacted : null;
      row.personPrice = row.person ? row.person.price : null;
      row.personAssignedLenderId = row.person
        ? row.person.assignedLenderId
        : null;
      row.personAssignedLenderName = row.person
        ? row.person.assignedLenderName
        : null;
      row.personAssignedUserId = row.person ? row.person.assignedUserId : null;
      row.personAssignedPondId = row.person ? row.person.assignedPondId : null;
      row.personAssignedTo = row.person ? row.person.assignedTo : null;
      row.personTags = row.person ? row.person.tags : null;
      row.personEmails = row.person ? row.person.emails : null;
      row.personPhones = row.person ? row.person.phones : null;
      row.personAddresses = row.person ? row.person.addresses : null;
      row.personCollaborators = row.person ? row.person.collaborators : null;
      row.personTeamLeaders = row.person ? row.person.teamLeaders : null;
      row.personPondMembers = row.person ? row.person.pondMembers : null;
      return row;
    });

    // Convert flattened rows to CSV
    const csv = parser.parse(flattenedRows);

    return csv;
  }
}

module.exports = { CSVParser };
