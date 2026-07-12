import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

const getAuthHeaders = (thunkAPI) => {
    const token = thunkAPI.getState()?.auth?.token
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getDrivers = createAsyncThunk('driver/getDrivers', async (_, thunkAPI) => {
    try {
        const result = await api.get('/drivers', { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to fetch drivers' })
    }
})

export const addDriver = createAsyncThunk('driver/addDriver', async (driverData, thunkAPI) => {
    try {
        const result = await api.post('/drivers', driverData, { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to add driver' })
    }
})

export const updateDriverStatus = createAsyncThunk('driver/updateDriverStatus', async ({ id, status }, thunkAPI) => {
    try {
        const result = await api.put(`/drivers/${id}/status`, { status }, { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to update driver status' })
    }
})

export const updateDriverSafety = createAsyncThunk('driver/updateDriverSafety', async ({ id, safety_status }, thunkAPI) => {
    try {
        const result = await api.put(`/drivers/${id}/safety`, { safety_status }, { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to update driver safety' })
    }
})

const driverSlice = createSlice({
    name: 'driver',
    initialState: {
        items: [],
        loading: false,
        message: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getDrivers.pending, (state) => {
            state.loading = true
            state.message = null
            state.error = null
        })
        builder.addCase(getDrivers.fulfilled, (state, action) => {
            state.loading = false
            state.items = action.payload?.data || []
            state.message = action.payload?.message || null
        })
        builder.addCase(getDrivers.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload?.message || 'Failed to fetch drivers'
        })

        builder.addCase(addDriver.pending, (state) => {
            state.loading = true
            state.message = null
            state.error = null
        })
        builder.addCase(addDriver.fulfilled, (state, action) => {
            state.loading = false
            state.items = [action.payload?.data, ...state.items]
            state.message = action.payload?.message || 'Driver added successfully'
        })
        builder.addCase(addDriver.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload?.message || 'Failed to add driver'
        })

        builder.addCase(updateDriverStatus.pending, (state) => {
            state.loading = true
            state.message = null
            state.error = null
        })
        builder.addCase(updateDriverStatus.fulfilled, (state, action) => {
            state.loading = false
            state.items = state.items.map((driver) =>
                driver.id === action.payload?.data?.id ? action.payload.data : driver
            )
            state.message = action.payload?.message || 'Driver status updated'
        })
        builder.addCase(updateDriverStatus.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload?.message || 'Failed to update driver status'
        })

        builder.addCase(updateDriverSafety.pending, (state) => {
            state.loading = true
            state.message = null
            state.error = null
        })
        builder.addCase(updateDriverSafety.fulfilled, (state, action) => {
            state.loading = false
            state.items = state.items.map((driver) =>
                driver.id === action.payload?.data?.id ? action.payload.data : driver
            )
            state.message = action.payload?.message || 'Driver safety updated'
        })
        builder.addCase(updateDriverSafety.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload?.message || 'Failed to update driver safety'
        })
    }
})

export default driverSlice.reducer