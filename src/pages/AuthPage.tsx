import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { usePreferences } from '../hooks/usePreferences'
import { signInWithPassword, signUpWithPassword } from '../services/authService'
import { useAuth } from '../hooks/useAuth'

export function AuthPage() {
  const { session } = useAuth()
  const { language, setLanguage, setTheme, t, theme } = usePreferences()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (session) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      if (mode === 'login') {
        await signInWithPassword(email, password)
      } else {
        await signUpWithPassword(email, password)
        setMessage(t('auth.created'))
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('auth.failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-4 dark:bg-[#0b1020] md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="max-w-lg space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              AERA
            </p>
            <h1 className="text-5xl font-semibold tracking-tight">
              {t('auth.heroTitle')}
            </h1>
            <p className="text-base text-slate-300">
              {t('auth.heroDescription')}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [t('auth.cardSalesTitle'), t('auth.cardSalesCopy')],
              [t('auth.cardPurchasesTitle'), t('auth.cardPurchasesCopy')],
              [t('auth.cardProfitTitle'), t('auth.cardProfitCopy')],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[28px] bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-2 text-sm text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="label">{t('layout.language')}</label>
                  <select
                    className="input"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value as 'en' | 'es')}
                  >
                    <option value="es">{t('layout.langSpanish')}</option>
                    <option value="en">{t('layout.langEnglish')}</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="label">{t('layout.theme')}</label>
                  <select
                    className="input"
                    value={theme}
                    onChange={(event) => setTheme(event.target.value as 'light' | 'dark')}
                  >
                    <option value="light">{t('layout.themeLight')}</option>
                    <option value="dark">{t('layout.themeDark')}</option>
                  </select>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  {t('auth.welcome')}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {t('auth.subtitle')}
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="label">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="label">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {message ? (
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-200">
                  {message}
                </div>
              ) : null}

              <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? t('auth.submitWait')
                  : mode === 'login'
                    ? t('auth.signIn')
                    : t('auth.createAccount')}
              </button>
            </form>

            <button
              type="button"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              onClick={() => {
                setMode((current) => (current === 'login' ? 'register' : 'login'))
                setMessage(null)
              }}
            >
              {mode === 'login' ? t('auth.needAccount') : t('auth.haveAccount')}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
