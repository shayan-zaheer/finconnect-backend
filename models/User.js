const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
    "User",
    {
        accountNumber: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: { isEmail: true },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("developer", "admin"),
            allowNull: false,
            defaultValue: "developer",
        },
        isSubscribed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        subscriptionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Subscription",
                key: "subscriptionId",
            },
        },
        balance: {
            type: DataTypes.NUMBER,
            defaultValue: 0,
        },
    },
    {
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed("password")) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
        },
        timestamps: true,
    }
);

module.exports = User;
