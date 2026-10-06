import { STATUS, STATUS_TONE } from '../utils/constants'
import { STATUS_LABEL_KEY, STATUS_SHORT_LABEL_KEY } from '../utils/i18n'
import { cn } from '../utils/cn'

/**
 * The single status badge used everywhere in the app.
 *
 * All colour decisions come from `STATUS_TONE`, all wording from the i18n
 * dictionary - so a new status only ever needs adding in constants + i18n.
 */

const TONE_CLASSES = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const TONE_DOT_CLASSES = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  neutral: 'bg-slate-400',
}

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-[11px] gap-1.5',
  md: 'px-2.5 py-1 text-xs gap-2',
}

export const StatusBadge = ({ status, t, size = 'sm', withDot = true, className = '' }) => {
  if (!status) return null

  const tone = STATUS_TONE[status] ?? 'neutral'
  const key = size === 'sm' ? STATUS_SHORT_LABEL_KEY[status] : STATUS_LABEL_KEY[status]
  const label = t ? t(key ?? 'statusShortNotProvided') : status

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium ring-1 ring-inset whitespace-nowrap',
        SIZE_CLASSES[size] ?? SIZE_CLASSES.sm,
        TONE_CLASSES[tone] ?? TONE_CLASSES.neutral,
        className,
      )}
    >
      {withDot ? (
        <span
          aria-hidden="true"
          className={cn('h-1.5 w-1.5 rounded-full', TONE_DOT_CLASSES[tone])}
        />
      ) : null}
      {label}
    </span>
  )
}

/** Small "Mandatory" / "Optional" pill - a different axis from status. */
export const RequirementBadge = ({ mandatory, t, className = '' }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap',
      mandatory
        ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
        : 'bg-slate-50 text-slate-600 ring-slate-200',
      className,
    )}
  >
    {mandatory ? t('mandatory') : t('optional')}
  </span>
)

/** Neutral metadata pill (used for expiry requirements, counts, etc.). */
export const Pill = ({ tone = 'neutral', children, className = '' }) => {
  const tones = {
    neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
    info: 'bg-sky-50 text-sky-700 ring-sky-200',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}

export { STATUS }
