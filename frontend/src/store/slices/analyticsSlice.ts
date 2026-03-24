import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsApi, ReportFilters } from '../../services/analyticsApi';

export const fetchDashboardStats = createAsyncThunk(
  'analytics/fetchDashboardStats',
  async () => {
    const stats = await analyticsApi.getDashboardStats();
    return stats;
  },
);

export const generateReport = createAsyncThunk(
  'analytics/generateReport',
  async ({ type, filters }: { type: string; filters: ReportFilters }) => {
    const report = await analyticsApi.generateReport(type, filters);
    return report;
  },
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
        state.loading = false;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load dashboard stats';
      })
      .addCase(generateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate report';
      });
  },
});

export const { setDashboardStats, setLoading, setError } = analyticsSlice.actions;
export default analyticsSlice.reducer;

