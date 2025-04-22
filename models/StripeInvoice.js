const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = require("./User");

const StripeInvoice = sequelize.define("StripeInvoice", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: "accountNumber",
        },
    },
    invoiceUrl: {
        type: DataTypes.UUID,
    },
});

module.exports = StripeInvoice;

