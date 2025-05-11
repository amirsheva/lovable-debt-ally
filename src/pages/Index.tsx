
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import { Debt, Payment } from '../types';
import { fetchDebts, fetchPayments } from '../services/debtService';
import { useToast } from '../hooks/use-toast';

const Index = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Load data from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [debtsData, paymentsData] = await Promise.all([
          fetchDebts(),
          fetchPayments()
        ]);
        
        setDebts(debtsData);
        setPayments(paymentsData);
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
  
  if (isLoading) {
    return <Layout>
      <div className="flex items-center justify-center h-64">در حال بارگذاری...</div>
    </Layout>;
  }
  
  return (
    <Layout>
      <Dashboard debts={debts} payments={payments} />
    </Layout>
  );
};

export default Index;
