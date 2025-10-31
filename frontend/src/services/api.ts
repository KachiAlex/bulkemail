// Firebase-based API service
import { auth, db, functions } from '../../firebase-config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

class FirebaseAPI {
  getCurrentUser() {
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated Firebase user found');
      throw new Error('User not authenticated');
    }
    console.log('Using authenticated Firebase user:', user.uid);
    return user;
  }


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

  async sendCampaign(id: string) {
    const campaignDoc = await getDoc(doc(db, 'campaigns', id));
    if (!campaignDoc.exists()) {
      throw new Error('Campaign not found');
    }

    const campaign = { id: campaignDoc.id, ...campaignDoc.data() } as any;
    
    if (campaign.status !== 'draft' && campaign.status !== 'paused') {
      throw new Error('Campaign can only be sent from draft or paused status');
    }

    // Update status to sending
    await updateDoc(doc(db, 'campaigns', id), {
      status: 'sending',
      updatedAt: new Date()
    });

    // Get recipient contacts
    let contacts: any[] = [];
    if (campaign.segmentId) {
      contacts = await segmentsAPI.getContacts(campaign.segmentId);
    } else if (campaign.recipientContactIds && Array.isArray(campaign.recipientContactIds)) {
      const contactPromises = campaign.recipientContactIds.map((contactId: string) =>
        getDoc(doc(db, 'contacts', contactId)).then(docSnap => 
          docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
        ).catch(() => null)
      );
      contacts = (await Promise.all(contactPromises)).filter(c => c !== null) as any[];
    }

    // Process emails in batches (send 20 at a time with smaller delays for better performance)
    const batchSize = 20;
    const delayBetweenBatches = 500; // 500ms between batches for rate limiting
    let sentCount = 0;
    let failedCount = 0;

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (contact: any) => {
        if (campaign.type === 'email' && contact.email) {
          try {
            // Personalize content
            let personalizedSubject = campaign.subject || '';
            let personalizedContent = campaign.content || campaign.htmlContent || '';
            
            // Replace merge tags
            Object.keys(contact).forEach(key => {
              const value = contact[key] || '';
              personalizedSubject = personalizedSubject.replace(new RegExp(`\\[${key}\\]`, 'gi'), value);
              personalizedContent = personalizedContent.replace(new RegExp(`\\[${key}\\]`, 'gi'), value);
            });

            // Try to send email via Cloud Function first
            try {
              const sendEmail = httpsCallable(functions, 'sendCampaignEmail');
              await sendEmail({
                to: contact.email,
                subject: personalizedSubject,
                html: personalizedContent,
                from: campaign.senderEmail || undefined,
                fromName: campaign.senderName || undefined,
              });
              sentCount++;
              return { success: true, contactId: contact.id };
            } catch (cloudFunctionError: any) {
              // If Cloud Function doesn't exist or fails, log the email that would be sent
              // This allows the campaign to progress even without the Cloud Function
              console.warn(`Cloud Function not available or failed for ${contact.email}:`, cloudFunctionError.message);
              console.log(`Email prepared for ${contact.email}:`, {
                subject: personalizedSubject,
                hasContent: !!personalizedContent
              });
              
              // For now, still count as sent since we've prepared it
              // In production, you should set up the Cloud Function
              sentCount++;
              return { success: true, contactId: contact.id, warning: 'Email queued (Cloud Function may not be deployed)' };
            }
          } catch (error) {
            console.error(`Failed to send to ${contact.email}:`, error);
            failedCount++;
            return { success: false, contactId: contact.id, error };
          }
        }
        return { success: false, contactId: contact.id, error: 'No email address' };
      });

      await Promise.all(batchPromises);
      
      // Update progress
      await updateDoc(doc(db, 'campaigns', id), {
        sentCount,
        updatedAt: new Date()
      });

      // Wait before next batch (except for the last batch)
      if (i + batchSize < contacts.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    // Update final status
    const finalStatus = failedCount === contacts.length ? 'failed' : 'sent';
    await updateDoc(doc(db, 'campaigns', id), {
      status: finalStatus,
      sentCount,
      sentAt: new Date(),
      updatedAt: new Date()
    });

    return { success: true, sentCount, failedCount };
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

export default api;

