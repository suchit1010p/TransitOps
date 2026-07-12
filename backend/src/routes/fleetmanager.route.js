import express from "express";
import { addVehicle, getVehicles, updateVehicleStatus, getMaintenanceRecords, addMaintenanceRecord, updateMaintenanceStatus } from "../controllers/fleetmanager.controller.js";
import { verifyAuth, verifyRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.js";

const router = express.Router();

router.get("/vehicles", verifyAuth, getVehicles);
router.post("/vehicles", verifyAuth, verifyRole(ROLES.FLEET_MANAGER), addVehicle);
router.put("/vehicles/:id/status", verifyAuth, verifyRole(ROLES.FLEET_MANAGER), updateVehicleStatus);

router.get("/maintenance", verifyAuth, getMaintenanceRecords);
router.post("/maintenance", verifyAuth, verifyRole(ROLES.FLEET_MANAGER), addMaintenanceRecord);
router.put("/maintenance/:id/status", verifyAuth, verifyRole(ROLES.FLEET_MANAGER), updateMaintenanceStatus);

export default router;
