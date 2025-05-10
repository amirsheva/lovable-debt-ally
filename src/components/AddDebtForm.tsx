import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Debt, DebtType } from '../types';
import { calculateInstallmentAmount } from '../utils/debtUtils';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface AddDebtFormProps {
  onAddDebt?: (debt: Debt) => void;
}

const AddDebtForm: React.FC<AddDebtFormProps> = ({ onAddDebt }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    amount: '',
    debtType: 'bank_loan' as DebtType,
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    installments: '1',
    description: '',
    hasInstallments: false
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    const installments = formData.hasInstallments ? parseInt(formData.installments) : 1;
    
    // Calculate installment amount separately to avoid TypeScript error
    const installmentAmount = amount / installments;
    
    // Create the new debt object
    const newDebt: Debt = {
      id: Date.now().toString(),
      amount: amount,
      debtType: formData.debtType,
      dueDate: formData.dueDate,
      installments: installments,
      installmentAmount: installmentAmount,
      description: formData.description,
      status: 'pending',
      createdAt: format(new Date(), 'yyyy-MM-dd')
    };
    
    // Call the onAddDebt function if provided
    if (onAddDebt) {
      onAddDebt(newDebt);
    }
    
    // For now, let's just log the data and redirect
    console.log('New debt added:', newDebt);
    
    // Show success message (toast would be ideal)
    alert('بدهی جدید با موفقیت اضافه شد');
    
    // Redirect to the debts page
    navigate('/debts');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">افزودن بدهی جدید</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              مبلغ بدهی (ریال)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="مثال: 5000000"
              required
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Debt Type */}
          <div>
            <label htmlFor="debtType" className="block text-sm font-medium text-gray-700 mb-1">
              نوع بدهی
            </label>
            <select
              id="debtType"
              name="debtType"
              value={formData.debtType}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="bank_loan">وام بانکی</option>
              <option value="company_loan">وام شرکتی</option>
              <option value="friend_loan">قرض از دوست/خانواده</option>
              <option value="other">بدهی دیگر</option>
            </select>
          </div>
          
          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              تاریخ سررسید
            </label>
            <div className="relative">
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Has Installments Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasInstallments"
              name="hasInstallments"
              checked={formData.hasInstallments}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="hasInstallments" className="mr-2 block text-sm text-gray-700">
              به صورت اقساط است
            </label>
          </div>
          
          {/* Installments - Only shown if hasInstallments is true */}
          {formData.hasInstallments && (
            <div>
              <label htmlFor="installments" className="block text-sm font-medium text-gray-700 mb-1">
                تعداد اقساط
              </label>
              <input
                type="number"
                id="installments"
                name="installments"
                value={formData.installments}
                onChange={handleChange}
                min="1"
                required={formData.hasInstallments}
                className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              توضیحات
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="توضیحات خود را وارد کنید..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Installment Amount Preview - Only shown if hasInstallments is true and amount is entered */}
          {formData.hasInstallments && formData.amount && formData.installments && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-700">مبلغ هر قسط:</p>
              <p className="font-semibold text-primary">
                {new Intl.NumberFormat('fa-IR').format(parseFloat(formData.amount) / parseInt(formData.installments))} ریال
              </p>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              ثبت بدهی
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddDebtForm;
