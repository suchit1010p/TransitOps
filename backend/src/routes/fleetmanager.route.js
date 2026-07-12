import express from "express";
import { addVehicle, getVehicles } from "../controllers/fleetmanager.controller.js";
import { verifyAuth, verifyRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.js";

const router = express.Router();

router.get("/vehicles", verifyAuth, getVehicles);
router.post("/vehicles", verifyRole(ROLES.FLEET_MANAGER), addVehicle);

export default router;
