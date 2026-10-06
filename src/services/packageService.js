import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { readFileAsArrayBuffer } from './requirementsService'
import { formatDate } from '../utils/formatters'

/**
 * Package generation service.
 *
 * Combines the matched PDFs into one submission file, entirely in the browser:
 *
 *   1. a cover page in English (tender metadata + included documents, in order)
 *   2. an optional index page listing the start page of each document
 *   3. every matched document, in `order`, all pages preserved
 *   4. a footer on every page: "<tender_id> | Page X of Y"
 *
 * Nothing here touches the network, and the original uploads are never modified.
 */

/** A4 at 72 dpi, the pdf-lib default unit. */
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN_X = 56
const MARGIN_TOP = 64
const MARGIN_BOTTOM = 56

/** Footer geometry - reserved band so footer text never overlaps content. */
const FOOTER_BAND_HEIGHT = 34
const FOOTER_FONT_SIZE = 9

const INK = rgb(0.09, 0.11, 0.15)
const MUTED = rgb(0.42, 0.45, 0.5)
const RULE = rgb(0.85, 0.87, 0.9)
const ACCENT = rgb(0.31, 0.27, 0.9)

/**
 * pdf-lib's WinAnsi encoding cannot represent Bengali glyphs. Text drawn with a
 * standard font must therefore be transliterated-safe: we filter out anything
 * outside the encodable range rather than letting `drawText` throw.
 */
const sanitiseForStandardFont = (value) =>
  String(value ?? '')
    // Bengali block and other non-Latin marks are dropped with a readable stand-in.
    .replace(/[\u0980-\u09FF]+/g, (match) => `[${match.length} Bengali chars]`)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022]/g, '-')
    // Final guard: keep only code points WinAnsi can encode.
    .replace(/[^\u0000-\u00FF]/g, '')

/** Wraps text into lines that fit `maxWidth`, preserving whole words. */
const wrapText = (text, font, size, maxWidth) => {
  const safe = sanitiseForStandardFont(text)
  const words = safe.split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate
    } else {
      if (current) lines.push(current)
      // A single word longer than the line is hard-split so it cannot overflow.
      if (font.widthOfTextAtSize(word, size) > maxWidth) {
        let chunk = ''
        for (const char of word) {
          const next = chunk + char
          if (font.widthOfTextAtSize(next, size) <= maxWidth) chunk = next
          else {
            lines.push(chunk)
            chunk = char
          }
        }
        current = chunk
      } else {
        current = word
      }
    }
  }

  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

/**
 * Builds the ordered list of documents that will actually enter the package.
 * Optional documents with no matched file are skipped, exactly as required.
 *
 * @returns {Array<{ requirement, upload }>}
 */
export const buildIncludedDocuments = (requirements = [], uploadedFiles = []) => {
  const byId = new Map(uploadedFiles.map((entry) => [entry.id, entry]))

  return requirements
    .filter((requirement) => Boolean(requirement.matchedFileId))
    .map((requirement) => ({
      requirement,
      upload: byId.get(requirement.matchedFileId) ?? null,
    }))
    .filter((entry) => Boolean(entry.upload))
    // The `order` field decides placement; ties fall back to the id.
    .sort((a, b) => (a.requirement.order ?? 0) - (b.requirement.order ?? 0))
}

/**
 * Draws the progress footer inside a reserved band at the bottom of a page, so
 * it can never cover the document content above it.
 */
const drawFooter = (page, font, text, pageWidth) => {
  const y = FOOTER_BAND_HEIGHT / 2 - 2

  page.drawLine({
    start: { x: MARGIN_X, y: FOOTER_BAND_HEIGHT },
    end: { x: pageWidth - MARGIN_X, y: FOOTER_BAND_HEIGHT },
    thickness: 0.5,
    color: RULE,
  })

  const size = FOOTER_FONT_SIZE
  const width = font.widthOfTextAtSize(text, size)
  page.drawText(text, {
    x: (pageWidth - width) / 2,
    y,
    size,
    font,
    color: MUTED,
  })
}

/**
 * Draws the English cover page.
 * @returns {Promise<number>} number of pages added (always 1)
 */
