
import { supabase } from "@/integrations/supabase/client";
import { Debt, DebtType, DebtStatus, Payment } from "../types";
import { format } from "date-fns";

// Function to fetch all debts from Supabase
export const fetchDebts = async (): Promise<Debt[]> => {
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
    amount: Number(item.amount),
    debtType: item.debt_type as DebtType,
    dueDate: item.due_date,
    installments: item.installments,
    installmentAmount: Number(item.installment_amount),
    description: item.description,
    status: item.status as DebtStatus,
    createdAt: item.created_at,
    user_id: item.user_id
  }));
};

// Function to fetch all payments from Supabase
export const fetchPayments = async (): Promise<Payment[]> => {
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
      amount: debt.amount,
      debt_type: debt.debtType,
      due_date: debt.dueDate,
      installments: debt.installments,
      installment_amount: debt.installmentAmount,
      description: debt.description,
      status: debt.status,
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
    amount: Number(data.amount),
    debtType: data.debt_type as DebtType,
    dueDate: data.due_date,
    installments: data.installments,
    installmentAmount: Number(data.installment_amount),
    description: data.description,
    status: data.status as DebtStatus,
    createdAt: data.created_at,
    user_id: data.user_id
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

// Function to migrate existing data from localStorage to Supabase
export const migrateLocalStorageToSupabase = async (): Promise<void> => {
  try {
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
