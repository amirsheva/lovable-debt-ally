
import React from 'react';
import Layout from '../components/Layout';
import DebtDetails from '../components/DebtDetails';
import { Debt, Payment } from '../types';

interface DebtPageProps {
  debts: Debt[];
  payments: Payment[];
  onAddPayment: (payment: Omit<Payment, "id">) => Promise<Payment>;
}

const DebtPage: React.FC<DebtPageProps> = ({ debts, payments, onAddPayment }) => {
  return (
    <Layout>
      <DebtDetails 
        debts={debts} 
        payments={payments} 
        onAddPayment={onAddPayment} 
      />
    </Layout>
  );
};

export default DebtPage;