const drawCoverPage = async (doc, { tender, included, generatedAt, bold, regular }) => {
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const contentWidth = PAGE_WIDTH - MARGIN_X * 2
  let y = PAGE_HEIGHT - MARGIN_TOP

  const line = (height) => {
    y -= height
  }

  // --- Title -------------------------------------------------------------
  page.drawText('TENDER DOCUMENT PACKAGE', {
    x: MARGIN_X,
    y: y - 16,
    size: 20,
    font: bold,
    color: INK,
  })
  line(46)

  page.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: PAGE_WIDTH - MARGIN_X, y },
    thickness: 1.5,
    color: ACCENT,
  })
  line(34)

  // --- Tender metadata ---------------------------------------------------
  const rows = [
    ['Tender ID', tender?.tender_id],
    ['Tender Title', tender?.title],
    ['Procuring Entity', tender?.procuring_entity],
    ['Bidder', tender?.bidder],
    ['Submission Deadline', tender?.submission_deadline],
    ['Package Generated On', generatedAt],
  ]

  for (const [label, value] of rows) {
    page.drawText(`${label}`, {
      x: MARGIN_X,
      y,
      size: 9,
      font: bold,
      color: MUTED,
    })
    line(14)

    const valueLines = wrapText(value || '-', regular, 12, contentWidth)
    for (const valueLine of valueLines) {
      page.drawText(valueLine, { x: MARGIN_X, y, size: 12, font: regular, color: INK })
      line(16)
    }
    line(8)
  }

  line(10)

  // --- Included documents, in order --------------------------------------
  page.drawText('DOCUMENTS INCLUDED IN THIS PACKAGE', {
    x: MARGIN_X,
    y,
    size: 10,
    font: bold,
    color: MUTED,
  })
  line(20)

  if (included.length === 0) {
    page.drawText('No documents matched.', { x: MARGIN_X, y, size: 11, font: regular, color: INK })
    line(18)
  }

  for (const { requirement } of included) {
    // Keep the list on the cover page; stop before the footer band.
    if (y < MARGIN_BOTTOM + FOOTER_BAND_HEIGHT + 20) break

    const orderLabel = String(requirement.order ?? '').padStart(2, '0')
    const title = requirement.title_en || requirement.title_bn || requirement.id

    page.drawText(`${orderLabel}.`, {
      x: MARGIN_X,
      y,
      size: 11,
      font: bold,
      color: INK,
    })

    const titleLines = wrapText(title, regular, 11, contentWidth - 30)
    for (const titleLine of titleLines) {
      page.drawText(titleLine, { x: MARGIN_X + 26, y, size: 11, font: regular, color: INK })
      line(14)
    }
    line(6)
  }

  return 1
}

/**
 * Draws the optional index page (bonus task) listing the first page of each
 * document inside the finished package.
 */
const drawIndexPage = async (doc, { included, startPages, bold, regular }) => {
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const contentWidth = PAGE_WIDTH - MARGIN_X * 2
  let y = PAGE_HEIGHT - MARGIN_TOP

  const line = (height) => {
    y -= height
  }

  page.drawText('INDEX', { x: MARGIN_X, y: y - 14, size: 18, font: bold, color: INK })
  line(40)

  page.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: PAGE_WIDTH - MARGIN_X, y },
    thickness: 1,
    color: RULE,
  })
  line(24)

  page.drawText('Order', { x: MARGIN_X, y, size: 9, font: bold, color: MUTED })
  page.drawText('Document', { x: MARGIN_X + 50, y, size: 9, font: bold, color: MUTED })
  const pageHeaderX = PAGE_WIDTH - MARGIN_X - 46
  page.drawText('Page', { x: pageHeaderX, y, size: 9, font: bold, color: MUTED })
  line(20)

  for (const { requirement, upload } of included) {
    if (y < MARGIN_BOTTOM + FOOTER_BAND_HEIGHT + 20) break

    const orderLabel = String(requirement.order ?? '').padStart(2, '0')
    page.drawText(orderLabel, { x: MARGIN_X, y, size: 11, font: regular, color: MUTED })

    const title = requirement.title_en || requirement.title_bn || requirement.id
    const titleLines = wrapText(title, regular, 11, contentWidth - 100)
    page.drawText(titleLines[0], {
      x: MARGIN_X + 50,
      y,
      size: 11,
      font: regular,
      color: INK,
    })

    const startPage = startPages.get(requirement.id)
    const pageLabel = startPage ? String(startPage) : '-'
    page.drawText(pageLabel, { x: pageHeaderX, y, size: 11, font: bold, color: INK })

    line(16)
    if (upload?.pages) {
      page.drawText(`${upload.pages} page(s)`, {
        x: MARGIN_X + 50,
        y,
        size: 9,
        font: regular,
        color: MUTED,
      })
      line(14)
    }
    line(4)
  }

  return 1
}

/**
 * Generates the complete package PDF.
 *
 * @param {object} options
 * @param {object} options.tender validated tender metadata
 * @param {Array}  options.requirements requirements carrying matchedFileId
 * @param {Array}  options.uploadedFiles upload records (with the original File)
 * @param {boolean} [options.includeIndex] add the index page after the cover
 * @param {(stage: string, progress: number) => void} [options.onProgress]
 * @returns {Promise<{ ok: true, bytes: Uint8Array, pageCount: number, includedCount: number }
 *                  | { ok: false, error: string, failedFile?: string }>}
 */
