
import React from 'react';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import { useEffect, useState } from 'react';
import { Debt, Payment } from '../types';
import { generateMockDebts, generateMockPayments } from '../utils/debtUtils';

const Index = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const storedDebts = localStorage.getItem('debts');
    const storedPayments = localStorage.getItem('payments');
    
    if (storedDebts && storedPayments) {
      setDebts(JSON.parse(storedDebts));
      setPayments(JSON.parse(storedPayments));
    } else {
      // Fallback to mock data if nothing in localStorage
      setDebts(generateMockDebts());
      setPayments(generateMockPayments());
    }
  }, []);
  
  return (
    <Layout>
      <Dashboard debts={debts} payments={payments} />
    </Layout>
  );
};

export default Index;
