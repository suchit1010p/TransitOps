import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { sql } from "../db/db.js"

// GET operations (Accessible by authenticated users)
export const getFleetStatus = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, {}, "Fleet status retrieved successfully (viewed by all)"))
})

export const getMaintenanceRecords = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, {}, "Maintenance records retrieved successfully (viewed by all)"))
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
    return res.status(201).json(new ApiResponse(201, {}, "Maintenance record added successfully (Fleet Manager only)"))
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
