
import React from 'react';
import Layout from '../components/Layout';
import DebtsList from '../components/DebtsList';
import { Debt } from '../types';

interface DebtsListPageProps {
  debts: Debt[];
}

const DebtsListPage: React.FC<DebtsListPageProps> = ({ debts }) => {
  return (
    <Layout>
      <DebtsList debts={debts} />
    </Layout>
  );
};

export default DebtsListPage;
