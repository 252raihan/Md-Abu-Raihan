import { cn } from '../utils/cn'

/**
 * Generic rounded card - the main layout primitive of the dashboard.
 */
export const Card = ({ children, className = '', as: Tag = 'section' }) => (
  <Tag
    className={cn(
      'rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50',
      className,
    )}
  >
    {children}
  </Tag>
)

export const CardHeader = ({ title, description, icon: Icon, actions, className = '' }) => (
  <div
    className={cn(
      'flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-6 py-5',
      className,
    )}
  >
    <div className="flex min-w-0 items-start gap-3">
      {Icon ? (
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 ring-inset">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
      ) : null}
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
        ) : null}
      </div>
    </div>
    {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
  </div>
)

export const CardBody = ({ children, className = '' }) => (
  <div className={cn('px-6 py-5', className)}>{children}</div>
)

export const CardFooter = ({ children, className = '' }) => (
  <div className={cn('border-t border-slate-100 px-6 py-4', className)}>{children}</div>
)

export default Card
