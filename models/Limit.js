const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Limit = sequelize.define("Limit", {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "User", // Table name (not the model file name)
      key: "accountNumber", // Assuming this is your PK
    },
  },
  subscriptionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Subscription",
      key: "subscriptionId", // Adjust if different
    },
  },
  transactionAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  noOfTransactions: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lastBilledOn: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Limit;
