import { Building2, CalendarClock, FileText, Hash, UserRound } from 'lucide-react'
import Card, { CardHeader, CardBody } from './Card'
import { formatDeadline, formatDeadlineRelative } from '../utils/formatters'

/**
 * Read-only summary of the tender metadata from requirements.json.
 */
const Field = ({ icon: Icon, label, value, hint }) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200 ring-inset">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-words text-slate-900">{value}</dd>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  </div>
)

export const TenderInfo = ({ tender, language, t }) => {
  if (!tender) return null

  const deadline = formatDeadline(tender.submission_deadline, language)
  const relative = formatDeadlineRelative(tender.submission_deadline, language)

  return (
    <Card>
      <CardHeader title={t('tenderInfoTitle')} description={t('tenderInfoDescription')} />

      <CardBody>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
          <Field
            icon={Hash}
            label={t('tenderId')}
            value={tender.tender_id}
          />
          <Field
            icon={FileText}
            label={t('tenderTitle')}
            value={tender.title}
          />
          <Field
            icon={Building2}
            label={t('procuringEntity')}
            value={tender.procuring_entity}
          />
          <Field
            icon={UserRound}
            label={t('bidder')}
            value={tender.bidder}
          />
          <Field
            icon={CalendarClock}
            label={t('submissionDeadline')}
            value={deadline}
            hint={relative}
          />
        </dl>
      </CardBody>
    </Card>
  )
}

export default TenderInfo
