import express from "express";
import { addDriver, getDrivers, updateDriverSafety, updateDriverStatus } from "../controllers/safetyofficer.controller.js";
import { verifyAuth, verifyRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.js";

const router = express.Router();

router.get("/drivers", verifyAuth, getDrivers);
router.post("/drivers", verifyRole(ROLES.SAFETY_OFFICER), addDriver);
router.put("/drivers/:id/status", verifyRole(ROLES.SAFETY_OFFICER), updateDriverStatus);
router.put("/drivers/:id/safety", verifyRole(ROLES.SAFETY_OFFICER), updateDriverSafety);

export default router;
