import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice.js"
import driverReducer from "../features/driver/driverSlice.js"
import vehiclesReducer from "../features/vehical/vehicalSlice.js"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        driver: driverReducer,
        vehicle: vehiclesReducer,
    }
})