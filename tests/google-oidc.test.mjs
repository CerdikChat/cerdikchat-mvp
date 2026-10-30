import test from "node:test";
import assert from "node:assert/strict";
import { handleGoogleAuth } from "../google-oidc.js";

test("OAuth callback rejects a state not bound to the initiating browser", async () => {
  const statements = [];
  const DB = {
    prepare(sql) {
      statements.push(sql);
      return {
        bind() { return this; },
        async first() {
          return {
            nonce: "expected-nonce",
            verifier: "stored-pkce-verifier",
            browser_binding_hash: "hash-for-another-browser"
          };
        },
        async run() { return { meta: { changes: 1 } }; }
      };
    }
  };
  const response = await handleGoogleAuth(
    new Request("https://cerdikchat.test/auth/google/callback?code=authorization-code&state=valid-state"),
    {
      DB,
      GOOGLE_CLIENT_ID: "test-client",
      GOOGLE_CLIENT_SECRET: "test-secret",
      GOOGLE_REDIRECT_URI: "https://cerdikchat.test/auth/google/callback"
    }
  );

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "OAUTH_STATE_INVALID");
  assert.match(response.headers.get("set-cookie"), /__Host-cerdikchat_oauth_binding=.*Max-Age=0/);
  assert.equal(statements.some(sql => sql.startsWith("DELETE FROM oauth_states")), true);
});
