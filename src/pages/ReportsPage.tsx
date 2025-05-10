
import React, { useMemo } from 'react';
import { Debt, Payment, DebtType } from '../types';
import Layout from '../components/Layout';
import { formatCurrency, getDebtTypeLabel } from '../utils/debtUtils';
import { ChartContainer } from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart2 } from 'lucide-react';

interface ReportsPageProps {
  debts: Debt[];
  payments: Payment[];
}

const COLORS = ['#3b82f6', '#6366f1', '#22c55e', '#f59e0b'];

const ReportsPage: React.FC<ReportsPageProps> = ({ debts, payments }) => {
  // Calculate total metrics
  const totalDebtAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalPaidAmount = payments.reduce((sum, payment) => sum + payment.paymentAmount, 0);
  const remainingAmount = totalDebtAmount - totalPaidAmount;
  
  // Generate data for debt type distribution
  const debtTypeDistribution = useMemo(() => {
    const distribution: Record<DebtType, number> = {
      bank_loan: 0,
      company_loan: 0,
      friend_loan: 0,
      other: 0
    };
    
    debts.forEach(debt => {
      distribution[debt.debtType] += debt.amount;
    });
    
    return Object.entries(distribution).map(([type, amount]) => ({
      name: getDebtTypeLabel(type as DebtType),
      value: amount
    }));
  }, [debts]);
  
  // Generate data for monthly payment trends
  const monthlyPaymentTrends = useMemo(() => {
    const monthlyData: Record<string, { paid: number, due: number }> = {};
    
    // Group payments by month
    payments.forEach(payment => {
      const month = payment.paymentDate.substring(0, 7); // Get YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { paid: 0, due: 0 };
      }
      monthlyData[month].paid += payment.paymentAmount;
    });
    
    // Calculate due amounts from debts
    debts.forEach(debt => {
      // This is a simplified approach - in a real app, you'd have more sophisticated logic
      const month = debt.dueDate.substring(0, 7); // Get YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { paid: 0, due: 0 };
      }
      monthlyData[month].due += debt.installmentAmount;
    });
    
    // Convert to array sorted by month
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: month.substring(5) + '/' + month.substring(0, 4), // Format as MM/YYYY for display
        پرداخت_شده: data.paid,
        سررسید: data.due
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [debts, payments]);
  
  // Calculate payment status
  const paymentStatusData = useMemo(() => [
    { name: 'پرداخت شده', value: totalPaidAmount },
    { name: 'باقی‌مانده', value: remainingAmount }
  ], [totalPaidAmount, remainingAmount]);
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold">گزارش‌ها</h1>
          <BarChart2 className="mr-2 h-6 w-6 text-primary" />
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">کل بدهی</h3>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalDebtAmount)}</p>
            <p className="text-xs text-gray-500 mt-1">{debts.length} بدهی ثبت شده</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">پرداخت شده</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaidAmount)}</p>
            <p className="text-xs text-gray-500 mt-1">{payments.length} پرداخت ثبت شده</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">باقی‌مانده</h3>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(remainingAmount)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {debts.filter(d => d.status !== 'completed').length} بدهی باقی‌مانده
            </p>
          </div>
        </div>
        
        {/* Charts */}
        <div className="space-y-6">
          {/* Payment Status Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">وضعیت پرداخت</h2>
            <div className="h-64">
              <ChartContainer config={{ paid: { color: "#22c55e" }, remaining: { color: "#f59e0b" } }}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#f59e0b'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </div>
          </div>
          
          {/* Debt Type Distribution */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">توزیع انواع بدهی</h2>
            <div className="h-64">
              <ChartContainer 
                config={{ 
                  "وام بانکی": { color: "#3b82f6" }, 
                  "وام شرکتی": { color: "#6366f1" },
                  "قرض از دوست/خانواده": { color: "#22c55e" },
                  "بدهی دیگر": { color: "#f59e0b" }
                }}
              >
                <PieChart>
                  <Pie
                    data={debtTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {debtTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </div>
          </div>
          
          {/* Monthly Payment Trends */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">روند پرداخت‌های ماهانه</h2>
            <div className="h-64">
              <ChartContainer 
                config={{ 
                  پرداخت_شده: { color: "#22c55e" }, 
                  سررسید: { color: "#f59e0b" }
                }}
              >
                <BarChart data={monthlyPaymentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(tick) => `${(tick / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="پرداخت_شده" fill="#22c55e" />
                  <Bar dataKey="سررسید" fill="#f59e0b" />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;
