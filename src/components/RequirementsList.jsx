import { AlertTriangle, ClipboardList } from 'lucide-react'
import Card, { CardHeader, CardBody } from './Card'
import { StatusBadge, RequirementBadge, Pill } from './StatusBadge'
import { STATUS } from '../utils/constants'
import { cn } from '../utils/cn'

/**
 * Requirements checklist, always rendered in `order` sequence.
 *
 * Status wording/colour is delegated to StatusBadge so this component only
 * decides layout.
 */

const RequirementRow = ({ requirement, title, t, index }) => {
  const blocking = requirement.status === STATUS.MISSING || requirement.status === STATUS.EXPIRED
  const attention = requirement.status === STATUS.EXPIRY_NEEDED

  return (
    <li
      className={cn(
        'flex flex-wrap items-start gap-4 rounded-xl border px-4 py-3.5 transition-colors',
        blocking
          ? 'border-rose-100 bg-rose-50/40'
          : attention
            ? 'border-amber-100 bg-amber-50/40'
            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/60',
      )}
    >
      {/* Order badge */}
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold',
          blocking
            ? 'bg-rose-100 text-rose-700'
            : 'bg-slate-100 text-slate-600',
        )}
        aria-hidden="true"
      >
        {requirement.order ?? index + 1}
      </span>

      {/* Title + attributes */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <span className="text-[11px] font-medium text-slate-400">{requirement.id}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <RequirementBadge mandatory={requirement.mandatory} t={t} />
          <Pill tone={requirement.has_expiry ? 'warning' : 'neutral'}>
            {requirement.has_expiry ? t('expiryRequired') : t('expiryNotRequired')}
          </Pill>
        </div>
      </div>

      {/* Status */}
      <div className="flex shrink-0 items-center pt-1">
        <StatusBadge status={requirement.status} t={t} />
      </div>
    </li>
  )
}

export const RequirementsList = ({ requirements, getTitle, summary, t }) => {
  if (!requirements?.length) return null

  const mandatoryCount = requirements.filter((item) => item.mandatory).length
  const optionalCount = requirements.length - mandatoryCount
  const blockingCount = summary?.blocking ?? 0

  return (
    <Card>
      <CardHeader
        icon={ClipboardList}
        title={t('requirementsTitle')}
        description={t('requirementsDescription')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="info">
              {t('totalLabel')}: {requirements.length}
            </Pill>
            <Pill tone="neutral">
              {t('mandatory')}: {mandatoryCount}
            </Pill>
            <Pill tone="neutral">
              {t('optional')}: {optionalCount}
            </Pill>
          </div>
        }
      />

      <CardBody className="space-y-3">
        {blockingCount > 0 ? (
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200 ring-inset">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
            <p>{t('blockingNotice')}</p>
          </div>
        ) : (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-200 ring-inset">
            {t('noBlockingNotice')}
          </div>
        )}

        <ul className="space-y-2.5">
          {requirements.map((requirement, index) => (
            <RequirementRow
              key={requirement.id}
              requirement={requirement}
              index={index}
              title={getTitle(requirement)}
              t={t}
            />
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}

export default RequirementsList
