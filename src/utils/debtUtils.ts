import { Debt, DebtType, Payment } from "../types";
import { format, parseISO, isAfter, isBefore, addMonths } from "date-fns";
import { formatPersianCurrency } from "./supabaseUtils";

// Function to format currency
export const formatCurrency = (amount: number): string => {
  return formatPersianCurrency(amount);
};

// Function to format date
export const formatDate = (dateString: string): string => {
  return format(parseISO(dateString), 'yyyy/MM/dd');
};

// Function to calculate the remaining balance
export const calculateRemainingBalance = (debt: Debt, payments: Payment[]): number => {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.paymentAmount, 0);
  return Math.ceil(debt.amount - totalPaid); // Round up to the nearest integer
};

// Function to calculate installment amount
export const calculateInstallmentAmount = (debt: Debt): number => {
  const amount = debt.installments > 0 ? debt.amount / debt.installments : debt.amount;
  return Math.ceil(amount); // Round up to the nearest integer
};

// Function to calculate next payment due date
export const calculateNextPaymentDate = (debt: Debt, payments: Payment[]): string => {
  if (payments.length === 0) {
    return debt.dueDate;
  }
  
  const paidInstallments = payments.length;
  if (paidInstallments >= debt.installments) {
    return "تمام شده";
  }
  
  const firstDueDate = parseISO(debt.dueDate);
  return format(addMonths(firstDueDate, paidInstallments), 'yyyy-MM-dd');
};

// Function to get translation for debt types
export const getDebtTypeLabel = (type: DebtType): string => {
  const types = {
    bank_loan: "وام بانکی",
    company_loan: "وام شرکتی",
    friend_loan: "قرض از دوست/خانواده",
    other: "بدهی دیگر"
  };
  return types[type];
};

// Function to get color for debt type
export const getDebtTypeColor = (type: DebtType): string => {
  const colors = {
    bank_loan: "bg-blue-500",
    company_loan: "bg-indigo-500",
    friend_loan: "bg-green-500",
    other: "bg-amber-500"
  };
  return colors[type];
};

// Generate mock data for demonstration
export const generateMockDebts = (): Debt[] => {
  const today = new Date();
  
  return [
    {
      id: "1",
      amount: 50000000,
      debtType: "bank_loan",
      dueDate: format(today, 'yyyy-MM-dd'),
      installments: 12,
      installmentAmount: 4166667,
      description: "وام مسکن",
      status: "in_progress",
      createdAt: format(new Date(2023, 0, 15), 'yyyy-MM-dd')
    },
    {
      id: "2",
      amount: 15000000,
      debtType: "friend_loan",
      dueDate: format(addMonths(today, 1), 'yyyy-MM-dd'),
      installments: 3,
      installmentAmount: 5000000,
      description: "قرض از دوست برای خرید لپ‌تاپ",
      status: "pending",
      createdAt: format(new Date(2023, 1, 20), 'yyyy-MM-dd')
    },
    {
      id: "3",
      amount: 80000000,
      debtType: "company_loan",
      dueDate: format(addMonths(today, -2), 'yyyy-MM-dd'),
      installments: 24,
      installmentAmount: 3333333,
      description: "وام خرید خودرو",
      status: "in_progress",
      createdAt: format(new Date(2022, 11, 5), 'yyyy-MM-dd')
    },
    {
      id: "4",
      amount: 5000000,
      debtType: "other",
      dueDate: format(addMonths(today, 2), 'yyyy-MM-dd'),
      installments: 1,
      installmentAmount: 5000000,
      description: "بدهی به فروشگاه",
      status: "pending",
      createdAt: format(new Date(2023, 2, 10), 'yyyy-MM-dd')
    }
  ];
};

// Generate mock payments for demonstration
export const generateMockPayments = (): Payment[] => {
  return [
    {
      id: "p1",
      debtId: "1",
      paymentDate: format(new Date(2023, 1, 15), 'yyyy-MM-dd'),
      paymentAmount: 4166667,
      remainingBalance: 45833333
    },
    {
      id: "p2",
      debtId: "1",
      paymentDate: format(new Date(2023, 2, 15), 'yyyy-MM-dd'),
      paymentAmount: 4166667,
      remainingBalance: 41666666
    },
    {
      id: "p3",
      debtId: "3",
      paymentDate: format(new Date(2023, 0, 5), 'yyyy-MM-dd'),
      paymentAmount: 3333333,
      remainingBalance: 76666667
    },
    {
      id: "p4",
      debtId: "3",
      paymentDate: format(new Date(2023, 1, 5), 'yyyy-MM-dd'),
      paymentAmount: 3333333,
      remainingBalance: 73333334
    }
  ];
};
