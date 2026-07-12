import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { sql } from "../db/db.js"

const VALID_DRIVER_VALUES = ["Available", "On Trip", "Off Duty", "Suspended"]

const normalizeDriverValue = (value) => {
    if (!value) return "Available"
    const normalized = String(value).trim()
    return VALID_DRIVER_VALUES.includes(normalized) ? normalized : "Available"
}

// GET operations (Accessible by authenticated users)
export const getDrivers = asyncHandler(async (req, res) => {
    const drivers = await sql`
        SELECT id, name, license_number, license_category, license_expiry_date, contact_number, safety_status, status, created_at
        FROM drivers
        ORDER BY created_at DESC
    `;

    return res.status(200).json(new ApiResponse(200, drivers, "Drivers retrieved successfully."))
})

export const getComplianceReports = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, {}, "Compliance reports retrieved successfully (viewed by all)"))
})

// POST/PUT/DELETE operations (Restricted to Safety Officer)
export const updateDriverCompliance = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, {}, "Driver compliance updated successfully (Safety Officer only)"))
})

export const addComplianceReport = asyncHandler(async (req, res) => {
    return res.status(201).json(new ApiResponse(201, {}, "Compliance report added successfully (Safety Officer only)"))
})

export const addDriver = asyncHandler(async (req, res) => {
    const {
        name,
        license_number,
        license_category,
        license_expiry_date,
        contact_number,
        safety_status = "Available",
        status = "Available",
    } = req.body;

    const safeStatus = normalizeDriverValue(safety_status)
    const driverStatus = normalizeDriverValue(status)

    if (!name || !license_number || !license_category || !license_expiry_date) {
        throw new ApiError(400, "name, license_number, license_category and license_expiry_date are required.")
    }

    const [driver] = await sql`
        INSERT INTO drivers (
            name,
            license_number,
            license_category,
            license_expiry_date,
            contact_number,
            safety_status,
            status
        ) VALUES (
            ${name},
            ${license_number},
            ${license_category},
            ${license_expiry_date},
            ${contact_number || null},
            ${safeStatus},
            ${driverStatus}
        )
        RETURNING id, name, license_number, license_category, license_expiry_date, contact_number, safety_status, status, created_at
    `;

    return res.status(201).json(new ApiResponse(201, driver, "Driver added successfully."))
})

export const updateDriverStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const driverStatus = normalizeDriverValue(status)

    if (!id) {
        throw new ApiError(400, "Driver id is required.")
    }

    if (!status) {
        throw new ApiError(400, "status is required.")
    }

    const [driver] = await sql`
        UPDATE drivers
        SET status = ${driverStatus}
        WHERE id = ${id}
        RETURNING id, name, license_number, license_category, license_expiry_date, contact_number, safety_status, status, created_at
    `;

    if (!driver) {
        throw new ApiError(404, "Driver not found.")
    }

    return res.status(200).json(new ApiResponse(200, driver, "Driver status updated successfully."))
})

export const updateDriverSafety = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { safety_status } = req.body;
    const safeStatus = normalizeDriverValue(safety_status)

    if (!id) {
        throw new ApiError(400, "Driver id is required.")
    }

    if (!safety_status) {
        throw new ApiError(400, "safety_status is required.")
    }

    const [driver] = await sql`
        UPDATE drivers
        SET safety_status = ${safeStatus}
        WHERE id = ${id}
        RETURNING id, name, license_number, license_category, license_expiry_date, contact_number, safety_status, status, created_at
    `;

    if (!driver) {
        throw new ApiError(404, "Driver not found.")
    }

    return res.status(200).json(new ApiResponse(200, driver, "Driver safety updated successfully."))
})
