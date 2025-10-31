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
  limit 
} from 'firebase/firestore';
import { db } from '../firebase-config';

// Firestore service for CRM data
export const dbService = {
  // Contacts
  async getContacts(userId) {
    const q = query(
      collection(db, 'contacts'),
      where('createdById', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getContact(contactId) {
    const docRef = doc(db, 'contacts', contactId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Contact not found');
  },

  async createContact(contactData) {
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...contactData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...contactData };
  },

  async updateContact(contactId, updateData) {
    const docRef = doc(db, 'contacts', contactId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date()
    });
  },

  async deleteContact(contactId) {
    await deleteDoc(doc(db, 'contacts', contactId));
  },

  // Campaigns
  async getCampaigns(userId) {
    const q = query(
      collection(db, 'campaigns'),
      where('createdById', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createCampaign(campaignData) {
    const docRef = await addDoc(collection(db, 'campaigns'), {
      ...campaignData,
      status: 'draft',
      totalRecipients: 0,
      sentCount: 0,
      openedCount: 0,
      clickedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...campaignData };
  },

  async updateCampaign(campaignId, updateData) {
    const docRef = doc(db, 'campaigns', campaignId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date()
    });
  },

  // Analytics
  async getDashboardStats(userId) {
    // Get contacts count
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('createdById', '==', userId)
    );
    const contactsSnapshot = await getDocs(contactsQuery);
    const totalContacts = contactsSnapshot.size;

    // Get campaigns count
    const campaignsQuery = query(
      collection(db, 'campaigns'),
      where('createdById', '==', userId)
    );
    const campaignsSnapshot = await getDocs(campaignsQuery);
    const totalCampaigns = campaignsSnapshot.size;

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
        total: 0,
        completed: 0,
        avgDuration: 0
      }
    };
  }
};
