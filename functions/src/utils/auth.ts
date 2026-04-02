import * as admin from 'firebase-admin';

export async function verifyIdToken(token: string) {
  if (!token) throw new Error('No token');
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded;
}
