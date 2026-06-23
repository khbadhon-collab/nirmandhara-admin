import { useState } from 'react'
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
  const [page, setPage] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { toasts, toast } = useToast()

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
      default: return <ComingSoon title={page.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} {...props} />
    }
  }

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
