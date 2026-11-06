import { randomUUID } from "node:crypto";
import { log } from "./log.js";

export function createStore() {
  return new Map();
}

export function createUser(store, { name, email }) {
  if (!name || !email) throw new Error("name and email are required");
  const id = randomUUID();
  store.set(id, { id, name, email, createdAt: new Date().toISOString() });
  log("user created", { id });
  return id;
}

export function signupWithKyc(store, input) {
  const id = createUser(store, input);
  log("kyc signup", { id });
  const user = store.get(id);
  user.phone = input.phone;
  user.aadhaarLast4 = input.aadhaar && String(input.aadhaar).replace(/\D/g, "").slice(-4);
  user.marketingOptIn = input.marketingOptIn === true;
  return id;
}

export function deleteUser(store, id) {
  const user = store.get(id);
  if (!user) return false;
  store.set(id, { id, createdAt: user.createdAt, deletedAt: new Date().toISOString(), marketingOptIn: false });
  return true;
}

export function getUser(store, id) {
  const user = store.get(id);
  return user && !user.deletedAt ? user : null;
}
