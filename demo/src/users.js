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

export function getUser(store, id) {
  return store.get(id) ?? null;
}
