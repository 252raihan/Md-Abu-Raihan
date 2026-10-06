import { useCallback, useId, useRef, useState } from 'react'
import { FileJson, UploadCloud, AlertTriangle, CheckCircle2, FileUp } from 'lucide-react'
import Card, { CardBody } from './Card'
import { cn } from '../utils/cn'

/**
 * requirements.json loader.
 *
 * The file is read with FileReader, validated by the requirements service and
 * handed to the app as a plain object. No network access is involved.
 */

const SCHEMA_HINT = [
  '{',
  '  "tender": {',
  '    "tender_id": "T-2026-0417",',
  '    "title": "Supply of IT Equipment",',
  '    "procuring_entity": "Example Directorate",',
  '    "bidder": "Example Company Ltd.",',
  '    "submission_deadline": "2026-10-20"',
  '  },',
  '  "requirements": [',
  '    {',
  '      "id": "R01",',
  '      "order": 1,',
  '      "title_en": "Trade License",',
  '      "title_bn": "ট্রেড লাইসেন্স",',
  '      "mandatory": true,',
  '      "has_expiry": true',
  '    }',
  '  ]',
  '}',
]

export const LoadRequirements = ({ onLoad, error, isLoading, t }) => {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showSchema, setShowSchema] = useState(false)
  const inputId = useId()

  const handleFile = useCallback(
    async (file) => {
      if (!file) return
      await onLoad(file)
      if (inputRef.current) inputRef.current.value = ''
    },
    [onLoad],
  )

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      setIsDragging(false)
      handleFile(event.dataTransfer?.files?.[0])
    },
    [handleFile],
  )

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 ring-inset">
              <FileJson className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                {t('loadTitle')}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
                {t('loadDescription')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSchema((value) => !value)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            aria-expanded={showSchema}
          >
            {showSchema ? t('hideFormat') : t('showFormat')}
          </button>
        </div>

        {/* Drop zone ------------------------------------------------- */}
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            'mt-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
            isDragging
              ? 'border-indigo-400 bg-indigo-50/60'
              : 'border-slate-200 bg-slate-50/60 hover:border-indigo-300',
          )}
        >
          <UploadCloud
            className={cn('h-8 w-8', isDragging ? 'text-indigo-500' : 'text-slate-400')}
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-medium text-slate-700">{t('loadDropTitle')}</p>
          <p className="mt-1 text-xs text-slate-500">{t('loadDropHint')}</p>

          <label
            htmlFor={inputId}
            className={cn(
              'mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700',
              'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600',
              isLoading && 'pointer-events-none opacity-60',
            )}
          >
            <FileUp className="h-4 w-4" aria-hidden="true" />
            {isLoading ? t('loading') : t('loadButton')}
          </label>

          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </div>

        {/* Feedback -------------------------------------------------- */}
        {error ? (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200 ring-inset"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-medium">{t('loadFailed')}</p>
              <p className="mt-0.5 break-words text-rose-700">{error}</p>
            </div>
          </div>
        ) : null}

        {!error && !isLoading ? (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            {t('privacyNote')}
          </p>
        ) : null}

        {showSchema ? (
          <div className="mt-4 rounded-xl bg-slate-900 p-4">
            <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300">
              <code>{SCHEMA_HINT.join('\n')}</code>
            </pre>
          </div>
        ) : null}
      </CardBody>
    </Card>
  )
}

export default LoadRequirements
