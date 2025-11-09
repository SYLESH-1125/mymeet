import { firestoreHelpers } from './firestore';

// Generate a short alphanumeric code for class
export function generateClassCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Create a new class
export async function createClass(ownerUid: string): Promise<{ classId: string; code: string; link: string }> {
  const code = generateClassCode();
  const classId = await firestoreHelpers.createClass(ownerUid, code);
  const link = `${window.location.origin}/classroom/${classId}`;
  
  // Initialize room state
  await firestoreHelpers.updateRoomState(classId, {
    mode: 'presenting',
    presenterUid: ownerUid,
    screenSharing: false,
  });

  // Initialize code doc
  await firestoreHelpers.updateCodeDoc(classId, '// Start coding here...', 'javascript');

  return { classId, code, link };
}

// Join a class by code or ID
export async function joinClassByCode(code: string): Promise<string | null> {
  const classroom = await firestoreHelpers.getClassByCode(code);
  return classroom ? classroom.id : null;
}

// Get class info
export async function getClassInfo(classId: string) {
  return await firestoreHelpers.getClassById(classId);
}

// Start/stop class
export async function toggleClassLive(classId: string, isLive: boolean) {
  await firestoreHelpers.updateClassLiveStatus(classId, isLive);
}
