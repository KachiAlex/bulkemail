import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Call {
  id: string;
  direction: 'inbound' | 'outbound';
  status: string;
  fromNumber: string;
  toNumber: string;
  duration: number;
  disposition?: string;
  notes?: string;
  createdAt: string;
}

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

