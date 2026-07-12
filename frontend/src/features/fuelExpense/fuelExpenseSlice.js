import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

const getAuthHeaders = (thunkAPI) => {
    const token = thunkAPI.getState()?.auth?.token
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getFuelLogs = createAsyncThunk('fuel/getLogs', async (_, thunkAPI) => {
    try {
        const result = await api.get('/fuel-logs', { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to fetch fuel logs' })
    }
})

export const addFuelLog = createAsyncThunk('fuel/addLog', async (logData, thunkAPI) => {
    try {
        const result = await api.post('/fuel-logs', logData, { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to add fuel log' })
    }
})

export const getExpenses = createAsyncThunk('fuel/getExpenses', async (_, thunkAPI) => {
    try {
        const result = await api.get('/expenses', { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to fetch expenses' })
    }
})

export const addExpense = createAsyncThunk('fuel/addExpense', async (expData, thunkAPI) => {
    try {
        const result = await api.post('/expenses', expData, { headers: getAuthHeaders(thunkAPI) })
        return result.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to add expense' })
    }
})

const fuelExpenseSlice = createSlice({
    name: 'fuelExpense',
    initialState: {
        fuelLogs: [],
        expenses: [],
        loading: false,
        submitting: false,
        message: null,
        error: null,
    },
    reducers: {
        clearFuelMessage: (state) => { state.message = null; state.error = null }
    },
    extraReducers: (builder) => {
        // Get fuel logs
        builder.addCase(getFuelLogs.pending, (state) => { state.loading = true; state.error = null })
        builder.addCase(getFuelLogs.fulfilled, (state, action) => {
            state.loading = false
            state.fuelLogs = action.payload?.data || []
        })
        builder.addCase(getFuelLogs.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload?.message || 'Failed to fetch fuel logs'
        })

        // Add fuel log
        builder.addCase(addFuelLog.pending, (state) => { state.submitting = true; state.message = null; state.error = null })
        builder.addCase(addFuelLog.fulfilled, (state, action) => {
            state.submitting = false
            const rec = action.payload?.data
            if (rec) state.fuelLogs = [rec, ...state.fuelLogs]
            state.message = 'Fuel log saved successfully'
        })
        builder.addCase(addFuelLog.rejected, (state, action) => {
            state.submitting = false
            state.error = action.payload?.message || 'Failed to add fuel log'
        })

        // Get expenses
        builder.addCase(getExpenses.pending, (state) => { state.loading = true; state.error = null })
        builder.addCase(getExpenses.fulfilled, (state, action) => {
            state.loading = false
            state.expenses = action.payload?.data || []
        })
        builder.addCase(getExpenses.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload?.message || 'Failed to fetch expenses'
        })

        // Add expense
        builder.addCase(addExpense.pending, (state) => { state.submitting = true; state.message = null; state.error = null })
        builder.addCase(addExpense.fulfilled, (state, action) => {
            state.submitting = false
            const rec = action.payload?.data
            if (rec) state.expenses = [rec, ...state.expenses]
            state.message = 'Expense added successfully'
        })
        builder.addCase(addExpense.rejected, (state, action) => {
            state.submitting = false
            state.error = action.payload?.message || 'Failed to add expense'
        })
    }
})

export const { clearFuelMessage } = fuelExpenseSlice.actions
export default fuelExpenseSlice.reducer
