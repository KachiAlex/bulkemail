
  // Contacts
  async getContacts(filters?: any) {
    const user = this.getCurrentUser();
    
    try {
      // Use createdById instead of ownerId to match our Firestore schema
      let q = query(
        collection(db, 'contacts'),
        where('createdById', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      let contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Sort by createdAt on client side
      contacts.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      if (filters?.search) {
        // Client-side filtering for search
        contacts = contacts.filter((contact: any) => 
          contact.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
          contact.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
          contact.email?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      return contacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw new Error('Failed to fetch contacts');
    }
  }

  async getContact(id: string) {
    const docRef = doc(db, 'contacts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Contact not found');
  }

  async createContact(contactData: any) {
    const user = this.getCurrentUser();
    
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...contactData,
      createdById: user.uid,  // Use createdById instead of ownerId
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...contactData };
  }

  async updateContact(id: string, updateData: any) {
    const docRef = doc(db, 'contacts', id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date()
    });
  }

  async deleteContact(id: string) {
    await deleteDoc(doc(db, 'contacts', id));
  }

  async bulkDeleteContacts(ids: string[]) {
    const batch = writeBatch(db);
    ids.forEach(id => {
      batch.delete(doc(db, 'contacts', id));
    });
    await batch.commit();
  }

  // Campaigns
  async getCampaigns() {
    const user = this.getCurrentUser();
    
    const q = query(
      collection(db, 'campaigns'),
      where('createdById', '==', user.uid)
    );
    const snapshot = await getDocs(q);
    let campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort by createdAt on client side
    campaigns.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    return campaigns;
  }

  async getCampaign(id: string) {
    const docRef = doc(db, 'campaigns', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Campaign not found');
  }

  async createCampaign(campaignData: any) {
    const user = this.getCurrentUser();
    
    // Calculate total recipients
    let totalRecipients = 0;
    if (campaignData.segmentId) {
      try {
        const segmentContacts = await segmentsAPI.getContacts(campaignData.segmentId);
        totalRecipients = segmentContacts.length;
      } catch (error) {
        console.error('Error fetching segment contacts:', error);
      }
    } else if (campaignData.recipientContactIds && Array.isArray(campaignData.recipientContactIds)) {
      totalRecipients = campaignData.recipientContactIds.length;
    }
    
    const timestamp = new Date();
    const docRef = await addDoc(collection(db, 'campaigns'), {
      ...campaignData,
      createdById: user.uid,
      status: 'draft',
      totalRecipients,
      sentCount: 0,
      openedCount: 0,
      clickedCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    return { 
      id: docRef.id, 
      ...campaignData,
      totalRecipients,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }

  async updateCampaign(id: string, updateData: any) {
    const docRef = doc(db, 'campaigns', id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date()
    });
  }

  // Generic backend fetch with Firebase ID token
  async backendFetch(url: string, options: any = {}) {
    const idToken = await this.getIdToken();
    options.headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${idToken}`,
    };
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Backend request failed: ${response.status}`);
    return await response.json();
  }

  async sendCampaign(id: string) {
    // Use Render backend for sending campaign email
    const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://pandicrm.onrender.com/api';
    return await this.backendFetch(`${API_BASE_URL}/campaigns/${id}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async deleteCampaign(id: string) {
    await deleteDoc(doc(db, 'campaigns', id));
  }

  // Calls
  async getCalls() {
    const user = this.getCurrentUser();
    
    const q = query(
      collection(db, 'calls'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async createCall(callData: any) {
    const user = this.getCurrentUser();
    
    const docRef = await addDoc(collection(db, 'calls'), {
      ...callData,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...callData };
  }

  // Analytics
  async getDashboardStats() {
    const user = this.getCurrentUser();
    
    // Get contacts count
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('createdById', '==', user.uid)
    );
    const contactsSnapshot = await getDocs(contactsQuery);
    const totalContacts = contactsSnapshot.size;

    // Get campaigns count
    const campaignsQuery = query(
      collection(db, 'campaigns'),
      where('createdById', '==', user.uid)
    );
    const campaignsSnapshot = await getDocs(campaignsQuery);
    const totalCampaigns = campaignsSnapshot.size;

    // Get calls count
    const callsQuery = query(
      collection(db, 'calls'),
      where('userId', '==', user.uid)
    );
    const callsSnapshot = await getDocs(callsQuery);
    const totalCalls = callsSnapshot.size;

    return {
      contacts: {
        total: totalContacts,
        newThisMonth: 0, // Calculate based on createdAt
        avgLeadScore: 75
      },
      campaigns: {
        total: totalCampaigns,
        totalSent: 0,
        openRate: 25.5,
        clickThroughRate: 8.2
      },
      calls: {
        total: totalCalls,
        completed: 0,
        avgDuration: 0
      }
    };
  }

  // Users management (Admin only)
  async getAllUsers() {
    // Verify authentication
    this.getCurrentUser();
    
    // Check if user is admin (will be handled by security rules)
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
      lastLoginAt: doc.data().lastLoginAt?.toDate ? doc.data().lastLoginAt.toDate() : doc.data().lastLoginAt,
    }));
  }

  async getUser(id: string) {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        lastLoginAt: data.lastLoginAt?.toDate ? data.lastLoginAt.toDate() : data.lastLoginAt,
      };
    }
    throw new Error('User not found');
  }

  async updateUser(id: string, updateData: any) {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date()
    });
  }

  async createUser(data: any) {
    // Verify authentication
    this.getCurrentUser();

    const timestamp = new Date();
    const docRef = await addDoc(collection(db, 'users'), {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return { id: docRef.id, ...data };
  }

  async deleteUser(id: string) {
    // Note: This only deletes from Firestore, not Firebase Auth
    // You may want to use Firebase Admin SDK in a Cloud Function for complete deletion
    await deleteDoc(doc(db, 'users', id));
  }
}

const api = new FirebaseAPI();

// Auth APIs - handled by Firebase Auth directly
export const authAPI = {
  login: () => { throw new Error('Use Firebase Auth directly'); },
  register: () => { throw new Error('Use Firebase Auth directly'); },
  logout: () => { throw new Error('Use Firebase Auth directly'); },
  getProfile: () => { throw new Error('Use Firebase Auth directly'); },
};

// Contacts APIs
export const contactsAPI = {
  getAll: (filters?: any) => api.getContacts(filters),
  getOne: (id: string) => api.getContact(id),
  create: (data: any) => api.createContact(data),
  update: (id: string, data: any) => api.updateContact(id, data),
  delete: (id: string) => api.deleteContact(id),
  bulkDelete: (ids: string[]) => api.bulkDeleteContacts(ids),
  import: async (file: File) => {
    // Simple CSV import implementation
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    // const headers = lines[0].split(',').map(h => h.trim());
    const contacts = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const contact = {
          firstName: values[0] || '',
          lastName: values[1] || '',
          email: values[2] || '',
          phone: values[3] || '',
          company: values[4] || '',
          jobTitle: values[5] || '',
          status: 'new',
          leadScore: 50,
          tags: ['imported'],
          source: 'import',
          category: 'prospect',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        if (contact.email) {
          await api.createContact(contact);
          contacts.push(contact);
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error}`);
      }
    }

    return {
      imported: contacts.length,
      errors: errors
    };
  },
  export: () => { throw new Error('Export not implemented yet'); },
  updateLeadScore: (id: string, score: number) => api.updateContact(id, { leadScore: score }),
  addTags: (id: string, tags: string[]) => api.updateContact(id, { tags }),
  removeTags: (id: string, tags: string[]) => api.updateContact(id, { tags }),
};

// Segments APIs
export const segmentsAPI = {
  getAll: async () => {
    const user = api.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const q = query(
      collection(db, 'segments'),
      where('createdById', '==', user.uid)
    );
    const snapshot = await getDocs(q);
    let segments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort by createdAt on client side
    segments.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    return segments;
  },
  getOne: async (id: string) => {
    const docRef = doc(db, 'segments', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Segment not found');
  },
  getContacts: async (id: string) => {
    // Get segment criteria and filter contacts
    let segment: any | null = null;
    try {
      segment = await segmentsAPI.getOne(id);
    } catch (e) {
      console.warn('Segment not found, returning empty contacts for segment id:', id);
      return [];
    }
    const user = api.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    let q = query(
      collection(db, 'contacts'),
      where('createdById', '==', user.uid)
    );
    
    // Apply segment filters (simplified implementation)
    if ((segment as any).criteria) {
      if ((segment as any).criteria.status) {
        q = query(q, where('status', '==', (segment as any).criteria.status));
      }
      if ((segment as any).criteria.tags && (segment as any).criteria.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', (segment as any).criteria.tags));
      }
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  create: async (data: any) => {
    const user = api.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const docRef = await addDoc(collection(db, 'segments'), {
      ...data,
      createdById: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...data };
  },
  delete: async (id: string) => {
    await deleteDoc(doc(db, 'segments', id));
  },
};

// Campaigns APIs
export const campaignsAPI = {
  getAll: () => api.getCampaigns(),
  getOne: (id: string) => api.getCampaign(id),
  create: (data: any) => api.createCampaign(data),
  update: (id: string, data: any) => api.updateCampaign(id, data),
  send: (id: string) => api.sendCampaign(id),
  pause: (id: string) => api.updateCampaign(id, { status: 'paused' }),
  cancel: (id: string) => api.updateCampaign(id, { status: 'cancelled' }),
  getStats: (id: string) => api.getCampaign(id),
  delete: (id: string) => api.deleteCampaign(id),
};

// Users APIs (Admin only)
export const usersAPI = {
  getAll: () => api.getAllUsers(),
  getOne: (id: string) => api.getUser(id),
  create: (data: any) => api.createUser(data),
  update: (id: string, data: any) => api.updateUser(id, data),
  delete: (id: string) => api.deleteUser(id),
};

// Telephony APIs
export const callsAPI = {
  getAll: () => api.getCalls(),
  getOne: (_id: string) => { throw new Error('Call details not implemented yet'); },
  initiate: (data: any) => api.createCall(data),
  update: (_id: string, _data: any) => { throw new Error('Call update not implemented yet'); },
  getStats: () => { throw new Error('Call stats not implemented yet'); },
  delete: (_id: string) => { throw new Error('Call delete not implemented yet'); },
};

// AI APIs
export const aiAPI = {
  calculateLeadScore: (_contactId: string) => { throw new Error('AI not implemented yet'); },
  generateEmail: async (data: any) => {
    // Simple email generation without AI
    const subject = `Re: ${data.purpose || 'Your Inquiry'}`;
    const body = `Dear [Name],

Thank you for your interest in our services. ${data.purpose ? `Regarding ${data.purpose},` : ''} we would be happy to discuss how we can help you achieve your goals.

Please let us know if you have any questions or would like to schedule a call to discuss further.

Best regards,
[Your Name]`;
    
    return { subject, body };
  },
  generateSms: async (data: any) => {
    // Simple SMS generation without AI
    const message = `Hi [Name], ${data.purpose ? `regarding ${data.purpose}` : 'we wanted to reach out'}. Would you be interested in a quick call to discuss? Reply YES or call us at [phone]. Thanks!`;
    
    return message;
  },
  summarizeCall: (_callId: string) => { throw new Error('AI not implemented yet'); },
  analyzeSentiment: (_text: string) => { throw new Error('AI not implemented yet'); },
  getFollowUpRecommendations: (_contactId: string) => { throw new Error('AI not implemented yet'); },
  generateVariations: (_content: string, _numVariations?: number) => { throw new Error('AI not implemented yet'); },
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: () => api.getDashboardStats(),
  getContactTrends: (_days?: number) => { throw new Error('Contact trends not implemented yet'); },
  getCampaignPerformance: (_campaignId?: string) => { throw new Error('Campaign performance not implemented yet'); },
  getLeadSources: () => { throw new Error('Lead sources not implemented yet'); },
  getUserPerformance: () => { throw new Error('User performance not implemented yet'); },
  getConversionFunnel: () => { throw new Error('Conversion funnel not implemented yet'); },
};

// Adapter layer: expose legacy `*API` names but call backend HTTP services.
import httpClient from './httpClient';
import { contactsApi } from './contactsApi';
import { campaignsApi } from './campaignsApi';
import { authApi } from './authApi';
import { aiApi } from './aiApi';
import { analyticsApi } from './analyticsApi';
import { callsApi } from './callsApi';

// contactsAPI - legacy name mapped to new `contactsApi`
export const contactsAPI = {
  getAll: (filters?: any) => contactsApi.list(filters),
  getOne: (id: string) => contactsApi.get(id),
  create: (data: any) => contactsApi.create(data),
  update: (id: string, data: any) => contactsApi.update(id, data),
  delete: (id: string) => contactsApi.remove(id),
  bulkDelete: (ids: string[]) => contactsApi.bulkDelete(ids),
  import: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return httpClient.post('/contacts/import', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  export: () => httpClient.get('/contacts/export', { responseType: 'blob' }),
  updateLeadScore: (id: string, score: number) => contactsApi.update(id, { leadScore: score }),
  addTags: (id: string, tags: string[]) => contactsApi.addTags(id, tags),
  removeTags: (id: string, tags: string[]) => contactsApi.removeTags(id, tags),
};

export const campaignsAPI = {
  getAll: (filters?: any) => campaignsApi.list(filters),
  getOne: (id: string) => campaignsApi.get(id),
  create: (data: any) => campaignsApi.create(data),
  update: (id: string, data: any) => campaignsApi.update(id, data),
  send: (id: string) => campaignsApi.send(id),
  pause: (id: string) => campaignsApi.pause(id),
  cancel: (id: string) => campaignsApi.cancel(id),
  getStats: (id: string) => campaignsApi.getAnalytics(id),
  delete: (id: string) => campaignsApi.remove(id),
};

export const segmentsAPI = {
  getAll: () => httpClient.get('/contacts/segments/all').then(r => r.data),
  getOne: (id: string) => httpClient.get(`/contacts/segments/${id}`).then(r => r.data),
  getContacts: (id: string) => httpClient.get(`/contacts/segments/${id}/contacts`).then(r => r.data),
  create: (data: any) => httpClient.post('/contacts/segments', data).then(r => r.data),
  delete: (id: string) => httpClient.delete(`/contacts/segments/${id}`).then(r => r.data),
};

export const callsAPI = {
  getAll: () => callsApi.getAll(),
  create: (data: any) => callsApi.initiate(data),
};

export const aiAPI = {
  generateEmail: (data: any) => aiApi.generateContent(data),
  analyzeLeadScore: (data: any) => aiApi.analyzeLeadScore(data),
  summarizeCall: (data: any) => aiApi.summarizeCall(data),
};

export const analyticsAPI = {
  getDashboard: () => analyticsApi.getDashboard(),
};

export const authAPI = {
  login: (p: any) => authApi.login(p),
  register: (p: any) => authApi.register(p),
  logout: () => authApi.logout(),
  getProfile: () => authApi.getProfile(),
};

export const usersAPI = {
  getAll: () => httpClient.get('/users').then(r => r.data),
  getOne: (id: string) => httpClient.get(`/users/${id}`).then(r => r.data),
  create: (data: any) => httpClient.post('/users', data).then(r => r.data),
  update: (id: string, data: any) => httpClient.patch(`/users/${id}`, data).then(r => r.data),
  delete: (id: string) => httpClient.delete(`/users/${id}`).then(r => r.data),
};

export default {};

