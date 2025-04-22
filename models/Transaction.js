const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Transaction = sequelize.define(
    "Transaction",
    {
        transactionId: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        senderAccount: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "User",
                key: "accountNumber",
            },
        },
        receiverAccount: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "User",
                key: "accountNumber",
            },
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }
);

module.exports = Transaction;
