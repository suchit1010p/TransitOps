import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

import { sql } from "../db/db.js"

export const getFuelLogs = asyncHandler(async (req, res) => {
    const logs = await sql`
        SELECT f.*, v.name_model as vehicle_name, v.registration_number
        FROM fuel_logs f
        LEFT JOIN vehicles v ON f.vehicle_id = v.id
        ORDER BY f.log_date DESC
    `;
    return res.status(200).json(new ApiResponse(200, logs, "Fuel logs retrieved successfully."))
})

export const getExpenses = asyncHandler(async (req, res) => {
    const expenses = await sql`
        SELECT e.*, v.name_model as vehicle_name, v.registration_number
        FROM expenses e
        LEFT JOIN vehicles v ON e.vehicle_id = v.id
        ORDER BY e.expense_date DESC
    `;
    return res.status(200).json(new ApiResponse(200, expenses, "Expenses retrieved successfully."))
})

export const getAnalytics = asyncHandler(async (req, res) => {
    // 1. Fuel Efficiency: total km driven / total liters fueled
    const [fuelStats] = await sql`
        SELECT 
            COALESCE(SUM(f.liters), 0) as total_liters,
            COALESCE(SUM(t.planned_distance), 0) as total_km
        FROM fuel_logs f
        LEFT JOIN trips t ON f.trip_id = t.id
    `;
    const fuelEfficiency = fuelStats.total_liters > 0 
        ? (Number(fuelStats.total_km) / Number(fuelStats.total_liters)).toFixed(1) 
        : 0;

    // 2. Fleet Utilization: On Trip vehicles / Total vehicles
    const [vehicleStats] = await sql`
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'On Trip') as on_trip
        FROM vehicles
    `;
    const fleetUtilization = vehicleStats.total > 0 
        ? Math.round((Number(vehicleStats.on_trip) / Number(vehicleStats.total)) * 100) 
        : 0;

    // 3. Operational Cost: fuel + expenses + maintenance
    const [costStats] = await sql`
        SELECT 
            (SELECT COALESCE(SUM(cost), 0) FROM fuel_logs) +
            (SELECT COALESCE(SUM(amount), 0) FROM expenses) +
            (SELECT COALESCE(SUM(cost), 0) FROM maintenance_logs) AS total_cost
    `;
    const operationalCost = Number(costStats.total_cost);

    // 4. Revenue estimate: planned_distance * 50 per km for completed trips
    const [revenueStats] = await sql`
        SELECT COALESCE(SUM(planned_distance), 0) * 50 as total_revenue
        FROM trips WHERE status = 'Completed'
    `;
    const totalRevenue = Number(revenueStats.total_revenue);

    // 5. Vehicle ROI: (Revenue - Cost) / Acquisition Cost
    const [acqStats] = await sql`SELECT COALESCE(SUM(acquisition_cost), 0) as total_acq FROM vehicles`;
    const totalAcq = Number(acqStats.total_acq);
    const roi = totalAcq > 0 ? (((totalRevenue - operationalCost) / totalAcq) * 100).toFixed(1) : 0;

    // 6. Monthly Revenue (last 6 months)
    const monthlyRevenue = await sql`
        SELECT 
            TO_CHAR(completed_at, 'Mon') as month,
            EXTRACT(MONTH FROM completed_at) as month_num,
            EXTRACT(YEAR FROM completed_at) as year,
            COALESCE(SUM(planned_distance), 0) * 50 as revenue
        FROM trips
        WHERE status = 'Completed' AND completed_at IS NOT NULL
            AND completed_at >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR(completed_at, 'Mon'), EXTRACT(MONTH FROM completed_at), EXTRACT(YEAR FROM completed_at)
        ORDER BY year ASC, month_num ASC
    `;

    // 7. Top Costliest Vehicles (fuel + maintenance + expenses per vehicle)
    const costliestVehicles = await sql`
        SELECT 
            v.name_model,
            v.registration_number,
            COALESCE(fl.fuel_cost, 0) + COALESCE(ml.maint_cost, 0) + COALESCE(ex.exp_cost, 0) as total_cost
        FROM vehicles v
        LEFT JOIN (SELECT vehicle_id, SUM(cost) as fuel_cost FROM fuel_logs GROUP BY vehicle_id) fl ON fl.vehicle_id = v.id
        LEFT JOIN (SELECT vehicle_id, SUM(cost) as maint_cost FROM maintenance_logs GROUP BY vehicle_id) ml ON ml.vehicle_id = v.id
        LEFT JOIN (SELECT vehicle_id, SUM(amount) as exp_cost FROM expenses GROUP BY vehicle_id) ex ON ex.vehicle_id = v.id
        WHERE COALESCE(fl.fuel_cost, 0) + COALESCE(ml.maint_cost, 0) + COALESCE(ex.exp_cost, 0) > 0
        ORDER BY total_cost DESC
        LIMIT 5
    `;

    // 8. Trip status breakdown
    const tripStatusBreakdown = await sql`
        SELECT status, COUNT(*) as count
        FROM trips
        GROUP BY status
    `;

    // 9. Driver trip count (top 5 most active drivers)
    const topDrivers = await sql`
        SELECT d.name, COUNT(t.id) as trip_count
        FROM drivers d
        LEFT JOIN trips t ON t.driver_id = d.id
        GROUP BY d.name
        ORDER BY trip_count DESC
        LIMIT 5
    `;

    return res.status(200).json(new ApiResponse(200, {
        kpis: { fuelEfficiency, fleetUtilization, operationalCost, roi, totalRevenue },
        monthlyRevenue,
        costliestVehicles,
        tripStatusBreakdown,
        topDrivers,
    }, "Analytics data retrieved successfully."))
})

// POST/PUT/DELETE operations (Restricted to Financial Analyst via verifyRole)
export const addFuelLog = asyncHandler(async (req, res) => {
    const { vehicle_id, trip_id, liters, cost, log_date } = req.body;

    if (!vehicle_id || !liters || !cost || !log_date) {
        throw new ApiError(400, "vehicle_id, liters, cost, and log_date are required.");
    }

    const [log] = await sql`
        INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, log_date)
        VALUES (${vehicle_id}, ${trip_id || null}, ${Number(liters)}, ${Number(cost)}, ${log_date})
        RETURNING *
    `;
    return res.status(201).json(new ApiResponse(201, log, "Fuel log added successfully."))
})

export const addExpense = asyncHandler(async (req, res) => {
    const { vehicle_id, trip_id, expense_type, amount, expense_date, description } = req.body;

    if (!vehicle_id || !expense_type || !amount || !expense_date) {
        throw new ApiError(400, "vehicle_id, expense_type, amount, and expense_date are required.");
    }

    const [expense] = await sql`
        INSERT INTO expenses (vehicle_id, trip_id, expense_type, amount, expense_date, description)
        VALUES (${vehicle_id}, ${trip_id || null}, ${expense_type}, ${Number(amount)}, ${expense_date}, ${description || null})
        RETURNING *
    `;
    return res.status(201).json(new ApiResponse(201, expense, "Expense added successfully."))
})

