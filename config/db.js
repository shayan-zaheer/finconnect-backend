const { Sequelize } = require("sequelize");
const fs = require("fs");

const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    dialect: "postgres",
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
            ca: fs.readFileSync("./config/ca.pem").toString(),
        },
    },
});

const startSQL = async () => {
    try {
        await sequelize.authenticate();
        console.log("PostgreSQL running.");
        await sequelize.sync({ alter: true });
        console.log("DB synced successfully!");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

module.exports = { sequelize, startSQL };
