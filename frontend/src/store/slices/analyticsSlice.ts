import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalyticsState {
  dashboardStats: any;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboardStats: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDashboardStats: (state, action: PayloadAction<any>) => {
      state.dashboardStats = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setDashboardStats, setLoading, setError } = analyticsSlice.actions;
export default analyticsSlice.reducer;

