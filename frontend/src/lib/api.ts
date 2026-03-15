export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Types ---
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export interface Customer {
  id: number;
  name: string;
  type?: string;
  region?: string;
  country?: string;
  volume_potential?: string;
  website?: string;
  products_used?: string;
  pic_contacts?: string;
  email_addresses?: string;
  office_address?: string;
  priority_rating: number;
  assigned_user?: string;
  lead_stage: string;
}

export interface Supplier {
  id: number;
  name: string;
  type?: string;
  region?: string;
  country?: string;
  products?: string;
  pic_contacts?: string;
  commission_rules?: string;
  reminder_frequency?: string;
  commission?: string;
  contact?: string;
  email?: string;
  rating?: number;
  orders?: number;
}

export interface Enquiry {
  id: number;
  enquiry_number: string;
  source?: string;
  date: string;
  customer_id?: number;
  products_requested?: string;
  qty?: string;
  status: string;
  notes?: string;
}

export interface Order {
  id: number;
  sc_number: string;
  enquiry_id?: number;
  supplier_id?: number;
  qty?: string;
  value_currency?: string;
  delivery_terms?: string;
  payment_mode?: string;
  shipment_status?: string;
  payment_status?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  assigned_to?: number;
  due_date?: string;
  status: string;
  type?: string;
  created_at: string;
}

export interface Goal {
  id: number;
  user_id: number;
  title: string;
  target_value: number;
  current_value: number;
  deadline?: string;
  status: string;
}

export interface QualityClaim {
  id: number;
  order_id: number;
  customer_id: number;
  issue_description: string;
  claim_amount: number;
  status: string;
  created_at: string;
}

// --- Fetch Helpers ---

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    
    if (res.status === 401) {
      console.warn("[API] 401 Unauthorized detected at:", url);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Only redirect if we are not already on an auth page
        const isAuthRoute = window.location.pathname === '/login' || 
                           window.location.pathname === '/register' || 
                           window.location.pathname === '/';
        
        if (!isAuthRoute) {
          console.log("[API] Redirecting to login due to 401");
          window.location.href = '/login';
        }
      }
    }

    return res;
  } catch (error) {
    console.error("[API] Fetch error:", error);
    throw error;
  }
}

// Users & Auth
export async function loginUser(data: FormData) {
  const res = await fetch(`${API_BASE_URL}/auth/token`, {
    method: "POST",
    body: data,
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function registerUser(data: any): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

export async function updatePassword(token: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/auth/password`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update password");
  return res.json();
}

export async function getUsers(): Promise<User[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/auth/users`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// Customers
export async function getCustomers(): Promise<Customer[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/customers/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  const res = await fetchWithAuth(`${API_BASE_URL}/customers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create customer");
  return res.json();
}

export async function updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
  const res = await fetchWithAuth(`${API_BASE_URL}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update customer");
  return res.json();
}

// Suppliers
export async function getSuppliers(): Promise<Supplier[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/suppliers/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch suppliers");
  return res.json();
}

export async function createSupplier(data: Partial<Supplier>): Promise<Supplier> {
  const res = await fetchWithAuth(`${API_BASE_URL}/suppliers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create supplier");
  return res.json();
}

export async function updateSupplier(id: number, data: Partial<Supplier>): Promise<Supplier> {
  const res = await fetchWithAuth(`${API_BASE_URL}/suppliers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update supplier");
  return res.json();
}

// Enquiries
export async function getEnquiries(): Promise<Enquiry[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/enquiries/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch enquiries");
  return res.json();
}

export async function createEnquiry(data: Partial<Enquiry>): Promise<Enquiry> {
  const res = await fetchWithAuth(`${API_BASE_URL}/enquiries/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create enquiry");
  return res.json();
}

export async function updateEnquiry(id: number, data: Partial<Enquiry>): Promise<Enquiry> {
  const res = await fetchWithAuth(`${API_BASE_URL}/enquiries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update enquiry");
  return res.json();
}

// Orders
export async function getOrders(): Promise<Order[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/orders/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function createOrder(data: Partial<Order>): Promise<Order> {
  const res = await fetchWithAuth(`${API_BASE_URL}/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}

export async function updateOrder(id: number, data: Partial<Order>): Promise<Order> {
  const res = await fetchWithAuth(`${API_BASE_URL}/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update order");
  return res.json();
}

// Tasks
export async function getTasks(userId?: number): Promise<Task[]> {
  const url = userId ? `${API_BASE_URL}/tasks/?user_id=${userId}` : `${API_BASE_URL}/tasks/`;
  const res = await fetchWithAuth(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function createTask(data: Partial<Task>): Promise<Task> {
  const res = await fetchWithAuth(`${API_BASE_URL}/tasks/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function updateTask(id: number, data: Partial<Task>): Promise<Task> {
  const res = await fetchWithAuth(`${API_BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

// Goals
export async function getGoals(userId?: number): Promise<Goal[]> {
  const url = userId ? `${API_BASE_URL}/goals/?user_id=${userId}` : `${API_BASE_URL}/goals/`;
  const res = await fetchWithAuth(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch goals");
  return res.json();
}

export async function createGoal(data: Partial<Goal>): Promise<Goal> {
  const res = await fetchWithAuth(`${API_BASE_URL}/goals/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create goal");
  return res.json();
}

export async function updateGoal(id: number, data: Partial<Goal>): Promise<Goal> {
  const res = await fetchWithAuth(`${API_BASE_URL}/goals/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update goal");
  return res.json();
}

// Claims
export async function getClaims(): Promise<QualityClaim[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/claims/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch claims");
  return res.json();
}

export async function createClaim(data: Partial<QualityClaim>): Promise<QualityClaim> {
  const res = await fetchWithAuth(`${API_BASE_URL}/claims/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create claim");
  return res.json();
}

export async function updateClaim(id: number, data: Partial<QualityClaim>): Promise<QualityClaim> {
  const res = await fetchWithAuth(`${API_BASE_URL}/claims/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update claim");
  return res.json();
}

