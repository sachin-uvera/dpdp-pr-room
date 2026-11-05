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

test("signupWithKyc stores the KYC details", async () => {
  const { signupWithKyc } = await import("../src/users.js");
  const store = createStore();
  const id = signupWithKyc(store, {
    name: "Ravi",
    email: "ravi@example.com",
    phone: "+91 98765 43210",
    aadhaar: "1234 5678 9012",
  });
  assert.equal(getUser(store, id).aadhaar, "1234 5678 9012");
});

test("deleteUser hides the user", async () => {
  const { deleteUser } = await import("../src/users.js");
  const store = createStore();
  const id = createUser(store, { name: "Asha", email: "asha@example.com" });
  assert.equal(deleteUser(store, id), true);
  assert.equal(getUser(store, id), null);
});
