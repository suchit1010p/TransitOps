import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

// GET operations (Accessible by everyone via verifyAuth)
export const getDispatcherDashboard = asyncHandler(async (req, res) => {
    // Logic for dashboard
    return res.status(200).json(new ApiResponse(200, {}, "Dispatcher dashboard retrieved successfully (viewed by all)"))
})

export const getTrips = asyncHandler(async (req, res) => {
    // Logic for trips
    return res.status(200).json(new ApiResponse(200, {}, "Trips retrieved successfully (viewed by all)"))
})

// POST/PUT/DELETE operations (Restricted to Dispatcher via verifyDispatcher)
export const addTrip = asyncHandler(async (req, res) => {
    // Logic to add a trip
    return res.status(201).json(new ApiResponse(201, {}, "Trip added successfully (Dispatcher only)"))
})

export const updateTripStatus = asyncHandler(async (req, res) => {
    // Logic to update trip status
    return res.status(200).json(new ApiResponse(200, {}, "Trip status updated successfully (Dispatcher only)"))
})
