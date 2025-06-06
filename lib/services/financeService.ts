import api from '../api';
import { 
  Invoice, 
  Expense, 
  Transaction, 
  ProjectFinancialSummary,
  BudgetItem,
  TransactionCategory,
  ExpenseCategory,
  IncomeCategory,
  Partner,
  Distribution,
  PartnerDistribution
} from '../types/finance';

// Mock data para cuando no hay conexión a la API
import { 
  MOCK_INVOICES, 
  MOCK_EXPENSES, 
  MOCK_TRANSACTIONS, 
  MOCK_BUDGET_ITEMS,
  MOCK_EXPENSE_CATEGORIES,
  MOCK_INCOME_CATEGORIES,
  MOCK_TRANSACTION_CATEGORIES,
  MOCK_FINANCIAL_SUMMARY,
  MOCK_RECURRING_PLANS,
  MOCK_PENDING_INCOMES,
  MOCK_PARTNERS,
  MOCK_DISTRIBUTIONS,
  MOCK_PARTNER_DISTRIBUTIONS
} from './mockData/financeMockData';

class FinanceService {
  // Facturas
  async getProjectInvoices(projectId: string): Promise<Invoice[]> {
    try {
      const response = await api.get<Invoice[]>(`/finance/projects/${projectId}/invoices`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching invoices for project ${projectId}:`, error);
      // Devolver datos simulados en caso de error
      return MOCK_INVOICES.filter((invoice: Invoice) => invoice.projectId === projectId);
    }
  }

  async getClientInvoices(clientId: string): Promise<Invoice[]> {
    try {
      const response = await api.get<Invoice[]>(`/finance/clients/${clientId}/invoices`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching invoices for client ${clientId}:`, error);
      // Devolver datos simulados en caso de error
      return MOCK_INVOICES.filter((invoice: Invoice) => invoice.clientId === clientId);
    }
  }

  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    try {
      const response = await api.get<Invoice>(`/finance/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching invoice ${invoiceId}:`, error);
      // Devolver datos simulados en caso de error
      return MOCK_INVOICES.find((invoice: Invoice) => invoice._id === invoiceId) || null;
    }
  }

  async createInvoice(invoiceData: Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'>): Promise<Invoice | null> {
    try {
      const response = await api.post<Invoice>('/finance/invoices', invoiceData);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      return null;
    }
  }

  async updateInvoice(invoiceId: string, invoiceData: Partial<Invoice>): Promise<Invoice | null> {
    try {
      const response = await api.put<Invoice>(`/finance/invoices/${invoiceId}`, invoiceData);
      return response.data;
    } catch (error) {
      console.error(`Error updating invoice ${invoiceId}:`, error);
      return null;
    }
  }

  async markInvoiceAsPaid(invoiceId: string, paidAmount: number, paidDate?: Date): Promise<Invoice | null> {
    try {
      const response = await api.post<Invoice>(`/finance/invoices/${invoiceId}/mark-as-paid`, {
        paidAmount,
        paidDate
      });
      return response.data;
    } catch (error) {
      console.error(`Error marking invoice ${invoiceId} as paid:`, error);
      return null;
    }
  }

  async deleteInvoice(invoiceId: string): Promise<boolean> {
    try {
      await api.delete(`/finance/invoices/${invoiceId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting invoice ${invoiceId}:`, error);
      return false;
    }
  }

  // Gastos
  async getProjectExpenses(projectId: string): Promise<Expense[]> {
    try {
      const response = await api.get<Expense[]>(`/finance/projects/${projectId}/expenses`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching expenses for project ${projectId}:`, error);
      // Devolver datos simulados en caso de error
      return MOCK_EXPENSES.filter((expense: Expense) => expense.projectId === projectId);
    }
  }

  async getAllExpenses(): Promise<Expense[]> {
    try {
      const response = await api.get<Expense[]>('/finance/expenses');
      return response.data;
    } catch (error) {
      console.error('Error fetching all expenses:', error);
      // Devolver datos simulados en caso de error
      return MOCK_EXPENSES;
    }
  }

  async getExpenseById(expenseId: string): Promise<Expense | null> {
    try {
      const response = await api.get<Expense>(`/finance/expenses/${expenseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching expense ${expenseId}:`, error);
      // Devolver datos simulados en caso de error
      return MOCK_EXPENSES.find((expense: Expense) => expense._id === expenseId) || null;
    }
  }

  async createExpense(expenseData: Omit<Expense, '_id' | 'createdAt' | 'updatedAt'>): Promise<Expense | null> {
    try {
      // Si hay un recibo, usar FormData
      if (typeof expenseData.receipt === 'object') {
        const formData = new FormData();
        const { receipt, ...data } = expenseData as any;
        formData.append('receipt', receipt);
        formData.append('data', JSON.stringify(data));
        
        const response = await api.post<Expense>('/finance/expenses', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data;
      } else {
        const response = await api.post<Expense>('/finance/expenses', expenseData);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      return null;
    }
  }

  async updateExpense(expenseId: string, expenseData: Partial<Expense>): Promise<Expense | null> {
    try {
      // Si hay un recibo, usar FormData
      if (typeof expenseData.receipt === 'object') {
        const formData = new FormData();
        const { receipt, ...data } = expenseData as any;
        formData.append('receipt', receipt);
        formData.append('data', JSON.stringify(data));
        
        const response = await api.put<Expense>(`/finance/expenses/${expenseId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data;
      } else {
        const response = await api.put<Expense>(`/finance/expenses/${expenseId}`, expenseData);
        return response.data;
      }
    } catch (error) {
      console.error(`Error updating expense ${expenseId}:`, error);
      return null;
    }
  }

  async approveExpense(expenseId: string): Promise<Expense | null> {
    try {
      const response = await api.post<Expense>(`/finance/expenses/${expenseId}/approve`);
      return response.data;
    } catch (error) {
      console.error(`Error approving expense ${expenseId}:`, error);
      return null;
    }
  }

  async rejectExpense(expenseId: string): Promise<Expense | null> {
    try {
      const response = await api.post<Expense>(`/finance/expenses/${expenseId}/reject`);
      return response.data;
    } catch (error) {
      console.error(`Error rejecting expense ${expenseId}:`, error);
      return null;
    }
  }

  async deleteExpense(expenseId: string): Promise<boolean> {
    try {
      await api.delete(`/finance/expenses/${expenseId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting expense ${expenseId}:`, error);
      return false;
    }
  }

  // Presupuestos
  async getProjectBudget(projectId: string): Promise<BudgetItem[]> {
    try {
      const response = await api.get<BudgetItem[]>(`/finance/projects/${projectId}/budget`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching budget for project ${projectId}:`, error);
      // Devolver datos simulados en caso de error
      return MOCK_BUDGET_ITEMS.filter((item: BudgetItem) => item.projectId === projectId);
    }
  }

  // Transacciones
  async getProjectTransactions(projectId: string): Promise<Transaction[]> {
    try {
      const response = await api.get<Transaction[]>(`/finance/projects/${projectId}/transactions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transactions for project ${projectId}:`, error);
      // Devolver datos simulados en caso de error
      return MOCK_TRANSACTIONS.filter((transaction: Transaction) => transaction.projectId === projectId);
    }
  }

  // Categorías
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    try {
      const response = await api.get<ExpenseCategory[]>('/finance/expense-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      // Devolver array vacío en lugar de datos simulados
      return [];
    }
  }

  async getIncomeCategories(): Promise<IncomeCategory[]> {
    try {
      const response = await api.get<IncomeCategory[]>('/finance/income-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching income categories:', error);
      // Devolver datos mock en caso de error o si la API no está implementada
      return MOCK_INCOME_CATEGORIES;
    }
  }

  async createExpenseCategory(categoryData: Partial<ExpenseCategory>): Promise<ExpenseCategory | null> {
    try {
      const response = await api.post<ExpenseCategory>('/finance/expense-categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating expense category:', error);
      return null;
    }
  }

  async createIncomeCategory(categoryData: Partial<IncomeCategory>): Promise<IncomeCategory | null> {
    try {
      const response = await api.post<IncomeCategory>('/finance/income-categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating income category:', error);
      return null;
    }
  }

  async updateExpenseCategory(categoryId: string, categoryData: Partial<ExpenseCategory>): Promise<ExpenseCategory | null> {
    try {
      const response = await api.put<ExpenseCategory>(`/finance/expense-categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating expense category ${categoryId}:`, error);
      return null;
    }
  }

  async updateIncomeCategory(categoryId: string, categoryData: Partial<IncomeCategory>): Promise<IncomeCategory | null> {
    try {
      const response = await api.put<IncomeCategory>(`/finance/income-categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating income category ${categoryId}:`, error);
      return null;
    }
  }

  async deleteExpenseCategory(categoryId: string): Promise<boolean> {
    try {
      await api.delete(`/finance/expense-categories/${categoryId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting expense category ${categoryId}:`, error);
      return false;
    }
  }

  async deleteIncomeCategory(categoryId: string): Promise<boolean> {
    try {
      await api.delete(`/finance/income-categories/${categoryId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting income category ${categoryId}:`, error);
      return false;
    }
  }

  async getTransactionCategories(): Promise<TransactionCategory[]> {
    try {
      const response = await api.get<TransactionCategory[]>('/finance/transaction-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction categories:', error);
      // Devolver array vacío en lugar de datos simulados
      return [];
    }
  }

  async createTransactionCategory(categoryData: Partial<TransactionCategory>): Promise<TransactionCategory | null> {
    try {
      const response = await api.post<TransactionCategory>('/finance/transaction-categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction category:', error);
      return null;
    }
  }

  async updateTransactionCategory(categoryId: string, categoryData: Partial<TransactionCategory>): Promise<TransactionCategory | null> {
    try {
      const response = await api.put<TransactionCategory>(`/finance/transaction-categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating transaction category ${categoryId}:`, error);
      return null;
    }
  }

  async deleteTransactionCategory(categoryId: string): Promise<boolean> {
    try {
      await api.delete(`/finance/transaction-categories/${categoryId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting transaction category ${categoryId}:`, error);
      return false;
    }
  }

  // Obtener todas las transacciones
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const response = await api.get<Transaction[]>('/finance/transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      // Devolver datos simulados en caso de error
      return MOCK_TRANSACTIONS;
    }
  }
  
  // Actualizar una transacción
  async updateTransaction(transactionId: string, transactionData: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const response = await api.put<Transaction>(`/finance/transactions/${transactionId}`, transactionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating transaction ${transactionId}:`, error);
      return null;
    }
  }

  // Resumen financiero
  async getProjectFinancialSummary(projectId: string): Promise<ProjectFinancialSummary | null> {
    try {
      const response = await api.get<ProjectFinancialSummary>(`/finance/projects/${projectId}/financial-summary`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching financial summary for project ${projectId}:`, error);
      // Devolver datos simulados en caso de error
      return MOCK_FINANCIAL_SUMMARY;
    }
  }

  // Utilidades
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid':
      case 'completed':
      case 'approved':
        return 'text-green-500';
      case 'sent':
      case 'pending':
        return 'text-blue-500';
      case 'overdue':
      case 'rejected':
        return 'text-red-500';
      case 'draft':
        return 'text-gray-500';
      case 'cancelled':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'paid':
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400';
      case 'sent':
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400';
      case 'overdue':
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
    }
  }

  // Obtener todas las facturas
  async getAllInvoices(): Promise<Invoice[]> {
    try {
      const response = await api.get<Invoice[]>('/finance/invoices');
      return response.data;
    } catch (error) {
      console.error('Error fetching all invoices:', error);
      // En caso de error, retornar un array vacío en lugar de datos mock
      return [];
    }
  }

  // Registrar pago de factura
  async registerInvoicePayment(invoiceId: string, paymentData: { paidAmount: number, paidDate?: Date }): Promise<Invoice | null> {
    try {
      const response = await api.post<Invoice>(`/finance/invoices/${invoiceId}/mark-as-paid`, paymentData);
      return response.data;
    } catch (error) {
      console.error(`Error registering payment for invoice ${invoiceId}:`, error);
      return null;
    }
  }

  // Enviar recordatorio de factura
  async sendInvoiceReminder(invoiceId: string): Promise<boolean> {
    try {
      const response = await api.post(`/finance/invoices/${invoiceId}/send-reminder`);
      return response.status === 200;
    } catch (error) {
      console.error(`Error sending reminder for invoice ${invoiceId}:`, error);
      return false;
    }
  }

  // Obtener todos los clientes con facturas
  async getClientsWithInvoices(): Promise<any[]> {
    try {
      const response = await api.get('/finance/clients-with-invoices');
      
      // Verificar si la respuesta es válida
      if (!response || !response.data) {
        console.warn('Respuesta vacía al obtener clientes con facturas');
        return [];
      }
      
      // Asegurar que response.data sea un array
      const clientsData = Array.isArray(response.data) ? response.data : 
                         (typeof response.data === 'object' && response.data !== null) ? [response.data] : [];
      
      // Mapear los datos al formato requerido
      return clientsData.map(client => ({
        id: client._id || client.id || `client-${Math.random().toString(36).substr(2, 9)}`,
        name: client.name || client.businessName || "",
        email: client.email || "",
        status: client.status || "active"
      }));
    } catch (error) {
      console.error('Error fetching clients with invoices:', error);
      // En caso de error, retornar array vacío
      return [];
    }
  }
  
  // Obtener todos los clientes (no solo los que tienen facturas)
  async getAllClients(): Promise<any[]> {
    try {
      // Solicitar específicamente clientes con estado activo
      const response = await api.get('/clients', {
        params: { status: 'active' }
      });
      
      // Verificar si la respuesta es válida
      if (!response || !response.data) {
        console.warn('Respuesta vacía al obtener clientes');
        return [];
      }
      
      // Asegurar que response.data.data sea un array (la API devuelve {data: [...clientes]})
      const clientsData = Array.isArray(response.data.data) ? response.data.data : 
                         (typeof response.data === 'object' && response.data.data) ? response.data.data :
                         Array.isArray(response.data) ? response.data : [];
      
      // Mapear los datos al formato requerido
      return clientsData.map((client: any) => ({
        id: client._id || client.id || `client-${Math.random().toString(36).substr(2, 9)}`,
        name: client.name || client.businessName || "",
        email: client.email || "",
        status: client.status || "active"
      }));
    } catch (error) {
      console.error('Error fetching all clients:', error);
      
      // Intentar obtener clientes con facturas como alternativa
      try {
        const invoiceClients = await this.getClientsWithInvoices();
        if (Array.isArray(invoiceClients) && invoiceClients.length > 0) {
          return invoiceClients;
        }
      } catch (fallbackError) {
        console.error('Error en fallback getClientsWithInvoices:', fallbackError);
      }
      
      // Si todo falla, devolver datos de ejemplo básicos
      return [
        { id: "example1", name: "Cliente Ejemplo 1", email: "cliente1@ejemplo.com", status: "active" },
        { id: "example2", name: "Cliente Ejemplo 2", email: "cliente2@ejemplo.com", status: "active" },
        { id: "example3", name: "Cliente Ejemplo 3", email: "cliente3@ejemplo.com", status: "active" }
      ];
    }
  }

  // Crear plan recurrente (simulación ya que no existe en el backend aún)
  async createRecurringPlan(planData: any): Promise<any | null> {
    try {
      // Esta función simula la creación de un plan recurrente
      // Cuando se implemente el backend, se cambiará por una llamada a la API real
      console.log('Creating recurring plan with data:', planData);
      
      // Por ahora simular una respuesta exitosa
      return {
        ...planData,
        _id: `rec-${Date.now()}`,
        createdAt: new Date(),
        status: 'active'
      };
    } catch (error) {
      console.error('Error creating recurring plan:', error);
      return null;
    }
  }

  // Obtener planes recurrentes 
  async getRecurringPlans(): Promise<any[]> {
    try {
      // Hacer una solicitud a la API para obtener los planes recurrentes reales
      const response = await api.get('/finance/recurring-plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching recurring plans:', error);
      
      // En caso de error, devolvemos los datos mock como fallback
      console.log('Usando datos mock como fallback para planes recurrentes');
      return MOCK_RECURRING_PLANS || [];
    }
  }

  // Obtener ingresos pendientes de confirmación (simulación)
  async getPendingIncomes(): Promise<any[]> {
    try {
      // Esta función simula la obtención de ingresos pendientes de confirmación
      // Cuando se implemente el backend, se cambiará por una llamada a la API real
      console.log('Fetching pending incomes');
      
      // Por ahora devolver datos mock simulados
      return MOCK_PENDING_INCOMES || [];
    } catch (error) {
      console.error('Error fetching pending incomes:', error);
      return [];
    }
  }

  // Confirmar ingresos pendientes (simulación)
  async confirmPendingIncomes(incomeIds: string[]): Promise<boolean> {
    try {
      // Esta función simula la confirmación de ingresos pendientes
      // Cuando se implemente el backend, se cambiará por una llamada a la API real
      console.log('Confirming pending incomes:', incomeIds);
      
      // Por ahora simular una respuesta exitosa
      return true;
    } catch (error) {
      console.error('Error confirming pending incomes:', error);
      return false;
    }
  }

  // Obtener facturas pendientes de pago
  async getPendingInvoices(): Promise<any[]> {
    try {
      const response = await api.get('/finance/pending-invoices');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending invoices:', error);
      return [];
    }
  }

  // Confirmar pagos de facturas
  async confirmInvoicePayments(invoiceIds: string[], paymentDetails: { 
    accountId?: string, 
    reference?: string, 
    notes?: string,
    isPartialPayment?: boolean,
    partialAmount?: number,
    remainingAmount?: number,
    originalInvoiceId?: string,
    status?: string
  }): Promise<any> {
    try {
      // Si es un pago parcial, necesitamos:
      // 1. Actualizar la factura original con el monto pagado
      // 2. Crear una nueva factura por el monto restante
      // 3. Luego confirmar el pago de la factura original
      
      if (paymentDetails.isPartialPayment && 
          paymentDetails.partialAmount && 
          paymentDetails.remainingAmount &&
          invoiceIds.length === 1) { // Solo para pagos de una factura
        
        const invoiceId = invoiceIds[0];
        
        console.log('Procesando pago parcial para factura:', {
          invoiceId,
          partialAmount: paymentDetails.partialAmount,
          remainingAmount: paymentDetails.remainingAmount
        });
        
        try {
          // 1. Obtener la factura original
          const originalInvoiceResponse = await api.get(`/finance/invoices/${invoiceId}`);
          const originalInvoice = originalInvoiceResponse.data;
          
          if (!originalInvoice) {
            throw new Error('No se pudo obtener la factura original');
          }
          
          // 2. Crear una nueva factura por el monto restante
          const newInvoiceData = {
            clientId: originalInvoice.clientId,
            clientName: typeof originalInvoice.clientId === 'object' && originalInvoice.clientId && 'name' in originalInvoice.clientId 
                ? originalInvoice.clientId.name 
                : 'Cliente',
            projectId: originalInvoice.projectId,
            projectName: typeof originalInvoice.projectId === 'object' && originalInvoice.projectId && 'name' in originalInvoice.projectId
                ? originalInvoice.projectId.name
                : 'General',
            total: paymentDetails.remainingAmount,
            status: 'draft',
            items: originalInvoice.items ? originalInvoice.items.map((item: any) => ({
              description: `${item.description} (Saldo pendiente)`,
              quantity: 1,
              unitPrice: paymentDetails.remainingAmount,
              amount: paymentDetails.remainingAmount
            })) : [{
              description: `Saldo pendiente de factura #${originalInvoice.number || invoiceId}`,
              quantity: 1,
              unitPrice: paymentDetails.remainingAmount,
              amount: paymentDetails.remainingAmount
            }],
            notes: `Saldo pendiente de factura #${originalInvoice.number || invoiceId}`,
            issueDate: new Date(),
            dueDate: originalInvoice.dueDate || new Date(new Date().setDate(new Date().getDate() + 30)),
            relatedInvoiceId: invoiceId,
            number: `${originalInvoice.number || 'INV'}-R${new Date().getTime().toString().slice(-4)}`,
            subtotal: paymentDetails.remainingAmount,
            taxRate: originalInvoice.taxRate || 0,
            taxAmount: originalInvoice.taxAmount 
              ? (originalInvoice.taxAmount * paymentDetails.remainingAmount / originalInvoice.total) 
              : 0,
            createdBy: originalInvoice.createdBy || '000000000000000000000000',
            balance: paymentDetails.remainingAmount,
            paid: 0
          };
          
          // Asegurarnos de que no haya valores undefined o null en campos obligatorios
          if (!newInvoiceData.number) {
            newInvoiceData.number = `REM-${Date.now().toString().slice(-6)}`;
          }
          
          if (newInvoiceData.taxRate === undefined || newInvoiceData.taxRate === null) {
            newInvoiceData.taxRate = 0;
          }
          
          if (newInvoiceData.taxAmount === undefined || newInvoiceData.taxAmount === null) {
            newInvoiceData.taxAmount = 0;
          }
          
          if (newInvoiceData.subtotal === undefined || newInvoiceData.subtotal === null) {
            newInvoiceData.subtotal = paymentDetails.remainingAmount;
          }
          
          // Crear la nueva factura
          const newInvoiceResponse = await api.post('/finance/invoices', newInvoiceData);
          const newInvoice = newInvoiceResponse.data;
          
          console.log('Nueva factura por saldo restante creada:', newInvoice);
          
          // 3. Actualizar la factura original para reflejar el pago parcial
          const updateData = {
            status: 'paid',
            paid: paymentDetails.partialAmount,
            total: paymentDetails.partialAmount, // Modificar el total para que solo refleje lo pagado
            balance: 0, // Como esta factura ahora se considera pagada, el balance es 0
            notes: originalInvoice.notes 
              ? `${originalInvoice.notes}\nFactura modificada: se pagaron ${paymentDetails.partialAmount} de ${originalInvoice.total} originales. Saldo restante facturado en factura #${newInvoice._id}`
              : `Factura modificada: se pagaron ${paymentDetails.partialAmount} de ${originalInvoice.total} originales. Saldo restante facturado en factura #${newInvoice._id}`
          };
          
          // Actualizar la factura original
          await api.put(`/finance/invoices/${invoiceId}`, updateData);
          
          console.log('Factura original actualizada con pago parcial');
          
          // 4. Confirmar el pago (ahora solo por el monto parcial)
          const confirmResponse = await api.post('/finance/confirm-invoices', {
            invoiceIds,
            accountId: paymentDetails.accountId,
            reference: paymentDetails.reference,
            notes: `${paymentDetails.notes || ''} - Pago parcial confirmado. Saldo restante en factura #${newInvoice._id}`,
            amount: paymentDetails.partialAmount // Especificamos el monto pagado
          });
          
          // Devolver respuesta combinada
          return {
            ...confirmResponse.data,
            newInvoice
          };
        } catch (error: any) {
          console.error('Error procesando pago parcial:', error);
          
          // Proporcionar información más detallada sobre el error
          if (error.response && error.response.data) {
            const errorData = error.response.data;
            const errorDetails = {
              status: error.response.status,
              message: errorData.message || 'Error desconocido',
              details: errorData.error || errorData.details || '',
              failed: errorData.failed || []
            };
            
            console.error('Detalles del error:', errorDetails);
            
            // Si hay un error específico para esta factura, mostrar ese mensaje
            if (Array.isArray(errorDetails.failed) && errorDetails.failed.length > 0) {
              const failedInvoice = errorDetails.failed.find((item: any) => 
                item.id === invoiceId || (typeof item === 'object' && item.id === invoiceId)
              );
              
              if (failedInvoice && failedInvoice.reason) {
                throw new Error(`Error: ${failedInvoice.reason}`);
              }
            }
          }
          
          // Si no se pudo determinar un error específico, lanzar el error original
          throw error;
        }
      }
      
      // Para pagos completos, simplemente confirmar la factura
      console.log('Confirmando pago completo para facturas:', invoiceIds);
      
      const response = await api.post('/finance/confirm-invoices', {
        invoiceIds,
        ...paymentDetails
      });
      
      return response.data;
      
    } catch (error: any) {
      console.error('Error confirming invoice payments:', error);
      
      // Proporcionar información más detallada sobre el error
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.error('Error procesando pago parcial:', {
          status: error.response.status,
          message: errorData.message || 'Error desconocido',
          details: errorData.error || errorData.details || ''
        });
      }
      
      throw error;
    }
  }

  // Obtener resumen de ingresos y cobros
  async getIncomesSummary(): Promise<any> {
    try {
      const response = await api.get('/finance/incomes-summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching incomes summary:', error);
      // En caso de error, devolver datos simulados básicos
      return {
        totalPending: 0,
        overdue: 0,
        recurringTotal: 0,
        upcomingTotal: 0,
        pendingCount: 0,
        overdueCount: 0,
        recurringCount: 0,
        upcomingCount: 0
      };
    }
  }

  // Métodos para gestión de nómina
  async getEmployeePayroll(): Promise<any[]> {
    try {
      const response = await api.get('/finance/payroll/employees');
      return response.data;
    } catch (error) {
      console.error('Error fetching employee payroll data:', error);
      // En caso de error o desarrollo, devolvemos datos de los empleados normales
      // ya que no tenemos MOCK_PAYROLL específico
      const employeeResponse = await api.get('/employees');
      return employeeResponse.data.employees.map((emp: any) => ({
        id: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        position: emp.position,
        salary: this.generateRandomSalary(),
        email: emp.email,
        startDate: emp.createdAt,
        paymentMethod: "Transferencia",
        accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
        lastPayment: this.formatDate(new Date(Date.now() - 30*24*60*60*1000)),
        status: emp.isActive ? "active" : "inactive"
      }));
    }
  }

  async getPayrollHistory(): Promise<any[]> {
    try {
      const response = await api.get('/finance/payroll/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll history:', error);
      
      // Intentamos obtener transacciones y filtrar las de nómina
      try {
        const transactionsResponse = await api.get('/finance/transactions');
        const payrollTransactions = transactionsResponse.data.filter(
          (transaction: any) => 
            transaction.type === 'expense' && 
            (transaction.description.toLowerCase().includes('nómina') || 
             transaction.description.toLowerCase().includes('salario'))
        );
        
        return payrollTransactions.map((transaction: any) => ({
          id: transaction._id,
          employee: transaction.description.split(' - ')[1] || 'Empleado',
          employeeId: transaction.employeeId || '',
          amount: transaction.amount.toFixed(2),
          concept: transaction.description,
          date: this.formatDate(transaction.date),
          status: transaction.status === 'completed' ? 'completed' : 'pending'
        }));
      } catch (innerError) {
        console.error('Error retrieving transactions for payroll:', innerError);
        return [];
      }
    }
  }

  async getScheduledPayments(): Promise<any[]> {
    try {
      const response = await api.get('/finance/payroll/scheduled');
      return response.data;
    } catch (error) {
      console.error('Error fetching scheduled payroll payments:', error);
      // Si falla, intentamos obtener planes recurrentes
      try {
        const recurringPlansResponse = await api.get('/finance/recurring-plans');
        const payrollPlans = recurringPlansResponse.data.filter(
          (plan: any) => plan.type === 'expense' && plan.description.toLowerCase().includes('nómina')
        );
        
        return payrollPlans.map((plan: any) => ({
          id: plan._id,
          name: plan.description,
          frequency: plan.frequency,
          employees: plan.items?.length || Math.floor(1 + Math.random() * 5),
          totalAmount: plan.amount.toFixed(2),
          nextDate: this.formatDate(plan.nextDate),
          status: plan.status
        }));
      } catch (innerError) {
        console.error('Error retrieving recurring plans for payroll:', innerError);
        return [];
      }
    }
  }

  async registerPayrollPayment(paymentData: any): Promise<any> {
    try {
      const response = await api.post('/finance/payroll/register', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error registering payroll payment:', error);
      
      // Como fallback, intentamos crear una transacción general
      try {
        const transactionData = {
          type: 'expense',
          amount: paymentData.amount,
          date: paymentData.date || new Date(),
          description: `Nómina - ${paymentData.employeeName || 'Empleado'}`,
          categoryId: paymentData.categoryId || '123456789012345678901234', // ID de categoría por defecto
          status: 'pending',
          accountId: paymentData.accountId || '123456789012345678901234', // ID de cuenta por defecto
          paymentMethod: paymentData.paymentMethod || 'bank_transfer',
          employeeId: paymentData.employeeId,
          reference: paymentData.reference
        };
        
        const transactionResponse = await api.post('/finance/transactions', transactionData);
        return transactionResponse.data;
      } catch (innerError) {
        console.error('Error creating transaction for payroll:', innerError);
        return null;
      }
    }
  }

  async confirmPayrollPayment(paymentId: string): Promise<any> {
    try {
      const response = await api.post(`/finance/payroll/confirm/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error confirming payroll payment ${paymentId}:`, error);
      
      // Como fallback, intentamos actualizar la transacción
      try {
        const transactionData = {
          status: 'completed'
        };
        
        const transactionResponse = await api.put(`/finance/transactions/${paymentId}`, transactionData);
        return transactionResponse.data;
      } catch (innerError) {
        console.error('Error updating transaction for payroll confirmation:', innerError);
        return null;
      }
    }
  }

  // Método auxiliar para generar salarios aleatorios para datos de prueba
  private generateRandomSalary(): string {
    const baseSalary = 2500 + Math.floor(Math.random() * 3000);
    return `$${baseSalary.toFixed(2)}`;
  }

  // Métodos para gestión de socios y dividendos
  
  async getPartners(): Promise<Partner[]> {
    try {
      const response = await api.get<Partner[]>('/finance/partners');
      return response.data.map(partner => ({
        ...partner,
        _id: partner._id.toString(),
        totalInvested: this.formatCurrency(Number(partner.totalInvested)),
        dividendsYTD: this.formatCurrency(Number(partner.dividendsYTD))
      }));
    } catch (error) {
      console.error('Error al obtener socios:', error);
      // Devolver datos mock como respaldo
      return MOCK_PARTNERS;
    }
  }

  async getPartnerById(partnerId: string): Promise<Partner | null> {
    try {
      const response = await api.get<Partner>(`/finance/partners/${partnerId}`);
      return {
        ...response.data,
        _id: response.data._id.toString(),
        totalInvested: this.formatCurrency(Number(response.data.totalInvested)),
        dividendsYTD: this.formatCurrency(Number(response.data.dividendsYTD))
      };
    } catch (error) {
      console.error(`Error al obtener socio ${partnerId}:`, error);
      // Devolver datos mock filtrados como respaldo
      return MOCK_PARTNERS.find(partner => partner._id === partnerId) || null;
    }
  }

  async getDistributions(): Promise<Distribution[]> {
    try {
      const response = await api.get<Distribution[]>('/finance/distributions');
      return response.data.map(dist => ({
        ...dist,
        _id: dist._id.toString(),
        totalAmount: this.formatCurrency(Number(dist.totalAmount)),
        profit: this.formatCurrency(Number(dist.profit)),
        retention: this.formatCurrency(Number(dist.retention)),
        reinvestment: this.formatCurrency(Number(dist.reinvestment)),
        date: this.formatDate(dist.date)
      }));
    } catch (error) {
      console.error('Error al obtener distribuciones:', error);
      // Devolver datos mock como respaldo
      return MOCK_DISTRIBUTIONS;
    }
  }

  async getDistributionById(distributionId: string): Promise<Distribution | null> {
    try {
      const response = await api.get<Distribution>(`/finance/distributions/${distributionId}`);
      return {
        ...response.data,
        _id: response.data._id.toString(),
        totalAmount: this.formatCurrency(Number(response.data.totalAmount)),
        profit: this.formatCurrency(Number(response.data.profit)),
        retention: this.formatCurrency(Number(response.data.retention)),
        reinvestment: this.formatCurrency(Number(response.data.reinvestment)),
        date: this.formatDate(response.data.date)
      };
    } catch (error) {
      console.error(`Error al obtener distribución ${distributionId}:`, error);
      // Devolver datos mock filtrados como respaldo
      return MOCK_DISTRIBUTIONS.find(dist => dist._id === distributionId) || null;
    }
  }

  async getPartnerDistributions(partnerId?: string, distributionId?: string): Promise<PartnerDistribution[]> {
    try {
      let url = '/finance/partner-distributions';
      const params = new URLSearchParams();
      
      if (partnerId) {
        params.append('partnerId', partnerId);
      }
      
      if (distributionId) {
        params.append('distributionId', distributionId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get<PartnerDistribution[]>(url);
      return response.data.map(pd => ({
        ...pd,
        _id: String(pd._id),
        distributionId: typeof pd.distributionId === 'object' && pd.distributionId !== null ? 
          String((pd.distributionId as any)._id) : String(pd.distributionId),
        partnerId: typeof pd.partnerId === 'object' && pd.partnerId !== null ? 
          String((pd.partnerId as any)._id) : String(pd.partnerId),
        amount: this.formatCurrency(Number(pd.amount)),
        date: this.formatDate(pd.date)
      }));
    } catch (error) {
      console.error('Error al obtener distribuciones por socio:', error);
      
      // Filtrar datos mock según los parámetros recibidos
      let results = [...MOCK_PARTNER_DISTRIBUTIONS];
      
      if (partnerId) {
        results = results.filter(pd => pd.partnerId === partnerId);
      }
      
      if (distributionId) {
        results = results.filter(pd => pd.distributionId === distributionId);
      }
      
      return results;
    }
  }

  async createDistribution(distributionData: Omit<Distribution, '_id'>): Promise<Distribution | null> {
    try {
      // Preparar los datos para la API
      const apiData = {
        ...distributionData,
        totalAmount: parseFloat(String(distributionData.totalAmount).replace(/[$,]/g, '')),
        profit: parseFloat(String(distributionData.profit).replace(/[$,]/g, '')),
        retention: parseFloat(String(distributionData.retention).replace(/[$,]/g, '')),
        reinvestment: parseFloat(String(distributionData.reinvestment).replace(/[$,]/g, '')),
        date: new Date(distributionData.date)
      };
      
      const response = await api.post<{distribution: Distribution}>('/finance/distributions', apiData);
      const { distribution } = response.data;
      
      return {
        ...distribution,
        _id: String(distribution._id),
        totalAmount: this.formatCurrency(Number(distribution.totalAmount)),
        profit: this.formatCurrency(Number(distribution.profit)),
        retention: this.formatCurrency(Number(distribution.retention)),
        reinvestment: this.formatCurrency(Number(distribution.reinvestment)),
        date: this.formatDate(distribution.date)
      };
    } catch (error) {
      console.error('Error al crear distribución:', error);
      return null;
    }
  }

  async completeDistribution(distributionId: string): Promise<boolean> {
    try {
      await api.post(`/finance/distributions/${distributionId}/complete`);
      return true;
    } catch (error) {
      console.error(`Error al completar la distribución ${distributionId}:`, error);
      return false;
    }
  }

  async updatePartnerDistribution(id: string, updates: Partial<PartnerDistribution>): Promise<PartnerDistribution | null> {
    try {
      // Preparar los datos para la API
      const apiData: any = { ...updates };
      
      if (updates.amount) {
        apiData.amount = parseFloat(String(updates.amount).replace(/[$,]/g, ''));
      }
      
      const response = await api.put<PartnerDistribution>(`/finance/partner-distributions/${id}`, apiData);
      const data = response.data;
      
      return {
        ...data,
        _id: String(data._id),
        distributionId: typeof data.distributionId === 'object' && data.distributionId !== null ? 
          String((data.distributionId as any)._id) : String(data.distributionId),
        partnerId: typeof data.partnerId === 'object' && data.partnerId !== null ? 
          String((data.partnerId as any)._id) : String(data.partnerId),
        amount: this.formatCurrency(Number(data.amount)),
        date: this.formatDate(data.date)
      };
    } catch (error) {
      console.error(`Error al actualizar la distribución por socio ${id}:`, error);
      return null;
    }
  }

  async getDividendsSummary(): Promise<any> {
    try {
      const response = await api.get('/finance/dividends-summary');
      const data = response.data;
      
      return {
        activePartners: data.activePartners,
        totalCapital: this.formatCurrency(Number(data.totalCapital)),
        totalDistributionsYTD: this.formatCurrency(Number(data.totalDistributionsYTD)),
        distributionsCount: data.distributionsCount,
        nextDistribution: data.nextDistribution ? {
          ...data.nextDistribution,
          _id: String((data.nextDistribution as any)._id),
          totalAmount: this.formatCurrency(Number(data.nextDistribution.totalAmount)),
          date: this.formatDate(data.nextDistribution.date)
        } : null,
        totalReinvestmentYTD: this.formatCurrency(Number(data.totalReinvestmentYTD))
      };
    } catch (error) {
      console.error('Error al obtener resumen de dividendos:', error);
      
      // Generar resumen basado en datos mock como respaldo
      const completedDistributions = MOCK_DISTRIBUTIONS.filter(d => d.status === 'completed');
      const currentYearDistributions = completedDistributions.filter(d => d.period.includes('2023'));
      
      return {
        activePartners: MOCK_PARTNERS.filter(p => p.status === 'active').length,
        totalCapital: MOCK_PARTNERS.reduce((sum, p) => sum + parseFloat(p.totalInvested.replace('$', '').replace(',', '')), 0),
        totalDistributionsYTD: currentYearDistributions.reduce((sum, d) => sum + parseFloat(d.totalAmount.replace('$', '').replace(',', '')), 0),
        distributionsCount: currentYearDistributions.length,
        nextDistribution: MOCK_DISTRIBUTIONS.find(d => d.status === 'pending') || null,
        totalReinvestmentYTD: currentYearDistributions.reduce((sum, d) => sum + parseFloat(d.reinvestment.replace('$', '').replace(',', '')), 0)
      };
    }
  }
}

export const financeService = new FinanceService(); 