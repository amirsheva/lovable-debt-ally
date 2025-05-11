
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DebtPage from "./pages/DebtPage";
import DebtsListPage from "./pages/DebtsListPage";
import AddDebtPage from "./pages/AddDebtPage";
import CalendarPage from "./pages/CalendarPage";
import ReportsPage from "./pages/ReportsPage"; 
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import { Debt, Payment, DebtStatus } from "./types";
import { useToast } from "./hooks/use-toast";
import { 
  fetchDebts, 
  fetchPayments, 
  addDebt, 
  addPayment, 
  updateDebtStatus, 
  migrateLocalStorageToSupabase 
} from "./services/debtService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

const App = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initial data loading from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Try to migrate data from localStorage if this is first run
        await migrateLocalStorageToSupabase();
        
        // Fetch data from Supabase
        const [debtsData, paymentsData] = await Promise.all([
          fetchDebts(),
          fetchPayments()
        ]);
        
        setDebts(debtsData);
        setPayments(paymentsData);
        
        toast({
          title: "اطلاعات بارگذاری شد",
          description: "اطلاعات با موفقیت از پایگاه داده بارگذاری شد.",
        });
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          variant: "destructive",
          title: "خطا در بارگذاری اطلاعات",
          description: "لطفاً صفحه را مجدداً بارگذاری کنید.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handler for adding a new debt
  const handleAddDebt = async (newDebt: Omit<Debt, "id" | "createdAt">) => {
    try {
      const createdDebt = await addDebt(newDebt);
      setDebts(prevDebts => [...prevDebts, createdDebt]);
      
      toast({
        title: "بدهی جدید اضافه شد",
        description: "بدهی جدید با موفقیت ثبت شد.",
      });
      
      return createdDebt;
    } catch (error) {
      console.error("Error adding debt:", error);
      toast({
        variant: "destructive",
        title: "خطا در ثبت بدهی",
        description: "لطفاً دوباره تلاش کنید.",
      });
      throw error;
    }
  };

  // Handler for adding a new payment
  const handleAddPayment = async (newPayment: Omit<Payment, "id">) => {
    try {
      const createdPayment = await addPayment(newPayment);
      setPayments(prevPayments => [...prevPayments, createdPayment]);
      
      toast({
        title: "پرداخت جدید ثبت شد",
        description: "پرداخت جدید با موفقیت ثبت شد.",
      });
      
      // Update debt status if needed
      const debt = debts.find(d => d.id === newPayment.debtId);
      if (debt) {
        let newStatus: DebtStatus | null = null;
        
        // If remaining balance is 0 or less, mark as completed
        if (newPayment.remainingBalance <= 0) {
          newStatus = 'completed';
        }
        // Otherwise mark as in_progress if it was pending
        else if (debt.status === 'pending') {
          newStatus = 'in_progress';
        }
        
        if (newStatus) {
          await updateDebtStatus(debt.id, newStatus);
          
          // Update local state
          setDebts(prevDebts => prevDebts.map(d => 
            d.id === debt.id ? { ...d, status: newStatus as DebtStatus } : d
          ));
        }
      }
      
      return createdPayment;
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        variant: "destructive",
        title: "خطا در ثبت پرداخت",
        description: "لطفاً دوباره تلاش کنید.",
      });
      throw error;
    }
  };

  // If still loading, show loading indicator
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">در حال بارگذاری...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/debts" 
                element={
                  <ProtectedRoute>
                    <DebtsListPage debts={debts} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-debt" 
                element={
                  <ProtectedRoute>
                    <AddDebtPage onAddDebt={handleAddDebt} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/debt/:id" 
                element={
                  <ProtectedRoute>
                    <DebtPage 
                      debts={debts} 
                      payments={payments}
                      onAddPayment={handleAddPayment}
                    />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute>
                    <CalendarPage 
                      debts={debts}
                      payments={payments}
                    />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <ReportsPage 
                      debts={debts}
                      payments={payments}
                    />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRoles={['admin', 'god']}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
