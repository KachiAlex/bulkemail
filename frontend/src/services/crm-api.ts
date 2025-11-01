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
  SMS,
  Campaign,
  Segment,
  EmailTemplate,
  Dashboard,
  LeadScore,
  AIRecommendation
} from '../types/crm';
import { validateContactEmail } from '../utils/emailValidator';

class CRMAPI {
  private getCurrentUser() {
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated Firebase user found');
      throw new Error('User not authenticated');
    }
    console.log('Using authenticated Firebase user:', user.uid);
    return user;
  }

  // Contact Management
  async getContacts(filters?: any): Promise<Contact[]> {
    try {
      const user = this.getCurrentUser();
      let q = query(collection(db, 'contacts'), where('createdById', '==', user.uid));
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters?.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filters.tags));
      }

      const snapshot = await getDocs(q);
      let contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
      
      // Client-side sorting
      contacts.sort((a, b) => {
        const dateA = a.lastActivityAt || a.createdAt;
        const dateB = b.lastActivityAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      
      return contacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  }

  async getContact(id: string): Promise<Contact> {
    const docRef = doc(db, 'contacts', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Contact not found');
    return { id: docSnap.id, ...docSnap.data() } as Contact;
  }

  async createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const user = this.getCurrentUser();
    
    // Validate email if provided
    if (contact.email) {
      const validation = await validateContactEmail(contact.email, { 
        showToast: true,
        useAPI: true  // Automatically uses API if keys are configured
      });
      
      // Store validation result in contact
      const contactWithValidation = {
        ...contact,
        emailValidated: validation.validation.isValid,
        emailValidationScore: validation.validation.score,
        emailValidationReason: validation.validation.reason,
        emailValidationProvider: validation.validation.provider
      };
      
      const docRef = await addDoc(collection(db, 'contacts'), {
        ...contactWithValidation,
        createdById: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...contactWithValidation, createdAt: new Date(), updatedAt: new Date() } as Contact;
    }
    
    // No email provided, create contact normally
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...contact,
      createdById: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...contact, createdAt: new Date(), updatedAt: new Date() } as Contact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    const docRef = doc(db, 'contacts', id);
    
    // Validate email if being updated
    if (updates.email) {
      const validation = await validateContactEmail(updates.email, { 
        showToast: true,
        useAPI: true  // Automatically uses API if keys are configured
      });
      
      // Add validation result to updates
      const updatesWithValidation = {
        ...updates,
        emailValidated: validation.validation.isValid,
        emailValidationScore: validation.validation.score,
        emailValidationReason: validation.validation.reason,
        emailValidationProvider: validation.validation.provider,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updatesWithValidation);
    } else {
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    }
  }

  async deleteContact(id: string): Promise<void> {
    await deleteDoc(doc(db, 'contacts', id));
  }

  // Account Management
  async getAccounts(): Promise<Account[]> {
    const user = this.getCurrentUser();
    const q = query(collection(db, 'accounts'), where('createdById', '==', user.uid));
    const snapshot = await getDocs(q);
    let accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
    
    accounts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return accounts;
  }

  async createAccount(account: Omit<Account, 'id' | 'contacts' | 'opportunities' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const user = this.getCurrentUser();
    const docRef = await addDoc(collection(db, 'accounts'), {
      ...account,
      contacts: [],
      opportunities: [],
      createdById: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...account, contacts: [], opportunities: [], createdAt: new Date(), updatedAt: new Date() } as Account;
  }

  // Opportunity Management
  async getOpportunities(): Promise<Opportunity[]> {
    const user = this.getCurrentUser();
    const q = query(collection(db, 'opportunities'), where('createdById', '==', user.uid));
    const snapshot = await getDocs(q);
    let opportunities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
    
    opportunities.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return opportunities;
  }

  async createOpportunity(opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Opportunity> {
    const user = this.getCurrentUser();
    const docRef = await addDoc(collection(db, 'opportunities'), {
      ...opportunity,
      createdById: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...opportunity, createdAt: new Date(), updatedAt: new Date() } as Opportunity;
  }

  // Activity Timeline
  async getActivities(contactId?: string, accountId?: string, opportunityId?: string): Promise<Activity[]> {
    const user = this.getCurrentUser();
    let q = query(collection(db, 'activities'), where('userId', '==', user.uid));
    
    if (contactId) {
      q = query(q, where('contactId', '==', contactId));
    }
    if (accountId) {
      q = query(q, where('accountId', '==', accountId));
    }
    if (opportunityId) {
      q = query(q, where('opportunityId', '==', opportunityId));
    }

    const snapshot = await getDocs(q);
    let activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
    
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities;
  }

  async createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const docRef = await addDoc(collection(db, 'activities'), activity);
    return { id: docRef.id, ...activity } as Activity;
  }

  // Task Management
  async getTasks(): Promise<Task[]> {
    const user = this.getCurrentUser();
    const q = query(collection(db, 'tasks'), where('assignedTo', '==', user.uid));
    const snapshot = await getDocs(q);
    let tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    
    tasks.sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate as any).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.dueDate ? new Date(b.dueDate as any).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
    return tasks;
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const user = this.getCurrentUser();
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...task,
      assignedTo: (task as any).assignedTo || user.uid,
      createdById: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...task, createdAt: new Date(), updatedAt: new Date() } as Task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const ref = doc(db, 'tasks', id);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
  }

  async deleteTask(id: string): Promise<void> {
    await deleteDoc(doc(db, 'tasks', id));
  }

  // Pipeline Management
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
    console.log('Calling sendCampaignEmail with user:', user.uid);
    const sendCampaignEmail = httpsCallable(functions, 'sendCampaignEmail');
    
    await sendCampaignEmail({
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    });

    // After successful send, save to Firestore
    const now = new Date();
    const emailMessage: any = {
      threadId: '',
      from: user.email || '',
      to: [emailData.to],
      subject: emailData.subject,
      body: emailData.html,
      isHtml: true,
      isRead: true,
      isReplied: false,
      isForwarded: false,
      timestamp: now,
      messageId: `sent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Check if thread exists with this recipient
    const existingThreads = await this.getEmailThreads();
    const existingThread = existingThreads.find(
      thread => thread.participants.includes(emailData.to)
    );

    if (existingThread) {
      // Add to existing thread
      emailMessage.threadId = existingThread.id;
      await updateDoc(doc(db, 'emailThreads', existingThread.id), {
        messages: [...existingThread.messages, emailMessage],
        lastMessageAt: serverTimestamp()
      });
    } else {
      // Create new thread with correct threadId from the start
      emailMessage.threadId = 'temp';
      const threadRef = await addDoc(collection(db, 'emailThreads'), {
        userId: user.uid,
        subject: emailData.subject,
        participants: [user.email || '', emailData.to],
        messages: [emailMessage],
        isRead: true,
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      // Update with correct threadId
      emailMessage.threadId = threadRef.id;
      await updateDoc(doc(db, 'emailThreads', threadRef.id), {
        messages: [emailMessage]
      });
    }
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
