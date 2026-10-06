import { STATUS } from './constants'

/**
 * Status engine.
 *
 * Every status transition in the application goes through here. Components
 * never compute a status themselves - they render whatever this module returns.
 *
 * Build 1 only implements the "no files uploaded yet" baseline. The expiry
 * checks below are already wired so that later builds only need to populate
 * `matchedFileId` / `expiryDate` on a requirement and the correct status will
 * appear automatically.
 */

/**
 * Baseline status when a document has not been matched to an uploaded file.
 * mandatory -> Missing, optional -> Not provided.
 */
export const getBaselineStatus = (requirement) =>
  requirement?.mandatory ? STATUS.MISSING : STATUS.NOT_PROVIDED

/**
 * Normalises a possibly messy expiry value into a Date, or null.
 * Accepts "YYYY-MM-DD", "YYYY-MM-DDTHH:mm" and ISO date-time strings.
 */
export const parseExpiryDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  // Date-only strings: treat as end of that day so a doc expiring "today"
  // is still valid on the day itself.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/
  const parsed = new Date(dateOnly.test(trimmed) ? `${trimmed}T23:59:59` : trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** True when the given expiry date is in the past. */
export const isExpired = (value, now = new Date()) => {
  const parsed = parseExpiryDate(value)
  if (!parsed) return false
  return parsed.getTime() < now.getTime()
}

/**
 * Resolves the status for a single requirement.
 *
 * Rules (in priority order):
 *  1. No matched file            -> Missing (mandatory) / Not provided (optional)
 *  2. File matched, expiry needed and missing/expired -> Expiry date needed / Expired
 *  3. Otherwise                  -> OK
 */
export const resolveRequirementStatus = (requirement, now = new Date()) => {
  if (!requirement) return STATUS.MISSING

  const hasFile = Boolean(requirement.matchedFileId)

  if (!hasFile) return getBaselineStatus(requirement)

  if (requirement.has_expiry) {
    if (!requirement.expiryDate) return STATUS.EXPIRY_NEEDED
    if (isExpired(requirement.expiryDate, now)) return STATUS.EXPIRED
  }

  return STATUS.OK
}

/**
 * Applies the status engine across a requirement list and returns a new array.
 * Also exposes derived counts used by the dashboard summary.
 */
export const resolveRequirementStatuses = (requirements = [], now = new Date()) =>
  requirements.map((requirement) => ({
    ...requirement,
    status: resolveRequirementStatus(requirement, now),
  }))

/** Aggregate counters for the summary strip. */
export const summariseRequirements = (requirements = []) => {
  const summary = {
    total: requirements.length,
    mandatory: 0,
    optional: 0,
    ok: 0,
    blocking: 0,
    byStatus: {},
  }

  for (const requirement of requirements) {
    if (requirement.mandatory) summary.mandatory += 1
    else summary.optional += 1

    const status = requirement.status ?? getBaselineStatus(requirement)
    summary.byStatus[status] = (summary.byStatus[status] ?? 0) + 1

    if (status === STATUS.OK) summary.ok += 1
    else if (requirement.mandatory) summary.blocking += 1
  }

  return summary
}

/**
 * A package can only be generated when nothing blocking remains.
 * Always returns the list of offending requirements so the UI can explain why.
 */
export const getBlockingRequirements = (requirements = []) =>
  requirements.filter((requirement) => requirement.mandatory && requirement.status !== STATUS.OK)
