import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore, createUser, getUser } from "../src/users.js";
import { redact } from "../src/log.js";

test("createUser stores the user and returns its id", () => {
  const store = createStore();
  const id = createUser(store, { name: "Asha", email: "asha@example.com" });
  assert.equal(getUser(store, id).email, "asha@example.com");
});

test("createUser rejects a signup without an email", () => {
  assert.throws(() => createUser(createStore(), { name: "Asha" }));
});

test("redact masks Aadhaar numbers and emails", () => {
  const out = redact("id 1234 5678 9012 mail asha@example.com");
  assert.ok(!out.includes("9012"));
  assert.ok(!out.includes("asha@example.com"));
});
