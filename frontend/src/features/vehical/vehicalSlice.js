import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

const getAuthHeaders = (thunkAPI) => {
    const token = thunkAPI.getState()?.auth?.token
    return token ? { Authorization: `Bearer ${token}` } : {}
}


export const getVehicals = createAsyncThunk('vehicals/getVehicals', async (_, thunkAPI) => {
    try {
        const result = await api.get('/vehicles', { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to fetch drivers' })
    }
})

export const addVehicles = createAsyncThunk('vehicles/addVehicle', async (VehiclerData, thunkAPI) => {
    try {
        const result = await api.post('/vehicles', VehiclerData, { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to add driver' })
    }
})

export const updateVehicalStatus = createAsyncThunk('vehical/updateVehicleStatus', async ({ id, status }, thunkAPI) => {
    try {
        const result = await api.put(`/vehicles/${id}/status`, { status }, { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to update driver status' })
    }
})


const vehicleSlice = createSlice({
    name: 'vehicle',
    initialState: {
        items: [],
        loading: false,
        message: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getVehicals.pending, (state) => {
            state.loading = true
            state.message = null
            state.error = null
        })
        builder.addCase(getVehicals.fulfilled, (state, action) => {
            state.loading = false
            state.items = action.payload?.data || []
            state.message = action.payload?.message || null
        })
        builder.addCase(getVehicals.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload?.message || 'Failed to fetch drivers'
        })

        builder.addCase(addVehicles.pending, (state) => {
            state.loading = true
            state.message = null
            state.error = null
        })
        builder.addCase(addVehicles.fulfilled, (state, action) => {
            state.loading = false
            state.items = [action.payload?.data, ...state.items]
            state.message = action.payload?.message || 'Driver added successfully'
        })
        builder.addCase(addVehicles.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload?.message || 'Failed to add driver'
        })

        builder.addCase(updateVehicalStatus.pending, (state) => {
            state.loading = true
            state.message = null
            state.error = null
        })
        builder.addCase(updateVehicalStatus.fulfilled, (state, action) => {
            state.loading = false
            state.items = state.items.map((driver) =>
                driver.id === action.payload?.data?.id ? action.payload.data : driver
            )
            state.message = action.payload?.message || 'Driver status updated'
        })
        builder.addCase(updateVehicalStatus.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload?.message || 'Failed to update driver status'
        })
    }
})

export default vehicleSlice.reducer