import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Debt, Payment } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  getDebtTypeLabel, 
  calculateRemainingBalance,
  calculateNextPaymentDate 
} from '../utils/debtUtils';
import { ArrowLeft, Calendar, Check, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DebtDetailsProps {
  debts: Debt[];
  payments: Payment[];
  onAddPayment?: (payment: Omit<Payment, "id">) => Promise<Payment>;
}

const DebtDetails: React.FC<DebtDetailsProps> = ({ debts, payments, onAddPayment }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Find the debt by ID
  const debt = debts.find(debt => debt.id === id);
  
  // Find payments for this debt
  const debtPayments = payments.filter(payment => payment.debtId === id);
  
  // Calculate remaining balance
  const remainingBalance = debt ? calculateRemainingBalance(debt, debtPayments) : 0;
  
  // Calculate next payment date
  const nextPaymentDate = debt ? calculateNextPaymentDate(debt, debtPayments) : '';
  
  // If debt not found, redirect to debts page
  if (!debt) {
    navigate('/debts');
    return null;
  }
  
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      // Validate payment amount
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          variant: "destructive",
          title: "خطا در مقدار",
          description: "لطفاً مبلغ معتبری وارد کنید.",
        });
        return;
      }
      
      setIsSubmitting(true);
      
      // Create new payment
      const newPayment = {
        debtId: debt.id,
        paymentDate,
        paymentAmount: amount,
        remainingBalance: remainingBalance - amount
      };
      
      // Call the onAddPayment function if provided
      if (onAddPayment) {
        await onAddPayment(newPayment);
      }
      
      // Show success message
      toast({
        title: "پرداخت ثبت شد",
        description: "پرداخت با موفقیت ثبت شد.",
      });
      
      // Close the modal and reset form
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        variant: "destructive",
        title: "خطا در ثبت پرداخت",
        description: "لطفاً دوباره تلاش کنید.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 ml-1" /> بازگشت
        </button>
      </div>
      
      {/* Debt Details */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{debt.description}</h1>
            <p className="text-gray-600">نوع: {getDebtTypeLabel(debt.debtType)}</p>
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {debt.status === 'pending' && 'در انتظار'}
            {debt.status === 'in_progress' && 'در حال پرداخت'}
            {debt.status === 'completed' && 'تکمیل شده'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">جزئیات بدهی</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">مبلغ کل:</span>
                <span className="font-medium">{formatCurrency(debt.amount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">تاریخ ایجاد:</span>
                <span>{formatDate(debt.createdAt)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">تاریخ سررسید:</span>
                <span>{formatDate(debt.dueDate)}</span>
              </div>
              {debt.installments > 1 && (
                <>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">تعداد اقساط:</span>
                    <span>{debt.installments}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">مبلغ هر قسط:</span>
                    <span>{formatCurrency(debt.installmentAmount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">وضعیت پرداخت</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="stats-card bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">پرداخت شده</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(debt.amount - remainingBalance)}
                  </p>
                </div>
                <div className="stats-card bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">باقی‌مانده</p>
                  <p className="text-xl font-bold text-amber-600">
                    {formatCurrency(remainingBalance)}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>پیشرفت پرداخت</span>
                  <span>{Math.round(((debt.amount - remainingBalance) / debt.amount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${((debt.amount - remainingBalance) / debt.amount) * 100}%` }}
                  />
                </div>
              </div>
              
              {debt.installments > 1 && (
                <div className="text-sm text-gray-600">
                  <p>پرداخت شده: {debtPayments.length} از {debt.installments} قسط</p>
                  {debt.status !== 'completed' && (
                    <p className="flex items-center mt-2">
                      <Calendar className="h-4 w-4 ml-1" /> 
                      قسط بعدی: {nextPaymentDate === 'تمام شده' ? 'تمام شده' : formatDate(nextPaymentDate)}
                    </p>
                  )}
                </div>
              )}
              
              {remainingBalance > 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full mt-4 bg-primary text-white flex items-center justify-center py-2 rounded-lg hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 ml-1" /> ثبت پرداخت جدید
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">تاریخچه پرداخت‌ها</h2>
        
        {debtPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right">شماره</th>
                  <th className="px-4 py-3 text-right">تاریخ</th>
                  <th className="px-4 py-3 text-right">مبلغ</th>
                  <th className="px-4 py-3 text-right">مانده</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {debtPayments.map((payment, index) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{formatDate(payment.paymentDate)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      {formatCurrency(payment.paymentAmount)}
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrency(payment.remainingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">هنوز پرداختی ثبت نشده است.</p>
          </div>
        )}
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">ثبت پرداخت جدید</h2>
            
            <form onSubmit={handleAddPayment}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    مبلغ پرداختی (ریال)
                  </label>
                  <input
                    type="number"
                    id="paymentAmount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`مبلغ پیشنهادی: ${formatCurrency(Math.min(debt.installmentAmount, remainingBalance))}`}
                    required
                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
                    تاریخ پرداخت
                  </label>
                  <input
                    type="date"
                    id="paymentDate"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p>مبلغ باقی‌مانده پس از این پرداخت:</p>
                  <p className="font-bold text-primary">
                    {formatCurrency(remainingBalance - (parseFloat(paymentAmount) || 0))}
                  </p>
                </div>
                
                <div className="flex justify-end pt-4 space-x-3 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                    disabled={isSubmitting}
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center disabled:opacity-70"
                  >
                    {isSubmitting ? 'در حال ثبت...' : (
                      <>
                        <Check className="h-4 w-4 ml-1" /> ثبت پرداخت
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtDetails;
