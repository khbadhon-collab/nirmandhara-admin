import { useState } from 'react'
import logo from '/logo.jpg'

const NAV = [
  { label: 'Dashboard', icon: 'fa-house-user', page: 'dashboard' },
  { section: 'CRM Section' },
  {
    label: 'CRM', icon: 'fa-right-left', children: [
      { label: 'Client', icon: 'fa-user-tag', children: [
        { label: 'Add Client', page: 'client-add' },
        { label: 'List', page: 'client-list' },
      ]},
      { label: 'Todays Call', icon: 'fa-bell', page: 'today-call' },
      { label: 'Overdue Call', icon: 'fa-bell-slash', page: 'overdue-call' },
      { label: 'Upcoming Call', icon: 'fa-arrow-right', page: 'upcoming-call' },
      { label: 'Client Visit Date', icon: 'fa-calendar', page: 'visit-date' },
      { label: 'Client Status', icon: 'fa-shopping-basket', page: 'client-status' },
      { label: 'Client Category', icon: 'fa-list', page: 'client-category' },
      { label: 'Area', icon: 'fa-map-marker-alt', page: 'area' },
      { label: 'SQFT', icon: 'fa-square', page: 'sqft' },
      { label: 'Reference', icon: 'fa-window-restore', page: 'reference' },
    ]
  },
  {
    label: 'Design & Execution', icon: 'fa-cubes', children: [
      { label: 'Execution', icon: 'fa-shopping-basket', page: 'execution' },
      { label: 'Design', icon: 'fa-shopping-basket', page: 'design-list' },
    ]
  },
  { section: 'Project Section' },
  {
    label: 'Procurement', icon: 'fa-cubes', children: [
      { label: 'Design Invoice', icon: 'fa-cubes', children: [
        { label: 'Add', page: 'design-sell-add' },
        { label: 'List', page: 'design-sell-list' },
      ]},
      { label: 'B.O.Q/Qoutation', icon: 'fa-thumbtack', children: [
        { label: 'Add B.O.Q', page: 'boq-add' },
        { label: 'B.O.Q List', page: 'boq-list' },
      ]},
      { label: 'Working List', icon: 'fa-thumbtack', children: [
        { label: 'List', page: 'working-list' },
      ]},
      { label: 'Estimated Budget', icon: 'fa-cart-shopping', children: [
        { label: 'Add', page: 'budget-add' },
        { label: 'List', page: 'budget-list' },
      ]},
      { label: 'Product', icon: 'fa-compress', children: [
        { label: 'Unit', icon: 'fa-list-ol', page: 'unit-list' },
        { label: 'Category', icon: 'fa-expand', page: 'category-list' },
        { label: 'B.O.Q Items', icon: 'fa-box', children: [
          { label: 'Add', page: 'product-add' },
          { label: 'List', page: 'product-list' },
        ]},
      ]},
    ]
  },
  { label: 'Vendor', icon: 'fa-person', children: [
    { label: 'List', page: 'vendor-list' },
  ]},
  { label: 'Contractor', icon: 'fa-money-bill-wave', children: [
    { label: 'Contractor List', page: 'contractor-list' },
    { label: 'Category', page: 'contractor-category' },
    { label: 'Items', page: 'contractor-items' },
    { label: 'Contract List', page: 'contract-list' },
  ]},
  { label: 'Project', icon: 'fa-city', children: [
    { label: 'Project', icon: 'fa-city', children: [
      { label: 'Add Project', page: 'project-add' },
      { label: 'Project List', page: 'project-list' },
    ]},
    { label: 'Requisition', icon: 'fa-thumbtack', children: [
      { label: 'Add', page: 'requisition-add' },
      { label: 'List', page: 'requisition-list' },
      { label: 'Category', page: 'requisition-category' },
      { label: 'Product', page: 'requisition-product' },
    ]},
    { label: 'Purchase', icon: 'fa-cart-shopping', children: [
      { label: 'Direct Purchase', page: 'direct-purchase' },
      { label: 'Add(Requisition)', page: 'purchase-add' },
      { label: 'List', page: 'purchase-list' },
    ]},
    { label: 'Convynce Allowanse', icon: 'fa-car', children: [
      { label: 'Add', page: 'conveyance-add' },
      { label: 'List', page: 'conveyance-list' },
    ]},
    { label: 'Labor', icon: 'fa-user-nurse', children: [
      { label: 'List', page: 'labor-list' },
    ]},
  ]},
  { label: 'Task Module', icon: 'fa-right-left', children: [
    { label: 'Task Status', icon: 'fa-list-check', page: 'task-status' },
    { label: 'Task Type', icon: 'fa-bars-progress', page: 'task-type' },
    { label: 'Task Assign', icon: 'fa-right-left', children: [
      { label: 'Task Assign', page: 'task-assign' },
    ]},
  ]},
  { label: 'Employee Task', icon: 'fa-right-left', children: [
    { label: 'List', page: 'emp-task-list' },
  ]},
  { section: 'Accounts Section' },
  { label: 'Accounts', icon: 'fa-credit-card', children: [
    { label: 'Accountant Budget', icon: 'fa-users', page: 'accountant-budget' },
    { label: 'Employee Salary', icon: 'fa-users', page: 'emp-salary-pay' },
    { label: 'Receivable', icon: 'fa-user-nurse', children: [
      { label: 'Payment Collection', page: 'payment-collection' },
      { label: 'Design Sell', page: 'design-sell-payment' },
      { label: 'Design Due', page: 'design-due' },
    ]},
    { label: 'Payable', icon: 'fa-user-nurse', children: [
      { label: 'Vendor', page: 'vendor-payable' },
      { label: 'Contractor', page: 'contractor-payable' },
      { label: 'Conveyance Allowance', page: 'conveyance-payable' },
    ]},
    { label: 'Account Setting', icon: 'fa-user-nurse', children: [
      { label: 'Payment Method', page: 'payment-method' },
      { label: 'Account', page: 'account-list' },
      { label: 'Balance Transfer', page: 'balance-transfer' },
    ]},
    { label: 'Payment History', icon: 'fa-user-nurse', children: [
      { label: 'Client Payment', page: 'payment-history-client' },
      { label: 'Vendor Payment', page: 'payment-history-vendor' },
      { label: 'Contractor Payment', page: 'payment-history-contractor' },
      { label: 'Convynce Payment', page: 'payment-history-conveyance' },
      { label: 'Design Sell', page: 'payment-history-design' },
    ]},
  ]},
  { label: 'Office Management', icon: 'fa-bars-progress', children: [
    { label: 'Expense Head', icon: 'fa-right-left', children: [
      { label: 'Head', page: 'expense-head' },
      { label: 'Sub Head', page: 'expense-subhead' },
    ]},
    { label: 'Office Expense', icon: 'fa-right-left', children: [
      { label: 'Add', page: 'expense-add' },
      { label: 'List', page: 'expense-list' },
    ]},
  ]},
  { section: 'HRM Section' },
  { label: 'Employee', icon: 'fa-users', children: [
    { label: 'List', page: 'employee-list' },
  ]},
  { label: 'Advance/Bonus', icon: 'fa-users', children: [
    { label: 'Advance/Loan', page: 'advance-list' },
    { label: 'Bonus', page: 'bonus-list' },
  ]},
  { label: 'Employee Salary', icon: 'fa-credit-card', children: [
    { label: 'Add Salary', page: 'salary-add' },
    { label: 'View Employee Salary', page: 'salary-list' },
    { label: 'Salary Sheet', page: 'salary-sheet' },
  ]},
  { section: 'Client Section' },
  { label: 'Project', icon: 'fa-right-left', children: [
    { label: 'List', icon: 'fa-list', page: 'client-project-list' },
  ]},
  { section: 'Cash Book' },
  { label: 'Cash Book', icon: 'fa-file', page: 'cashbook' },
  { section: 'Report Section' },
  { label: 'CRM Report', icon: 'fa-equals', children: [
    { label: 'Client Report', icon: 'fa-file-alt', page: 'report-client' },
    { label: 'Employee Report', icon: 'fa-file-alt', page: 'report-employee' },
  ]},
  { label: 'All Report', icon: 'fa-right-left', children: [
    { label: 'Head Wise Office Expense', icon: 'fa-file', page: 'report-head-expense' },
    { label: 'Employee Wise Convience', icon: 'fa-file', page: 'report-conveyance' },
    { label: 'Architect Wise Report', icon: 'fa-file', page: 'report-architect' },
    { label: 'Project Wise Report', icon: 'fa-file', page: 'report-project' },
    { label: 'Contractor Wise Report', icon: 'fa-file', page: 'report-contractor' },
    { label: 'Accountant Wise All Expense', icon: 'fa-file', page: 'report-accountant' },
    { label: 'Employee Wise All Report', icon: 'fa-file', page: 'report-emp-all' },
    { label: 'Project Wise Product Purchase', icon: 'fa-file', page: 'report-project-purchase' },
    { label: 'Client Wise Payment Report', icon: 'fa-file-lines', page: 'report-client-payment' },
    { label: 'Vendor Wise Payment Report', icon: 'fa-file', page: 'report-vendor' },
    { label: 'Category Wise Report', icon: 'fa-file', page: 'report-category' },
    { label: 'Estimated Budget Report', icon: 'fa-file', page: 'report-budget' },
    { label: 'Profit Report', icon: 'fa-file', page: 'report-profit' },
    { label: 'VAT Report', icon: 'fa-file', page: 'report-vat' },
    { label: 'Employee Daily Task Report', icon: 'fa-file', page: 'report-task' },
    { label: 'Employee Salary Report', icon: 'fa-file', page: 'report-salary' },
    { label: 'Method Wise Report', icon: 'fa-file', page: 'report-method' },
  ]},
  { section: 'Settings Section' },
  { label: 'Settings', icon: 'fa-ellipsis-vertical', children: [
    { label: 'Business', icon: 'fa-landmark', page: 'business' },
    { label: 'RBAC', icon: 'fa-user-secret', children: [
      { label: 'Role List', page: 'role-list' },
      { label: 'Permission List', page: 'permission-list' },
    ]},
    { label: 'SMS Portal', icon: 'fa-envelope', page: 'sms-portal' },
    { label: 'Setting', icon: 'fa-cogs', page: 'settings' },
  ]},
]

