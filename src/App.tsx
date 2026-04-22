import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PreferencesProvider } from './contexts/PreferencesContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProductsPage } from './pages/ProductsPage'
import { MaterialsPage } from './pages/MaterialsPage'
import { SalesPage } from './pages/SalesPage'
import { PurchasesPage } from './pages/PurchasesPage'
import { InventoryPage } from './pages/InventoryPage'
import { isSupabaseConfigured } from './services/supabaseClient'
import { usePreferences } from './hooks/usePreferences'

function ConfigurationPage() {
  const { t } = usePreferences()

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-4 md:p-6 dark:bg-[#0b1020]">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl items-center justify-center">
        <div className="panel w-full p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            {t('app.setup')}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {t('app.missingSupabase')}
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {t('app.missingSupabaseBody')}
          </p>
          <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <p className="font-semibold text-slate-900 dark:text-white">{t('app.createEnv')}</p>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-slate-900 p-4 text-slate-100 dark:bg-slate-800">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key`}
            </pre>
          </div>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            {t('app.restartVite')}
          </p>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  if (!isSupabaseConfigured) {
    return <ConfigurationPage />
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="materials" element={<MaterialsPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="inventory" element={<InventoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function App() {
  return (
    <PreferencesProvider>
      <AppContent />
      <Analytics />
    </PreferencesProvider>
  )
}

export default App
