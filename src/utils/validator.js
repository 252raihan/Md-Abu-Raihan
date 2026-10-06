import {
  MAX_ERRORS_SHOWN,
  REQUIRED_REQUIREMENT_FIELDS,
  REQUIRED_TENDER_FIELDS,
  VALIDATION_ERROR,
} from './constants'

/**
 * requirements.json validator.
 *
 * Returns a result object rather than throwing, so the UI can render a list of
 * friendly, translated problems instead of a stack trace.
 *
 *   { ok: true, tender, requirements }
 *   { ok: false, errors: [{ code, params, fallback }] }
 */

const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== ''

const error = (code, params) => ({ code, params })

/** Validates the `tender` object. Appends translated-ready errors. */
const validateTender = (tender, errors) => {
  if (tender === undefined || tender === null) {
    errors.push(error(VALIDATION_ERROR.MISSING_TENDER))
    return null
  }

  if (!isPlainObject(tender)) {
    errors.push(error(VALIDATION_ERROR.TENDER_NOT_OBJECT))
    return null
  }

  for (const field of REQUIRED_TENDER_FIELDS) {
    if (!isNonEmptyString(tender[field])) {
      errors.push(error(VALIDATION_ERROR.MISSING_TENDER_FIELD, { field }))
    }
  }

  // A deadline that cannot be parsed would break the countdown and the
  // ordering checks later, so reject it up front.
  if (isNonEmptyString(tender.submission_deadline)) {
    const raw = tender.submission_deadline.trim()
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/
    const parsed = new Date(dateOnly.test(raw) ? `${raw}T00:00:00` : raw)
    if (Number.isNaN(parsed.getTime())) {
      errors.push(error(VALIDATION_ERROR.INVALID_DEADLINE))
    }
  }

  return tender
}

/**
 * Validates a single requirement entry.
 * @returns the normalised requirement, or null when it is unusable.
 */
const validateRequirement = (raw, index, errors, seenIds, seenOrders) => {
  const position = index + 1

  if (!isPlainObject(raw)) {
    errors.push(error(VALIDATION_ERROR.REQUIREMENT_NOT_OBJECT, { index: position }))
    return null
  }

  const label = isNonEmptyString(raw.id) ? raw.id : `#${position}`
  const hasField = (field) =>
    Object.prototype.hasOwnProperty.call(raw, field) && raw[field] !== undefined && raw[field] !== null

  // Readable conditional: without the required fields there is nothing usable.
  const fallbackRequiredField = 'id'
  let missingField = null
  for (const field of REQUIRED_REQUIREMENT_FIELDS) {
    if (!hasField(field)) {
      missingField = field
      break
    }
  }

  if (missingField) {
    errors.push(
      error(VALIDATION_ERROR.REQUIREMENT_MISSING_FIELD, { id: label, field: missingField }),
    )
    return null
  }

  // --- type checks -----------------------------------------------------
  if (!isNonEmptyString(raw.id)) {
    errors.push(
      error(VALIDATION_ERROR.REQUIREMENT_INVALID_FIELD, {
        id: label,
        field: 'id',
        expected: 'a non-empty string',
      }),
    )
    return null
  }

  if (!isNonEmptyString(raw.title_en) && !isNonEmptyString(raw.title_bn)) {
    errors.push(
      error(VALIDATION_ERROR.REQUIREMENT_INVALID_FIELD, {
        id: label,
        field: 'title_en',
        expected: 'a non-empty string (title_bn may be used as an alternative)',
      }),
    )
    return null
  }

  const order = Number(raw.order)
  if (!Number.isFinite(order)) {
    errors.push(
      error(VALIDATION_ERROR.REQUIREMENT_INVALID_FIELD, {
        id: label,
        field: 'order',
        expected: 'a number',
      }),
    )
    return null
  }

  if (typeof raw.mandatory !== 'boolean') {
    errors.push(
      error(VALIDATION_ERROR.REQUIREMENT_INVALID_FIELD, {
        id: label,
        field: 'mandatory',
        expected: 'true or false',
      }),
    )
    return null
  }

  if (typeof raw.has_expiry !== 'boolean') {
    errors.push(
      error(VALIDATION_ERROR.REQUIREMENT_INVALID_FIELD, {
        id: label,
        field: 'has_expiry',
        expected: 'true or false',
      }),
    )
    return null
  }

  // --- uniqueness ------------------------------------------------------
  if (seenIds.has(raw.id)) {
    errors.push(error(VALIDATION_ERROR.DUPLICATE_REQUIREMENT_ID, { id: raw.id }))
    return null
  }
  seenIds.add(raw.id)

  if (seenOrders.has(order)) {
    errors.push(error(VALIDATION_ERROR.DUPLICATE_REQUIREMENT_ORDER, { order }))
    return null
  }
  seenOrders.add(order)

  // Normalised requirement. `matchedFileId`, `expiryDate` and `status` are
  // populated by later builds; they start empty here on purpose.
  return {
    id: raw.id.trim(),
    order,
    title_en: isNonEmptyString(raw.title_en) ? raw.title_en.trim() : '',
    title_bn: isNonEmptyString(raw.title_bn) ? raw.title_bn.trim() : '',
    mandatory: raw.mandatory,
    has_expiry: raw.has_expiry,
    matchedFileId: null,
    expiryDate: null,
    status: null,
    // Preserved verbatim so nothing from the source file is silently lost.
    notes: isNonEmptyString(raw.notes) ? raw.notes.trim() : undefined,
  }
}

/**
 * Parses and validates raw JSON text.
 * @param {string} text raw file contents
 */
export const validateRequirementsJson = (text) => {
  const errors = []

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch (parseError) {
    return {
      ok: false,
      errors: [
        error(VALIDATION_ERROR.INVALID_JSON, {
          message: parseError?.message ?? '',
        }),
      ],
    }
  }

  if (!isPlainObject(parsed)) {
    return { ok: false, errors: [error(VALIDATION_ERROR.ROOT_NOT_OBJECT)] }
  }

  const tender = validateTender(parsed.tender, errors)

  let requirements = null
  if (parsed.requirements === undefined || parsed.requirements === null) {
    errors.push(error(VALIDATION_ERROR.MISSING_REQUIREMENTS))
  } else if (!Array.isArray(parsed.requirements)) {
    errors.push(error(VALIDATION_ERROR.REQUIREMENTS_NOT_ARRAY))
  } else if (parsed.requirements.length === 0) {
    errors.push(error(VALIDATION_ERROR.EMPTY_REQUIREMENTS))
  } else {
    const seenIds = new Set()
    const seenOrders = new Set()
    requirements = parsed.requirements
      .map((raw, index) => validateRequirement(raw, index, errors, seenIds, seenOrders))
      .filter(Boolean)

    // Stable order by the declared submission order. Ties are impossible
    // (duplicate orders are rejected above) but the id keeps it deterministic.
    requirements.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors.slice(0, MAX_ERRORS_SHOWN), totalErrors: errors.length }
  }

  return { ok: true, tender, requirements }
}

export { isPlainObject, isNonEmptyString }
