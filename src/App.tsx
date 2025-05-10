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
import { Debt, Payment } from "./types";
import { generateMockDebts, generateMockPayments } from "./utils/debtUtils";

const queryClient = new QueryClient();

const App = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Load mock data on app mount
  useEffect(() => {
    setDebts(generateMockDebts());
    setPayments(generateMockPayments());
  }, []);

  // Handler for adding a new debt
  const handleAddDebt = (newDebt: Debt) => {
    setDebts(prevDebts => [...prevDebts, newDebt]);
  };

  // Handler for adding a new payment
  const handleAddPayment = (newPayment: Payment) => {
    setPayments(prevPayments => [...prevPayments, newPayment]);
    
    // Update debt status if needed
    setDebts(prevDebts => {
      return prevDebts.map(debt => {
        if (debt.id === newPayment.debtId) {
          // If remaining balance is 0 or less, mark as completed
          if (newPayment.remainingBalance <= 0) {
            return { ...debt, status: 'completed' };
          }
          // Otherwise mark as in_progress if it was pending
          if (debt.status === 'pending') {
            return { ...debt, status: 'in_progress' };
          }
        }
        return debt;
      });
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
