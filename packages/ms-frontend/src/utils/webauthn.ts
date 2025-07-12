// WebAuthn utility functions for browser API interactions

interface WebAuthnCredential {
  id: string;
  rawId: ArrayBuffer;
  response: AuthenticatorAttestationResponse;
  type: 'public-key';
}

interface WebAuthnAssertion {
  id: string;
  rawId: ArrayBuffer;
  response: AuthenticatorAssertionResponse;
  type: 'public-key';
}

// Check if WebAuthn is supported
export function isWebAuthnSupported(): boolean {
  return !!(navigator.credentials && navigator.credentials.create);
}

// Convert ArrayBuffer to base64url string
export function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Convert base64url string to ArrayBuffer
export function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// Create a WebAuthn credential
export async function createWebAuthnCredential(options: any): Promise<any> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  // Convert base64url strings to ArrayBuffers
  const publicKeyOptions = {
    ...options,
    challenge: base64urlToArrayBuffer(options.challenge),
    user: {
      ...options.user,
      id: base64urlToArrayBuffer(options.user.id),
    },
    excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
      ...cred,
      id: base64urlToArrayBuffer(cred.id),
    })),
  };

  const credential = await navigator.credentials.create({
    publicKey: publicKeyOptions,
  }) as WebAuthnCredential;

  if (!credential) {
    throw new Error('Failed to create WebAuthn credential');
  }

  // Convert ArrayBuffers back to base64url strings
  return {
    id: credential.id,
    rawId: arrayBufferToBase64url(credential.rawId),
    response: {
      clientDataJSON: arrayBufferToBase64url(credential.response.clientDataJSON),
      attestationObject: arrayBufferToBase64url(credential.response.attestationObject),
      transports: credential.response.getTransports?.() || [],
    },
    type: credential.type,
  };
}

// Get a WebAuthn assertion
export async function getWebAuthnAssertion(options: any): Promise<any> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  // Convert base64url strings to ArrayBuffers
  const publicKeyOptions = {
    ...options,
    challenge: base64urlToArrayBuffer(options.challenge),
    allowCredentials: options.allowCredentials?.map((cred: any) => ({
      ...cred,
      id: base64urlToArrayBuffer(cred.id),
    })),
  };

  const assertion = await navigator.credentials.get({
    publicKey: publicKeyOptions,
  }) as WebAuthnAssertion;

  if (!assertion) {
    throw new Error('Failed to get WebAuthn assertion');
  }

  // Convert ArrayBuffers back to base64url strings
  return {
    id: assertion.id,
    rawId: arrayBufferToBase64url(assertion.rawId),
    response: {
      clientDataJSON: arrayBufferToBase64url(assertion.response.clientDataJSON),
      authenticatorData: arrayBufferToBase64url(assertion.response.authenticatorData),
      signature: arrayBufferToBase64url(assertion.response.signature),
      userHandle: assertion.response.userHandle 
        ? arrayBufferToBase64url(assertion.response.userHandle) 
        : null,
    },
    type: assertion.type,
  };
} 