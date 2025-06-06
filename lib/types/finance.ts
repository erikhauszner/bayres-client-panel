import { Employee } from './employee';

export type TransactionType = 
  | 'income' 
  | 'expense' 
  | 'transfer';

export type TransactionStatus = 
  | 'pending' 
  | 'completed' 
  | 'cancelled';

export type PaymentMethod = 
  | 'cash' 
  | 'bank_transfer' 
  | 'credit_card' 
  | 'debit_card' 
  | 'check' 
  | 'paypal' 
  | 'other';

export interface TransactionCategory {
  _id?: string;
  name: string;
  type: TransactionType;
  description?: string;
  color?: string;
}

export interface Transaction {
  _id?: string;
  type: TransactionType;
  amount: number;
  date: Date | string;
  description: string;
  categoryId: string;
  category?: TransactionCategory;
  status: TransactionStatus;
  projectId?: string;
  taskId?: string;
  accountId: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  attachments?: string[];
  createdBy: string | Employee;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  _id?: string;
  number: string;
  clientId: string;
  projectId: string;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  issueDate: Date | string;
  dueDate: Date | string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paid: number;
  balance: number;
  notes?: string;
  terms?: string;
  createdBy: string | Employee;
  createdAt: Date;
  updatedAt: Date;
  paidDate?: Date | string;
  clientName?: string;
  projectName?: string;
}

export interface InvoiceItem {
  _id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taskId?: string;
}

export interface ExpenseCategory {
  _id?: string;
  name: string;
  description?: string;
}

export interface IncomeCategory {
  _id?: string;
  name: string;
  description?: string;
}

export interface Expense {
  _id?: string;
  projectId: string;
  taskId?: string;
  date: Date | string;
  amount: number;
  categoryId: string;
  category?: ExpenseCategory;
  description: string;
  receipt?: string;
  vendor?: string;
  createdBy: string | Employee;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  approvedBy?: string | Employee;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetItem {
  _id?: string;
  projectId: string;
  categoryId: string;
  category?: ExpenseCategory;
  description: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
}

export interface ProjectFinancialSummary {
  projectId: string;
  budget: number;
  actual: number;
  invoiced: number;
  paid: number;
  expenses: number;
  profit: number;
  profitMargin: number;
}

export interface Partner {
  _id: string;
  name: string;
  position: string;
  participation: string;
  email: string;
  startDate: string;
  status: 'active' | 'inactive';
  account: string;
  totalInvested: string;
  dividendsYTD: string;
}

export interface Distribution {
  _id: string;
  period: string;
  totalAmount: string;
  date: string;
  status: 'pending' | 'completed';
  profit: string;
  retention: string;
  reinvestment: string;
}

export interface PartnerDistribution {
  _id: string;
  distributionId: string;
  partnerId: string;
  amount: string;
  participation: string;
  status: 'pending' | 'paid';
  date: string;
} 