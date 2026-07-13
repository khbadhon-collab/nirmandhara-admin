import { supabase } from './supabase'

// ── CLIENTS ──────────────────────────────────────────────
export const clientsApi = {
  getAll: () => supabase.from('nd_clients').select('*').order('created_at', { ascending: false }),
  getById: (id) => supabase.from('nd_clients').select('*').eq('id', id).single(),
  create: (data) => supabase.from('nd_clients').insert(data).select().single(),
  update: (id, data) => supabase.from('nd_clients').update(data).eq('id', id).select().single(),
  delete: (id) => supabase.from('nd_clients').delete().eq('id', id),
}

// ── PROJECTS ─────────────────────────────────────────────
export const projectsApi = {
  getAll: () => supabase.from('nd_projects').select('*, nd_clients(name, phone)').order('created_at', { ascending: false }),
  getById: (id) => supabase.from('nd_projects').select('*, nd_clients(name, phone, address)').eq('id', id).single(),
  create: (data) => supabase.from('nd_projects').insert(data).select().single(),
  update: (id, data) => supabase.from('nd_projects').update(data).eq('id', id).select().single(),
  delete: (id) => supabase.from('nd_projects').delete().eq('id', id),
}

// ── CATEGORIES ───────────────────────────────────────────
export const categoriesApi = {
  getAll: () => supabase.from('nd_categories').select('*').order('name'),
  create: (data) => supabase.from('nd_categories').insert(data).select().single(),
}

// ── UNITS ────────────────────────────────────────────────
export const unitsApi = {
  getAll: () => supabase.from('nd_units').select('*').order('name'),
  create: (data) => supabase.from('nd_units').insert(data).select().single(),
}

// ── PRODUCTS ─────────────────────────────────────────────
export const productsApi = {
  getAll: () => supabase.from('nd_products').select('*, nd_categories(name), nd_units(name)').order('name'),
  getById: (id) => supabase.from('nd_products').select('*, nd_categories(name), nd_units(name)').eq('id', id).single(),
  create: (data) => supabase.from('nd_products').insert(data).select().single(),
  update: (id, data) => supabase.from('nd_products').update(data).eq('id', id),
  delete: (id) => supabase.from('nd_products').delete().eq('id', id),
}

// ── QUOTATIONS ───────────────────────────────────────────
export const quotationsApi = {
  getAll: () => supabase.from('nd_quotations').select('*, nd_clients(name, phone), nd_projects(project_name)').order('created_at', { ascending: false }),
  getById: (id) => supabase.from('nd_quotations').select('*, nd_clients(name, phone, address), nd_projects(project_name, address)').eq('id', id).single(),
  getItems: (quotationId) => supabase.from('nd_quotation_items').select('*').eq('quotation_id', quotationId).order('sort_order'),
  create: (data) => supabase.from('nd_quotations').insert(data).select().single(),
  createItems: (items) => supabase.from('nd_quotation_items').insert(items),
  update: (id, data) => supabase.from('nd_quotations').update(data).eq('id', id).select().single(),
  deleteItems: (quotationId) => supabase.from('nd_quotation_items').delete().eq('quotation_id', quotationId),
  delete: (id) => supabase.from('nd_quotations').delete().eq('id', id),
}

// ── DESIGN SELLS ─────────────────────────────────────────
export const designSellsApi = {
  getAll: () => supabase.from('nd_design_sells').select('*, nd_clients(name, phone), nd_projects(project_name)').order('created_at', { ascending: false }),
  getById: (id) => supabase.from('nd_design_sells').select('*, nd_clients(name, phone, address), nd_projects(project_name)').eq('id', id).single(),
  create: (data) => supabase.from('nd_design_sells').insert(data).select().single(),
  update: (id, data) => supabase.from('nd_design_sells').update(data).eq('id', id).select().single(),
  delete: (id) => supabase.from('nd_design_sells').delete().eq('id', id),
}

// ── CLIENT PAYMENTS ──────────────────────────────────────
export const paymentsApi = {
  getAll: () => supabase.from('nd_client_payments').select('*, nd_clients(name, phone), nd_projects(project_name), nd_payment_methods(name)').order('created_at', { ascending: false }),
  getById: (id) => supabase.from('nd_client_payments').select('*, nd_clients(name, phone, address), nd_projects(project_name), nd_payment_methods(name), nd_quotations(quotation_no)').eq('id', id).single(),
  create: (data) => supabase.from('nd_client_payments').insert(data).select().single(),
  delete: (id) => supabase.from('nd_client_payments').delete().eq('id', id),
}

// ── PAYMENT METHODS ──────────────────────────────────────
export const paymentMethodsApi = {
  getAll: () => supabase.from('nd_payment_methods').select('*').order('name'),
}

// ── VENDORS ──────────────────────────────────────────────
export const vendorsApi = {
  getAll: () => supabase.from('nd_vendors').select('*').order('name'),
  create: (data) => supabase.from('nd_vendors').insert(data).select().single(),
  update: (id, data) => supabase.from('nd_vendors').update(data).eq('id', id),
  delete: (id) => supabase.from('nd_vendors').delete().eq('id', id),
}

// ── EMPLOYEES ────────────────────────────────────────────
export const employeesApi = {
  getAll: () => supabase.from('nd_employees').select('*').order('name'),
  create: (data) => supabase.from('nd_employees').insert(data).select().single(),
  update: (id, data) => supabase.from('nd_employees').update(data).eq('id', id),
  delete: (id) => supabase.from('nd_employees').delete().eq('id', id),
}

// ── EXPENSES ─────────────────────────────────────────────
export const expensesApi = {
  getAll: () => supabase.from('nd_expenses').select('*, nd_expense_categories(name), nd_projects(project_name)').order('date', { ascending: false }),
  create: (data) => supabase.from('nd_expenses').insert(data).select().single(),
  delete: (id) => supabase.from('nd_expenses').delete().eq('id', id),
}

export const expenseCategoriesApi = {
  getAll: () => supabase.from('nd_expense_categories').select('*').order('name'),
  create: (data) => supabase.from('nd_expense_categories').insert(data).select().single(),
}

// Convert empty strings to null so Postgres date/number columns accept them
export function cleanForm(obj) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) out[k] = v === '' ? null : v
  return out
}
