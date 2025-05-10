
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Debt, DebtType } from '../../types';
import { getDebtTypeLabel } from '../../utils/debtUtils';

interface DebtsChartProps {
  debts: Debt[];
}

const DebtsChart: React.FC<DebtsChartProps> = ({ debts }) => {
  // Group debts by type and calculate total amount for each type
  const groupedByType = debts.reduce((acc, debt) => {
    const type = debt.debtType;
    if (!acc[type]) {
      acc[type] = {
        type,
        amount: 0,
        count: 0
      };
    }
    acc[type].amount += debt.amount;
    acc[type].count += 1;
    return acc;
  }, {} as Record<DebtType, { type: DebtType; amount: number; count: number }>);
  
  // Convert to array for chart
  const data = Object.values(groupedByType);
  
  // Colors for each debt type
  const COLORS = {
    bank_loan: '#3b82f6',
    company_loan: '#8b5cf6', 
    friend_loan: '#10b981',
    other: '#f59e0b'
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-semibold">{getDebtTypeLabel(data.type)}</p>
          <p className="text-sm">تعداد: {data.count} بدهی</p>
          <p className="text-sm">مبلغ: {new Intl.NumberFormat('fa-IR').format(data.amount)} ریال</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <h3 className="font-semibold mb-4 text-center">نمودار انواع بدهی‌ها</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              nameKey="type"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.type as DebtType]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => getDebtTypeLabel(value as DebtType)} 
              layout="horizontal"
              verticalAlign="bottom"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DebtsChart;
