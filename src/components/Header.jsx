import { useState } from 'react'

export default function Header({ onToggleSidebar, currentPage, notifCount = 0, onLogout }) {
  const [ddOpen, setDdOpen] = useState(false)

  const pageTitles = {
    dashboard: 'Dashboard',
    'client-list': 'Client List',
    'client-add': 'Add Client',
    'project-list': 'Project List',
    'project-add': 'Add Project',
    'boq-add': 'Add B.O.Q / Quotation',
    'boq-list': 'B.O.Q List',
    'design-sell-add': 'Add Design Invoice',
    'design-sell-list': 'Design Invoice List',
    'payment-collection': 'Payment Collection',
    'payment-history-client': 'Client Payment History',
    'employee-list': 'Employee List',
    'expense-list': 'Office Expense List',
    'expense-add': 'Add Expense',
    'vendor-list': 'Vendor List',
    'report-project': 'Project Wise Report',
    'report-client-payment': 'Client Wise Payment Report',
    cashbook: 'Cash Book',
  }

  return (
    <header className="page-header">
      <div className="header-left">
        <button className="btn-icon" onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <span className="page-title">{pageTitles[currentPage] || 'Admin Panel'}</span>
      </div>
      <div className="header-right">
        <div className="notif-wrap btn-icon">
          <i className="fas fa-bell"></i>
          <span className="notif-badge">{notifCount}</span>
        </div>
        <div className="user-menu">
          <button className="user-btn" onClick={() => setDdOpen(!ddOpen)}>
            <i className="fas fa-user" style={{ color: 'var(--accent)' }}></i>
            Admin
            <i className="fas fa-angle-down" style={{ opacity: .5, fontSize: 11 }}></i>
          </button>
          <div className={`user-dropdown ${ddOpen ? 'open' : ''}`}>
            <div className="dd-head">
              <h6>Admin</h6>
              <small>nirmandhara@gmail.com</small>
            </div>
            <a href="#"><span>Profile</span><i className="fas fa-user" style={{ opacity: .3 }}></i></a>
            <div className="dd-divider"></div>
            <a href="#"><span>Sign Out</span><i className="fas fa-sign-out-alt" style={{ opacity: .3 }}></i></a>
          </div>
        </div>
        <button className="btn-icon"><i className="fas fa-stream"></i></button>
      </div>
      <button onClick={onLogout} title="Logout" style={{marginLeft:12,padding:'7px 14px',background:'#fff',border:'1px solid #ddd',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600,color:'#c0392b'}}>Logout</button>
    </header>
  )
}
