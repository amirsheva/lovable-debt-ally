import { supabase } from "@/integrations/supabase/client";
import { Debt, DebtType, DebtStatus, Payment, Category, Bank, DayNote } from "../types";
import { queryCustomTable } from "@/utils/supabaseUtils";

// Function to fetch all debts from Supabase for the current user
export const fetchDebts = async (): Promise<Debt[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("debts")
    .select("*");

  if (error) {
    console.error("Error fetching debts:", error);
    throw error;
  }

  // Transform from database format to application format
  return (data || []).map(item => ({
    id: item.id,
    name: (item as any).name as string | undefined,
    amount: Number(item.amount),
    debtType: item.debt_type as DebtType,
    dueDate: item.due_date,
    installments: item.installments,
    installmentAmount: Number(item.installment_amount),
    description: item.description,
    status: item.status as DebtStatus,
    createdAt: item.created_at,
    user_id: item.user_id,
    category_id: (item as any).category_id,
    bank_id: (item as any).bank_id
  }));
};

// Function to fetch all payments from Supabase for the current user
export const fetchPayments = async (): Promise<Payment[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("payments")
    .select("*");

  if (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }

  // Transform from database format to application format
  return (data || []).map(item => ({
    id: item.id,
    debtId: item.debt_id,
    paymentDate: item.payment_date,
    paymentAmount: Number(item.payment_amount),
    remainingBalance: Number(item.remaining_balance),
    user_id: item.user_id
  }));
};

// Function to add a new debt to Supabase
export const addDebt = async (debt: Omit<Debt, "id" | "createdAt">): Promise<Debt> => {
  const { data, error } = await supabase
    .from("debts")
    .insert({
      name: debt.name,
      amount: debt.amount,
      debt_type: debt.debtType,
      due_date: debt.dueDate,
      installments: debt.installments,
      installment_amount: debt.installmentAmount,
      description: debt.description,
      status: debt.status,
      category_id: debt.category_id,
      bank_id: debt.bank_id
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding debt:", error);
    throw error;
  }

  // Transform from database format to application format
  return {
    id: data.id,
    name: (data as any).name as string | undefined,
    amount: Number(data.amount),
    debtType: data.debt_type as DebtType,
    dueDate: data.due_date,
    installments: data.installments,
    installmentAmount: Number(data.installment_amount),
    description: data.description,
    status: data.status as DebtStatus,
    createdAt: data.created_at,
    user_id: data.user_id,
    category_id: (data as any).category_id,
    bank_id: (data as any).bank_id
  };
};

// Function to add a new payment to Supabase
export const addPayment = async (payment: Omit<Payment, "id">): Promise<Payment> => {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      debt_id: payment.debtId,
      payment_date: payment.paymentDate,
      payment_amount: payment.paymentAmount,
      remaining_balance: payment.remainingBalance,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding payment:", error);
    throw error;
  }

  // Transform from database format to application format
  return {
    id: data.id,
    debtId: data.debt_id,
    paymentDate: data.payment_date,
    paymentAmount: Number(data.payment_amount),
    remainingBalance: Number(data.remaining_balance),
    user_id: data.user_id
  };
};

// Function to update a debt status
export const updateDebtStatus = async (id: string, status: DebtStatus): Promise<void> => {
  const { error } = await supabase
    .from("debts")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating debt status:", error);
    throw error;
  }
};

// Function to fetch categories
export const fetchCategories = async (): Promise<Category[]> => {
  const result = await queryCustomTable<Category>('debt_categories')
    .select('*')
    .order('name')
    .get();

  if (result.error) {
    console.error("Error fetching categories:", result.error);
    throw result.error;
  }

  return (result.data || []) as Category[];
};

// Function to fetch banks
export const fetchBanks = async (): Promise<Bank[]> => {
  const result = await queryCustomTable<Bank>('banks')
    .select('*')
    .order('name')
    .get();

  if (result.error) {
    console.error("Error fetching banks:", result.error);
    throw result.error;
  }

  return (result.data || []) as Bank[];
};

// Function to add a new category
export const addCategory = async (name: string, isSystem: boolean = false): Promise<Category> => {
  const result = await queryCustomTable<Category>('debt_categories')
    .insert({ name, is_system: isSystem });

  if (result.error) {
    console.error("Error adding category:", result.error);
    throw result.error;
  }

  return result.data as Category;
};

// Function to add a new bank
export const addBank = async (name: string, isSystem: boolean = false): Promise<Bank> => {
  const result = await queryCustomTable<Bank>('banks')
    .insert({ name, is_system: isSystem });

  if (result.error) {
    console.error("Error adding bank:", result.error);
    throw result.error;
  }

  return result.data as Bank;
};

// Function to fetch day notes for a specific date
export const fetchDayNote = async (date: string): Promise<DayNote | null> => {
  const result = await queryCustomTable<DayNote>('day_notes')
    .select('*')
    .eq('date', date)
    .maybeSingle();

  if (result.error) {
    console.error("Error fetching day note:", result.error);
    throw result.error;
  }

  return (result.data || null) as DayNote | null;
};

// Function to save a day note
export const saveDayNote = async (date: string, note: string, id?: string): Promise<DayNote> => {
  if (id) {
    // Update existing note
    const result = await queryCustomTable<DayNote>('day_notes')
      .update({ note })
      .eq('id', id);

    if (result.error) {
      console.error("Error updating day note:", result.error);
      throw result.error;
    }

    return result.data as DayNote;
  } else {
    // Insert new note
    const result = await queryCustomTable<DayNote>('day_notes')
      .insert({ date, note });

    if (result.error) {
      console.error("Error adding day note:", result.error);
      throw result.error;
    }

    return result.data as DayNote;
  }
};

// Function to delete a day note
export const deleteDayNote = async (id: string): Promise<void> => {
  const result = await queryCustomTable("day_notes")
    .delete()
    .eq("id", id);

  if (result.error) {
    console.error("Error deleting day note:", result.error);
    throw result.error;
  }
};

// Function to migrate existing data from localStorage to Supabase
export const migrateLocalStorageToSupabase = async (): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return; // Only migrate if user is logged in

    // Load mock data from localStorage
    const storedDebts = localStorage.getItem('debts');
    const storedPayments = localStorage.getItem('payments');
    
    if (storedDebts) {
      const debts: Debt[] = JSON.parse(storedDebts);
      
      // Only migrate if there's no existing data in Supabase
      const { count } = await supabase.from('debts').select('*', { count: 'exact', head: true });
      
      if (count === 0) {
        for (const debt of debts) {
          // Insert each debt into Supabase
          await supabase.from('debts').insert({
            id: debt.id, // Preserve original ID for reference
            name: debt.name || debt.description.substring(0, 50), // Use description as name if not provided
            amount: debt.amount,
            debt_type: debt.debtType,
            due_date: debt.dueDate,
            installments: debt.installments,
            installment_amount: debt.installmentAmount,
            description: debt.description,
            status: debt.status,
            created_at: debt.createdAt
          });
        }
      }
    }
    
    if (storedPayments) {
      const payments: Payment[] = JSON.parse(storedPayments);
      
      // Only migrate if there's no existing data in Supabase
      const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true });
      
      if (count === 0) {
        for (const payment of payments) {
          // Insert each payment into Supabase
          await supabase.from('payments').insert({
            id: payment.id, // Preserve original ID for reference
            debt_id: payment.debtId,
            payment_date: payment.paymentDate,
            payment_amount: payment.paymentAmount,
            remaining_balance: payment.remainingBalance
          });
        }
      }
    }
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};
