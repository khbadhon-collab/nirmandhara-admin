// Config-driven pages for GenericCrud. Every table/column here exists in Supabase.
const tk = (n) => '৳' + (parseFloat(n) || 0).toLocaleString()
const dt = (d) => d ? String(d).split('T')[0] : '-'

export const PAGE_CONFIGS = {
  // ───────── PRODUCTS / SETTINGS ─────────
  'unit-list': {
    title: 'Units', table: 'nd_units', icon: 'fa-list-ol', orderBy: 'name', orderAsc: true,
    columns: [{ key: 'name', label: 'Unit Name' }],
    fields: [{ key: 'name', label: 'Unit Name', required: true }],
  },
  'category-list': {
    title: 'Product Categories', table: 'nd_categories', icon: 'fa-expand', orderBy: 'name', orderAsc: true,
    columns: [{ key: 'name', label: 'Category Name' }],
    fields: [{ key: 'name', label: 'Category Name', required: true }],
  },
  'product-list': {
    title: 'B.O.Q Items (Products)', table: 'nd_products', icon: 'fa-box',
    select: '*, nd_categories(name), nd_units(name)', orderBy: 'name', orderAsc: true,
    columns: [
      { key: 'name', label: 'Product' },
      { key: 'cat', label: 'Category', render: r => r.nd_categories?.name || '-' },
      { key: 'unit', label: 'Unit', render: r => r.nd_units?.name || '-' },
      { key: 'price', label: 'Price', render: r => tk(r.price) },
      { key: 'description', label: 'Description' },
    ],
    fields: [
      { key: 'name', label: 'Product Name', required: true },
      { key: 'category_id', label: 'Category', optionsTable: 'nd_categories' },
      { key: 'unit_id', label: 'Unit', optionsTable: 'nd_units' },
      { key: 'price', label: 'Price (৳)', type: 'number' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },

  // ───────── VENDORS ─────────
  'vendor-list': {
    title: 'Vendors', table: 'nd_vendors', icon: 'fa-person', orderBy: 'name', orderAsc: true,
    columns: [
      { key: 'name', label: 'Vendor' }, { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' }, { key: 'address', label: 'Address' },
    ],
    fields: [
      { key: 'name', label: 'Vendor Name', required: true },
      { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' },
      { key: 'address', label: 'Address', type: 'textarea' },
    ],
  },
  'vendor-payable': {
    title: 'Vendor Payments (Payable)', table: 'nd_vendor_payments', icon: 'fa-money-bill',
    select: '*, nd_vendors(name), nd_projects(project_name), nd_payment_methods(name)',
    columns: [
      { key: 'date', label: 'Date', render: r => dt(r.date) },
      { key: 'vendor', label: 'Vendor', render: r => r.nd_vendors?.name || '-' },
      { key: 'project', label: 'Project', render: r => r.nd_projects?.project_name || '-' },
      { key: 'amount', label: 'Amount', render: r => tk(r.amount) },
      { key: 'method', label: 'Method', render: r => r.nd_payment_methods?.name || '-' },
      { key: 'note', label: 'Note' },
    ],
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'vendor_id', label: 'Vendor', optionsTable: 'nd_vendors', required: true },
      { key: 'project_id', label: 'Project', optionsTable: 'nd_projects', optionLabel: 'project_name' },
      { key: 'amount', label: 'Amount (৳)', type: 'number', required: true },
      { key: 'payment_method_id', label: 'Payment Method', optionsTable: 'nd_payment_methods' },
      { key: 'note', label: 'Note', type: 'textarea' },
    ],
    summary: rows => 'Total Paid: ' + tk(rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)),
  },

  // ───────── CONTRACTORS ─────────
  'contractor-list': {
    title: 'Contractors', table: 'nd_contractors', icon: 'fa-helmet-safety', orderBy: 'name', orderAsc: true,
    columns: [
      { key: 'name', label: 'Contractor' }, { key: 'phone', label: 'Phone' },
      { key: 'specialty', label: 'Specialty / Category' },
    ],
    fields: [
      { key: 'name', label: 'Contractor Name', required: true },
      { key: 'phone', label: 'Phone' },
      { key: 'specialty', label: 'Specialty / Category' },
    ],
  },
  'contract-list': {
    title: 'Contracts', table: 'nd_contracts', icon: 'fa-file-signature',
    select: '*, nd_contractors(name), nd_projects(project_name)',
    columns: [
      { key: 'title', label: 'Contract' },
      { key: 'contractor', label: 'Contractor', render: r => r.nd_contractors?.name || '-' },
      { key: 'project', label: 'Project', render: r => r.nd_projects?.project_name || '-' },
      { key: 'amount', label: 'Amount', render: r => tk(r.amount) },
      { key: 'start_date', label: 'Start', render: r => dt(r.start_date) },
      { key: 'end_date', label: 'End', render: r => dt(r.end_date) },
      { key: 'status', label: 'Status' },
    ],
    fields: [
      { key: 'title', label: 'Contract Title', required: true },
      { key: 'contractor_id', label: 'Contractor', optionsTable: 'nd_contractors', required: true },
      { key: 'project_id', label: 'Project', optionsTable: 'nd_projects', optionLabel: 'project_name' },
      { key: 'amount', label: 'Contract Amount (৳)', type: 'number' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Ongoing', 'Completed', 'Cancelled'], default: 'Ongoing' },
      { key: 'note', label: 'Note', type: 'textarea' },
    ],
  },
  'contractor-payable': {
    title: 'Contractor Payments (Payable)', table: 'nd_contractor_payments', icon: 'fa-money-bill',
    select: '*, nd_contractors(name), nd_projects(project_name), nd_payment_methods(name)',
    columns: [
      { key: 'date', label: 'Date', render: r => dt(r.date) },
      { key: 'contractor', label: 'Contractor', render: r => r.nd_contractors?.name || '-' },
      { key: 'project', label: 'Project', render: r => r.nd_projects?.project_name || '-' },
      { key: 'amount', label: 'Amount', render: r => tk(r.amount) },
      { key: 'method', label: 'Method', render: r => r.nd_payment_methods?.name || '-' },
      { key: 'note', label: 'Note' },
    ],
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'contractor_id', label: 'Contractor', optionsTable: 'nd_contractors', required: true },
      { key: 'project_id', label: 'Project', optionsTable: 'nd_projects', optionLabel: 'project_name' },
      { key: 'amount', label: 'Amount (৳)', type: 'number', required: true },
      { key: 'payment_method_id', label: 'Payment Method', optionsTable: 'nd_payment_methods' },
      { key: 'note', label: 'Note', type: 'textarea' },
    ],
    summary: rows => 'Total Paid: ' + tk(rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)),
  },

  // ───────── ACCOUNTS ─────────
  'payment-method': {
    title: 'Payment Methods', table: 'nd_payment_methods', icon: 'fa-credit-card', orderBy: 'name', orderAsc: true,
    columns: [{ key: 'name', label: 'Method' }],
    fields: [{ key: 'name', label: 'Method Name', required: true }],
  },
  'account-list': {
    title: 'Accounts', table: 'nd_accounts', icon: 'fa-building-columns', orderBy: 'name', orderAsc: true,
    select: '*, nd_payment_methods(name)',
    columns: [
      { key: 'name', label: 'Account' },
      { key: 'method', label: 'Type', render: r => r.nd_payment_methods?.name || '-' },
      { key: 'balance', label: 'Balance', render: r => tk(r.balance) },
    ],
    fields: [
      { key: 'name', label: 'Account Name', required: true },
      { key: 'payment_method_id', label: 'Payment Method', optionsTable: 'nd_payment_methods' },
      { key: 'balance', label: 'Opening Balance (৳)', type: 'number' },
    ],
    summary: rows => 'Total Balance: ' + tk(rows.reduce((s, r) => s + (parseFloat(r.balance) || 0), 0)),
  },
  'emp-salary-pay': {
    title: 'Employee Salary Payments', table: 'nd_salary_payments', icon: 'fa-sack-dollar',
    select: '*, nd_employees(name, designation), nd_payment_methods(name)',
    columns: [
      { key: 'date', label: 'Date', render: r => dt(r.date) },
      { key: 'emp', label: 'Employee', render: r => r.nd_employees?.name || '-' },
      { key: 'month', label: 'Month' },
      { key: 'amount', label: 'Amount', render: r => tk(r.amount) },
      { key: 'method', label: 'Method', render: r => r.nd_payment_methods?.name || '-' },
      { key: 'note', label: 'Note' },
    ],
    fields: [
      { key: 'date', label: 'Payment Date', type: 'date', required: true },
      { key: 'employee_id', label: 'Employee', optionsTable: 'nd_employees', required: true },
      { key: 'month', label: 'Salary Month (e.g. July 2026)', required: true },
      { key: 'amount', label: 'Amount (৳)', type: 'number', required: true },
      { key: 'payment_method_id', label: 'Payment Method', optionsTable: 'nd_payment_methods' },
      { key: 'note', label: 'Note', type: 'textarea' },
    ],
    summary: rows => 'Total Paid: ' + tk(rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)),
  },
  'balance-transfer': {
    title: 'Balance Transfers', table: 'nd_balance_transfers', icon: 'fa-right-left',
    select: '*, from_acc:nd_accounts!nd_balance_transfers_from_account_id_fkey(name), to_acc:nd_accounts!nd_balance_transfers_to_account_id_fkey(name)',
    columns: [
      { key: 'date', label: 'Date', render: r => dt(r.date) },
      { key: 'from', label: 'From', render: r => r.from_acc?.name || '-' },
      { key: 'to', label: 'To', render: r => r.to_acc?.name || '-' },
      { key: 'amount', label: 'Amount', render: r => tk(r.amount) },
      { key: 'note', label: 'Note' },
    ],
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'from_account_id', label: 'From Account', optionsTable: 'nd_accounts', required: true },
      { key: 'to_account_id', label: 'To Account', optionsTable: 'nd_accounts', required: true },
      { key: 'amount', label: 'Amount (৳)', type: 'number', required: true },
      { key: 'note', label: 'Note' },
    ],
    afterSave: async (row, supabase, isEdit) => {
      if (isEdit) return
      const amt = parseFloat(row.amount) || 0
      const { data: fa } = await supabase.from('nd_accounts').select('balance').eq('id', row.from_account_id).single()
      if (fa) await supabase.from('nd_accounts').update({ balance: (parseFloat(fa.balance) || 0) - amt }).eq('id', row.from_account_id)
      const { data: ta } = await supabase.from('nd_accounts').select('balance').eq('id', row.to_account_id).single()
      if (ta) await supabase.from('nd_accounts').update({ balance: (parseFloat(ta.balance) || 0) + amt }).eq('id', row.to_account_id)
    },
  },
  'accountant-budget': {
    title: 'Project Budgets', table: 'nd_projects', icon: 'fa-coins', orderBy: 'created_at',
    select: '*, nd_clients(name)',
    columns: [
      { key: 'project_name', label: 'Project' },
      { key: 'client', label: 'Client', render: r => r.nd_clients?.name || '-' },
      { key: 'total_budget', label: 'Budget', render: r => tk(r.total_budget) },
      { key: 'total_paid', label: 'Received', render: r => tk(r.total_paid) },
      { key: 'due', label: 'Due', render: r => tk((r.total_budget || 0) - (r.total_paid || 0)) },
      { key: 'status', label: 'Status' },
    ],
    fields: [
      { key: 'project_name', label: 'Project Name', required: true },
      { key: 'total_budget', label: 'Budget (৳)', type: 'number' },
      { key: 'total_paid', label: 'Received (৳)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Ongoing', 'Completed', 'On Hold'], default: 'Ongoing' },
    ],
    summary: rows => 'Total Budget: ' + tk(rows.reduce((s, r) => s + (parseFloat(r.total_budget) || 0), 0)) + '  |  Total Due: ' + tk(rows.reduce((s, r) => s + ((parseFloat(r.total_budget) || 0) - (parseFloat(r.total_paid) || 0)), 0)),
  },

  // ───────── CONVEYANCE ─────────
  'conveyance-list': {
    title: 'Conveyance Allowance', table: 'nd_conveyance', icon: 'fa-car',
    select: '*, nd_employees(name), nd_projects(project_name)',
    columns: [
      { key: 'date', label: 'Date', render: r => dt(r.date) },
      { key: 'emp', label: 'Employee', render: r => r.nd_employees?.name || '-' },
      { key: 'from_place', label: 'From' }, { key: 'to_place', label: 'To' },
      { key: 'purpose', label: 'Purpose' },
      { key: 'amount', label: 'Amount', render: r => tk(r.amount) },
      { key: 'status', label: 'Status' },
    ],
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'employee_id', label: 'Employee', optionsTable: 'nd_employees', required: true },
      { key: 'project_id', label: 'Project', optionsTable: 'nd_projects', optionLabel: 'project_name' },
      { key: 'from_place', label: 'From' }, { key: 'to_place', label: 'To' },
      { key: 'purpose', label: 'Purpose' },
      { key: 'amount', label: 'Amount (৳)', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Paid'], default: 'Pending' },
    ],
    summary: rows => 'Total: ' + tk(rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)),
  },

  // ───────── OFFICE / EXPENSES ─────────
  'expense-head': {
    title: 'Expense Heads', table: 'nd_expense_categories', icon: 'fa-folder', orderBy: 'name', orderAsc: true,
    columns: [{ key: 'name', label: 'Head Name' }],
    fields: [{ key: 'name', label: 'Head Name', required: true }],
  },
  'expense-subhead': {
    title: 'Expense Sub-Heads', table: 'nd_expense_categories', icon: 'fa-folder-open', orderBy: 'name', orderAsc: true,
    columns: [
      { key: 'name', label: 'Sub-Head' },
      { key: 'parent_id', label: 'Parent Head ID', render: r => r.parent_id || '-' },
    ],
    fields: [
      { key: 'name', label: 'Sub-Head Name', required: true },
      { key: 'parent_id', label: 'Parent Head', optionsTable: 'nd_expense_categories' },
    ],
  },
  'expense-list': {
    title: 'Office Expenses', table: 'nd_expenses', icon: 'fa-receipt', orderBy: 'date',
    select: '*, nd_expense_categories(name), nd_projects(project_name), nd_payment_methods(name)',
    columns: [
      { key: 'date', label: 'Date', render: r => dt(r.date) },
      { key: 'cat', label: 'Head', render: r => r.nd_expense_categories?.name || '-' },
      { key: 'project', label: 'Project', render: r => r.nd_projects?.project_name || '-' },
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount', render: r => tk(r.amount) },
      { key: 'method', label: 'Method', render: r => r.nd_payment_methods?.name || '-' },
    ],
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'category_id', label: 'Expense Head', optionsTable: 'nd_expense_categories' },
      { key: 'project_id', label: 'Project (optional)', optionsTable: 'nd_projects', optionLabel: 'project_name' },
      { key: 'description', label: 'Description', required: true },
      { key: 'amount', label: 'Amount (৳)', type: 'number', required: true },
      { key: 'payment_method_id', label: 'Payment Method', optionsTable: 'nd_payment_methods' },
    ],
    summary: rows => 'Total Expense: ' + tk(rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)),
  },

  // ───────── REQUISITION / PURCHASE / LABOR ─────────
  'requisition-list': {
    title: 'Requisitions', table: 'nd_requisitions', icon: 'fa-clipboard-list',
    select: '*, nd_projects(project_name)',
    columns: [
      { key: 'date', label: 'Date', render: r => dt(r.date) },
      { key: 'project', label: 'Project', render: r => r.nd_projects?.project_name || '-' },
      { key: 'item_name', label: 'Item' },
      { key: 'qty', label: 'Qty' }, { key: 'unit', label: 'Unit' },
      { key: 'status', label: 'Status' }, { key: 'note', label: 'Note' },
    ],
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'project_id', label: 'Project', optionsTable: 'nd_projects', optionLabel: 'project_name', required: true },
      { key: 'item_name', label: 'Item Name', required: true },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'unit', label: 'Unit' },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Purchased', 'Rejected'], default: 'Pending' },
      { key: 'note', label: 'Note', type: 'textarea' },
    ],
  },
  'purchase-list': {
    title: 'Purchases', table: 'nd_purchases', icon: 'fa-cart-shopping',
    select: '*, nd_vendors(name), nd_projects(project_name)',
    columns: [
      { key: 'date', label: 'Date', render: r => dt(r.date) },
      { key: 'vendor', label: 'Vendor', render: r => r.nd_vendors?.name || '-' },
      { key: 'project', label: 'Project', render: r => r.nd_projects?.project_name || '-' },
      { key: 'item_name', label: 'Item' },
      { key: 'qty', label: 'Qty' },
      { key: 'unit_price', label: 'Unit Price', render: r => tk(r.unit_price) },
      { key: 'total', label: 'Total', render: r => tk(r.total) },
      { key: 'purchase_type', label: 'Type' },
    ],
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'vendor_id', label: 'Vendor', optionsTable: 'nd_vendors' },
      { key: 'project_id', label: 'Project', optionsTable: 'nd_projects', optionLabel: 'project_name' },
      { key: 'item_name', label: 'Item Name', required: true },
      { key: 'qty', label: 'Quantity', type: 'number', default: 1 },
      { key: 'unit_price', label: 'Unit Price (৳)', type: 'number' },
      { key: 'total', label: 'Total (৳)', type: 'number' },
      { key: 'purchase_type', label: 'Type', type: 'select', options: ['Direct', 'Requisition'], default: 'Direct' },
      { key: 'note', label: 'Note', type: 'textarea' },
    ],
    summary: rows => 'Total Purchases: ' + tk(rows.reduce((s, r) => s + (parseFloat(r.total) || 0), 0)),
  },
  'labor-list': {
    title: 'Labor', table: 'nd_labor', icon: 'fa-user-nurse', orderBy: 'name', orderAsc: true,
    select: '*, nd_projects(project_name)',
    columns: [
      { key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' },
      { key: 'daily_rate', label: 'Daily Rate', render: r => tk(r.daily_rate) },
      { key: 'project', label: 'Project', render: r => r.nd_projects?.project_name || '-' },
      { key: 'status', label: 'Status' },
    ],
    fields: [
      { key: 'name', label: 'Labor Name', required: true },
      { key: 'phone', label: 'Phone' },
      { key: 'daily_rate', label: 'Daily Rate (৳)', type: 'number' },
      { key: 'project_id', label: 'Assigned Project', optionsTable: 'nd_projects', optionLabel: 'project_name' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'], default: 'Active' },
    ],
  },

  // ───────── TASKS ─────────
  'task-type': {
    title: 'Task Types', table: 'nd_task_types', icon: 'fa-bars-progress', orderBy: 'name', orderAsc: true,
    columns: [{ key: 'name', label: 'Task Type' }],
    fields: [{ key: 'name', label: 'Type Name', required: true }],
  },
  'task-assign': {
    title: 'Tasks', table: 'nd_tasks', icon: 'fa-list-check',
    select: '*, nd_employees(name), nd_projects(project_name), nd_task_types(name)',
    columns: [
      { key: 'title', label: 'Task' },
      { key: 'type', label: 'Type', render: r => r.nd_task_types?.name || '-' },
      { key: 'emp', label: 'Assigned To', render: r => r.nd_employees?.name || '-' },
      { key: 'project', label: 'Project', render: r => r.nd_projects?.project_name || '-' },
      { key: 'due_date', label: 'Due', render: r => dt(r.due_date) },
      { key: 'status', label: 'Status' },
    ],
    fields: [
      { key: 'title', label: 'Task Title', required: true },
      { key: 'task_type_id', label: 'Task Type', optionsTable: 'nd_task_types' },
      { key: 'employee_id', label: 'Assign To', optionsTable: 'nd_employees' },
      { key: 'project_id', label: 'Project', optionsTable: 'nd_projects', optionLabel: 'project_name' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Done', 'Cancelled'], default: 'Pending' },
      { key: 'note', label: 'Note', type: 'textarea' },
    ],
  },
  // ───────── HR EXTRAS ─────────
  'advance-list': {
    title: 'Salary Advances', table: 'nd_advances', icon: 'fa-hand-holding-dollar',
    select: '*, nd_employees(name)',
    columns: [
      { key: 'date', label: 'Date', render: r => dt(r.date) },
      { key: 'emp', label: 'Employee', render: r => r.nd_employees?.name || '-' },
      { key: 'amount', label: 'Amount', render: r => tk(r.amount) },
      { key: 'status', label: 'Status' }, { key: 'note', label: 'Note' },
    ],
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'employee_id', label: 'Employee', optionsTable: 'nd_employees', required: true },
      { key: 'amount', label: 'Amount (৳)', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Adjusted'], default: 'Pending' },
      { key: 'note', label: 'Note' },
    ],
    summary: rows => 'Total Advances: ' + tk(rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)),
  },
  'bonus-list': {
    title: 'Bonuses', table: 'nd_bonuses', icon: 'fa-gift',
    select: '*, nd_employees(name)',
    columns: [
      { key: 'date', label: 'Date', render: r => dt(r.date) },
      { key: 'emp', label: 'Employee', render: r => r.nd_employees?.name || '-' },
      { key: 'occasion', label: 'Occasion' },
      { key: 'amount', label: 'Amount', render: r => tk(r.amount) },
    ],
    fields: [
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'employee_id', label: 'Employee', optionsTable: 'nd_employees', required: true },
      { key: 'occasion', label: 'Occasion (e.g. Eid Bonus)' },
      { key: 'amount', label: 'Amount (৳)', type: 'number', required: true },
    ],
    summary: rows => 'Total Bonus: ' + tk(rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)),
  },
  'settings': {
    title: 'Business Settings', table: 'nd_settings', icon: 'fa-gear', orderBy: 'key', orderAsc: true,
    columns: [
      { key: 'key', label: 'Setting' }, { key: 'value', label: 'Value' },
    ],
    fields: [
      { key: 'key', label: 'Setting Name (e.g. Company Phone)', required: true },
      { key: 'value', label: 'Value', type: 'textarea' },
    ],
  },
}

