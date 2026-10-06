import { UPLOAD_LIMITS } from '../utils/constants'
import { formatBytes } from '../utils/formatters'

/**
 * Upload validation.
 *
 * Pure functions only - the browser File objects are inspected but never read
 * here, so this module stays trivially testable.
 */

const isPdf = (file) => {
  const name = String(file?.name ?? '').toLowerCase()
  return UPLOAD_LIMITS.ACCEPTED_MIME_TYPES.includes(file?.type) || name.endsWith('.pdf')
}

/**
 * Validates a single candidate file.
 * @returns {{ ok: true } | { ok: false, reason: 'type'|'size'|'empty', message: string }}
 */
export const validatePdfFile = (file) => {
  if (!file) {
    return { ok: false, reason: 'type', message: 'No file provided.' }
  }

  if (!isPdf(file)) {
    return { ok: false, reason: 'type', message: `${file.name} is not a PDF file.` }
  }

  if (file.size === 0) {
    return { ok: false, reason: 'empty', message: `${file.name} is empty.` }
  }

  if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES) {
    const actual = formatBytes(file.size)
    const limit = formatBytes(UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES)
    return {
      ok: false,
      reason: 'size',
      message: `${file.name} is ${actual} - the limit is ${limit} per file.`,
    }
  }

  return { ok: true }
}

/**
 * Validates a whole batch against the per-run file cap.
 *
 * @param {File[]} incoming
 * @param {number} alreadyCount number of files already in the tray
 * @returns {{ accepted: File[], rejected: Array<{ name: string, message: string }> }}
 */
export const validatePdfBatch = (incoming = [], alreadyCount = 0) => {
  const accepted = []
  const rejected = []
  let slots = UPLOAD_LIMITS.MAX_FILES - alreadyCount

  for (const file of incoming) {
    if (slots <= 0) {
      rejected.push({
        name: file?.name ?? 'unknown',
        message: `The maximum of ${UPLOAD_LIMITS.MAX_FILES} files has been reached.`,
      })
      continue
    }

    const result = validatePdfFile(file)
    if (result.ok) {
      accepted.push(file)
      slots -= 1
    } else {
      rejected.push({ name: file?.name ?? 'unknown', message: result.message })
    }
  }

  return { accepted, rejected }
}

/** Total bytes of a list of upload records. */
export const sumFileSizes = (uploads = []) =>
  uploads.reduce((total, entry) => total + (entry?.file?.size ?? 0), 0)
