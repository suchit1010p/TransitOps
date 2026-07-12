import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { sql } from "../db/db.js"

// GET operations (Accessible by everyone via verifyAuth)
export const getDispatcherDashboard = asyncHandler(async (req, res) => {
    // Vehicle KPIs
    const [vehicleKpis] = await sql`
        SELECT
            COUNT(*) as total_vehicles,
            COUNT(*) FILTER (WHERE status = 'Available') as available_vehicles,
            COUNT(*) FILTER (WHERE status = 'In Shop') as in_maintenance,
            COUNT(*) FILTER (WHERE status NOT IN ('Retired')) as active_vehicles
        FROM vehicles
    `;

    // Trip KPIs
    const [tripKpis] = await sql`
        SELECT
            COUNT(*) FILTER (WHERE status = 'Dispatched') as active_trips,
            COUNT(*) FILTER (WHERE status = 'Draft') as pending_trips
        FROM trips
    `;

    // Drivers on duty
    const [driverKpis] = await sql`
        SELECT COUNT(*) FILTER (WHERE status = 'On Trip') as drivers_on_duty
        FROM drivers
    `;

    // Fleet utilization
    const totalVehicles = Number(vehicleKpis.total_vehicles);
    const availableVehicles = Number(vehicleKpis.available_vehicles);
    const fleetUtilization = totalVehicles > 0
        ? Math.round(((totalVehicles - availableVehicles) / totalVehicles) * 100)
        : 0;

    // Vehicle status breakdown (for chart)
    const vehicleStatusBreakdown = await sql`
        SELECT status, COUNT(*) as count
        FROM vehicles
        GROUP BY status
    `;

    // Recent trips (last 10)
    const recentTrips = await sql`
        SELECT
            t.id, t.source, t.destination, t.status, t.created_at,
            v.name_model as vehicle_name, v.registration_number,
            d.name as driver_name
        FROM trips t
        LEFT JOIN vehicles v ON t.vehicle_id = v.id
        LEFT JOIN drivers d ON t.driver_id = d.id
        ORDER BY t.created_at DESC
        LIMIT 10
    `;

    return res.status(200).json(new ApiResponse(200, {
        kpis: {
            activeVehicles: Number(vehicleKpis.active_vehicles),
            availableVehicles: Number(vehicleKpis.available_vehicles),
            inMaintenance: Number(vehicleKpis.in_maintenance),
            activeTrips: Number(tripKpis.active_trips),
            pendingTrips: Number(tripKpis.pending_trips),
            driversOnDuty: Number(driverKpis.drivers_on_duty),
            fleetUtilization,
        },
        vehicleStatusBreakdown,
        recentTrips,
    }, "Dashboard data retrieved successfully."))
})

export const getTrips = asyncHandler(async (req, res) => {
    const trips = await sql`
        SELECT 
            t.id, t.source, t.destination, t.cargo_weight, 
            t.planned_distance, t.status, t.created_at,
            v.name_model as vehicle_name, v.registration_number,
            d.name as driver_name, d.license_number
        FROM trips t
        LEFT JOIN vehicles v ON t.vehicle_id = v.id
        LEFT JOIN drivers d ON t.driver_id = d.id
        ORDER BY t.created_at DESC
    `;
    
    return res.status(200).json(new ApiResponse(200, trips, "Trips retrieved successfully."))
})

// POST/PUT/DELETE operations (Restricted to Dispatcher via verifyDispatcher)
export const addTrip = asyncHandler(async (req, res) => {
    const { 
        source, destination, vehicle_id, driver_id, 
        cargo_weight_kg, planned_distance_km, status = "Draft"
    } = req.body;

    if (!source || !destination || !vehicle_id || !driver_id || !cargo_weight_kg) {
        throw new ApiError(400, "source, destination, vehicle_id, driver_id and cargo_weight_kg are required.");
    }

    // 1. Validate Vehicle
    const vehicles = await sql`SELECT * FROM vehicles WHERE id = ${vehicle_id}`;
    if (!vehicles || vehicles.length === 0) {
        throw new ApiError(404, "Vehicle not found.");
    }
    const vehicle = vehicles[0];

    if (vehicle.status === "In Shop" || vehicle.status === "Retired") {
        throw new ApiError(400, `Cannot dispatch vehicle. Current status is ${vehicle.status}.`);
    }

    if (Number(cargo_weight_kg) > Number(vehicle.max_load_capacity)) {
        throw new ApiError(400, `Cargo weight (${cargo_weight_kg}kg) exceeds vehicle capacity (${vehicle.max_load_capacity}kg).`);
    }

    // 2. Validate Driver
    const drivers = await sql`SELECT * FROM drivers WHERE id = ${driver_id}`;
    if (!drivers || drivers.length === 0) {
        throw new ApiError(404, "Driver not found.");
    }
    const driver = drivers[0];

    if (driver.status === "Suspended") {
        throw new ApiError(400, "Cannot assign suspended driver.");
    }

    const today = new Date();
    const expiry = new Date(driver.license_expiry_date);
    if (expiry < today) {
        throw new ApiError(400, "Cannot assign driver with expired license.");
    }

    const [trip] = await sql`
        INSERT INTO trips (
            source, destination, vehicle_id, driver_id, 
            cargo_weight, planned_distance, status, created_by
        ) VALUES (
            ${source}, ${destination}, ${vehicle_id}, ${driver_id}, 
            ${Number(cargo_weight_kg)}, ${planned_distance_km ? Number(planned_distance_km) : null}, 
            ${status}, ${req.user ? req.user.id : null}
        )
        RETURNING *
    `;

    // If dispatched immediately, update vehicle and driver status
    if (status === "Dispatched") {
        await sql`UPDATE vehicles SET status = 'On Trip' WHERE id = ${vehicle_id}`;
        await sql`UPDATE drivers SET status = 'On Trip' WHERE id = ${driver_id}`;
    }

    return res.status(201).json(new ApiResponse(201, trip, "Trip added successfully."));
})

export const updateTripStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
        throw new ApiError(400, "Trip id and status are required.");
    }

    const trips = await sql`SELECT * FROM trips WHERE id = ${id}`;
    if (!trips || trips.length === 0) {
        throw new ApiError(404, "Trip not found.");
    }
    const trip = trips[0];

    const validStatuses = ["Draft", "Dispatched", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid trip status.");
    }

    const [updatedTrip] = await sql`
        UPDATE trips 
        SET status = ${status},
            dispatched_at = CASE WHEN ${status} = 'Dispatched' THEN NOW() ELSE dispatched_at END,
            completed_at = CASE WHEN ${status} = 'Completed' THEN NOW() ELSE completed_at END
        WHERE id = ${id} RETURNING *
    `;

    // Handle lifecycle state changes for related entities
    if (status === "Dispatched") {
        await sql`UPDATE vehicles SET status = 'On Trip' WHERE id = ${trip.vehicle_id}`;
        await sql`UPDATE drivers SET status = 'On Trip' WHERE id = ${trip.driver_id}`;
    } else if (status === "Completed" || status === "Cancelled") {
        await sql`UPDATE vehicles SET status = 'Available' WHERE id = ${trip.vehicle_id}`;
        await sql`UPDATE drivers SET status = 'Available' WHERE id = ${trip.driver_id}`;
        
        // If completed, update odometer
        if (status === "Completed" && trip.planned_distance) {
            await sql`
                UPDATE vehicles 
                SET odometer = odometer + ${trip.planned_distance} 
                WHERE id = ${trip.vehicle_id}
            `;
        }
    }

    return res.status(200).json(new ApiResponse(200, updatedTrip, `Trip status updated to ${status}.`));
})
