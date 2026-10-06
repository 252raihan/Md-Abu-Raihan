import { validateRequirementsJson } from '../utils/validator'

/**
 * requirements.json loading service.
 *
 * Everything happens through the browser FileReader API - the file is never
 * sent anywhere. This module owns the "file in, validated data out" contract so
 * that App.jsx only has to deal with the result.
 */

/** Reads a File/Blob as text using FileReader. */
export const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'))
    reader.readAsText(file, 'utf-8')
  })

/** Reads a File/Blob as an ArrayBuffer (used later for PDF parsing). */
export const readFileAsArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'))
    reader.readAsArrayBuffer(file)
  })

/**
 * Full load pipeline: read -> parse -> validate -> sort.
 *
 * @param {File} file the selected requirements.json
 * @returns {Promise<{ ok: boolean, tender?, requirements?, errors?, sourceName? }>}
 */
export const loadRequirementsFile = async (file) => {
  let text
  try {
    text = await readFileAsText(file)
  } catch (readError) {
    return {
      ok: false,
      errors: [{ code: 'FILE_READ', params: { message: readError?.message } }],
      sourceName: file?.name,
    }
  }

  const result = validateRequirementsJson(text)
  return { ...result, sourceName: file?.name }
}

/** Quick guard used by the file input and drop zone. */
export const isJsonFile = (file) => {
  if (!file) return false
  const name = String(file.name ?? '').toLowerCase()
  return name.endsWith('.json') || file.type === 'application/json'
}
