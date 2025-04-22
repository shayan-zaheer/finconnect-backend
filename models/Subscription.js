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
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        transactionLimit: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        transactionPerDay: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        invoice: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        priority: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        }, 
        price_id: {
            type: DataTypes.TEXT,
            allowNull:true
        }
    }
);

module.exports = Subscription;
