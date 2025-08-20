import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  login,
  register,
  getUserProfile,
  verifyOTP as verifyOTPApi,
  resendOTP as resendOTPApi
} from '../../services/api';

// Load user profile if token exists
export const loadUserProfile = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const res = await getUserProfile();
    return res.data; // user object
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load profile');
  }
});

// Login
export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await login(data);
    localStorage.setItem('token', res.data.token);
    return res.data; // { token, user }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

// Register
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await register(data);
    localStorage.setItem('token', res.data.token);
    return res.data; // { token, user }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

// Verify OTP
export const verifyOTP = createAsyncThunk('auth/verifyOTP', async (data, { rejectWithValue }) => {
  try {
    const res = await verifyOTPApi(data); // ✅ use helper function
    localStorage.setItem('token', res.data.token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
  }
});

// Resend OTP
export const resendOTP = createAsyncThunk('auth/resendOTP', async (data, { rejectWithValue }) => {
  try {
    const res = await resendOTPApi(data); // ✅ use helper function
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Resend failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load user profile
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify OTP cases
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Resend OTP cases
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;