import express from "express";
import { getDispatcherDashboard, getTrips, addTrip, updateTripStatus } from "../controllers/dispatcher.controller.js";
import { verifyAuth, verifyRole } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/dispatcher-dashboard", verifyAuth, getDispatcherDashboard);
router.get("/trips", verifyAuth, getTrips);
router.post("/trips", verifyAuth, verifyRole("Dispatcher"), addTrip);
router.put("/trips/:id/status", verifyAuth, verifyRole("Dispatcher"), updateTripStatus);

export default router;
