require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const morgan = require('morgan');
const authRoutes = require("./routes/authRoutes");
const globalErrorHandler = require('./controllers/errorController');
const { startSQL } = require('./config/db');
const paymentRoutes = require("./routes/stripeRoutes")
const webHookController = require("./controllers/webHookController")

const fintechRoutes = require("./routes/fintechRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const apiRoutes = require("./routes/apiRoutes");
const activityLogger = require("./middlewares/logger");

const app = express();
const PORT = 8000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.post("/webhooks", express.raw({ type: 'application/json' }),webHookController.listenWebhooks)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(morgan("dev"));

app.use(activityLogger);

app.use("/api/auth", authRoutes);
app.use("/api/pay",paymentRoutes)
app.use("/api/fintech",fintechRoutes);
app.use("/api/key", apiRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/admin", adminRoutes);

startSQL();

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});

module.exports = {express}