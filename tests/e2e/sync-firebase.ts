import type { User } from "firebase/auth";
export const firebaseConfigured = true;
export const firebaseClients = () => {
  if (localStorage.getItem("fixture-init-error")) throw new Error("fixture auth initialization failure");
  return { auth: {} };
};
export class GoogleAuthProvider {}
export async function signInWithPopup() {
  localStorage.setItem("fixture-user", "a");
  window.dispatchEvent(new Event("fixture-auth"));
}
export async function signOut() {
  localStorage.removeItem("fixture-user");
  window.dispatchEvent(new Event("fixture-auth"));
}
export function onAuthStateChanged(_auth: unknown, callback: (user: User | null) => void, failed?: (error: Error) => void) {
  const notify = () => {
    const uid = localStorage.getItem("fixture-user");
    callback(uid ? { uid } as User : null);
  };
  queueMicrotask(notify);
  window.addEventListener("fixture-auth", notify);
  const fail = () => failed?.(new Error("fixture auth failure"));
  window.addEventListener("fixture-auth-error", fail);
  return () => {
    window.removeEventListener("fixture-auth", notify);
    window.removeEventListener("fixture-auth-error", fail);
  };
}
