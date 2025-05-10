
import React from 'react';
import Layout from '../components/Layout';
import AddDebtForm from '../components/AddDebtForm';
import { Debt } from '../types';

interface AddDebtPageProps {
  onAddDebt: (debt: Debt) => void;
}

const AddDebtPage: React.FC<AddDebtPageProps> = ({ onAddDebt }) => {
  return (
    <Layout>
      <AddDebtForm onAddDebt={onAddDebt} />
    </Layout>
  );
};

export default AddDebtPage;
