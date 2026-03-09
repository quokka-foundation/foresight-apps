import { api } from "./api";
import { APP_URL } from "./constants";

const JWT_KEY = "foresight_jwt";

export function getStoredJwt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(JWT_KEY);
}

export function storeJwt(token: string): void {
  localStorage.setItem(JWT_KEY, token);
}

export function clearJwt(): void {
  localStorage.removeItem(JWT_KEY);
}

export function decodeJwt(
  token: string,
): { sub: string; walletAddress: string; exp: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}

export function buildSiweMessage(address: string, nonce: string): string {
  const domain = new URL(APP_URL).host;
  const issuedAt = new Date().toISOString();
  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    "",
    `Sign in to Foresight Alpha Intelligence`,
    "",
    `URI: ${APP_URL}`,
    `Version: 1`,
    `Chain ID: 8453`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

export async function performSiweAuth(
  address: string,
  signMessage: (args: { message: string }) => Promise<string>,
): Promise<string> {
  const { nonce } = await api.nonce();
  const message = buildSiweMessage(address, nonce);
  const signature = await signMessage({ message });
  const { token } = await api.siweVerify({ message, signature });
  storeJwt(token);
  return token;
}
