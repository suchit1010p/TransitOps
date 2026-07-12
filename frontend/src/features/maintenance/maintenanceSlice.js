import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

const getAuthHeaders = (thunkAPI) => {
    const token = thunkAPI.getState()?.auth?.token
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getMaintenanceLogs = createAsyncThunk('maintenance/getLogs', async (_, thunkAPI) => {
    try {
        const result = await api.get('/maintenance', { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to fetch maintenance logs' })
    }
})

export const addMaintenanceLog = createAsyncThunk('maintenance/addLog', async (logData, thunkAPI) => {
    try {
        const result = await api.post('/maintenance', logData, { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to add maintenance record' })
    }
})

export const closeMaintenanceLog = createAsyncThunk('maintenance/closeLog', async (id, thunkAPI) => {
    try {
        const result = await api.put(`/maintenance/${id}/status`, { status: 'Closed' }, { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to close maintenance record' })
    }
})

const maintenanceSlice = createSlice({
    name: 'maintenance',
    initialState: {
        items: [],
        loading: false,
        submitting: false,
        message: null,
        error: null,
    },
    reducers: {
        clearMessage: (state) => { state.message = null; state.error = null }
    },
    extraReducers: (builder) => {
        // Get logs
        builder.addCase(getMaintenanceLogs.pending, (state) => {
            state.loading = true
            state.error = null
        })
        builder.addCase(getMaintenanceLogs.fulfilled, (state, action) => {
            state.loading = false
            state.items = action.payload?.data || []
        })
        builder.addCase(getMaintenanceLogs.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload?.message || 'Failed to fetch logs'
        })

        // Add log
        builder.addCase(addMaintenanceLog.pending, (state) => {
            state.submitting = true
            state.message = null
            state.error = null
        })
        builder.addCase(addMaintenanceLog.fulfilled, (state, action) => {
            state.submitting = false
            const newRecord = action.payload?.data
            if (newRecord) state.items = [newRecord, ...state.items]
            state.message = 'Record saved — vehicle status changed to In Shop'
        })
        builder.addCase(addMaintenanceLog.rejected, (state, action) => {
            state.submitting = false
            state.error = action.payload?.message || 'Failed to add record'
        })

        // Close log
        builder.addCase(closeMaintenanceLog.pending, (state) => {
            state.submitting = true
        })
        builder.addCase(closeMaintenanceLog.fulfilled, (state, action) => {
            state.submitting = false
            const updated = action.payload?.data
            if (updated) {
                state.items = state.items.map((item) =>
                    item.id === updated.id ? updated : item
                )
            }
            state.message = 'Record closed — vehicle status changed to Available'
        })
        builder.addCase(closeMaintenanceLog.rejected, (state, action) => {
            state.submitting = false
            state.error = action.payload?.message || 'Failed to close record'
        })
    }
})

export const { clearMessage } = maintenanceSlice.actions
export default maintenanceSlice.reducer