// Route aliases: many menu items are the same page
export const PAGE_ALIASES = {
  'salary-add': 'emp-salary-pay',
  'salary-list': 'emp-salary-pay',
  'salary-sheet': 'emp-salary-pay',
  'report-salary': 'emp-salary-pay',
  'client-project-list': 'project-list',
  'report-client': 'client-status',
  'report-employee': 'employee-list',
  'report-emp-all': 'employee-list',
  'report-head-expense': 'expense-list',
  'report-conveyance': 'conveyance-list',
  'report-architect': 'contractor-list',
  'report-project': 'accountant-budget',
  'report-budget': 'accountant-budget',
  'report-contractor': 'contractor-payable',
  'report-accountant': 'account-list',
  'report-project-purchase': 'purchase-list',
  'report-client-payment': 'payment-collection',
  'report-vendor': 'vendor-payable',
  'report-category': 'category-list',
  'report-vat': 'boq-list',
  'report-task': 'task-assign',
  'report-method': 'payment-method',
  'business': 'settings',
  'role-list': 'settings',
  'permission-list': 'settings',
  'sms-portal': 'settings',
  'product-add': 'product-list',
  'contractor-category': 'contractor-list',
  'contractor-items': 'contract-list',
  'requisition-add': 'requisition-list',
  'requisition-category': 'category-list',
  'requisition-product': 'product-list',
  'direct-purchase': 'purchase-list',
  'purchase-add': 'purchase-list',
  'conveyance-add': 'conveyance-list',
  'conveyance-payable': 'conveyance-list',
  'payment-history-conveyance': 'conveyance-list',
  'payment-history-vendor': 'vendor-payable',
  'payment-history-contractor': 'contractor-payable',
  'budget-add': 'accountant-budget',
  'budget-list': 'accountant-budget',
  'task-status': 'task-assign',
  'emp-task-list': 'task-assign',
  'expense-add': 'expense-list',
  'working-list': 'task-assign',
  'execution': 'project-list',
  'design-list': 'design-sell-list',
  'design-sell-payment': 'design-sell-list',
  'design-due': 'design-sell-list',
  'payment-history-client': 'payment-collection',
  'payment-history-design': 'design-sell-list',
}
