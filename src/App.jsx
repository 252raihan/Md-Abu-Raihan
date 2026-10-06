import { useCallback, useState } from 'react'
import { AlertCircle, Info, ShieldCheck } from 'lucide-react'
import Header from './components/Header.jsx'
import LoadRequirements from './components/LoadRequirements.jsx'
import TenderInfo from './components/TenderInfo.jsx'
import RequirementsList from './components/RequirementsList.jsx'
import RequirementsPlaceholder from './components/RequirementsPlaceholder.jsx'
import UploadSection from './components/UploadSection.jsx'
import SummaryPanel from './components/SummaryPanel.jsx'
import GenerateBar from './components/GenerateBar.jsx'
import { useTenderPackage } from './hooks/useTenderPackage'
import { translateValidationError } from './utils/i18n'

/**
 * Application shell.
 *
 * This component owns layout and error presentation only. All state and
 * business rules live in `useTenderPackage`, the services and the status
 * engine - nothing here decides what a status means.
 */
export const App = () => {
  const app = useTenderPackage()
  const {
    tender,
    requirements,
    uploadedFiles,
    language,
    validationErrors,
    isGenerating,
    isLoadingRequirements,
    uploadWarnings,
    t,
    summary,
    statusCounts,
    blockingRequirements,
    hasRequirements,
    canGenerate,
    setLanguage,
    setIsGenerating,
    loadRequirements,
    clearRequirements,
    addPdfFiles,
    removeUploadedFile,
    clearUploadedFiles,
    getTitle,
  } = app

  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // The loader shows one friendly message; the validator can return many.
  const loaderError =
    validationErrors.length > 0
      ? translateValidationError(validationErrors[0], language)
      : null

  const handleReset = useCallback(() => {
    clearRequirements()
    setShowResetConfirm(false)
  }, [clearRequirements])

  // Build 1 stops here: generation is intentionally not implemented yet, and
  // the button stays disabled until every blocking issue is resolved.
  const handleGenerate = useCallback(() => {
    if (!canGenerate) return
    setIsGenerating(true)
    globalThis.setTimeout(() => setIsGenerating(false), 0)
  }, [canGenerate, setIsGenerating])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onReset={() => setShowResetConfirm(true)}
        canReset={hasRequirements || uploadedFiles.length > 0}
        t={t}
      />

      <main className="mx-auto max-w-screen-2xl px-6 py-8">
        {/* Page intro ------------------------------------------------- */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t('pageHeading')}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
            {t('pageSubtitle')}
          </p>
        </div>

        {/* Privacy assurance ------------------------------------------ */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-4">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 ring-1 ring-emerald-200 ring-inset">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-900">{t('privacyTitle')}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-emerald-800">
              {t('privacyBody')}
            </p>
          </div>
        </div>

        {/* Validation error summary ----------------------------------- */}
        {loaderError ? (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-rose-900">{t('loadFailed')}</p>
                <ul className="mt-1.5 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={`${error.code}-${index}`} className="text-xs text-rose-800">
                      {translateValidationError(error, language)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {/* Upload batch warnings -------------------------------------- */}
        {uploadWarnings.length > 0 ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
              <ul className="min-w-0 space-y-1">
                {uploadWarnings.map((warning, index) => (
                  <li key={index} className="text-xs text-amber-900">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {/* Primary grid ----------------------------------------------- */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left column: the workflow ------------------------------- */}
          <div className="space-y-6 xl:col-span-2">
            <LoadRequirements
              onLoad={loadRequirements}
              error={loaderError}
              isLoading={isLoadingRequirements}
              t={t}
            />

            <TenderInfo tender={tender} language={language} t={t} />

            {hasRequirements ? (
              <RequirementsList
                requirements={requirements}
                getTitle={getTitle}
                summary={summary}
                t={t}
              />
            ) : (
              <RequirementsPlaceholder t={t} />
            )}

            <UploadSection
              uploadedFiles={uploadedFiles}
              onAddFiles={addPdfFiles}
              onRemove={removeUploadedFile}
              onClearAll={clearUploadedFiles}
              t={t}
            />
          </div>

          {/* Right column: summary + action -------------------------- */}
          <div className="space-y-6">
            <SummaryPanel summary={summary} statusCounts={statusCounts} t={t} />

            <GenerateBar
              canGenerate={canGenerate}
              generateNow={handleGenerate}
              blockingCount={blockingRequirements.length}
              summary={summary}
              uploadedCount={uploadedFiles.length}
              isGenerating={isGenerating}
              t={t}
            />
          </div>
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-6 pb-4">
          <p className="text-xs text-slate-400">{t('footerNote')}</p>
        </footer>
      </main>

      {/* Reset confirmation ------------------------------------------ */}
      {showResetConfirm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2
              id="reset-dialog-title"
              className="text-base font-semibold tracking-tight text-slate-900"
            >
              {t('resetConfirmTitle')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {t('resetConfirmBody')}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
              >
                {t('reset')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
