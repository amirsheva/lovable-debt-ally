import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CalendarDay from '../components/CalendarDay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameMonth, isSameDay } from 'date-fns-jalali';
import { Debt, Payment } from '../types';

interface CalendarPageProps {
  debts: Debt[];
  payments: Payment[];
}

const CalendarPage: React.FC<CalendarPageProps> = ({ debts, payments }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [daysWithDebts, setDaysWithDebts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    // Calculate days with debts
    const debtDays: Record<string, number> = {};
    
    debts.forEach(debt => {
      const dateStr = debt.dueDate;
      if (debtDays[dateStr]) {
        debtDays[dateStr]++;
      } else {
        debtDays[dateStr] = 1;
      }
    });
    
    setDaysWithDebts(debtDays);
  }, [debts]);
  
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const getCalendarDays = () => {
    // Get the first and last day of the month
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Get an array of days in the month
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = monthStart.getDay();
    if (firstDayOfWeek === 6) { // If Saturday, we start from the previous week
      firstDayOfWeek = -1;
    }
    
    // Create an array for the previous month's days
    const previousMonthDays = [];
    for (let i = firstDayOfWeek; i >= 0; i--) {
      previousMonthDays.push(subMonths(addDays(monthStart, -i), 0));
    }
    
    // Calculate how many days we need to add from the next month
    const totalDaysInCalendar = 42; // 6 rows x 7 days
    const remainingDays = totalDaysInCalendar - (previousMonthDays.length + days.length);
    
    // Create an array for the next month's days
    const nextMonthDays = [];
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push(addDays(monthEnd, i));
    }
    
    // Combine all days
    return [...previousMonthDays, ...days, ...nextMonthDays];
  };
  
  const weekdays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">تقویم پرداخت</h1>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={goToPreviousMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
              <Button variant="ghost" onClick={goToNextMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekdays.map((day) => (
                <div key={day} className="text-center font-medium text-sm py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {getCalendarDays().map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const hasDebts = !!daysWithDebts[dateStr];
                const debtsCount = daysWithDebts[dateStr] || 0;
                
                return (
                  <div 
                    key={dateStr} 
                    className={`aspect-square min-h-14 ${
                      !isSameMonth(date, currentDate) ? 'opacity-40' : ''
                    }`}
                  >
                    <CalendarDay
                      date={date}
                      isToday={isSameDay(date, new Date())}
                      isSelected={selectedDate ? isSameDay(date, selectedDate) : false}
                      hasDebts={hasDebts}
                      debtsCount={debtsCount}
                      onClick={() => setSelectedDate(date)}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>{format(selectedDate, 'PPP')}</CardTitle>
              <CardDescription>بدهی‌ها و پرداخت‌های این روز</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  const dayDebts = debts.filter(debt => debt.dueDate === dateStr);
                  const dayPayments = payments.filter(payment => payment.paymentDate === dateStr);
                  
                  return (
                    <>
                      <div>
                        <h3 className="font-medium mb-2">بدهی‌های سررسید</h3>
                        {dayDebts.length > 0 ? (
                          <div className="space-y-2">
                            {dayDebts.map(debt => (
                              <div key={debt.id} className="p-3 border rounded-lg">
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="font-medium">{debt.name || debt.description}</h4>
                                    <p className="text-sm text-gray-600">{debt.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold">{new Intl.NumberFormat('fa-IR').format(debt.installmentAmount)} تومان</p>
                                    <p className="text-xs text-gray-500">
                                      {debt.status === 'completed' ? 'تکمیل شده' : debt.status === 'in_progress' ? 'در حال پرداخت' : 'در انتظار'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">هیچ بدهی سررسیدی برای این روز وجود ندارد.</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">پرداخت‌های انجام شده</h3>
                        {dayPayments.length > 0 ? (
                          <div className="space-y-2">
                            {dayPayments.map(payment => {
                              const relatedDebt = debts.find(d => d.id === payment.debtId);
                              return (
                                <div key={payment.id} className="p-3 border rounded-lg bg-green-50">
                                  <div className="flex justify-between">
                                    <div>
                                      <h4 className="font-medium">{relatedDebt?.name || relatedDebt?.description || 'پرداخت'}</h4>
                                      <p className="text-sm text-gray-600">پرداخت انجام شده</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-green-600">
                                        {new Intl.NumberFormat('fa-IR').format(payment.paymentAmount)} تومان
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        مانده: {new Intl.NumberFormat('fa-IR').format(payment.remainingBalance)} تومان
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500">هیچ پرداختی برای این روز ثبت نشده است.</p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CalendarPage;
