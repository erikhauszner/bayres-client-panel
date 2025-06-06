import { 
  Invoice, 
  Expense, 
  Transaction, 
  TransactionCategory,
  ExpenseCategory,
  BudgetItem,
  ProjectFinancialSummary,
  Partner,
  Distribution,
  PartnerDistribution
} from '../../types/finance';

// Datos mock para facturas
export const MOCK_INVOICES: Invoice[] = [
  {
    _id: 'inv-001',
    number: 'FAC-2023-0042',
    clientId: 'client-001',
    projectId: 'project-001',
    status: 'paid',
    issueDate: new Date('2023-06-15'),
    dueDate: new Date('2023-06-30'),
    items: [
      {
        description: 'Desarrollo de frontend',
        quantity: 1,
        unitPrice: 4800,
        amount: 4800
      }
    ],
    subtotal: 4800,
    taxRate: 21,
    taxAmount: 1008,
    total: 5808,
    paid: 5808,
    balance: 0,
    notes: 'Factura pagada en su totalidad',
    createdBy: 'employee-001',
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-15'),
    paidDate: new Date('2023-06-25')
  },
  {
    _id: 'inv-002',
    number: 'FAC-2023-0041',
    clientId: 'client-002',
    projectId: 'project-002',
    status: 'paid',
    issueDate: new Date('2023-06-10'),
    dueDate: new Date('2023-06-25'),
    items: [
      {
        description: 'Diseño UX/UI',
        quantity: 1,
        unitPrice: 3200,
        amount: 3200
      }
    ],
    subtotal: 3200,
    taxRate: 21,
    taxAmount: 672,
    total: 3872,
    paid: 3872,
    balance: 0,
    createdBy: 'employee-001',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-10'),
    paidDate: new Date('2023-06-20')
  },
  {
    _id: 'inv-003',
    number: 'FAC-2023-0040',
    clientId: 'client-003',
    projectId: 'project-003',
    status: 'sent',
    issueDate: new Date('2023-06-05'),
    dueDate: new Date('2023-06-20'),
    items: [
      {
        description: 'Consultoría tecnológica',
        quantity: 1,
        unitPrice: 7500,
        amount: 7500
      }
    ],
    subtotal: 7500,
    taxRate: 21,
    taxAmount: 1575,
    total: 9075,
    paid: 0,
    balance: 9075,
    createdBy: 'employee-001',
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-06-05')
  }
];

// Datos mock para gastos
export const MOCK_EXPENSES: Expense[] = [
  {
    _id: 'exp-001',
    projectId: 'project-001',
    date: new Date('2023-06-10'),
    amount: 250,
    categoryId: 'cat-001',
    description: 'Licencias de software',
    vendor: 'Adobe Inc.',
    createdBy: 'employee-001',
    status: 'approved',
    approvedBy: 'employee-002',
    approvedAt: new Date('2023-06-11'),
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-11')
  },
  {
    _id: 'exp-002',
    projectId: 'project-001',
    date: new Date('2023-06-15'),
    amount: 500,
    categoryId: 'cat-002',
    description: 'Contratación servicios externos de diseño',
    vendor: 'Freelancer Design',
    createdBy: 'employee-001',
    status: 'approved',
    approvedBy: 'employee-002',
    approvedAt: new Date('2023-06-16'),
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-16')
  },
  {
    _id: 'exp-003',
    projectId: 'project-002',
    date: new Date('2023-06-05'),
    amount: 800,
    categoryId: 'cat-003',
    description: 'Recursos adicionales para desarrollo',
    vendor: 'Tech Recursos',
    createdBy: 'employee-001',
    status: 'pending',
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-06-05')
  }
];

// Datos mock para categorías de gastos
export const MOCK_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    _id: 'cat-001',
    name: 'Software',
    description: 'Licencias y servicios de software'
  },
  {
    _id: 'cat-002',
    name: 'Servicios',
    description: 'Servicios profesionales externos'
  },
  {
    _id: 'cat-003',
    name: 'Personal',
    description: 'Gastos relacionados con personal'
  },
  {
    _id: 'cat-004',
    name: 'Oficina',
    description: 'Material y suministros de oficina'
  }
];

