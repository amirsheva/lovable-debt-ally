
export type DebtType = 'bank_loan' | 'company_loan' | 'friend_loan' | 'other';

export type DebtStatus = 'pending' | 'in_progress' | 'completed';

export type UserRole = 'admin' | 'user' | 'god';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: UserRole;
}

export interface Debt {
  id: string;
  name?: string;
  amount: number;
  debtType: DebtType;
  dueDate: string; // ISO date string
  installments: number;
  installmentAmount: number;
  description: string;
  status: DebtStatus;
  createdAt: string; // ISO date string
  user_id?: string; // Optional for backward compatibility
  category_id?: string;
  bank_id?: string;
}

export interface Payment {
  id: string;
  debtId: string;
  paymentDate: string; // ISO date string
  paymentAmount: number;
  remainingBalance: number;
  user_id?: string; // Optional for backward compatibility
}

export interface Category {
  id: string;
  name: string;
  user_id?: string;
  is_system: boolean;
  created_at: string;
}

export interface Bank {
  id: string;
  name: string;
  user_id?: string;
  is_system: boolean;
  created_at: string;
}

export interface DayNote {
  id: string;
  user_id: string;
  date: string;
  note: string;
  created_at: string;
}

export interface AppSettings {
  notifications: boolean;
  reminders: boolean;
  requiredFields: {
    name: boolean;
    category: boolean;
    bank: boolean;
    description: boolean;
  };
  enabledFeatures: {
    categories: boolean;
    banks: boolean;
    notes: boolean;
  };
}
