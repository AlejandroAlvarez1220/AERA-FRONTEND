import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { usePreferences } from '../hooks/usePreferences'
import { signOut } from '../services/authService'

export function AppLayout() {
  const navigate = useNavigate()
  const { language, setLanguage, setTheme, t, theme } = usePreferences()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { label: t('nav.dashboard'), to: '/' },
    { label: t('nav.products'), to: '/products' },
    { label: t('nav.materials'), to: '/materials' },
    { label: t('nav.sales'), to: '/sales' },
    { label: t('nav.purchases'), to: '/purchases' },
    { label: t('nav.inventory'), to: '/inventory' },
  ]

  async function handleSignOut() {
    await signOut()
    setIsMenuOpen(false)
    navigate('/auth', { replace: true })
  }

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  const renderNavigation = (isMobile = false) => (
    <nav className="space-y-2">
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={() => setIsMenuOpen(false)}
          className={({ isActive }) =>
            `flex rounded-2xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
            } ${isMobile ? 'text-base' : ''}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-slate-900 dark:bg-[#0b1020] dark:text-slate-100">
      {isMenuOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden" onClick={() => setIsMenuOpen(false)} />
      ) : null}

      <aside
        className={`fixed inset-y-3 left-3 z-50 flex w-[min(84vw,320px)] flex-col justify-between rounded-[32px] border border-white/60 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)] transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_24px_60px_rgba(2,6,23,0.65)] lg:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-[110%]'
        }`}
      >
        <div className="space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                AERA
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {t('layout.brandTitle')}
              </h1>
            </div>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              aria-label={t('layout.closeMenu')}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative block h-4 w-4">
                <span className="absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                <span className="absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
              </span>
            </button>
          </div>

          <div className="grid gap-3">
            <div>
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
            <div>
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

          {renderNavigation(true)}
        </div>

        <button type="button" className="btn-secondary w-full" onClick={() => void handleSignOut()}>
          {t('layout.signOut')}
        </button>
      </aside>

      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 overflow-hidden p-4 md:p-6">
        <aside className="panel hidden w-72 shrink-0 flex-col justify-between p-6 lg:flex">
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                AERA
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {t('layout.brandTitle')}
              </h1>
            </div>
            <div className="grid gap-3">
              <div>
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
              <div>
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
            {renderNavigation()}
          </div>

          <button type="button" className="btn-secondary w-full" onClick={() => void handleSignOut()}>
            {t('layout.signOut')}
          </button>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <div className="panel flex items-center justify-between gap-4 p-4 sm:p-5 lg:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                AERA
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{t('layout.mobileTitle')}</p>
            </div>
            <button
              type="button"
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              aria-label={t('layout.openMenu')}
              onClick={() => setIsMenuOpen(true)}
            >
              <span className="relative block h-4 w-5">
                <span className="absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current" />
                <span className="absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-current" />
                <span className="absolute left-0 top-3 block h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>
          </div>

          <div className="space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
