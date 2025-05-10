
import React from 'react';
import { Debt, Payment } from '../types';
import { formatCurrency } from '../utils/debtUtils';
import DebtsChart from './charts/DebtsChart';
import { Wallet, Calendar, ArrowDownCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  debts: Debt[];
  payments: Payment[];
}

const Dashboard: React.FC<DashboardProps> = ({ debts, payments }) => {
  // Calculate total debt amount
  const totalDebtAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);
  
  // Calculate total paid amount
  const totalPaidAmount = payments.reduce((sum, payment) => sum + payment.paymentAmount, 0);
  
  // Calculate remaining amount
  const remainingAmount = totalDebtAmount - totalPaidAmount;
  
  // Get upcoming payments (debts with the closest due dates)
  const today = new Date();
  const upcomingDebts = [...debts]
    .filter(debt => debt.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">داشبورد</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stats-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium opacity-80">مجموع بدهی‌ها</h3>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalDebtAmount)}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 text-xs">
            <span>{debts.length} بدهی ثبت شده</span>
          </div>
        </div>
        
        <div className="stats-card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium opacity-80">مجموع پرداخت شده</h3>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalPaidAmount)}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <ArrowDownCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 text-xs">
            <span>{payments.length} پرداخت ثبت شده</span>
          </div>
        </div>
        
        <div className="stats-card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium opacity-80">مبلغ باقی‌مانده</h3>
              <p className="text-2xl font-bold mt-1">{formatCurrency(remainingAmount)}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 text-xs">
            <span>{debts.filter(d => d.status !== 'completed').length} بدهی باقی‌مانده</span>
          </div>
        </div>
      </div>
      
      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debts Chart */}
        <DebtsChart debts={debts} />
        
        {/* Upcoming Payments */}
        <div className="bg-white rounded-lg p-4 h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">پرداخت‌های پیش رو</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {upcomingDebts.map((debt) => (
              <Link to={`/debt/${debt.id}`} key={debt.id} className="block">
                <div className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{debt.description}</h4>
                      <p className="text-sm text-gray-600">سررسید: {new Date(debt.dueDate).toLocaleDateString('fa-IR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatCurrency(debt.installmentAmount)}</p>
                      <p className="text-xs text-gray-500">
                        {debt.installments > 0 ? `قسط ${payments.filter(p => p.debtId === debt.id).length + 1} از ${debt.installments}` : "پرداخت کامل"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {upcomingDebts.length === 0 && (
              <div className="text-center p-6">
                <p className="text-gray-500">هیچ پرداخت پیش رویی وجود ندارد.</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-center">
            <Link to="/debts" className="text-primary text-sm hover:underline">
              مشاهده همه بدهی‌ها
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold mb-4">عملیات سریع</h3>
        <div className="flex flex-wrap gap-2">
          <Link 
            to="/add-debt" 
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-sm"
          >
            افزودن بدهی جدید
          </Link>
          <Link 
            to="/debts" 
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
          >
            مشاهده لیست بدهی‌ها
          </Link>
          <Link 
            to="/reports" 
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
          >
            گزارش‌ها
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
