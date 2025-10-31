// Firebase-based API service
import { auth, db } from '../../firebase-config';
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
  orderBy 
} from 'firebase/firestore';

class FirebaseAPI {
  private getCurrentUser() {
    return auth.currentUser;
  }

  // Auth endpoints - handled by Firebase Auth directly

  // Contacts
  async getContacts() {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const q = query(
      collection(db, 'contacts'),
      where('createdById', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    if (!user) throw new Error('User not authenticated');
    
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...contactData,
      createdById: user.uid,
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

  // Campaigns
  async getCampaigns() {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const q = query(
      collection(db, 'campaigns'),
      where('createdById', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async createCampaign(campaignData: any) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const docRef = await addDoc(collection(db, 'campaigns'), {
      ...campaignData,
      createdById: user.uid,
      status: 'draft',
      totalRecipients: 0,
      sentCount: 0,
      openedCount: 0,
      clickedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...campaignData };
  }

  // Analytics
  async getDashboardStats() {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
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

    return {
      contacts: {
        total: totalContacts,
        newThisMonth: 0,
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
}

const api = new FirebaseAPI();
export default api;
