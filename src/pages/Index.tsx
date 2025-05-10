
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import { Debt, Payment } from '../types';
import { generateMockDebts, generateMockPayments } from '../utils/debtUtils';

const Index = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Load mock data on component mount
  useEffect(() => {
    setDebts(generateMockDebts());
    setPayments(generateMockPayments());
  }, []);
  
  return (
    <Layout>
      <Dashboard debts={debts} payments={payments} />
    </Layout>
  );
};

export default Index;