export const MOCK_INCOME_CATEGORIES = [
  {
    _id: 'income-cat-1',
    name: 'Servicios Profesionales',
    description: 'Servicios prestados a clientes'
  },
  {
    _id: 'income-cat-2',
    name: 'Productos',
    description: 'Venta de productos'
  },
  {
    _id: 'income-cat-3',
    name: 'Suscripciones',
    description: 'Ingresos por suscripciones'
  },
  {
    _id: 'income-cat-4',
    name: 'Licencias',
    description: 'Licencias de software'
  },
  {
    _id: 'income-cat-5',
    name: 'Otros',
    description: 'Otros ingresos'
  }
];

// Datos mock para transacciones
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    _id: 'trx-001',
    type: 'income',
    amount: 5808,
    date: new Date('2023-06-25'),
    description: 'Pago factura FAC-2023-0042',
    categoryId: 'tcat-001',
    status: 'completed',
    projectId: 'project-001',
    accountId: 'acc-001',
    paymentMethod: 'bank_transfer',
    reference: 'Factura #FAC-2023-0042',
    createdBy: 'employee-001',
    createdAt: new Date('2023-06-25'),
    updatedAt: new Date('2023-06-25')
  },
  {
    _id: 'trx-002',
    type: 'expense',
    amount: 250,
    date: new Date('2023-06-11'),
    description: 'Pago licencias software',
    categoryId: 'tcat-002',
    status: 'completed',
    projectId: 'project-001',
    accountId: 'acc-001',
    paymentMethod: 'credit_card',
    reference: 'Gasto #exp-001',
    createdBy: 'employee-001',
    createdAt: new Date('2023-06-11'),
    updatedAt: new Date('2023-06-11')
  },
  {
    _id: 'trx-003',
    type: 'expense',
    amount: 500,
    date: new Date('2023-06-16'),
    description: 'Pago servicios de diseño',
    categoryId: 'tcat-002',
    status: 'completed',
    projectId: 'project-001',
    accountId: 'acc-001',
    paymentMethod: 'bank_transfer',
    reference: 'Gasto #exp-002',
    createdBy: 'employee-001',
    createdAt: new Date('2023-06-16'),
    updatedAt: new Date('2023-06-16')
  },
  {
    _id: 'trx-004',
    type: 'income',
    amount: 3872,
    date: new Date('2023-06-20'),
    description: 'Pago factura FAC-2023-0041',
    categoryId: 'tcat-001',
    status: 'completed',
    projectId: 'project-002',
    accountId: 'acc-001',
    paymentMethod: 'bank_transfer',
    reference: 'Factura #FAC-2023-0041',
    createdBy: 'employee-001',
    createdAt: new Date('2023-06-20'),
    updatedAt: new Date('2023-06-20')
  }
];

// Datos mock para categorías de transacciones
export const MOCK_TRANSACTION_CATEGORIES: TransactionCategory[] = [
  {
    _id: 'tcat-001',
    name: 'Ingresos por ventas',
    type: 'income',
    description: 'Ingresos por servicios prestados',
    color: '#4CAF50'
  },
  {
    _id: 'tcat-002',
    name: 'Gastos operativos',
    type: 'expense',
    description: 'Gastos relacionados con la operación',
    color: '#F44336'
  },
  {
    _id: 'tcat-003',
    name: 'Transferencias',
    type: 'transfer',
    description: 'Transferencias entre cuentas',
    color: '#2196F3'
  }
];

// Datos mock para elementos de presupuesto
export const MOCK_BUDGET_ITEMS: BudgetItem[] = [
  {
    _id: 'budget-001',
    projectId: 'project-001',
    categoryId: 'cat-001',
    description: 'Licencias de software',
    budgetedAmount: 300,
    actualAmount: 250,
    variance: 50
  },
  {
    _id: 'budget-002',
    projectId: 'project-001',
    categoryId: 'cat-002',
    description: 'Servicios de diseño',
    budgetedAmount: 600,
    actualAmount: 500,
    variance: 100
  },
  {
    _id: 'budget-003',
    projectId: 'project-002',
    categoryId: 'cat-003',
    description: 'Personal adicional',
    budgetedAmount: 1000,
    actualAmount: 800,
    variance: 200
  }
];

// Datos mock para resumen financiero
export const MOCK_FINANCIAL_SUMMARY: ProjectFinancialSummary = {
  projectId: 'project-001',
  budget: 5000,
  actual: 3500,
  invoiced: 9000,
  paid: 8000,
  expenses: 1500,
  profit: 6500,
  profitMargin: 72.22
};

