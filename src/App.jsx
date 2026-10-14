import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import GenericCrud from './pages/GenericCrud'
import ClientViews from './pages/clients/ClientViews'
import { PAGE_CONFIGS, PAGE_ALIASES } from './pages/pageConfigs'
import FinanceReport from './pages/FinanceReport'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ToastContainer from './components/Toast'
import { useToast } from './hooks/useToast'
import Dashboard from './pages/Dashboard'
import ClientList from './pages/clients/ClientList'
import ProjectList from './pages/projects/ProjectList'
import BOQAdd from './pages/quotations/BOQAdd'
import BOQList from './pages/quotations/BOQList'
import PaymentCollection from './pages/payments/PaymentCollection'
import DesignSellList from './pages/payments/DesignSellList'
import EmployeeList from './pages/employees/EmployeeList'
import ComingSoon from './pages/ComingSoon'
import './index.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [page, setPage] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { toasts, toast } = useToast()

  useEffect(() => {
    // Detect password reset token in URL hash
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setIsPasswordReset(true)
      setAuthLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordReset(true)
        return
      }
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  function navigate(p) { setPage(p); setSearchQuery('') }

  const props = { onNavigate: navigate, toast }

  function renderPage() {
    switch (page) {
      case 'dashboard': return <Dashboard {...props} />
      case 'client-list':
      case 'client-add': return <ClientList {...props} />
      case 'project-list':
      case 'project-add': return <ProjectList {...props} />
      case 'boq-add': return <BOQAdd {...props} />
      case 'boq-list': return <BOQList {...props} />
      case 'payment-collection': return <PaymentCollection {...props} />
      case 'design-sell-list':
      case 'design-sell-add': return <DesignSellList {...props} />
      case 'employee-list': return <EmployeeList {...props} />
      case 'today-call':
      case 'overdue-call':
      case 'upcoming-call':
      case 'visit-date':
      case 'client-status':
      case 'client-category':
      case 'area':
      case 'sqft':
      case 'reference':
        return <ClientViews view={page} {...props} />
      case 'report-profit':
      case 'cashbook':
        return <FinanceReport {...props} />
      default: {
        const key = PAGE_ALIASES[page] || page
        switch (key) {
          case 'project-list': return <ProjectList {...props} />
          case 'design-sell-list': return <DesignSellList {...props} />
          case 'payment-collection': return <PaymentCollection {...props} />
          case 'boq-list': return <BOQList {...props} />
          case 'employee-list': return <EmployeeList {...props} />
          case 'client-status': return <ClientViews view="client-status" {...props} />
          default: break
        }
        if (PAGE_CONFIGS[key]) return <GenericCrud key={key} config={PAGE_CONFIGS[key]} {...props} />
        return <ComingSoon title={page.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} {...props} />
      }
    }
  }

  if (authLoading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#1a5c3a',fontWeight:700}}>Nirman Dhara</div>
  )
  if (isPasswordReset) return <ResetPassword onDone={() => { setIsPasswordReset(false); window.location.hash = '' }} />
  if (!user) return <Login onLogin={setUser} />

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={page}
        onNavigate={navigate}
        collapsed={collapsed}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className={`page-wrapper ${collapsed ? 'expanded' : ''}`}>
        <Header
          onToggleSidebar={() => setCollapsed(!collapsed)}
          currentPage={page}
          notifCount={3}
          onLogout={logout}
        />
        <main className="main-content">
          {renderPage()}
        </main>
        <footer className="page-footer">
          &copy; {new Date().getFullYear()} <a href="#">nirmandhara</a> — Design Your Dream. All rights reserved.
        </footer>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  )
}
