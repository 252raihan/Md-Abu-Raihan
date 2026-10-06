/**
 * Central application constants.
 *
 * All "magic values" live here so that business rules are defined once and
 * reused by components, services and validators.
 */

/** Package status vocabulary. This is the ONLY place statuses are defined. */
export const STATUS = Object.freeze({
  OK: 'OK',
  MISSING: 'MISSING',
  EXPIRY_NEEDED: 'EXPIRY_NEEDED',
  EXPIRED: 'EXPIRED',
  NOT_PROVIDED: 'NOT_PROVIDED',
})

/** Statuses that block package generation (mandatory documents not satisfied). */
export const BLOCKING_STATUSES = Object.freeze([
  STATUS.MISSING,
  STATUS.EXPIRY_NEEDED,
  STATUS.EXPIRED,
])

/** A status a document can never be "resolved" from into an acceptable state. */
export const isBlockingStatus = (status) => BLOCKING_STATUSES.includes(status)

/** UI badge tone per status. Keeps colour decisions out of components. */
export const STATUS_TONE = Object.freeze({
  [STATUS.OK]: 'success',
  [STATUS.MISSING]: 'danger',
  [STATUS.EXPIRY_NEEDED]: 'warning',
  [STATUS.EXPIRED]: 'danger',
  [STATUS.NOT_PROVIDED]: 'neutral',
})

/** Upload rules for the PDF upload section. */
export const UPLOAD_LIMITS = Object.freeze({
  MAX_FILES: 30,
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024, // 50 MB
  ACCEPTED_MIME_TYPES: ['application/pdf'],
  ACCEPT_ATTRIBUTE: 'application/pdf,.pdf',
})

export const SUPPORTED_LANGUAGES = Object.freeze(['en', 'bn'])

export const DEFAULT_LANGUAGE = 'en'

/** Stable keys used by the validation error system. */
export const VALIDATION_ERROR = Object.freeze({
  FILE_READ: 'FILE_READ',
  INVALID_JSON: 'INVALID_JSON',
  ROOT_NOT_OBJECT: 'ROOT_NOT_OBJECT',
  MISSING_TENDER: 'MISSING_TENDER',
  TENDER_NOT_OBJECT: 'TENDER_NOT_OBJECT',
  MISSING_TENDER_FIELD: 'MISSING_TENDER_FIELD',
  INVALID_DEADLINE: 'INVALID_DEADLINE',
  MISSING_REQUIREMENTS: 'MISSING_REQUIREMENTS',
  REQUIREMENTS_NOT_ARRAY: 'REQUIREMENTS_NOT_ARRAY',
  EMPTY_REQUIREMENTS: 'EMPTY_REQUIREMENTS',
  REQUIREMENT_NOT_OBJECT: 'REQUIREMENT_NOT_OBJECT',
  REQUIREMENT_MISSING_FIELD: 'REQUIREMENT_MISSING_FIELD',
  REQUIREMENT_INVALID_FIELD: 'REQUIREMENT_INVALID_FIELD',
  DUPLICATE_REQUIREMENT_ID: 'DUPLICATE_REQUIREMENT_ID',
  DUPLICATE_REQUIREMENT_ORDER: 'DUPLICATE_REQUIREMENT_ORDER',
})

/** Tender object fields that MUST be present in requirements.json. */
export const REQUIRED_TENDER_FIELDS = Object.freeze([
  'tender_id',
  'title',
  'procuring_entity',
  'bidder',
  'submission_deadline',
])

/** Requirement fields that MUST be present on every requirement entry. */
export const REQUIRED_REQUIREMENT_FIELDS = Object.freeze([
  'id',
  'order',
  'title_en',
  'title_bn',
  'mandatory',
  'has_expiry',
])

export const MAX_ERRORS_SHOWN = 8
