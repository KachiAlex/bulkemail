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
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, functions } from '../../firebase-config';
import { httpsCallable } from 'firebase/functions';
import { 
  Contact, 
  Account, 
  Opportunity, 
  Activity, 
  Task, 
  Pipeline,
  EmailThread,
  Call,
  import httpClient from './httpClient';
  import { contactsApi } from './contactsApi';
  import { campaignsApi } from './campaignsApi';
  import { aiApi } from './aiApi';
  import { analyticsApi } from './analyticsApi';
  import { callsApi } from './callsApi';

  // Adapter: expose the legacy `crmAPI` interface but call backend HTTP endpoints
  export const crmAPI = {
    // Contacts
    async getContacts(filters?: any) {
      return contactsApi.list(filters);
    },

    async getContact(id: string) {
      return contactsApi.get(id);
    },

    async createContact(payload: any) {
      return contactsApi.create(payload);
    },

    async updateContact(id: string, payload: any) {
      return contactsApi.update(id, payload);
    },

    async deleteContact(id: string) {
      return contactsApi.remove(id);
    },

    async bulkDeleteContacts(ids: string[]) {
      return contactsApi.bulkDelete(ids);
    },

    // Campaigns
    async getCampaigns(filters?: any) {
      return campaignsApi.list(filters);
    },

    async getCampaign(id: string) {
      return campaignsApi.get(id);
    },

    async createCampaign(payload: any) {
      return campaignsApi.create(payload);
    },

    async updateCampaign(id: string, payload: any) {
      return campaignsApi.update(id, payload);
    },

    async deleteCampaign(id: string) {
      return campaignsApi.remove(id);
    },

    async sendCampaign(id: string) {
      return campaignsApi.send(id);
    },

    // Email threads & sending
    async getEmailThreads() {
      try {
        const { data } = await httpClient.get('/email/threads');
        return data;
      } catch (err) {
        console.warn('email threads endpoint missing, returning empty list', err);
        return [];
      }
    },

    async sendEmail(payload: any) {
      return httpClient.post('/email/send', payload).then(r => r.data);
    },

    // Calls
    async getCalls() {
      return callsApi.getAll();
    },

    async createCall(payload: any) {
      return callsApi.create(payload);
    },

    // Analytics
    async getDashboardStats() {
      return analyticsApi.getDashboard();
    },

    // Tasks, opportunities, accounts, activities — map to REST endpoints if available
    async getTasks() {
      const { data } = await httpClient.get('/tasks');
      return data;
    },

    async createTask(payload: any) {
      const { data } = await httpClient.post('/tasks', payload);
      return data;
    },

    async updateTask(id: string, payload: any) {
      return httpClient.patch(`/tasks/${id}`, payload).then(r => r.data);
    },

    async deleteTask(id: string) {
      return httpClient.delete(`/tasks/${id}`).then(r => r.data);
    },

    async getOpportunities() {
      const { data } = await httpClient.get('/opportunities');
      return data;
    },

    async createOpportunity(payload: any) {
      const { data } = await httpClient.post('/opportunities', payload);
      return data;
    },

    async getAccounts() {
      const { data } = await httpClient.get('/accounts');
      return data;
    },

    async createAccount(payload: any) {
      const { data } = await httpClient.post('/accounts', payload);
      return data;
    },

    // AI helpers
    async generateContent(payload: any) {
      return aiApi.generateContent(payload);
    },

    async analyzeLeadScore(payload: any) {
      return aiApi.analyzeLeadScore(payload);
    },
  };
  async getPipelines(): Promise<Pipeline[]> {
    const user = this.getCurrentUser();
    const q = query(collection(db, 'pipelines'), where('createdById', '==', user.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pipeline));
  }

  async createPipeline(pipeline: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pipeline> {
    const user = this.getCurrentUser();
    const docRef = await addDoc(collection(db, 'pipelines'), {
      ...pipeline,
      createdById: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...pipeline, createdAt: new Date(), updatedAt: new Date() } as Pipeline;
  }

  // Email Integration
  async getEmailThreads(): Promise<EmailThread[]> {
    const user = this.getCurrentUser();
    const q = query(collection(db, 'emailThreads'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    let threads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmailThread));
    
    threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    return threads;
  }

  async createEmailThread(thread: Omit<EmailThread, 'id'>): Promise<EmailThread> {
    const docRef = await addDoc(collection(db, 'emailThreads'), thread);
    return { id: docRef.id, ...thread } as EmailThread;
  }

  async sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const user = this.getCurrentUser();
    console.log('Calling sendEmail via Render backend with user:', user.uid);
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch('https://pandicrm.onrender.com/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      })
    });
    if (!response.ok) throw new Error('Failed to send email');
    // Optionally, handle response data here
  }

  // Call Management
  async getCalls(contactId?: string): Promise<Call[]> {
    const user = this.getCurrentUser();
    let q = query(collection(db, 'calls'), where('userId', '==', user.uid));
    
    if (contactId) {
      q = query(q, where('contactId', '==', contactId));
    }

    const snapshot = await getDocs(q);
    let calls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Call));
    
    calls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return calls;
  }

  async createCall(call: Omit<Call, 'id'>): Promise<Call> {
    const docRef = await addDoc(collection(db, 'calls'), call);
    return { id: docRef.id, ...call } as Call;
  }

  // SMS Management
  async getSMS(contactId?: string): Promise<SMS[]> {
    const user = this.getCurrentUser();
    let q = query(collection(db, 'sms'), where('userId', '==', user.uid));
    
    if (contactId) {
      q = query(q, where('contactId', '==', contactId));
    }

    const snapshot = await getDocs(q);
    let sms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SMS));
    
    sms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return sms;
  }

  async createSMS(sms: Omit<SMS, 'id'>): Promise<SMS> {
    const docRef = await addDoc(collection(db, 'sms'), sms);
    return { id: docRef.id, ...sms } as SMS;
  }

  // Campaign Management
  async getCampaigns(): Promise<Campaign[]> {
    const user = this.getCurrentUser();
    const q = query(collection(db, 'campaigns'), where('createdById', '==', user.uid));
    const snapshot = await getDocs(q);
    let campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
    
    campaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return campaigns;
  }

  // Segment Management
  async getSegments(): Promise<Segment[]> {
    const user = this.getCurrentUser();
    const q = query(collection(db, 'segments'), where('createdById', '==', user.uid));
    const snapshot = await getDocs(q);
    let segments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Segment));
    
    segments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return segments;
  }

  async createSegment(segment: Omit<Segment, 'id' | 'contactCount' | 'createdAt' | 'updatedAt'>): Promise<Segment> {
    const user = this.getCurrentUser();
    const docRef = await addDoc(collection(db, 'segments'), {
      ...segment,
      contactCount: 0,
      createdById: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...segment, contactCount: 0, createdAt: new Date(), updatedAt: new Date() } as Segment;
  }

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const user = this.getCurrentUser();
    // Use 'createdBy' to match backend Firebase function
    const q = query(collection(db, 'emailTemplates'), where('createdBy', '==', user.uid));
    const snapshot = await getDocs(q);
    let templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmailTemplate));
    
    templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return templates;
  }

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    const user = this.getCurrentUser();
    const docRef = await addDoc(collection(db, 'emailTemplates'), {
      ...template,
      createdBy: user.uid, // Use 'createdBy' to match backend
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...template, createdAt: new Date(), updatedAt: new Date() } as EmailTemplate;
  }

  // Dashboard Management
  async getDashboards(): Promise<Dashboard[]> {
    const user = this.getCurrentUser();
    const q = query(collection(db, 'dashboards'), where('createdById', '==', user.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dashboard));
  }

  async createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    const user = this.getCurrentUser();
    const docRef = await addDoc(collection(db, 'dashboards'), {
      ...dashboard,
      createdById: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...dashboard, createdAt: new Date(), updatedAt: new Date() } as Dashboard;
  }

  // AI & Intelligence
  async getLeadScores(): Promise<LeadScore[]> {
    const user = this.getCurrentUser();
    const q = query(collection(db, 'leadScores'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as LeadScore));
  }

  async getAIRecommendations(): Promise<AIRecommendation[]> {
    const q = query(collection(db, 'aiRecommendations'));
    const snapshot = await getDocs(q);
    let recommendations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIRecommendation));
    
    recommendations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return recommendations;
  }

  // Analytics & Reporting
  async getDashboardStats(): Promise<any> {
    try {
      // Get basic counts
      const [contacts, opportunities, tasks, activities] = await Promise.all([
        this.getContacts(),
        this.getOpportunities(),
        this.getTasks(),
        this.getActivities()
      ]);

      // Calculate metrics
      const totalContacts = contacts.length;
      const newContacts = contacts.filter(c => c.status === 'new').length;
      const qualifiedLeads = contacts.filter(c => c.status === 'qualified').length;
      const totalOpportunities = opportunities.length;
      const openOpportunities = opportunities.filter(o => !['closed-won', 'closed-lost'].includes(o.stage)).length;
      const wonOpportunities = opportunities.filter(o => o.stage === 'closed-won').length;
      const totalValue = opportunities.reduce((sum, o) => sum + (o.value || 0), 0);
      const pendingTasks = tasks.filter(t => t.status === 'pending').length;
      const overdueTasks = tasks.filter(t => t.status === 'pending' && t.dueDate && new Date(t.dueDate) < new Date()).length;

      return {
        contacts: {
          total: totalContacts,
          new: newContacts,
          qualified: qualifiedLeads
        },
        opportunities: {
          total: totalOpportunities,
          open: openOpportunities,
          won: wonOpportunities,
          totalValue
        },
        tasks: {
          total: tasks.length,
          pending: pendingTasks,
          overdue: overdueTasks
        },
        activities: {
          total: activities.length
        }
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      // Return default stats if there's an error
      return {
        contacts: { total: 0, new: 0, qualified: 0 },
        opportunities: { total: 0, open: 0, won: 0, totalValue: 0 },
        tasks: { total: 0, pending: 0, overdue: 0 },
        activities: { total: 0 }
      };
    }
  }

  // Bulk Operations
  async bulkUpdateContacts(contactIds: string[], updates: Partial<Contact>): Promise<void> {
    const batch = writeBatch(db);
    
    contactIds.forEach(id => {
      const docRef = doc(db, 'contacts', id);
      batch.update(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  }

  async bulkDeleteContacts(contactIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    
    contactIds.forEach(id => {
      const docRef = doc(db, 'contacts', id);
      batch.delete(docRef);
    });
    
    await batch.commit();
  }

  // Import/Export
  async importContacts(contacts: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{ imported: number; errors: string[] }> {
    const user = this.getCurrentUser();
    const batch = writeBatch(db);
    const errors: string[] = [];
    let imported = 0;

    for (const contact of contacts) {
      try {
        const docRef = doc(collection(db, 'contacts'));
        batch.set(docRef, {
          ...contact,
          createdById: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        imported++;
      } catch (error) {
        errors.push(`Failed to import ${contact.email}: ${error}`);
      }
    }

    await batch.commit();
    return { imported, errors };
  }

  async exportContacts(): Promise<Contact[]> {
    return this.getContacts();
  }
}

export const crmAPI = new CRMAPI();