export const generatePackage = async ({
  tender,
  requirements = [],
  uploadedFiles = [],
  includeIndex = false,
  onProgress,
}) => {
  const included = buildIncludedDocuments(requirements, uploadedFiles)

  if (!tender) {
    return { ok: false, error: 'No tender data loaded.' }
  }
  if (included.length === 0) {
    return { ok: false, error: 'No documents are matched to the package.' }
  }

  const report = (stage, progress) => onProgress?.(stage, progress)

  try {
    report('cover', 0.05)

    const out = await PDFDocument.create()
    const regular = await out.embedFont(StandardFonts.Helvetica)
    const bold = await out.embedFont(StandardFonts.HelveticaBold)

    // Generated date: prefer the local date in the YYYY-MM-DD shape used by the
    // tender data so the cover reads consistently.
    const now = new Date()
    const generatedAt = `${String(now.getDate()).padStart(2, '0')} ${formatDate(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate(),
      ).padStart(2, '0')}`,
      'en',
    ).text}`

    // The index needs to know where each document starts, which is only known
    // after copying - so track page starts and fill the index in a second pass.
    const startPages = new Map()

    // --- Documents ---------------------------------------------------------
    // Copied first into a working document so we learn the real page offsets
    // before the cover and index pages are prepended.
    const body = await PDFDocument.create()

    for (let index = 0; index < included.length; index += 1) {
      const { requirement, upload } = included[index]
      report('documents', 0.1 + (index / included.length) * 0.7)

      let buffer
      try {
        buffer = await readFileAsArrayBuffer(upload.file)
      } catch (error) {
        return {
          ok: false,
          error: `Could not read "${upload.name}": ${error?.message ?? 'unknown error'}`,
          failedFile: upload.name,
        }
      }

      let source
      try {
        source = await PDFDocument.load(buffer, { ignoreEncryption: false })
      } catch (error) {
        return {
          ok: false,
          error: `"${upload.name}" could not be merged (${upload.errorCode ?? 'damaged'}).`,
          failedFile: upload.name,
        }
      }

      const copied = await body.copyPages(source, source.getPageIndices())
      // Record where this document starts, relative to the body.
      startPages.set(requirement.id, body.getPageCount() + 1)
      copied.forEach((page) => body.addPage(page))
    }

    // --- Assemble: cover, optional index, then the body --------------------
    report('assembling', 0.85)

    const coverCount = await drawCoverPage(out, {
      tender,
      included,
      generatedAt,
      bold,
      regular,
    })

    let indexCount = 0
    if (includeIndex) {
      // Shift the recorded start pages by the pages that precede the body.
      const offset = coverCount + 1 // +1 for the index page itself
      const shifted = new Map(
        Array.from(startPages.entries()).map(([id, page]) => [id, page + offset]),
      )
      indexCount = await drawIndexPage(out, {
        included,
        startPages: shifted,
        bold,
        regular,
      })
    }

    const bodyPages = await out.copyPages(body, body.getPageIndices())
    bodyPages.forEach((page) => out.addPage(page))

    // --- Footers on every page --------------------------------------------
    report('footers', 0.92)

    const totalPages = out.getPageCount()
    const pages = out.getPages()
    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index]
      const { width } = page.getSize()
      // "T-2026-0417 | Page 3 of 24"
      const label = `${sanitiseForStandardFont(tender.tender_id)} | Page ${index + 1} of ${totalPages}`
      drawFooter(page, regular, label, width)
    }

    report('saving', 0.97)
    const bytes = await out.save()

    return {
      ok: true,
      bytes,
      pageCount: totalPages,
      includedCount: included.length,
    }
  } catch (error) {
    return { ok: false, error: error?.message ?? 'Package generation failed.' }
  }
}

/**
 * Triggers a browser download for the generated package.
 * The file never leaves the machine.
 */
export const downloadPackage = (bytes, fileName) => {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  // Release the object URL once the download has been handed to the browser.
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/** The required output name: <tender_id>_Package.pdf */
export const buildPackageFileName = (tender) =>
  `${sanitiseForStandardFont(tender?.tender_id || 'Tender')}_Package.pdf`

/**
 * Exports the checklist as CSV (bonus task). Uses the document title for the
 * active language and escapes every field.
 */
export const buildChecklistCsv = ({ requirements = [], uploadedFiles = [], language = 'en' }) => {
  const byId = new Map(uploadedFiles.map((entry) => [entry.id, entry]))
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

  const header = ['Order', 'Document', 'Requirement', 'File name', 'Pages', 'Expiry date', 'Status']
  const rows = requirements.map((requirement) => {
    const upload = requirement.matchedFileId ? byId.get(requirement.matchedFileId) : null
    return [
      requirement.order,
      language === 'bn' ? requirement.title_bn || requirement.title_en : requirement.title_en,
      requirement.mandatory ? 'Mandatory' : 'Optional',
      upload?.name ?? '',
      upload?.pages ?? '',
      requirement.expiryDate ?? '',
      requirement.status ?? '',
    ]
  })

  return [header, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')
}

/** Downloads the CSV checklist. */
export const downloadChecklistCsv = (csv, tender) => {
  // A BOM keeps Bangla text readable when opened in Excel.
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${sanitiseForStandardFont(tender?.tender_id || 'Tender')}_Checklist.csv`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
