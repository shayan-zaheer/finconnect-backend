const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Audit = sequelize.define(
    "Audit",
    {
        activity: {
            type: DataTypes.ENUM("PAYMENT", "LOGIN", "SIGNUP"),
            allowNull: false,
        },
        performedBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "User",
                key: "accountNumber",
            },
        }
    }
);

module.exports = Audit;
