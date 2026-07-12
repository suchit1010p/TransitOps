import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

const getAuthHeaders = (thunkAPI) => {
    const token = thunkAPI.getState()?.auth?.token
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getTrips = createAsyncThunk('trip/getTrips', async (_, thunkAPI) => {
    try {
        const result = await api.get('/trips', { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to fetch trips' })
    }
})

export const addTrip = createAsyncThunk('trip/addTrip', async (tripData, thunkAPI) => {
    try {
        const result = await api.post('/trips', tripData, { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to create trip' })
    }
})

export const updateTripStatus = createAsyncThunk('trip/updateStatus', async ({ id, status }, thunkAPI) => {
    try {
        const result = await api.put(`/trips/${id}/status`, { status }, { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to update trip status' })
    }
})

const tripSlice = createSlice({
    name: 'trip',
    initialState: {
        items: [],
        loading: false,
        submitting: false,
        message: null,
        error: null,
    },
    reducers: {
        clearTripMessage: (state) => { state.message = null; state.error = null }
    },
    extraReducers: (builder) => {
        // Get trips
        builder.addCase(getTrips.pending, (state) => { state.loading = true; state.error = null })
        builder.addCase(getTrips.fulfilled, (state, action) => {
            state.loading = false
            state.items = action.payload?.data || []
        })
        builder.addCase(getTrips.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload?.message || 'Failed to fetch trips'
        })

        // Add trip
        builder.addCase(addTrip.pending, (state) => { state.submitting = true; state.message = null; state.error = null })
        builder.addCase(addTrip.fulfilled, (state, action) => {
            state.submitting = false
            const rec = action.payload?.data
            if (rec) state.items = [rec, ...state.items]
            state.message = 'Trip created and dispatched successfully'
        })
        builder.addCase(addTrip.rejected, (state, action) => {
            state.submitting = false
            state.error = action.payload?.message || 'Failed to create trip'
        })

        // Update trip status
        builder.addCase(updateTripStatus.pending, (state) => { state.submitting = true; state.message = null; state.error = null })
        builder.addCase(updateTripStatus.fulfilled, (state, action) => {
            state.submitting = false
            const updated = action.payload?.data
            if (updated) {
                state.items = state.items.map((t) => t.id === updated.id ? { ...t, ...updated } : t)
            }
            state.message = `Trip status updated to ${updated?.status || 'new status'}`
        })
        builder.addCase(updateTripStatus.rejected, (state, action) => {
            state.submitting = false
            state.error = action.payload?.message || 'Failed to update trip'
        })
    }
})

export const { clearTripMessage } = tripSlice.actions
export default tripSlice.reducer
