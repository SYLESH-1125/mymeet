import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface ClassRoom {
  id: string;
  ownerUid: string;
  code: string;
  link: string;
  createdAt: Timestamp;
  isLive: boolean;
  mode: 'whiteboard' | 'code' | 'presenting';
}

export interface Attendee {
  uid: string;
  joinedAt: Timestamp;
  role: 'teacher' | 'student';
  presence: boolean;
  displayName: string;
  photoURL: string;
}

export interface ChatMessage {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  text: string;
  ts: Timestamp;
  type: 'chat' | 'system';
}

export interface Doubt {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  status: 'new' | 'answered';
  ts: Timestamp;
}

export interface RoomState {
  mode: 'whiteboard' | 'code' | 'presenting';
  presenterUid: string;
  screenSharing: boolean;
  whiteboardData?: any;
}

export interface CodeDoc {
  content: string;
  lang: string;
  lastModified: Timestamp;
}

// Firestore helpers
export const firestoreHelpers = {
  // Classes
  async createClass(ownerUid: string, code: string): Promise<string> {
    const classRef = await addDoc(collection(db, 'classes'), {
      ownerUid,
      code,
      link: `${window.location.origin}/classroom/${code}`,
      createdAt: serverTimestamp(),
      isLive: false,
      mode: 'presenting',
    });
    return classRef.id;
  },

  async getClassByCode(code: string): Promise<ClassRoom | null> {
    const q = query(collection(db, 'classes'), where('code', '==', code));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as ClassRoom;
    }
    return null;
  },

  async getClassById(classId: string): Promise<ClassRoom | null> {
    const docRef = doc(db, 'classes', classId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ClassRoom;
    }
    return null;
  },

  async updateClassLiveStatus(classId: string, isLive: boolean): Promise<void> {
    const docRef = doc(db, 'classes', classId);
    await updateDoc(docRef, { isLive });
  },

  // Attendees
  async addAttendee(
    classId: string,
    uid: string,
    role: 'teacher' | 'student',
    displayName: string,
    photoURL: string
  ): Promise<void> {
    const attendeeRef = doc(db, 'classes', classId, 'attendees', uid);
    await setDoc(attendeeRef, {
      uid,
      joinedAt: serverTimestamp(),
      role,
      presence: true,
      displayName,
      photoURL,
    });
  },

  async removeAttendee(classId: string, uid: string): Promise<void> {
    const attendeeRef = doc(db, 'classes', classId, 'attendees', uid);
    await deleteDoc(attendeeRef);
  },

  subscribeToAttendees(
    classId: string,
    callback: (attendees: Attendee[]) => void
  ) {
    const q = query(collection(db, 'classes', classId, 'attendees'));
    return onSnapshot(q, (snapshot) => {
      const attendees: Attendee[] = [];
      snapshot.forEach((doc) => {
        attendees.push({ ...doc.data() } as Attendee);
      });
      callback(attendees);
    });
  },

  // Chat
  async sendChatMessage(
    classId: string,
    uid: string,
    displayName: string,
    photoURL: string,
    text: string,
    type: 'chat' | 'system' = 'chat'
  ): Promise<void> {
    await addDoc(collection(db, 'classes', classId, 'chat'), {
      uid,
      displayName,
      photoURL,
      text,
      ts: serverTimestamp(),
      type,
    });
  },

  subscribeToChat(
    classId: string,
    callback: (messages: ChatMessage[]) => void
  ) {
    const q = query(
      collection(db, 'classes', classId, 'chat'),
      orderBy('ts', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      callback(messages);
    });
  },

  async getChatHistory(classId: string, limit: number = 50): Promise<ChatMessage[]> {
    const q = query(
      collection(db, 'classes', classId, 'chat'),
      orderBy('ts', 'desc'),
      // Note: limit import needed from firebase/firestore
    );
    const snapshot = await getDocs(q);
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    return messages.reverse(); // Return in ascending order
  },

  // Doubts
  async submitDoubt(
    classId: string,
    uid: string,
    displayName: string,
    text: string
  ): Promise<void> {
    await addDoc(collection(db, 'classes', classId, 'doubts'), {
      uid,
      displayName,
      text,
      status: 'new',
      ts: serverTimestamp(),
    });
  },

  async markDoubtAnswered(classId: string, doubtId: string): Promise<void> {
    const doubtRef = doc(db, 'classes', classId, 'doubts', doubtId);
    await updateDoc(doubtRef, { status: 'answered' });
  },

  subscribeToDoubts(classId: string, callback: (doubts: Doubt[]) => void) {
    const q = query(
      collection(db, 'classes', classId, 'doubts'),
      orderBy('ts', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const doubts: Doubt[] = [];
      snapshot.forEach((doc) => {
        doubts.push({ id: doc.id, ...doc.data() } as Doubt);
      });
      callback(doubts);
    });
  },

  async getDoubtHistory(classId: string, limit: number = 100): Promise<Doubt[]> {
    const q = query(
      collection(db, 'classes', classId, 'doubts'),
      orderBy('ts', 'desc'),
    );
    const snapshot = await getDocs(q);
    const doubts: Doubt[] = [];
    snapshot.forEach((doc) => {
      doubts.push({ id: doc.id, ...doc.data() } as Doubt);
    });
    return doubts;
  },

  // Room State
  async updateRoomState(classId: string, state: Partial<RoomState>): Promise<void> {
    const roomStateRef = doc(db, 'classes', classId, 'roomState', 'current');
    await setDoc(roomStateRef, state, { merge: true });
  },

  async getRoomState(classId: string): Promise<RoomState | null> {
    const roomStateRef = doc(db, 'classes', classId, 'roomState', 'current');
    const docSnap = await getDoc(roomStateRef);
    if (docSnap.exists()) {
      return docSnap.data() as RoomState;
    }
    return null;
  },

  subscribeToRoomState(classId: string, callback: (state: RoomState) => void) {
    const roomStateRef = doc(db, 'classes', classId, 'roomState', 'current');
    return onSnapshot(roomStateRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as RoomState);
      }
    });
  },

  // Code Editor
  async updateCodeDoc(
    classId: string,
    content: string,
    lang: string
  ): Promise<void> {
    const codeDocRef = doc(db, 'classes', classId, 'codeDoc', 'current');
    await setDoc(codeDocRef, {
      content,
      lang,
      lastModified: serverTimestamp(),
    });
  },

  async getCodeDoc(classId: string): Promise<CodeDoc | null> {
    const codeDocRef = doc(db, 'classes', classId, 'codeDoc', 'current');
    const docSnap = await getDoc(codeDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as CodeDoc;
    }
    return null;
  },

  subscribeToCodeDoc(classId: string, callback: (codeDoc: CodeDoc) => void) {
    const codeDocRef = doc(db, 'classes', classId, 'codeDoc', 'current');
    return onSnapshot(codeDocRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as CodeDoc);
      }
    });
  },
};
