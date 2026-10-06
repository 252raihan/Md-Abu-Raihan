/**
 * Hashing helpers built on the browser Web Crypto API.
 *
 * Used later to detect duplicate uploads without ever touching a server.
 * `crypto.subtle` requires a secure context (https or localhost) - both are
 * satisfied by the Vite dev server and by any real deployment target.
 */

/** True when SubtleCrypto is available in this browsing context. */
export const isWebCryptoAvailable = () =>
  typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.subtle !== 'undefined'

/**
 * Computes a SHA-256 digest.
 *
 * @param {ArrayBuffer|Uint8Array} data
 * @returns {Promise<string>} lower-case hex digest (64 chars)
 */
export const sha256Hex = async (data) => {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available in this browser context.')
  }

  const buffer = data instanceof Uint8Array ? data : new Uint8Array(data)
  // Copy into a standalone buffer so a detached/transferred source cannot break us.
  const digest = await globalThis.crypto.subtle.digest('SHA-256', buffer.slice())

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/** Shortens a hash for display: "a1b2c3d4…9f8e". */
export const shortenHash = (hash, head = 8, tail = 4) => {
  if (!hash) return ''
  if (hash.length <= head + tail + 1) return hash
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`
}
