import { useCallback, useId, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  FileText,
  Files,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import Card, { CardHeader, CardBody } from './Card'
import { Pill } from './StatusBadge'
import { UPLOAD_LIMITS } from '../utils/constants'
import { formatBytes, truncateMiddle } from '../utils/formatters'
import { cn } from '../utils/cn'

/**
 * PDF upload section.
 *
 * Drop zone, Browse Files button and the rules (PDF only, max 30 files,
 * max 50 MB each). File records are created by the app; this component only
 * collects the File objects and renders what comes back.
 */

const UploadRow = ({ entry, t, onRemove }) => {
  const hasError = Boolean(entry.error)

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 hover:border-slate-200">
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
          hasError
            ? 'bg-rose-50 text-rose-500 ring-rose-100'
            : 'bg-slate-50 text-slate-500 ring-slate-200',
        )}
      >
        <FileText className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900" title={entry.name}>
          {truncateMiddle(entry.name, 56)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span>{formatBytes(entry.size)}</span>
          <span aria-hidden="true">·</span>
          <span>
            {entry.pages == null
              ? t('pagesPending')
              : t('pagesCount', { count: entry.pages })}
          </span>
          {entry.shortHash ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[10px] text-slate-400">{entry.shortHash}</span>
            </>
          ) : null}
        </div>
        {hasError ? <p className="mt-1 text-[11px] text-rose-600">{entry.error}</p> : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {entry.isDuplicate ? (
          <Pill tone="warning">
            <Copy className="h-3 w-3" aria-hidden="true" />
            {t('duplicateLabel')}
          </Pill>
        ) : (
          <Pill tone="success">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            {t('uniqueLabel')}
          </Pill>
        )}

        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          aria-label={`${t('remove')} ${entry.name}`}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  )
}

export const UploadSection = ({ uploadedFiles, onAddFiles, onRemove, onClearAll, t }) => {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputId = useId()

  const remaining = UPLOAD_LIMITS.MAX_FILES - uploadedFiles.length

  const handleFiles = useCallback(
    async (fileList) => {
      await onAddFiles(fileList)
      if (inputRef.current) inputRef.current.value = ''
    },
    [onAddFiles],
  )

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      setIsDragging(false)
      handleFiles(event.dataTransfer?.files)
    },
    [handleFiles],
  )

  return (
    <Card>
      <CardHeader
        icon={Files}
        title={t('uploadTitle')}
        description={t('uploadDescription')}
        actions={
          <>
            <Pill tone={remaining <= 0 ? 'warning' : 'neutral'}>
              {uploadedFiles.length} / {UPLOAD_LIMITS.MAX_FILES}
            </Pill>
            {uploadedFiles.length > 0 ? (
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                {t('clearAll')}
              </button>
            ) : null}
          </>
        }
      />

      <CardBody className="space-y-4">
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
            isDragging
              ? 'border-indigo-400 bg-indigo-50/60'
              : 'border-slate-200 bg-slate-50/60 hover:border-indigo-300',
          )}
        >
          <UploadCloud
            className={cn('h-8 w-8', isDragging ? 'text-indigo-500' : 'text-slate-400')}
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-slate-700">{t('uploadDropTitle')}</p>

          <label
            htmlFor={inputId}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            {t('uploadButton')}
          </label>

          <input
            ref={inputRef}
            id={inputId}
            type="file"
            multiple
            accept={UPLOAD_LIMITS.ACCEPT_ATTRIBUTE}
            className="sr-only"
            onChange={(event) => handleFiles(event.target.files)}
          />

          <p className="mt-3 text-xs text-slate-500">
            {t('uploadRules', {
              maxFiles: UPLOAD_LIMITS.MAX_FILES,
              maxSize: formatBytes(UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES),
            })}
          </p>
        </div>

        {uploadedFiles.length === 0 ? (
          <p className="text-center text-xs text-slate-400">{t('uploadEmptyState')}</p>
        ) : (
          <ul className="space-y-2">
            {uploadedFiles.map((entry) => (
              <UploadRow key={entry.id} entry={entry} t={t} onRemove={onRemove} />
            ))}
          </ul>
        )}

        <p className="flex items-start gap-1.5 text-xs text-slate-500">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          {t('uploadNextStepNote')}
        </p>
      </CardBody>
    </Card>
  )
}

export default UploadSection
