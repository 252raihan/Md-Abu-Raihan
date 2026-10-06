import { ShieldCheck, FileStack, Globe, RotateCcw } from 'lucide-react'
import { cn } from '../utils/cn'

/**
 * Sticky application header: brand, privacy signal, language switcher.
 */

const LanguageSwitcher = ({ language, onChange, t }) => (
  <div
    className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 ring-1 ring-slate-200 ring-inset"
    role="group"
    aria-label={t('languageLabel')}
  >
    <Globe className="ml-1.5 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
    {[
      { code: 'en', label: t('langEnglish') },
      { code: 'bn', label: t('langBangla') },
    ].map((option) => {
      const active = language === option.code
      return (
        <button
          key={option.code}
          type="button"
          onClick={() => onChange(option.code)}
          aria-pressed={active}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
            active
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-800',
          )}
        >
          {option.label}
        </button>
      )
    })}
  </div>
)

export const Header = ({ language, onLanguageChange, onReset, canReset, t }) => (
  <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-6">
      {/* Brand -------------------------------------------------------- */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-sm">
          <FileStack className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
              {t('appName')}
            </span>
            <span className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-slate-200 ring-inset sm:inline">
              {t('buildLabel')}
            </span>
          </div>
          <p className="truncate text-xs text-slate-500">{t('appTagline')}</p>
        </div>
      </div>

      {/* Actions ------------------------------------------------------ */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 ring-inset lg:inline-flex">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {t('localBadge')}
        </span>

        {canReset ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            {t('reset')}
          </button>
        ) : null}

        <LanguageSwitcher language={language} onChange={onLanguageChange} t={t} />
      </div>
    </div>
  </header>
)

export default Header
