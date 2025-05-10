
export type DebtType = 'bank_loan' | 'company_loan' | 'friend_loan' | 'other';

export type DebtStatus = 'pending' | 'in_progress' | 'completed';

export interface Debt {
  id: string;
  amount: number;
  debtType: DebtType;
  dueDate: string; // ISO date string
  installments: number;
  installmentAmount: number;
  description: string;
  status: DebtStatus;
  createdAt: string; // ISO date string
}

export interface Payment {
  id: string;
  debtId: string;
  paymentDate: string; // ISO date string
  paymentAmount: number;
  remainingBalance: number;
}
