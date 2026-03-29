import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Contact } from '../../types/crm';
import {
  contactsApi,
  ContactFilters,
  CreateContactPayload,
  UpdateContactPayload,
} from '../../services/contactsApi';

export const fetchContacts = createAsyncThunk(
  'contacts/fetchAll',
  async (filters?: ContactFilters) => {
    const contacts = await contactsApi.list(filters);
    return contacts;
  },
);

export const createContact = createAsyncThunk(
  'contacts/create',
  async (payload: CreateContactPayload) => {
    const contact = await contactsApi.create(payload);
    return contact;
  },
);

export const updateContactThunk = createAsyncThunk(
  'contacts/update',
  async ({ id, payload }: { id: string; payload: UpdateContactPayload }) => {
    const contact = await contactsApi.update(id, payload);
    return contact;
  },
);

export const deleteContactThunk = createAsyncThunk('contacts/delete', async (id: string) => {
  await contactsApi.remove(id);
  return id;
});

export const bulkDeleteContacts = createAsyncThunk(
  'contacts/bulkDelete',
  async (ids: string[]) => {
    await contactsApi.bulkDelete(ids);
    return ids;
  },
);

interface ContactsState {
  contacts: Contact[];
  selectedContact: Contact | null;
  loading: boolean;
  error: string | null;
}

const initialState: ContactsState = {
  contacts: [],
  selectedContact: null,
  loading: false,
  error: null,
};

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
      state.loading = false;
    },
    setSelectedContact: (state, action: PayloadAction<Contact | null>) => {
      state.selectedContact = action.payload;
    },
    addContact: (state, action: PayloadAction<Contact>) => {
      state.contacts.unshift(action.payload);
    },
    updateContact: (state, action: PayloadAction<Contact>) => {
      const index = state.contacts.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.contacts[index] = action.payload;
      }
      if (state.selectedContact?.id === action.payload.id) {
        state.selectedContact = action.payload;
      }
    },
    deleteContact: (state, action: PayloadAction<string>) => {
      state.contacts = state.contacts.filter(c => c.id !== action.payload);
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
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.contacts = action.payload;
        state.loading = false;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load contacts';
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.contacts.unshift(action.payload);
      })
      .addCase(updateContactThunk.fulfilled, (state, action) => {
        const index = state.contacts.findIndex((contact) => contact.id === action.payload.id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
        if (state.selectedContact?.id === action.payload.id) {
          state.selectedContact = action.payload;
        }
      })
      .addCase(deleteContactThunk.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter((contact) => contact.id !== action.payload);
      })
      .addCase(bulkDeleteContacts.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter((contact) => !action.payload.includes(contact.id));
      });
  },
});

export const {
  setContacts,
  setSelectedContact,
  addContact,
  updateContact,
  setLoading,
  setError,
} = contactsSlice.actions;

export default contactsSlice.reducer;
