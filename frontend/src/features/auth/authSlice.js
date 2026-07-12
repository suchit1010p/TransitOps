import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

export const loginAuth = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
    try {
        const response = await api.post('/login', userData)
        return response.data
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Login failed' })
    }
})

export const registerAuth = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
    try {
        const response = await api.post('/register', userData)
        return response.data
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: 'Registration failed' })
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        message: null,
        loading: false,
        checkingAuth: false,
        authChecked: false,
        token: null,
        error: null
    },
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken } = action.payload;
            state.user = user;
            state.token = accessToken;
            state.authChecked = true;
        },
        logOut: (state) => {    
            state.user = null;
            state.message = null;
            state.loading = false;
            state.checkingAuth = false;
            state.authChecked = true;
            state.token = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loginAuth.pending, (state) => {
            state.message = null
            state.error = null
            state.loading = true
        })
        builder.addCase(loginAuth.fulfilled, (state, action) => {
            state.user = action.payload.data?.user || null
            state.token = action.payload.data?.accessToken || null
            state.message = action.payload.message
            state.loading = false
            state.authChecked = true
            state.error = null
        })
        builder.addCase(loginAuth.rejected, (state, action) => {
            state.error = action.payload?.message || 'Login failed'
            state.loading = false
        })
        builder.addCase(registerAuth.pending, (state) => {
            state.message = null
            state.error = null
            state.loading = true
        })
        builder.addCase(registerAuth.fulfilled, (state, action) => {
            state.user = action.payload.data?.user || null
            state.token = action.payload.data?.accessToken || null
            state.message = action.payload.message
            state.loading = false
            state.authChecked = true
            state.error = null
        })
        builder.addCase(registerAuth.rejected, (state, action) => {
            state.error = action.payload?.message || 'Registration failed'
            state.loading = false
        })
    }
})

export default authSlice.reducer

export const { setCredentials, logOut} = authSlice.actions