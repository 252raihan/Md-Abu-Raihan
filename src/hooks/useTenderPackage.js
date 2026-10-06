import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, STATUS } from '../utils/constants'
import { createTranslator, getDocumentTitle } from '../utils/i18n'
import {
  getBlockingRequirements,
  resolveRequirementStatuses,
  summariseRequirements,
} from '../utils/statusEngine'
import { isJsonFile, loadRequirementsFile } from '../services/requirementsService'
import { validatePdfBatch } from '../services/uploadService'
import { buildUploadRecords } from '../services/pdfService'

const LANGUAGE_STORAGE_KEY = 'tenderpack.language'

const readStoredLanguage = () => {
  try {
    const stored = globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY)
    return SUPPORTED_LANGUAGES.includes(stored) ? stored : DEFAULT_LANGUAGE
  } catch {
    // Private mode / disabled storage: silently fall back.
    return DEFAULT_LANGUAGE
  }
}

/**
 * Central application state.
 *
 * One hook owns every piece of shared state so components stay presentational:
 *
 *   tender            - validated tender metadata (or null)
 *   requirements      - sorted requirement list, each with a resolved status
 *   uploadedFiles     - PDF upload records (hash + duplicate flags)
 *   language          - 'en' | 'bn'
 *   validationErrors  - translated loader errors (or the batch upload warnings)
 *   isGenerating      - reserved for the packaging build
 */
export const useTenderPackage = () => {
  const [tender, setTender] = useState(null)
  const [requirements, setRequirements] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [language, setLanguage] = useState(readStoredLanguage)
  const [validationErrors, setValidationErrors] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false)
  const [uploadWarnings, setUploadWarnings] = useState([])
  const [sourceFileName, setSourceFileName] = useState(null)

  // Keep the chosen language in sync with the document/root element so the
  // Bangla font stack and screen readers both pick it up.
  useEffect(() => {
    try {
      globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch {
      // Ignore storage failures.
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  const t = useMemo(() => createTranslator(language), [language])

  /** Requirements with their status resolved against the current uploads. */
  const requirementsWithStatus = useMemo(
    () => resolveRequirementStatuses(requirements),
    [requirements],
  )

  const summary = useMemo(
    () => summariseRequirements(requirementsWithStatus),
    [requirementsWithStatus],
  )

  const blockingRequirements = useMemo(
    () => getBlockingRequirements(requirementsWithStatus),
    [requirementsWithStatus],
  )

  const hasRequirements = Boolean(tender) && requirementsWithStatus.length > 0

  // The Generate button stays disabled until every blocking issue is resolved.
  const canGenerate = hasRequirements && blockingRequirements.length === 0 && !isGenerating

  const loadRequirements = useCallback(async (file) => {
    if (!file) return { ok: false, errors: [] }

    if (!isJsonFile(file)) {
      setValidationErrors([{ code: 'INVALID_JSON', params: {}, fallback: 'Expected a .json file' }])
      return { ok: false, errors: [] }
    }

    setIsLoadingRequirements(true)
    try {
      const result = await loadRequirementsFile(file)

      if (!result.ok) {
        setValidationErrors(result.errors ?? [])
        return result
      }

      setTender(result.tender)
      setRequirements(result.requirements ?? [])
      setSourceFileName(result.sourceName ?? file.name)
      setValidationErrors([])
      // A new requirements file invalidates any previous matching.
      setUploadedFiles([])
      setUploadWarnings([])
      return result
    } finally {
      setIsLoadingRequirements(false)
    }
  }, [])

  const clearRequirements = useCallback(() => {
    setTender(null)
    setRequirements([])
    setValidationErrors([])
    setSourceFileName(null)
    setUploadedFiles([])
    setUploadWarnings([])
  }, [])

  /** Adds validated PDFs to the tray. The batch is validated before any read. */
  const addPdfFiles = useCallback(
    async (fileList) => {
      const incoming = Array.from(fileList ?? [])
      if (incoming.length === 0) return []

      // Validate against the number already in the tray, then read the accepted
      // files. Reading is the slow part, so it happens once, outside setState.
      const batch = validatePdfBatch(incoming, uploadedFiles.length)
      const records = await buildUploadRecords(batch.accepted, uploadedFiles)

      if (records.length > 0) {
        setUploadedFiles((current) => [...current, ...records])
      }

      setUploadWarnings(batch.rejected.map((entry) => entry.message))
      return records
    },
    [uploadedFiles],
  )

  const removeUploadedFile = useCallback((id) => {
    setUploadedFiles((current) => current.filter((entry) => entry.id !== id))
  }, [])

  const clearUploadedFiles = useCallback(() => {
    setUploadedFiles([])
    setUploadWarnings([])
  }, [])

  /** Translated display title for a requirement in the active language. */
  const getTitle = useCallback(
    (requirement) => getDocumentTitle(requirement, language),
    [language],
  )

  const statusCounts = useMemo(() => {
    const counts = {
      [STATUS.OK]: 0,
      [STATUS.MISSING]: 0,
      [STATUS.EXPIRY_NEEDED]: 0,
      [STATUS.EXPIRED]: 0,
      [STATUS.NOT_PROVIDED]: 0,
    }
    for (const requirement of requirementsWithStatus) {
      if (requirement.status) counts[requirement.status] += 1
    }
    return counts
  }, [requirementsWithStatus])

  return {
    // state
    tender,
    requirements: requirementsWithStatus,
    uploadedFiles,
    language,
    validationErrors,
    isGenerating,
    isLoadingRequirements,
    uploadWarnings,
    sourceFileName,

    // derived
    t,
    summary,
    statusCounts,
    blockingRequirements,
    hasRequirements,
    canGenerate,

    // actions
    setLanguage,
    setIsGenerating,
    loadRequirements,
    clearRequirements,
    addPdfFiles,
    removeUploadedFile,
    clearUploadedFiles,
    getTitle,
  }
}

export default useTenderPackage
