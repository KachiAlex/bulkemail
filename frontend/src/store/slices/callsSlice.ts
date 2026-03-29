import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Call } from '../../types/crm';
import {
  callsApi,
  CallFilters,
  CreateCallPayload,
  UpdateCallPayload,
} from '../../services/callsApi';

export const fetchCalls = createAsyncThunk(
  'calls/fetchAll',
  async (filters?: CallFilters) => {
    const calls = await callsApi.list(filters);
    return calls;
  },
);

export const createCall = createAsyncThunk(
  'calls/create',
  async (payload: CreateCallPayload) => {
    const call = await callsApi.create(payload);
    return call;
  },
);

export const updateCallThunk = createAsyncThunk(
  'calls/update',
  async ({ id, payload }: { id: string; payload: UpdateCallPayload }) => {
    const call = await callsApi.update(id, payload);
    return call;
  },
);

export const deleteCall = createAsyncThunk('calls/delete', async (id: string) => {
  await callsApi.remove(id);
  return id;
});

export const logCall = createAsyncThunk('calls/log', async (payload: CreateCallPayload) => {
  const call = await callsApi.logCall(payload);
  return call;
});

interface CallsState {
  calls: Call[];
  selectedCall: Call | null;
  loading: boolean;
  error: string | null;
}

const initialState: CallsState = {
  calls: [],
  selectedCall: null,
  loading: false,
  error: null,
};

const callsSlice = createSlice({
  name: 'calls',
  initialState,
  reducers: {
    setCalls: (state, action: PayloadAction<Call[]>) => {
      state.calls = action.payload;
      state.loading = false;
    },
    setSelectedCall: (state, action: PayloadAction<Call | null>) => {
      state.selectedCall = action.payload;
    },
    addCall: (state, action: PayloadAction<Call>) => {
      state.calls.unshift(action.payload);
    },
    updateCall: (state, action: PayloadAction<Call>) => {
      const index = state.calls.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.calls[index] = action.payload;
      }
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
      .addCase(fetchCalls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalls.fulfilled, (state, action) => {
        state.calls = action.payload;
        state.loading = false;
      })
      .addCase(fetchCalls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load calls';
      })
      .addCase(createCall.fulfilled, (state, action) => {
        state.calls.unshift(action.payload);
      })
      .addCase(updateCallThunk.fulfilled, (state, action) => {
        const index = state.calls.findIndex((call) => call.id === action.payload.id);
        if (index !== -1) {
          state.calls[index] = action.payload;
        }
        if (state.selectedCall?.id === action.payload.id) {
          state.selectedCall = action.payload;
        }
      })
      .addCase(deleteCall.fulfilled, (state, action) => {
        state.calls = state.calls.filter((call) => call.id !== action.payload);
      })
      .addCase(logCall.fulfilled, (state, action) => {
        state.calls.unshift(action.payload);
      });
  },
});

export const {
  setCalls,
  setSelectedCall,
  addCall,
  updateCall,
  setLoading,
  setError,
} = callsSlice.actions;

export default callsSlice.reducer;

