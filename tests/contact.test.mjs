// Run with: npm test  (Node's built-in runner; types stripped at load time)
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, describe, it } from "node:test";
import {
  buildEmail, checkToken, configFromEnv, describeFailure, issueToken, readInput, sendContactEmail, validate,
} from "../lib/contact.ts";

const valid = { name: "Jane Smith", email: "jane@example.com", subject: "Demo", message: "I'd love a demo next week." };

describe("validate", () => {
  it("accepts a well-formed submission", () => assert.deepEqual(validate(valid), {}));
  it("flags each bad field", () => {
    const e = validate({ name: "", email: "nope", subject: "", message: "short" });
    assert.deepEqual(Object.keys(e).sort(), ["email", "message", "name", "subject"]);
  });
  it("caps links in the message", () => {
    const e = validate({ ...valid, message: "see https://a.co https://b.co https://c.co https://d.co" });
    assert.match(e.message, /no more than 3 links/);
  });
  it("trims input and ignores non-string values", () => {
    const form = new Map([["name", "  Jane  "], ["email", 42]]);
    assert.deepEqual(readInput((k) => form.get(k)), { name: "Jane", email: "", subject: "", message: "" });
  });
});

describe("token", () => {
  const secret = "s3cret";
  const t0 = 1_790_000_000_000;
  it("accepts a token older than 3 s", () => assert.equal(checkToken(secret, issueToken(secret, t0), t0 + 5_000), "ok"));
  it("rejects instant submissions", () => assert.equal(checkToken(secret, issueToken(secret, t0), t0 + 500), "too-fast"));
  it("rejects expired tokens", () => assert.equal(checkToken(secret, issueToken(secret, t0), t0 + 25 * 3600e3), "expired"));
  it("rejects forged or malformed tokens", () => {
    assert.equal(checkToken(secret, issueToken("other", t0), t0 + 5_000), "invalid");
    assert.equal(checkToken(secret, `${t0 - 10_000}.${issueToken(secret, t0).split(".")[1]}`, t0 + 5_000), "invalid");
    assert.equal(checkToken(secret, "garbage", t0), "invalid");
    assert.equal(checkToken(secret, null, t0), "invalid");
  });
});

describe("buildEmail", () => {
  const cfg = { apiKey: "re_test", to: "team@example.com", from: "Site <contact@notifications.example.com>" };
  it("escapes HTML and strips header-injection newlines", () => {
    const m = buildEmail({ ...valid, subject: "Hi\r\nBcc: x@y.z", message: "<script>x</script>" }, cfg);
    assert.equal(m.subject, "Website contact: Hi Bcc: x@y.z");
    assert.ok(m.html.includes("&lt;script&gt;") && !m.html.includes("<script>"));
    assert.equal(m.reply_to, valid.email);
    assert.deepEqual(m.to, ["team@example.com"]);
  });
});

describe("configFromEnv", () => {
  it("needs all three vars", () => {
    assert.equal(configFromEnv({ RESEND_API_KEY: "k", CONTACT_TO_EMAIL: "t" }), null);
    assert.deepEqual(configFromEnv({ RESEND_API_KEY: "k", CONTACT_TO_EMAIL: "t", CONTACT_FROM_EMAIL: "f" }), { apiKey: "k", to: "t", from: "f" });
  });
});

describe("sendContactEmail against a mock Resend API", () => {
  let server, base, last, reply;
  before(async () => {
    server = createServer((req, res) => {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        last = { method: req.method, url: req.url, headers: req.headers, body: JSON.parse(body || "{}") };
        res.writeHead(reply.status, { "Content-Type": "application/json" }).end(JSON.stringify(reply.json));
      });
    });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  after(() => server.close());
  const cfg = () => ({ apiKey: "re_test", to: "team@example.com", from: "Site <contact@notifications.example.com>", apiBase: base });

  it("sends the documented request and returns the id", async () => {
    reply = { status: 200, json: { id: "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794" } };
    const r = await sendContactEmail(valid, cfg());
    assert.deepEqual(r, { ok: true, id: "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794" });
    assert.equal(last.method, "POST");
    assert.equal(last.url, "/emails");
    assert.equal(last.headers.authorization, "Bearer re_test");
    assert.equal(last.headers["content-type"], "application/json");
    assert.match(last.headers["idempotency-key"], /^[0-9a-f]{64}$/);
    assert.deepEqual(Object.keys(last.body).sort(), ["from", "html", "reply_to", "subject", "text", "to"]);
  });

  for (const [status, json] of [
    [401, { statusCode: 401, name: "missing_api_key", message: "Missing API Key" }],
    [403, { statusCode: 403, name: "validation_error", message: "The domain is not verified." }],
    [422, { statusCode: 422, name: "validation_error", message: "Invalid `to` field." }],
    [429, { statusCode: 429, name: "rate_limit_exceeded", message: "Too many requests." }],
  ]) {
    it(`maps HTTP ${status} to a failure with a friendly message`, async () => {
      reply = { status, json };
      const r = await sendContactEmail(valid, cfg());
      assert.deepEqual(r, { ok: false, status, message: json.message });
      assert.ok(describeFailure(status).length > 10 && !describeFailure(status).includes(json.message));
    });
  }

  it("reports network failures without throwing", async () => {
    const r = await sendContactEmail(valid, { ...cfg(), apiBase: "http://127.0.0.1:1" });
    assert.equal(r.ok, false);
    assert.equal(r.status, 0);
  });
});
