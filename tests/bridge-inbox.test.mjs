import test from "node:test";
import assert from "node:assert/strict";
import { assertInboxCapacity, MAX_INBOX_ITEMS } from "../src/bridge-inbox.js";

test("Context Bridge accepts inboxes below the 50-task session limit", () => {
  assert.equal(MAX_INBOX_ITEMS, 50);
  assert.doesNotThrow(() => assertInboxCapacity([]));
  assert.doesNotThrow(() => assertInboxCapacity(Array.from({ length: 49 }, (_, i) => i)));
});

test("Context Bridge rejects the 51st task before changing the inbox", () => {
  const inbox = Array.from({ length: 50 }, (_, i) => i);
  assert.throws(
    () => assertInboxCapacity(inbox),
    /Batas 50 tugas per tab tercapai/,
  );
  assert.equal(inbox.length, 50);
});

test("Context Bridge rejects invalid inbox state", () => {
  assert.throws(() => assertInboxCapacity(null), /Inbox sesi tidak valid/);
});