// Datos mock para planes recurrentes
export const MOCK_RECURRING_PLANS = [
  {
    _id: 'plan-001',
    clientId: 'client-001',
    clientName: 'ABC Solutions',
    concept: 'Servicio de hosting',
    amount: 250,
    frequency: 'monthly',
    status: 'active',
    nextDate: new Date('2023-08-15'),
    createdDate: new Date('2023-01-15'),
    lastInvoice: 'FAC-2023-0035'
  },
  {
    _id: 'plan-002',
    clientId: 'client-002',
    clientName: 'Corporación XYZ',
    concept: 'Consultoría mensual',
    amount: 12000,
    frequency: 'monthly',
    status: 'active',
    nextDate: new Date('2023-08-01'),
    createdDate: new Date('2023-02-01'),
    lastInvoice: 'FAC-2023-0039'
  },
  {
    _id: 'plan-003',
    clientId: 'client-003',
    clientName: 'Tech Avanzada',
    concept: 'Mantenimiento sitio web',
    amount: 3200,
    frequency: 'monthly',
    status: 'active',
    nextDate: new Date('2023-07-28'),
    createdDate: new Date('2023-03-28'),
    lastInvoice: 'FAC-2023-0038'
  },
  {
    _id: 'plan-004',
    clientId: 'client-005',
    clientName: 'Distribuidora Norte',
    concept: 'Servicio SEO',
    amount: 1800,
    frequency: 'quarterly',
    status: 'active',
    nextDate: new Date('2023-09-10'),
    createdDate: new Date('2023-03-10'),
    lastInvoice: 'FAC-2023-0028'
  },
  {
    _id: 'plan-005',
    clientId: 'client-006',
    clientName: 'Global Logistics',
    concept: 'Licencia software',
    amount: 4500,
    frequency: 'yearly',
    status: 'active',
    nextDate: new Date('2024-01-05'),
    createdDate: new Date('2023-01-05'),
    lastInvoice: 'FAC-2023-0005'
  }
];

// Datos mock para ingresos pendientes de confirmación
export const MOCK_PENDING_INCOMES = [
  {
    _id: 'inc-001',
    invoiceId: 'inv-005',
    invoiceNumber: 'FAC-2023-0045',
    clientId: 'client-001',
    clientName: 'ABC Solutions',
    concept: 'Desarrollo web y SEO',
    amount: 8500,
    date: new Date('2023-07-15'),
    status: 'pending',
    paymentMethod: 'bank_transfer',
    reference: 'Transferencia #12345'
  },
  {
    _id: 'inc-002',
    invoiceId: 'inv-006',
    invoiceNumber: 'FAC-2023-0044',
    clientId: 'client-002',
    clientName: 'Corporación XYZ',
    concept: 'Consultoría mensual',
    amount: 12000,
    date: new Date('2023-07-12'),
    status: 'pending',
    paymentMethod: 'bank_transfer',
    reference: 'Transferencia #67890'
  },
  {
    _id: 'inc-003',
    invoiceId: 'inv-007',
    invoiceNumber: 'REC-2023-0043',
    clientId: 'client-003',
    clientName: 'Tech Avanzada',
    concept: 'Mantenimiento sitio web (Plan recurrente)',
    amount: 3200,
    date: new Date('2023-07-10'),
    status: 'pending',
    paymentMethod: 'credit_card',
    reference: 'Cargo #54321'
  }
];

// Datos mock para socios
export const MOCK_PARTNERS: Partner[] = [
  {
    _id: "SOC001",
    name: "Eduardo Martínez",
    position: "CEO",
    participation: "40%",
    email: "eduardo@bayres.com",
    startDate: "10/01/2018",
    status: "active",
    account: "****7843",
    totalInvested: "$120,000.00",
    dividendsYTD: "$48,000.00"
  },
  {
    _id: "SOC002",
    name: "Carolina Ramírez",
    position: "COO",
    participation: "30%",
    email: "carolina@bayres.com",
    startDate: "10/01/2018",
    status: "active",
    account: "****2391",
    totalInvested: "$90,000.00",
    dividendsYTD: "$36,000.00"
  },
  {
    _id: "SOC003",
    name: "Felipe Soto",
    position: "CTO",
    participation: "20%",
    email: "felipe@bayres.com",
    startDate: "15/06/2019",
    status: "active",
    account: "****9124",
    totalInvested: "$60,000.00",
    dividendsYTD: "$24,000.00"
  },
  {
    _id: "SOC004",
    name: "Lucía Herrera",
    position: "CFO",
    participation: "10%",
    email: "lucia@bayres.com",
    startDate: "03/03/2020",
    status: "active",
    account: "****6478",
    totalInvested: "$30,000.00",
    dividendsYTD: "$12,000.00"
  }
];

