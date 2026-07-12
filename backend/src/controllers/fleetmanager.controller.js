import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { sql } from "../db/db.js"

// GET operations (Accessible by authenticated users)
export const getFleetStatus = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, {}, "Fleet status retrieved successfully (viewed by all)"))
})

export const getMaintenanceRecords = asyncHandler(async (req, res) => {
    const records = await sql`
        SELECT m.id, m.vehicle_id, m.service_type, m.cost, m.date, m.status,
               v.name_model as vehicle_name, v.registration_number
        FROM maintenance_logs m
        LEFT JOIN vehicles v ON m.vehicle_id = v.id
        ORDER BY m.date DESC
    `;
    return res.status(200).json(new ApiResponse(200, records, "Maintenance records retrieved successfully."))
})

export const getVehicles = asyncHandler(async (req, res) => {
    const vehicles = await sql`
        SELECT id, registration_number, name_model, type, max_load_capacity, odometer, acquisition_cost, status, region, created_at
        FROM vehicles
        ORDER BY created_at DESC
    `;

    return res.status(200).json(new ApiResponse(200, vehicles, "Vehicles retrieved successfully."))
})

// POST/PUT/DELETE operations (Restricted to Fleet Manager)
export const updateFleetStatus = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, {}, "Fleet status updated successfully (Fleet Manager only)"))
})

export const addMaintenanceRecord = asyncHandler(async (req, res) => {
    const { vehicle_id, service_type, cost, date, status = "Open", notes } = req.body;

    if (!vehicle_id || !service_type || !cost || !date) {
        throw new ApiError(400, "vehicle_id, service_type, cost, and date are required.");
    }

    // Insert maintenance record
    const [record] = await sql`
        INSERT INTO maintenance_logs (vehicle_id, service_type, cost, date, status)
        VALUES (
            ${vehicle_id}, ${service_type}, ${Number(cost)}, ${date}, ${status}
        )
        RETURNING *
    `;

    // If status is Open, update vehicle status to In Shop
    if (status === "Open") {
        await sql`UPDATE vehicles SET status = 'In Shop' WHERE id = ${vehicle_id}`;
    }

    return res.status(201).json(new ApiResponse(201, record, "Maintenance record added successfully."));
})

export const updateMaintenanceStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
        throw new ApiError(400, "Maintenance record id and status are required.");
    }

    // Fetch existing record
    const records = await sql`SELECT * FROM maintenance_logs WHERE id = ${id}`;
    if (!records || records.length === 0) {
        throw new ApiError(404, "Maintenance record not found.");
    }
    const record = records[0];

    const [updatedRecord] = await sql`
        UPDATE maintenance_logs SET status = ${status}
        WHERE id = ${id} RETURNING *
    `;

    // Handle vehicle status transitions based on maintenance completion
    if (status === "Closed" && record.status === "Open") {
        await sql`UPDATE vehicles SET status = 'Available' WHERE id = ${record.vehicle_id}`;
    } else if (status === "Open" && record.status === "Closed") {
        await sql`UPDATE vehicles SET status = 'In Shop' WHERE id = ${record.vehicle_id}`;
    }

    return res.status(200).json(new ApiResponse(200, updatedRecord, `Maintenance status updated to ${status}.`));
})

export const addVehicle = asyncHandler(async (req, res) => {
    const {
        registration_number,
        name_model,
        type,
        max_load_capacity,
        odometer = 0,
        acquisition_cost,
        status = "Available",
        region,
    } = req.body;

    if (!registration_number || !name_model || !type || !max_load_capacity || !acquisition_cost) {
        throw new ApiError(400, "registration_number, name_model, type, max_load_capacity and acquisition_cost are required.")
    }

    const [vehicle] = await sql`
        INSERT INTO vehicles (
            registration_number,
            name_model,
            type,
            max_load_capacity,
            odometer,
            acquisition_cost,
            status,
            region
        ) VALUES (
            ${registration_number},
            ${name_model},
            ${type},
            ${Number(max_load_capacity)},
            ${Number(odometer)},
            ${Number(acquisition_cost)},
            ${status},
            ${region || null}
        )
        RETURNING id, registration_number, name_model, type, max_load_capacity, odometer, acquisition_cost, status, region, created_at
    `;

    return res.status(201).json(new ApiResponse(201, vehicle, "Vehicle added successfully."))
})

export const updateVehicleStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
        throw new ApiError(400, "Vehicle id is required.")
    }

    if (!status) {
        throw new ApiError(400, "status is required.")
    }

    const [vehicle] = await sql`
        UPDATE vehicles
        SET status = ${status}
        WHERE id = ${id}
        RETURNING id, registration_number, name_model, type, max_load_capacity, odometer, acquisition_cost, status, region, created_at
    `;

    if (!vehicle) {
        throw new ApiError(404, "Vehicle not found.")
    }

    return res.status(200).json(new ApiResponse(200, vehicle, "Vehicle status updated successfully."))
})
