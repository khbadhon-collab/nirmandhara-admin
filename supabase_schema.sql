-- =============================================
-- NIRMAN DHARA - Complete Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- CLIENTS
create table if not exists nd_clients (
  id bigserial primary key,
  name text not null,
  phone text,
  email text,
  address text,
  area text,
  sqft text,
  reference text,
  category text,
  status text default 'Active',
  next_call_date date,
  visit_date date,
  notes text,
  created_at timestamptz default now()
);

-- CATEGORIES (for BOQ products)
create table if not exists nd_categories (
  id bigserial primary key,
  name text not null,
  created_at timestamptz default now()
);

-- UNITS
create table if not exists nd_units (
  id bigserial primary key,
  name text not null,
  created_at timestamptz default now()
);

-- PRODUCTS (BOQ Items)
create table if not exists nd_products (
  id bigserial primary key,
  name text not null,
  product_code text,
  price numeric(12,2) default 0,
  description text,
  category_id bigint references nd_categories(id),
  unit_id bigint references nd_units(id),
  created_at timestamptz default now()
);

-- PROJECTS
create table if not exists nd_projects (
  id bigserial primary key,
  project_name text not null,
  client_id bigint references nd_clients(id),
  address text,
  start_date date,
  end_date date,
  total_budget numeric(14,2) default 0,
  total_cost numeric(14,2) default 0,
  total_paid numeric(14,2) default 0,
  status text default 'Ongoing',
  notes text,
  created_at timestamptz default now()
);

-- QUOTATIONS (BOQ)
create table if not exists nd_quotations (
  id bigserial primary key,
  quotation_no text unique,
  date date default current_date,
  client_id bigint references nd_clients(id),
  project_id bigint references nd_projects(id),
  subtotal numeric(14,2) default 0,
  discount_type text,
  discount_value numeric(10,2) default 0,
  service_charge_type text,
  service_charge numeric(10,2) default 0,
  vat_pct numeric(5,2) default 0,
  ait_pct numeric(5,2) default 0,
  grand_total numeric(14,2) default 0,
  terms_condition text,
  status text default 'Draft',
  created_at timestamptz default now()
);

-- QUOTATION ITEMS
create table if not exists nd_quotation_items (
  id bigserial primary key,
  quotation_id bigint references nd_quotations(id) on delete cascade,
  category_id bigint references nd_categories(id),
  product_id bigint references nd_products(id),
  product_name text,
  description text,
  unit_price numeric(12,2) default 0,
  qty numeric(10,2) default 1,
  unit text,
  total numeric(14,2) default 0,
  sort_order int default 0
);

-- DESIGN SELLS (Design Invoice)
create table if not exists nd_design_sells (
  id bigserial primary key,
  invoice_no text unique,
  date date default current_date,
  client_id bigint references nd_clients(id),
  project_id bigint references nd_projects(id),
  amount numeric(14,2) default 0,
  paid numeric(14,2) default 0,
  due numeric(14,2) default 0,
  description text,
  status text default 'Unpaid',
  created_at timestamptz default now()
);

-- PAYMENT METHODS
create table if not exists nd_payment_methods (
  id bigserial primary key,
  name text not null,
  created_at timestamptz default now()
);

-- ACCOUNTS
create table if not exists nd_accounts (
  id bigserial primary key,
  name text not null,
  balance numeric(14,2) default 0,
  payment_method_id bigint references nd_payment_methods(id),
  created_at timestamptz default now()
);

-- CLIENT PAYMENTS (Receivable)
create table if not exists nd_client_payments (
  id bigserial primary key,
  receipt_no text unique,
  date date default current_date,
  client_id bigint references nd_clients(id),
  project_id bigint references nd_projects(id),
  quotation_id bigint references nd_quotations(id),
  amount numeric(14,2) default 0,
  payment_method_id bigint references nd_payment_methods(id),
  account_id bigint references nd_accounts(id),
  note text,
  created_at timestamptz default now()
);

-- VENDORS
create table if not exists nd_vendors (
  id bigserial primary key,
  name text not null,
  phone text,
  email text,
  address text,
  created_at timestamptz default now()
);

