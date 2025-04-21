const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Subscription = sequelize.define(
    "Subscription",
    {
        subscriptionId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.NUMBER,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        transactionLimit: {
            type: DataTypes.NUMBER,
            allowNull: false,
        },
        transactionPerDay: {
            type: DataTypes.NUMBER,
            allowNull: false,
        },
        invoice: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        priority: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        }
    }
);

module.exports = Subscription;
