import { UPLOAD_LIMITS } from '../utils/constants'
import { sha256Hex, shortenHash, isWebCryptoAvailable } from '../utils/hash'
import { readFileAsArrayBuffer } from './requirementsService'

/**
 * PDF intake service.
 *
 * Build 1 records each uploaded file and computes its SHA-256 fingerprint so
 * duplicates can be flagged immediately. Full page-count extraction with
 * pdfjs-dist, text extraction and matching to requirements arrive in the next
 * build - `buildUploadRecord` already returns the `pages` and `matchedFileId`
 * shaped fields those features will fill in, so nothing here is throwaway.
 */

/** Collision-resistant enough for a local session. */
const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`

/**
 * Builds the canonical upload record stored in application state.
 *
 * @param {File} file
 * @param {Set<string>} existingHashes hashes already present in the tray
 * @returns {Promise<object>} upload record
 */
export const buildUploadRecord = async (file, existingHashes = new Set()) => {
  const buffer = await readFileAsArrayBuffer(file)

  let hash = ''
  let hashError = null
  if (isWebCryptoAvailable()) {
    try {
      hash = await sha256Hex(buffer)
    } catch (error) {
      hashError = error?.message ?? 'Hashing failed'
    }
  } else {
    hashError = 'Web Crypto API unavailable'
  }

  return {
    id: createId(),
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    // Populated in the next build once pdfjs-dist reads the document.
    pages: null,
    hash,
    hashError,
    shortHash: shortenHash(hash, 10, 6),
    // A duplicate is a file whose bytes we have already seen in this session.
    isDuplicate: Boolean(hash) && existingHashes.has(hash),
    // Set by the matching stage in the next build.
    matchedRequirementId: null,
    addedAt: new Date().toISOString(),
    error: null,
  }
}

/**
 * Processes a validated batch of PDF files, tagging duplicates within the batch
 * as well as against files already in the tray.
 *
 * @param {File[]} files
 * @param {Array<{ hash: string }>} existingUploads
 */
export const buildUploadRecords = async (files = [], existingUploads = []) => {
  const hashes = new Set(existingUploads.map((entry) => entry.hash).filter(Boolean))
  const records = []

  for (const file of files) {
    try {
      const record = await buildUploadRecord(file, hashes)
      if (record.hash) hashes.add(record.hash)
      records.push(record)
    } catch (error) {
      records.push({
        id: createId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        pages: null,
        hash: '',
        hashError: error?.message ?? 'Could not read file',
        shortHash: '',
        isDuplicate: false,
        matchedRequirementId: null,
        addedAt: new Date().toISOString(),
        error: error?.message ?? 'Could not read file',
      })
    }
  }

  return records
}

/** Human readable summary of the configured upload limits. */
export const describeUploadLimits = ({ maxFiles, maxSizePerFile } = {}) => ({
  maxFiles: maxFiles ?? UPLOAD_LIMITS.MAX_FILES,
  maxSizePerFile: maxSizePerFile ?? UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES,
})

export { createId }