function NavItem({ item, currentPage, onNavigate, depth = 0 }) {
  const [open, setOpen] = useState(false)

  if (item.section) {
    return <div className="section-label">{item.section}</div>
  }

  if (!item.children) {
    return (
      <li className="nav-item">
        <button
          className={`nav-item-link ${currentPage === item.page ? 'active' : ''}`}
          onClick={() => item.page && onNavigate(item.page)}
        >
          {item.icon && <i className={`fas ${item.icon} nav-icon`}></i>}
          <span className="nav-text">{item.label}</span>
        </button>
      </li>
    )
  }

  return (
    <li className="nav-item">
      <button className={`nav-item-link ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        {item.icon && <i className={`fas ${item.icon} nav-icon`}></i>}
        <span className="nav-text">{item.label}</span>
        <i className="fas fa-chevron-right nav-chevron"></i>
      </button>
      <ul className={`nav-submenu ${open ? 'show' : ''}`}>
        {item.children.map((child, i) => (
          <NavItem key={i} item={child} currentPage={currentPage} onNavigate={onNavigate} depth={depth + 1} />
        ))}
      </ul>
    </li>
  )
}

export default function Sidebar({ currentPage, onNavigate, collapsed, searchQuery, onSearchChange }) {
  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sb-logo">
        <img src={logo} alt="Nirman Dhara" />
        <span className="sb-logo-text">Nirman Dhara</span>
      </div>
      <div className="sb-search">
        <input
          type="search"
          placeholder="Search Menu Item"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <nav className="sb-nav">
        <ul style={{ listStyle: 'none', paddingBottom: 20 }}>
          {NAV.filter(item => {
            if (!searchQuery) return true
            const q = searchQuery.toLowerCase()
            if (item.section) return false
            return JSON.stringify(item).toLowerCase().includes(q)
          }).map((item, i) => (
            <NavItem key={i} item={item} currentPage={currentPage} onNavigate={onNavigate} />
          ))}
        </ul>
      </nav>
    </nav>
  )
}
