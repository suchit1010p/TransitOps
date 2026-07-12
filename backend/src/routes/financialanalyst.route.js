import express from "express";
import { getFuelLogs, getExpenses, addFuelLog, addExpense, getAnalytics } from "../controllers/financialanalyst.controller.js";
import { verifyAuth, verifyRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.js";

const router = express.Router();

router.get("/fuel-logs", verifyAuth, getFuelLogs);
router.post("/fuel-logs", verifyAuth, verifyRole(ROLES.FINANCIAL_ANALYST), addFuelLog);

router.get("/expenses", verifyAuth, getExpenses);
router.post("/expenses", verifyAuth, verifyRole(ROLES.FINANCIAL_ANALYST), addExpense);

router.get("/analytics", verifyAuth, getAnalytics);

export default router;
