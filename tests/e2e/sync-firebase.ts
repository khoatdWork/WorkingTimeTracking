import type { User } from "firebase/auth";
export const firebaseConfigured = true;
export const firebaseClients = () => ({ auth: {} });
export class GoogleAuthProvider {}
export async function signInWithPopup() {}
export async function signOut() {
  localStorage.removeItem("fixture-user");
  window.dispatchEvent(new Event("fixture-auth"));
}
export function onAuthStateChanged(_auth: unknown, callback: (user: User | null) => void) {
  const notify = () => {
    const uid = localStorage.getItem("fixture-user");
    callback(uid ? { uid } as User : null);
  };
  queueMicrotask(notify);
  window.addEventListener("fixture-auth", notify);
  return () => window.removeEventListener("fixture-auth", notify);
}
