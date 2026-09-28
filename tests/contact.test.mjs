// Run with: npm test  (Node's built-in runner; types stripped at load time)
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, describe, it } from "node:test";
import {
  buildHubSpotPayload, checkToken, clientIp, describeFailure, issueToken, readInput, submitToHubSpot, validate,
} from "../lib/contact.ts";

const valid = {
  firstname: "Jane", lastname: "Smith", email: "jane@example.com", phone: "", message: "I'd love a demo next week.", interests: [],
};
const ctx = { pageUri: "https://example.com/contact", pageName: "Contact · Payback" };

describe("readInput", () => {
  it("trims text, ignores non-strings, and keeps only known interests in display order", () => {
    const form = new Map([["firstname", "  Jane "], ["email", 42]]);
    const all = new Map([["interests", ["send_invitations", "bogus", "own_my_individual_data", "send_invitations"]]]);
    const r = readInput((k) => form.get(k), (k) => all.get(k) ?? []);
    assert.equal(r.firstname, "Jane");
    assert.equal(r.email, "");
    assert.deepEqual(r.interests, ["own_my_individual_data", "send_invitations"]);
  });
});

describe("validate", () => {
  it("accepts a well-formed submission (phone and interests optional)", () => assert.deepEqual(validate(valid), {}));
  it("flags each bad field", () => {
    const e = validate({ ...valid, firstname: "", lastname: "", email: "nope", phone: "abc", message: "short" });
    assert.deepEqual(Object.keys(e).sort(), ["email", "firstname", "lastname", "message", "phone"]);
  });
  it("accepts common phone formats", () => {
    for (const phone of ["(303) 555-0142", "+1 303 555 0142", "303.555.0142"]) assert.deepEqual(validate({ ...valid, phone }), {});
  });
  it("caps links in the message", () => {
    assert.match(validate({ ...valid, message: "https://a.co https://b.co https://c.co https://d.co" }).message, /no more than 3 links/);
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

describe("buildHubSpotPayload", () => {
  it("maps fields to the HubSpot form's names and omits empty optional fields", () => {
    const p = buildHubSpotPayload(valid, ctx, 1_790_000_000_000);
    assert.equal(p.submittedAt, "1790000000000");
    assert.deepEqual(p.fields.map((f) => f.name), ["firstname", "lastname", "email", "message"]);
    assert.ok(p.fields.every((f) => f.objectTypeId === "0-1"));
    assert.deepEqual(p.context, ctx);
  });
  it("sends phone and semicolon-joined interests when present", () => {
    const p = buildHubSpotPayload({ ...valid, phone: "303-555-0142", interests: ["own_my_individual_data", "learn_about_payback_give"] }, ctx);
    const byName = Object.fromEntries(p.fields.map((f) => [f.name, f.value]));
    assert.equal(byName.phone, "303-555-0142");
    assert.equal(byName.choose_your_role, "own_my_individual_data;learn_about_payback_give");
  });
  it("passes only well-formed hutk and IP values", () => {
    const good = buildHubSpotPayload(valid, { ...ctx, hutk: "0123456789abcdef0123456789abcdef", ipAddress: "203.0.113.7" });
    assert.equal(good.context.hutk, "0123456789abcdef0123456789abcdef");
    assert.equal(good.context.ipAddress, "203.0.113.7");
    const bad = buildHubSpotPayload(valid, { ...ctx, hutk: "not-a-token", ipAddress: "1.2.3" });
    assert.equal(bad.context.hutk, undefined);
    assert.equal(bad.context.ipAddress, undefined);
  });
});

describe("clientIp", () => {
  it("prefers x-real-ip, falls back to the first x-forwarded-for hop, rejects junk", () => {
    assert.equal(clientIp((n) => ({ "x-real-ip": "198.51.100.4", "x-forwarded-for": "10.0.0.1" })[n] ?? null), "198.51.100.4");
    assert.equal(clientIp((n) => ({ "x-forwarded-for": "2001:db8::1, 10.0.0.1" })[n] ?? null), "2001:db8::1");
    assert.equal(clientIp((n) => ({ "x-forwarded-for": "unknown" })[n] ?? null), null);
  });
});

describe("submitToHubSpot against a mock HubSpot API", () => {
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
  const target = () => ({ portalId: "6769602", formGuid: "e5c4c31c-4ee9-4174-8b78-647c9c79e0ae", apiBase: base });

  it("posts the documented request and reports success", async () => {
    reply = { status: 200, json: { inlineMessage: "" } };
    assert.deepEqual(await submitToHubSpot(valid, ctx, target()), { ok: true });
    assert.equal(last.method, "POST");
    assert.equal(last.url, "/submissions/v3/integration/submit/6769602/e5c4c31c-4ee9-4174-8b78-647c9c79e0ae");
    assert.equal(last.headers["content-type"], "application/json");
    assert.equal(last.headers.authorization, undefined);
    assert.deepEqual(Object.keys(last.body).sort(), ["context", "fields", "submittedAt"]);
  });

  it("surfaces HubSpot's 400 error types (shape captured from the live API)", async () => {
    reply = { status: 400, json: {
      status: "error", message: "The request is not valid", correlationId: "01a0e8fb-38b0-7a68-a263-d0320f56fb51",
      errors: [{ message: "Error in 'fields.email'. Required field 'email' is missing", errorType: "REQUIRED_FIELD" }],
    } };
    const r = await submitToHubSpot(valid, ctx, target());
    assert.deepEqual(r, { ok: false, status: 400, errorTypes: ["REQUIRED_FIELD"], message: "The request is not valid" });
    assert.match(describeFailure(r).message, /couldn't be sent/);
  });

  it("puts an email rejection on the email field", async () => {
    reply = { status: 400, json: { status: "error", message: "x", errors: [{ message: "y", errorType: "BLOCKED_EMAIL" }] } };
    const f = describeFailure(await submitToHubSpot(valid, ctx, target()));
    assert.ok(f.fieldErrors?.email);
  });

  it("maps 429 to a retry-later message", async () => {
    reply = { status: 429, json: { status: "error", message: "rate limited" } };
    assert.match(describeFailure(await submitToHubSpot(valid, ctx, target())).message, /try again in a minute/);
  });

  it("reports network failures without throwing", async () => {
    const r = await submitToHubSpot(valid, ctx, { ...target(), apiBase: "http://127.0.0.1:1" });
    assert.equal(r.ok, false);
    assert.equal(r.status, 0);
  });
});
