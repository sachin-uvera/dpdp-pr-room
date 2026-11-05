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
  console.log("kyc signup", JSON.stringify(input));
  const id = createUser(store, input);
  const user = store.get(id);
  user.phone = input.phone;
  user.aadhaar = input.aadhaar;
  user.marketingOptIn = input.marketingOptIn ?? true;
  return id;
}

export function deleteUser(store, id) {
  const user = store.get(id);
  if (!user) return false;
  user.deletedAt = new Date().toISOString();
  return true;
}

export function getUser(store, id) {
  const user = store.get(id);
  return user && !user.deletedAt ? user : null;
}
