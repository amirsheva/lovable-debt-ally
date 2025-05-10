import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DebtPage from "./pages/DebtPage";
import DebtsListPage from "./pages/DebtsListPage";
import AddDebtPage from "./pages/AddDebtPage";
import CalendarPage from "./pages/CalendarPage";
import ReportsPage from "./pages/ReportsPage"; 
import { Debt, Payment, DebtStatus } from "./types";
import { generateMockDebts, generateMockPayments } from "./utils/debtUtils";

const queryClient = new QueryClient();

const App = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Load mock data on app mount
  useEffect(() => {
    // Check localStorage first for existing data
    const storedDebts = localStorage.getItem('debts');
    const storedPayments = localStorage.getItem('payments');
    
    if (storedDebts && storedPayments) {
      setDebts(JSON.parse(storedDebts));
      setPayments(JSON.parse(storedPayments));
    } else {
      // Use mock data if no stored data exists
      const mockDebts = generateMockDebts();
      const mockPayments = generateMockPayments();
      
      setDebts(mockDebts);
      setPayments(mockPayments);
      
      // Store in localStorage
      localStorage.setItem('debts', JSON.stringify(mockDebts));
      localStorage.setItem('payments', JSON.stringify(mockPayments));
    }
  }, []);

  // Update localStorage whenever data changes
  useEffect(() => {
    if (debts.length > 0) {
      localStorage.setItem('debts', JSON.stringify(debts));
    }
  }, [debts]);

  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem('payments', JSON.stringify(payments));
    }
  }, [payments]);

  // Handler for adding a new debt
  const handleAddDebt = (newDebt: Debt) => {
    setDebts(prevDebts => {
      const updatedDebts = [...prevDebts, newDebt];
      localStorage.setItem('debts', JSON.stringify(updatedDebts));
      return updatedDebts;
    });
  };

  // Handler for adding a new payment
  const handleAddPayment = (newPayment: Payment) => {
    setPayments(prevPayments => {
      const updatedPayments = [...prevPayments, newPayment];
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
      return updatedPayments;
    });
    
    // Update debt status if needed
    setDebts(prevDebts => {
      const updatedDebts = prevDebts.map(debt => {
        if (debt.id === newPayment.debtId) {
          // If remaining balance is 0 or less, mark as completed
          if (newPayment.remainingBalance <= 0) {
            return { ...debt, status: 'completed' as DebtStatus };
          }
          // Otherwise mark as in_progress if it was pending
          if (debt.status === 'pending') {
            return { ...debt, status: 'in_progress' as DebtStatus };
          }
        }
        return debt;
      });
      
      localStorage.setItem('debts', JSON.stringify(updatedDebts));
      return updatedDebts;
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/debts" 
              element={
                <DebtsListPage debts={debts} />
              } 
            />
            <Route 
              path="/add-debt" 
              element={
                <AddDebtPage onAddDebt={handleAddDebt} />
              } 
            />
            <Route 
              path="/debt/:id" 
              element={
                <DebtPage 
                  debts={debts} 
                  payments={payments}
                  onAddPayment={handleAddPayment}
                />
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <CalendarPage 
                  debts={debts}
                  payments={payments}
                />
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ReportsPage 
                  debts={debts}
                  payments={payments}
                />
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
