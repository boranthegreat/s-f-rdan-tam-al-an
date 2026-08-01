import { createPrivateKey, sign } from "node:crypto";

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function publicKeyToJwk(publicKey: string, privateKey: string) {
  const raw = Buffer.from(publicKey, "base64url");
  if (raw.length !== 65 || raw[0] !== 4) throw new Error("Invalid VAPID public key.");
  return {
    kty: "EC",
    crv: "P-256",
    x: raw.subarray(1, 33).toString("base64url"),
    y: raw.subarray(33, 65).toString("base64url"),
    d: Buffer.from(privateKey, "base64url").toString("base64url")
  };
}

export async function sendEmptyWebPush(endpoint: string) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const privateKey = process.env.VAPID_PRIVATE_KEY ?? "";
  const subject = process.env.VAPID_SUBJECT ?? "mailto:hello@boranthegreat.xyz";
  if (!publicKey || !privateKey) throw new Error("VAPID keys are missing.");

  const endpointUrl = new URL(endpoint);
  const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;
  const header = base64Url(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const claims = base64Url(JSON.stringify({ aud: audience, exp: Math.floor(Date.now() / 1000) + 11 * 60 * 60, sub: subject }));
  const unsigned = `${header}.${claims}`;
  const key = createPrivateKey({ key: publicKeyToJwk(publicKey, privateKey), format: "jwk" });
  const signature = sign("sha256", Buffer.from(unsigned), { key, dsaEncoding: "ieee-p1363" });
  const jwt = `${unsigned}.${signature.toString("base64url")}`;

  return fetch(endpoint, {
    method: "POST",
    headers: {
      TTL: "120",
      Urgency: "high",
      Authorization: `vapid t=${jwt}, k=${publicKey}`
    }
  });
}
