import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store';
import { loginDriver, logoutDriver, verifyToken } from '../../services/driverServices';

interface Driver {
  uniqueId: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdDate: string;
  accountNumber?: number;
}

interface AuthState {
  driver: Driver | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  driver: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setDriver(state, action: PayloadAction<Driver>) {
      state.driver = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isAuthenticated = false;
      state.driver = null;
    },
    logout(state) {
      state.driver = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const { setLoading, setDriver, setError, logout } = authSlice.actions;

export const loginThunk = (
    email: string,
    password: string
  ): AppThunk => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await loginDriver({ email, password });
      const driver: Driver = data.driver;
      dispatch(setDriver(driver));
    } catch (error: any) {
      dispatch(setError(error.error || 'Login failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const verifyTokenThunk = (): AppThunk => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const data = await verifyToken();
      const driver: Driver = data.driver;
      dispatch(setDriver(driver));
    } catch (error: any) {
      dispatch(setError(error.error || 'Verification failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  export const logoutThunk = (): AppThunk => async (dispatch) => {
    try {
      await logoutDriver();
      dispatch(logout());
    } catch (error: any) {
      console.error('Logout Error:', error);
    }
  };

export default authSlice.reducer;