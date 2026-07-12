import express from "express";
import { addDriver, getDrivers } from "../controllers/safetyofficer.controller.js";
import { verifyAuth, verifyRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.js";

const router = express.Router();

router.get("/drivers", verifyAuth, getDrivers);
router.post("/drivers", verifyRole(ROLES.SAFETY_OFFICER), addDriver);

export default router;