-- VENDOR PAYMENTS
create table if not exists nd_vendor_payments (
  id bigserial primary key,
  date date default current_date,
  vendor_id bigint references nd_vendors(id),
  project_id bigint references nd_projects(id),
  amount numeric(14,2) default 0,
  payment_method_id bigint references nd_payment_methods(id),
  note text,
  created_at timestamptz default now()
);

-- CONTRACTORS
create table if not exists nd_contractors (
  id bigserial primary key,
  name text not null,
  phone text,
  specialty text,
  created_at timestamptz default now()
);

-- CONTRACTOR PAYMENTS
create table if not exists nd_contractor_payments (
  id bigserial primary key,
  date date default current_date,
  contractor_id bigint references nd_contractors(id),
  project_id bigint references nd_projects(id),
  amount numeric(14,2) default 0,
  payment_method_id bigint references nd_payment_methods(id),
  note text,
  created_at timestamptz default now()
);

-- EMPLOYEES
create table if not exists nd_employees (
  id bigserial primary key,
  name text not null,
  phone text,
  designation text,
  salary numeric(10,2) default 0,
  join_date date,
  status text default 'Active',
  created_at timestamptz default now()
);

-- EXPENSE CATEGORIES
create table if not exists nd_expense_categories (
  id bigserial primary key,
  name text not null,
  parent_id bigint references nd_expense_categories(id),
  created_at timestamptz default now()
);

-- EXPENSES
create table if not exists nd_expenses (
  id bigserial primary key,
  date date default current_date,
  category_id bigint references nd_expense_categories(id),
  project_id bigint references nd_projects(id),
  amount numeric(12,2) default 0,
  description text,
  payment_method_id bigint references nd_payment_methods(id),
  created_at timestamptz default now()
);

-- SEED DEFAULT DATA
insert into nd_payment_methods (name) values ('Cash'), ('Bank Transfer'), ('bKash'), ('Nagad') on conflict do nothing;
insert into nd_units (name) values ('SQFT'), ('Nos'), ('pcs'), ('Job'), ('Taka') on conflict do nothing;
insert into nd_categories (name) values
  ('Interior Decoration'),('3D Design'),('Interior Products'),('2D Design'),
  ('2D Floor Plan'),('Kitchen'),('Bathroom'),('Master Bed'),('Drawing Room'),
  ('Dining Room'),('False Ceiling'),('Wall Paneling'),('Labor'),('Consultation'),
  ('Wet-Kitchen'),('Dry-Kitchen'),('Additional Works') on conflict do nothing;

-- Enable Row Level Security (open for now - tighten per user later)
alter table nd_clients enable row level security;
alter table nd_projects enable row level security;
alter table nd_quotations enable row level security;
alter table nd_quotation_items enable row level security;
alter table nd_client_payments enable row level security;
alter table nd_design_sells enable row level security;
alter table nd_expenses enable row level security;
alter table nd_employees enable row level security;

-- Open policies (change to auth-based later)
create policy "allow all" on nd_clients for all using (true) with check (true);
create policy "allow all" on nd_projects for all using (true) with check (true);
create policy "allow all" on nd_quotations for all using (true) with check (true);
create policy "allow all" on nd_quotation_items for all using (true) with check (true);
create policy "allow all" on nd_client_payments for all using (true) with check (true);
create policy "allow all" on nd_design_sells for all using (true) with check (true);
create policy "allow all" on nd_expenses for all using (true) with check (true);
create policy "allow all" on nd_employees for all using (true) with check (true);
create policy "allow all" on nd_categories for all using (true) with check (true);
create policy "allow all" on nd_units for all using (true) with check (true);
create policy "allow all" on nd_products for all using (true) with check (true);
create policy "allow all" on nd_vendors for all using (true) with check (true);
create policy "allow all" on nd_vendor_payments for all using (true) with check (true);
create policy "allow all" on nd_contractors for all using (true) with check (true);
create policy "allow all" on nd_contractor_payments for all using (true) with check (true);
create policy "allow all" on nd_payment_methods for all using (true) with check (true);
create policy "allow all" on nd_accounts for all using (true) with check (true);
create policy "allow all" on nd_expense_categories for all using (true) with check (true);
