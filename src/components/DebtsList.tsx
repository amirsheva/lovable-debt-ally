
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Debt, DebtType } from '../types';
import DebtCard from './DebtCard';
import { Search, Filter, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPersianCurrency } from '@/utils/supabaseUtils';

interface DebtsListProps {
  debts: Debt[];
}

const DebtsList: React.FC<DebtsListProps> = ({ debts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<DebtType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'amount' | 'createdAt'>('dueDate');
  
  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || debt.debtType === filterType;
    return matchesSearch && matchesType;
  });
  
  const sortedDebts = [...filteredDebts].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy === 'amount') {
      return b.amount - a.amount;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Calculate total debt amount
  const totalAmount = sortedDebts.reduce((acc, debt) => acc + debt.amount, 0);

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">لیست بدهی‌ها</h2>
          <p className="text-gray-600 mt-1">
            جمع کل: {formatPersianCurrency(totalAmount)}
          </p>
        </div>
        
        <Link to="/add-debt">
          <Button className="w-full md:w-auto flex items-center gap-2 bg-primary">
            <PlusCircle className="h-5 w-5" />
            افزودن بدهی جدید
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            placeholder="جستجو در بدهی‌ها..."
            className="pl-4 pr-10 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            className="rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as DebtType | 'all')}
          >
            <option value="all">همه انواع</option>
            <option value="bank_loan">وام بانکی</option>
            <option value="company_loan">وام شرکتی</option>
            <option value="friend_loan">قرض از دوست/خانواده</option>
            <option value="other">سایر</option>
          </select>
          
          <select 
            className="rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'amount' | 'createdAt')}
          >
            <option value="dueDate">مرتب‌سازی بر اساس تاریخ سررسید</option>
            <option value="amount">مرتب‌سازی بر اساس مبلغ</option>
            <option value="createdAt">مرتب‌سازی بر اساس تاریخ ایجاد</option>
          </select>
          
          <button className="p-2 bg-primary text-white rounded-lg">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDebts.map(debt => (
          <DebtCard key={debt.id} debt={debt} />
        ))}
        
        {sortedDebts.length === 0 && (
          <div className="col-span-full text-center p-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">هیچ بدهی با این مشخصات یافت نشد.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtsList;
