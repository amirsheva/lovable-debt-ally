
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isEqual, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import { Debt, Payment } from '../types';
import Layout from '../components/Layout';
import { formatCurrency } from '../utils/debtUtils';

interface CalendarPageProps {
  debts: Debt[];
  payments: Payment[];
}

const CalendarPage: React.FC<CalendarPageProps> = ({ debts, payments }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Generate days for the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get all due dates in this month
  const datesWithPayments = days.map(day => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    
    // Find debts due on this date
    const dueDebts = debts.filter(debt => {
      // For monthly installments, check if any installment is due on this day of month
      const dueDate = parseISO(debt.dueDate);
      if (format(day, 'dd') === format(dueDate, 'dd') && 
          debt.status !== 'completed' && 
          day >= new Date()) {
        return true;
      }
      // Exact match for one-time payments
      return debt.dueDate === formattedDate && debt.status !== 'completed';
    });
    
    // Find payments made on this date
    const dayPayments = payments.filter(payment => {
      return payment.paymentDate === formattedDate;
    });
    
    return {
      date: day,
      debts: dueDebts,
      payments: dayPayments,
      hasEvent: dueDebts.length > 0 || dayPayments.length > 0
    };
  });

  const nextMonth = () => {
    setCurrentMonth(current => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + 1);
      return next;
    });
  };

  const prevMonth = () => {
    setCurrentMonth(current => {
      const prev = new Date(current);
      prev.setMonth(current.getMonth() - 1);
      return prev;
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">تقویم پرداخت‌ها</h1>
        
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 ml-2 text-primary" />
            <h2 className="text-xl font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={prevMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px border-b">
            {['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'].map((day, i) => (
              <div key={i} className="py-2 text-center text-sm font-medium">
                {day}
              </div>
            ))}
          </div>
          
          {/* Days */}
          <div className="grid grid-cols-7 gap-px bg-gray-100">
            {datesWithPayments.map((dayInfo, i) => (
              <div 
                key={i} 
                className={`min-h-24 p-2 bg-white ${
                  isEqual(dayInfo.date, new Date()) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${
                    isEqual(dayInfo.date, new Date()) ? 'text-primary' : ''
                  }`}>
                    {format(dayInfo.date, 'd')}
                  </span>
                  
                  {dayInfo.hasEvent && (
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                  )}
                </div>
                
                {/* Debts due on this day */}
                {dayInfo.debts.length > 0 && (
                  <div className="mt-2">
                    {dayInfo.debts.map(debt => (
                      <div key={debt.id} className="text-xs p-1 bg-yellow-50 rounded mb-1 border-r-2 border-yellow-500">
                        <div className="font-medium truncate">{debt.description}</div>
                        <div className="text-primary">{formatCurrency(debt.installmentAmount)}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Payments made on this day */}
                {dayInfo.payments.length > 0 && (
                  <div className="mt-1">
                    {dayInfo.payments.map(payment => {
                      // Find the debt related to this payment
                      const relatedDebt = debts.find(d => d.id === payment.debtId);
                      return (
                        <div key={payment.id} className="text-xs p-1 bg-green-50 rounded mb-1 border-r-2 border-green-500">
                          <div className="font-medium truncate">{relatedDebt?.description || 'پرداخت'}</div>
                          <div className="text-green-600">{formatCurrency(payment.paymentAmount)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex gap-4 mt-4 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 ml-1"></div>
            <span>سررسید پرداخت</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 ml-1"></div>
            <span>پرداخت انجام شده</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;
