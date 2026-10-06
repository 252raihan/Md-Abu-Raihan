import { UPLOAD_LIMITS } from '../utils/constants'
import { sha256Hex, shortenHash, isWebCryptoAvailable } from '../utils/hash'
import { readFileAsArrayBuffer } from './requirementsService'
import { normaliseFileName } from '../utils/formatters'

/**
 * PDF intake service - everything runs locally in the browser.
 *
 * Responsibilities:
 *  - read the raw bytes (FileReader)
 *  - fingerprint the bytes with Web Crypto, for duplicate detection
 *  - count pages and extract text with pdf.js
 *  - survive damaged / password-protected files instead of crashing
 *
 * pdf.js is imported lazily so the initial bundle stays small and its worker is
 * only fetched once a PDF is actually processed.
 */

let pdfjsPromise = null

/**
 * Loads pdf.js once and wires up its worker.
 *
 * `new URL(..., import.meta.url)` is understood by Vite: the worker is emitted
 * as a real asset and the URL is correct in dev and in a production build.
 */
const loadPdfJs = async () => {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString()
      return pdfjs
    })()
  }
  return pdfjsPromise
}

/** Collision-resistant enough for a local session. */
const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`

/**
 * Maps a pdf.js exception onto a stable, translatable error code.
 * @returns {'encrypted'|'damaged'|'empty'|'unknown'}
 */
const classifyPdfError = (error) => {
  const name = String(error?.name ?? '')
  const message = String(error?.message ?? '').toLowerCase()

  if (name === 'PasswordException' || message.includes('password')) return 'encrypted'
  if (name === 'InvalidPDFException' || message.includes('invalid pdf')) return 'damaged'
  if (message.includes('empty') || message.includes('no pdf')) return 'empty'
  return 'unknown'
}

/**
 * Counts the pages of a PDF and extracts the text of each page.
 *
 * The text is used for the auto-match suggestion and expiry hints only - it is
 * never transmitted anywhere.
 *
 * @param {ArrayBuffer} buffer
 * @returns {Promise<{ ok: true, pages: number, pageTexts: string[], text: string }
 *                  | { ok: false, errorCode: string, message: string }>}
 */
export const analysePdf = async (buffer) => {
  let pdfjs
  try {
    pdfjs = await loadPdfJs()
  } catch (error) {
    return { ok: false, errorCode: 'unknown', message: error?.message ?? 'pdf.js failed to load' }
  }

  // pdf.js takes ownership of the buffer it is given, so pass a copy: the caller
  // still needs the original for hashing and for embedding during generation.
  const data = new Uint8Array(buffer.slice(0))

  let doc = null
  try {
    const task = pdfjs.getDocument({ data, isEvalSupported: false, useSystemFonts: true })
    doc = await task.promise

    const pageTexts = []
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      try {
        const page = await doc.getPage(pageNumber)
        const content = await page.getTextContent()
        const text = content.items
          .map((item) => (typeof item?.str === 'string' ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
        pageTexts.push(text)
        page.cleanup()
      } catch {
        // One unreadable page should not fail the whole document.
        pageTexts.push('')
      }
    }

    return { ok: true, pages: doc.numPages, pageTexts, text: pageTexts.join('\n') }
  } catch (error) {
    return {
      ok: false,
      errorCode: classifyPdfError(error),
      message: error?.message ?? 'Could not read this PDF',
    }
  } finally {
    try {
      await doc?.destroy()
    } catch {
      // Ignore teardown failures.
    }
  }
}

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

  // --- pdf structure ----------------------------------------------------
  const analysis = await analysePdf(buffer)

  return {
    id: createId(),
    file,
    name: file.name,
    size: file.size,
    type: file.type,

    pages: analysis.ok ? analysis.pages : null,
    pageTexts: analysis.ok ? analysis.pageTexts : [],
    text: analysis.ok ? analysis.text : '',

    hash,
    hashError,
    shortHash: shortenHash(hash, 10, 6),

    // A duplicate is a file whose bytes we have already seen this session.
    isDuplicate: Boolean(hash) && existingHashes.has(hash),

    // Managed by the app when the user matches files to requirements.
    matchedRequirementId: null,
    expiryDate: null,

    addedAt: new Date().toISOString(),

    // Non-null when the PDF could not be read (encrypted / damaged).
    error: analysis.ok ? null : analysis.message,
    errorCode: analysis.ok ? null : analysis.errorCode,
    errorMessage: analysis.ok ? null : analysis.message,

    // File-name based suggestion, filled in by `suggestRequirementId`.
    suggestedRequirementId: null,
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
        pageTexts: [],
        text: '',
        hash: '',
        hashError: error?.message ?? 'Could not read file',
        shortHash: '',
        isDuplicate: false,
        matchedRequirementId: null,
        expiryDate: null,
        addedAt: new Date().toISOString(),
        error: error?.message ?? 'Could not read file',
        errorCode: 'unknown',
        errorMessage: error?.message ?? 'Could not read file',
        suggestedRequirementId: null,
      })
    }
  }

  return records
}

/**
 * Auto-match suggestion (bonus task).
 *
 * Scores each requirement against a file name and its extracted text using a
 * token-overlap rule. The result is only ever a *suggestion* - the user
 * confirms it and nothing is applied automatically.
 *
 * @returns {string|null} requirement id with the best score, or null
 */
export const suggestRequirementId = (upload, requirements = []) => {
  if (!upload || !requirements.length) return null

  const haystack = `${normaliseFileName(upload.name)} ${String(upload.text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 4000)}`

  let bestId = null
  let bestScore = 0

  for (const requirement of requirements) {
    const tokens = new Set(
      [requirement.title_en, requirement.title_bn]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length >= 4),
    )

    if (tokens.size === 0) continue

    let score = 0
    for (const token of tokens) {
      if (haystack.includes(token)) score += 1
    }

    // Normalise so a long title does not automatically win.
    const normalised = score / tokens.size
    if (normalised > bestScore) {
      bestScore = normalised
      bestId = requirement.id
    }
  }

  // Require reasonable confidence before suggesting anything.
  return bestScore >= 0.5 ? bestId : null
}

/** Human readable summary of the configured upload limits. */
export const describeUploadLimits = ({ maxFiles, maxSizePerFile } = {}) => ({
  maxFiles: maxFiles ?? UPLOAD_LIMITS.MAX_FILES,
  maxSizePerFile: maxSizePerFile ?? UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES,
})

export { createId }
