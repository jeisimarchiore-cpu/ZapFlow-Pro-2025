
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  addDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9WZce6FaESU8H9tHcBYL-ACwxOrtbKm4",
  authDomain: "zapflow25.firebaseapp.com",
  projectId: "zapflow25",
  storageBucket: "zapflow25.firebasestorage.app",
  messagingSenderId: "182084372862",
  appId: "1:182084372862:web:ade0016971a298d21e8b2f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper para caminhos dinâmicos conforme solicitado
const APP_ID = "zapflow-pro";
const DEFAULT_UID = "user-001"; // Placeholder para sistema de Auth

export const getCollectionRef = (collectionName: string) => {
  return collection(db, "artifacts", APP_ID, "users", DEFAULT_UID, collectionName);
};

export const getDocumentRef = (collectionName: string, docId: string) => {
  return doc(db, "artifacts", APP_ID, "users", DEFAULT_UID, collectionName, docId);
};

// Funções Genéricas de CRUD
export const saveDocument = async (collectionName: string, data: any) => {
  const colRef = getCollectionRef(collectionName);
  return await addDoc(colRef, { ...data, updatedAt: new Date().toISOString() });
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  const docRef = getDocumentRef(collectionName, docId);
  return await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = getDocumentRef(collectionName, docId);
  return await deleteDoc(docRef);
};

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  const colRef = getCollectionRef(collectionName);
  const q = query(colRef);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};
