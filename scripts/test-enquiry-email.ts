import assert from "node:assert/strict";
import { sendEnquiryEmail } from "../src/lib/enquiryEmail";

const originalFetch = globalThis.fetch;
const originalKey = process.env.RESEND_API_KEY;

const enquiry = {
  id: "test-contact-123",
  name: "Test Customer",
  email: "customer@example.com",
  phone: null,
  subject: "Sizing question",
  message: "Is size 7 available?",
  enquiryType: "GENERAL",
  productSku: null,
  size: null,
  color: null,
};

async function run() {
  process.env.RESEND_API_KEY = "test-only-key";
  globalThis.fetch = async (input, init) => {
    assert.equal(input, "https://api.resend.com/emails");
    assert.equal(init?.method, "POST");
    assert.equal((init?.headers as Record<string, string>)["Idempotency-Key"], "enquiry-test-contact-123");
    const payload = JSON.parse(String(init?.body));
    assert.deepEqual(payload.to, ["aryan.kapoor@fashionfeet.co.in"]);
    assert.equal(payload.reply_to, "customer@example.com");
    assert.match(payload.text, /Is size 7 available\?/);
    return new Response(JSON.stringify({ id: "provider-message-123" }), { status: 200 });
  };
  assert.equal(await sendEnquiryEmail(enquiry), true);

  globalThis.fetch = async () => new Response("error", { status: 500 });
  assert.equal(await sendEnquiryEmail(enquiry), false);
  process.stdout.write("Enquiry email routing and provider-failure checks passed.\n");
}

run().finally(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalKey;
});
