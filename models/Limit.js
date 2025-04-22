const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");
const Subscription = require("./Subscription");

const Limit = sequelize.define("Limit", {
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: "accountNumber",
        },
    },
    subscriptionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Subscription,
            key: "subscriptionId",
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
