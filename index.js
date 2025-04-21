require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const morgan = require('morgan');
const authRoutes = require("./routes/authRoutes");
const globalErrorHandler = require('./controllers/errorController');
const { startSQL } = require('./config/db');
const paymentRoutes = require("./routes/stripeRoutes")



const app = express();
const PORT = 8000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/pay",paymentRoutes)

startSQL();

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});