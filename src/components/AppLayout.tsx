import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { usePreferences } from '../hooks/usePreferences'
import { signOut } from '../services/authService'

export function AppLayout() {
  const navigate = useNavigate()
  const { language, setLanguage, setTheme, t, theme } = usePreferences()

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
    navigate('/auth', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-slate-900 dark:bg-[#0b1020] dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 p-4 md:p-6">
        <aside className="panel hidden w-72 flex-col justify-between p-6 lg:flex">
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
            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <button type="button" className="btn-secondary w-full" onClick={() => void handleSignOut()}>
            {t('layout.signOut')}
          </button>
        </aside>

        <main className="flex-1 space-y-6">
          <div className="panel flex items-center justify-between gap-4 p-5 lg:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                AERA
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{t('layout.mobileTitle')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="input w-auto min-w-0 px-3 py-2"
                value={language}
                onChange={(event) => setLanguage(event.target.value as 'en' | 'es')}
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
              <select
                className="input w-auto min-w-0 px-3 py-2"
                value={theme}
                onChange={(event) => setTheme(event.target.value as 'light' | 'dark')}
              >
                <option value="light">{t('layout.themeLight')}</option>
                <option value="dark">{t('layout.themeDark')}</option>
              </select>
              <button type="button" className="btn-secondary" onClick={() => void handleSignOut()}>
                {t('layout.signOut')}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
