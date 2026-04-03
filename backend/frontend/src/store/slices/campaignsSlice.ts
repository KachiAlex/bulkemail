import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Campaign } from '../../types/crm';
import {
  campaignsApi,
  CampaignFilters,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from '../../services/campaignsApi';

export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchAll',
  async (filters?: CampaignFilters) => {
    const campaigns = await campaignsApi.list(filters);
    return campaigns;
  },
);

export const createCampaign = createAsyncThunk(
  'campaigns/create',
  async (payload: CreateCampaignPayload) => {
    const campaign = await campaignsApi.create(payload);
    return campaign;
  },
);

export const updateCampaignThunk = createAsyncThunk(
  'campaigns/update',
  async ({ id, payload }: { id: string; payload: UpdateCampaignPayload }) => {
    const campaign = await campaignsApi.update(id, payload);
    return campaign;
  },
);

export const deleteCampaign = createAsyncThunk('campaigns/delete', async (id: string) => {
  await campaignsApi.remove(id);
  return id;
});

export const sendCampaign = createAsyncThunk('campaigns/send', async (id: string) => {
  await campaignsApi.send(id);
  return id;
});

export const pauseCampaign = createAsyncThunk('campaigns/pause', async (id: string) => {
  await campaignsApi.pause(id);
  return id;
});

export const resumeCampaign = createAsyncThunk('campaigns/resume', async (id: string) => {
  await campaignsApi.resume(id);
  return id;
});

export const duplicateCampaign = createAsyncThunk('campaigns/duplicate', async (id: string) => {
  const campaign = await campaignsApi.duplicate(id);
  return campaign;
});

interface CampaignsState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  loading: boolean;
  error: string | null;
}

const initialState: CampaignsState = {
  campaigns: [],
  selectedCampaign: null,
  loading: false,
  error: null,
};

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    setCampaigns: (state, action: PayloadAction<Campaign[]>) => {
      state.campaigns = action.payload;
      state.loading = false;
    },
    setSelectedCampaign: (state, action: PayloadAction<Campaign | null>) => {
      state.selectedCampaign = action.payload;
    },
    addCampaign: (state, action: PayloadAction<Campaign>) => {
      state.campaigns.unshift(action.payload);
    },
    updateCampaign: (state, action: PayloadAction<Campaign>) => {
      const index = state.campaigns.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.campaigns[index] = action.payload;
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
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.campaigns = action.payload;
        state.loading = false;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load campaigns';
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns.unshift(action.payload);
      })
      .addCase(updateCampaignThunk.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex((campaign) => campaign.id === action.payload.id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        if (state.selectedCampaign?.id === action.payload.id) {
          state.selectedCampaign = action.payload;
        }
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter((campaign) => campaign.id !== action.payload);
      })
      .addCase(sendCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex((campaign) => campaign.id === action.payload);
        if (index !== -1) {
          state.campaigns[index].status = 'sending';
        }
      })
      .addCase(pauseCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex((campaign) => campaign.id === action.payload);
        if (index !== -1) {
          state.campaigns[index].status = 'paused';
        }
      })
      .addCase(resumeCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex((campaign) => campaign.id === action.payload);
        if (index !== -1) {
          state.campaigns[index].status = 'sending';
        }
      })
      .addCase(duplicateCampaign.fulfilled, (state, action) => {
        state.campaigns.unshift(action.payload);
      });
  },
});

export const {
  setCampaigns,
  setSelectedCampaign,
  addCampaign,
  updateCampaign,
  setLoading,
  setError,
} = campaignsSlice.actions;

export default campaignsSlice.reducer;

