import { CheckCircle2, CircleSlash, Clock, FileWarning, MinusCircle } from 'lucide-react'
import Card, { CardHeader, CardBody } from './Card'
import { STATUS } from '../utils/constants'
import { cn } from '../utils/cn'

/**
 * Read-only tally of every status, driven by the central status engine.
 */

const TILES = [
  { status: STATUS.OK, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
  { status: STATUS.MISSING, icon: FileWarning, tone: 'text-rose-600 bg-rose-50' },
  { status: STATUS.EXPIRY_NEEDED, icon: Clock, tone: 'text-amber-600 bg-amber-50' },
  { status: STATUS.EXPIRED, icon: CircleSlash, tone: 'text-rose-600 bg-rose-50' },
  { status: STATUS.NOT_PROVIDED, icon: MinusCircle, tone: 'text-slate-500 bg-slate-100' },
]

export const SummaryPanel = ({ summary, statusCounts, t }) => (
  <Card>
    <CardHeader title={t('summaryTitle')} />
    <CardBody className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-center ring-1 ring-slate-200 ring-inset">
          <p className="text-lg font-semibold text-slate-900">{summary.total}</p>
          <p className="text-[11px] text-slate-500">{t('totalLabel')}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 px-3 py-2.5 text-center ring-1 ring-indigo-200 ring-inset">
          <p className="text-lg font-semibold text-indigo-700">{summary.mandatory}</p>
          <p className="text-[11px] text-indigo-600">{t('mandatory')}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-center ring-1 ring-slate-200 ring-inset">
          <p className="text-lg font-semibold text-slate-900">{summary.optional}</p>
          <p className="text-[11px] text-slate-500">{t('optional')}</p>
        </div>
      </div>

      <ul className="space-y-1.5">
        {TILES.map(({ status, icon: Icon, tone }) => (
          <li key={status} className="flex items-center justify-between gap-3 py-0.5">
            <span className="flex items-center gap-2">
              <span
                className={cn('flex h-6 w-6 items-center justify-center rounded-md', tone)}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="text-xs text-slate-600">{t(`statusLabel_${status}`)}</span>
            </span>
            <span className="text-xs font-semibold text-slate-900">{statusCounts[status] ?? 0}</span>
          </li>
        ))}
      </ul>

      <div
        className={cn(
          'rounded-xl px-3 py-2.5 ring-1 ring-inset',
          summary.blocking > 0
            ? 'bg-amber-50 text-amber-800 ring-amber-200'
            : 'bg-emerald-50 text-emerald-800 ring-emerald-200',
        )}
      >
        <p className="text-xs font-medium">
          {summary.blocking > 0
            ? t('summaryBlockingCount', { count: summary.blocking })
            : t('summaryAllClear')}
        </p>
      </div>
    </CardBody>
  </Card>
)

export default SummaryPanel
