const mongoose = require("mongoose");
const config = require("./config/config");

const connect = () => {
  // Connection URL
  mongoose.Promise = global.Promise;
  mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
  mongoose.connection.on("error", () => {
    throw new Error(`unable to connect to database: ${config.mongoUri}`);
  });
};

module.exports = { connect };
