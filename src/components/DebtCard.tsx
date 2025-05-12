
import React from 'react';
import { Link } from 'react-router-dom';
import { Debt } from '../types';
import { formatDate, getDebtTypeLabel, getDebtTypeColor } from '../utils/debtUtils';
import { formatPersianCurrency, numberToPersianWords } from '../utils/supabaseUtils';

interface DebtCardProps {
  debt: Debt;
}

const DebtCard: React.FC<DebtCardProps> = ({ debt }) => {
  const statusClasses = {
    pending: 'bg-amber-100 text-amber-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };
  
  const statusLabels = {
    pending: 'در انتظار',
    in_progress: 'در حال پرداخت',
    completed: 'تکمیل شده'
  };

  return (
    <Link to={`/debt/${debt.id}`}>
      <div className="debt-card bg-white rounded-lg shadow-sm p-4 border hover:border-primary h-full">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg text-right">{debt.description}</h3>
            <p className="text-sm text-gray-600 text-right">
              {formatDate(debt.createdAt)}
            </p>
          </div>
          <div className={`${getDebtTypeColor(debt.debtType)} text-white rounded-full text-xs py-1 px-3`}>
            {getDebtTypeLabel(debt.debtType)}
          </div>
        </div>
        
        <div className="mb-4 text-right">
          <p className="text-xl font-bold text-primary">
            {formatPersianCurrency(debt.amount)}
          </p>
          <p className="text-xs text-gray-500">
            {numberToPersianWords(debt.amount)}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <div className={`${statusClasses[debt.status]} rounded-full text-xs py-1 px-3`}>
            {statusLabels[debt.status]}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">سررسید: {formatDate(debt.dueDate)}</p>
            {debt.installments > 1 && (
              <p className="text-sm text-gray-600 text-right">
                {debt.installments} قسط | هر قسط {formatPersianCurrency(debt.installmentAmount, false)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DebtCard;
