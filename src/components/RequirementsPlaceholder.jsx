import { FileUp } from 'lucide-react'
import Card, { CardHeader, CardBody } from './Card'

/**
 * Empty-state for the requirements checklist, shown before a JSON is loaded.
 */
export const RequirementsPlaceholder = ({ t }) => (
  <Card>
    <CardHeader title={t('requirementsTitle')} description={t('requirementsEmptyHint')} />
    <CardBody>
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
        <FileUp className="h-8 w-8 text-slate-300" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-slate-600">{t('requirementsEmptyTitle')}</p>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">
          {t('requirementsEmptyBody')}
        </p>
      </div>
    </CardBody>
  </Card>
)

export default RequirementsPlaceholder
