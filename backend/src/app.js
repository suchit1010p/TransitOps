import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.route.js"
import fleetManagerRoutes from "./routes/fleetmanager.route.js"
import safetyOfficerRoutes from "./routes/safetyofficer.route.js"

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()) 
    : true;

app.use(cors({
    origin: allowedOrigin,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1", authRoutes);
app.use("/api/v1", fleetManagerRoutes);
app.use("/api/v1", safetyOfficerRoutes);

app.use((err, req, res, next) => {
    const statusCode = err?.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: err?.message || "Internal Server Error",
        errors: err?.errors || []
    });
});


export { app };