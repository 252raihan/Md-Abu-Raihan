import { AlertTriangle, CheckCircle2, FileOutput, Loader2 } from 'lucide-react'
import Card, { CardFooter, CardBody } from './Card'
import { cn } from '../utils/cn'

/**
 * Generate Package action bar.
 *
 * Build 1 deliberately keeps this disabled: nothing matches files to
 * requirements yet, so every mandatory document is still blocking. The button
 * is wired to the real `canGenerate` flag from the status engine rather than
 * hard-coded to `disabled`, so it starts working as soon as matching lands.
 */
export const GenerateBar = ({
  canGenerate,
  generateNow,
  blockingCount,
  summary,
  uploadedCount,
  isGenerating,
  t,
}) => {
  const blocked = blockingCount > 0

  return (
    <Card className="sticky bottom-6">
      <CardBody className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
              blocked
                ? 'bg-amber-50 text-amber-600 ring-amber-200'
                : 'bg-emerald-50 text-emerald-600 ring-emerald-200',
            )}
          >
            {blocked ? (
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            )}
          </span>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{t('generateTitle')}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {/* Why the button is unavailable is always explained - never a dead
                  end. This is the required "resolve all blocking issues" hint. */}
              {blocked
                ? t('generateHint')
                : t('generateReadyNote', {
                  documents: summary.ok,
                  files: uploadedCount,
                })}
            </p>
            {blocked ? (
              <p className="mt-1 text-xs font-medium text-amber-700">
                {t('generateBlockedCount', { count: blockingCount })}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={generateNow}
          disabled={!canGenerate}
          aria-disabled={!canGenerate}
          title={!canGenerate ? t('generateHint') : t('generateAction')}
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
            canGenerate
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'cursor-not-allowed bg-slate-200 text-slate-500',
          )}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <FileOutput className="h-4 w-4" aria-hidden="true" />
          )}
          {isGenerating ? t('generating') : t('generatePackage')}
        </button>
      </CardBody>

      {blocked ? (
        <CardFooter className="bg-slate-50/80">
          <p className="text-xs text-slate-500">{t('generateHint')}</p>
        </CardFooter>
      ) : null}
    </Card>
  )
}

export default GenerateBar
