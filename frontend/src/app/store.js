import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice.js"
import driverReducer from "../features/driver/driverSlice.js"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        driver: driverReducer,
    }
})