// Datos mock para distribuciones de dividendos
export const MOCK_DISTRIBUTIONS: Distribution[] = [
  {
    _id: "DIV-2023-Q2",
    period: "Q2 2023",
    totalAmount: "$120,000.00",
    date: "30/06/2023",
    status: "completed",
    profit: "$200,000.00",
    retention: "$40,000.00",
    reinvestment: "$40,000.00"
  },
  {
    _id: "DIV-2023-Q1",
    period: "Q1 2023",
    totalAmount: "$100,000.00",
    date: "31/03/2023",
    status: "completed",
    profit: "$180,000.00",
    retention: "$35,000.00",
    reinvestment: "$45,000.00"
  },
  {
    _id: "DIV-2022-Q4",
    period: "Q4 2022",
    totalAmount: "$140,000.00",
    date: "31/12/2022",
    status: "completed",
    profit: "$230,000.00",
    retention: "$50,000.00",
    reinvestment: "$40,000.00"
  },
  {
    _id: "DIV-2022-Q3",
    period: "Q3 2022",
    totalAmount: "$90,000.00",
    date: "30/09/2022",
    status: "completed",
    profit: "$160,000.00",
    retention: "$30,000.00",
    reinvestment: "$40,000.00"
  },
  {
    _id: "DIV-2023-Q3",
    period: "Q3 2023",
    totalAmount: "$130,000.00",
    date: "30/09/2023",
    status: "pending",
    profit: "$220,000.00",
    retention: "$45,000.00",
    reinvestment: "$45,000.00"
  }
];

// Datos mock para distribuciones a socios
export const MOCK_PARTNER_DISTRIBUTIONS: PartnerDistribution[] = [
  {
    _id: "PD001",
    distributionId: "DIV-2023-Q2",
    partnerId: "SOC001",
    amount: "$48,000.00",
    participation: "40%",
    status: "paid",
    date: "01/07/2023"
  },
  {
    _id: "PD002",
    distributionId: "DIV-2023-Q2",
    partnerId: "SOC002",
    amount: "$36,000.00",
    participation: "30%",
    status: "paid",
    date: "01/07/2023"
  },
  {
    _id: "PD003",
    distributionId: "DIV-2023-Q2",
    partnerId: "SOC003",
    amount: "$24,000.00",
    participation: "20%",
    status: "paid",
    date: "01/07/2023"
  },
  {
    _id: "PD004",
    distributionId: "DIV-2023-Q2",
    partnerId: "SOC004",
    amount: "$12,000.00",
    participation: "10%",
    status: "paid",
    date: "01/07/2023"
  },
  {
    _id: "PD005",
    distributionId: "DIV-2023-Q1",
    partnerId: "SOC001",
    amount: "$40,000.00",
    participation: "40%",
    status: "paid",
    date: "01/04/2023"
  },
  {
    _id: "PD006",
    distributionId: "DIV-2023-Q1",
    partnerId: "SOC002",
    amount: "$30,000.00",
    participation: "30%",
    status: "paid",
    date: "01/04/2023"
  },
  {
    _id: "PD007",
    distributionId: "DIV-2023-Q1",
    partnerId: "SOC003",
    amount: "$20,000.00",
    participation: "20%",
    status: "paid",
    date: "01/04/2023"
  },
  {
    _id: "PD008",
    distributionId: "DIV-2023-Q1",
    partnerId: "SOC004",
    amount: "$10,000.00",
    participation: "10%",
    status: "paid",
    date: "01/04/2023"
  },
  {
    _id: "PD009",
    distributionId: "DIV-2023-Q3",
    partnerId: "SOC001",
    amount: "$52,000.00",
    participation: "40%",
    status: "pending",
    date: "01/10/2023"
  },
  {
    _id: "PD010",
    distributionId: "DIV-2023-Q3",
    partnerId: "SOC002",
    amount: "$39,000.00",
    participation: "30%",
    status: "pending",
    date: "01/10/2023"
  },
  {
    _id: "PD011",
    distributionId: "DIV-2023-Q3",
    partnerId: "SOC003",
    amount: "$26,000.00",
    participation: "20%",
    status: "pending",
    date: "01/10/2023"
  },
  {
    _id: "PD012",
    distributionId: "DIV-2023-Q3",
    partnerId: "SOC004",
    amount: "$13,000.00",
    participation: "10%",
    status: "pending",
    date: "01/10/2023"
  }
]; 