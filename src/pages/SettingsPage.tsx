import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Category, Bank } from '../types';
import { queryCustomTable } from '@/utils/supabaseUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SettingsPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const { toast } = useToast();
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFormErrors([]);
        const { data: categoriesData, error: categoriesError } = await queryCustomTable<Category>('debt_categories')
          .select('*')
          .order('name')
          .get();
        
        if (categoriesError) throw categoriesError;
        if (categoriesData) {
          setCategories(categoriesData);
        }
        
        const { data: banksData, error: banksError } = await queryCustomTable<Bank>('banks')
          .select('*')
          .order('name')
          .get();
        
        if (banksError) throw banksError;
        if (banksData) {
          setBanks(banksData);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setFormErrors([
          `خطا در بارگذاری اطلاعات: ${error.message || 'لطفاً دوباره تلاش کنید'}`
        ]);
      }
    };
    
    fetchData();
  }, []);
  
  const addCategory = async () => {
    try {
      setFormErrors([]);
      if (!newCategoryName.trim()) {
        setFormErrors(['نام دسته‌بندی نمی‌تواند خالی باشد']);
        return;
      }
      
      const { data, error } = await queryCustomTable<Category>('debt_categories')
        .insert({ 
          name: newCategoryName, 
          is_system: false 
        });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setCategories([...categories, data[0]]);
        setNewCategoryName('');
        
        toast({
          title: 'دسته‌بندی با موفقیت اضافه شد',
          description: `دسته‌بندی ${newCategoryName} به لیست دسته‌بندی‌ها اضافه شد.`,
        });
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      setFormErrors([
        `خطا در اضافه کردن دسته‌بندی: ${error.message || 'لطفاً دوباره تلاش کنید'}`
      ]);
    }
  };
  
  const addBank = async () => {
    try {
      setFormErrors([]);
      if (!newBankName.trim()) {
        setFormErrors(['نام بانک نمی‌تواند خالی باشد']);
        return;
      }
      
      const { data, error } = await queryCustomTable<Bank>('banks')
        .insert({ 
          name: newBankName, 
          is_system: false 
        });
        
      if (error) throw error;

      if (data && data.length > 0) {
        setBanks([...banks, data[0]]);
        setNewBankName('');
        
        toast({
          title: 'بانک با موفقیت اضافه شد',
          description: `بانک ${newBankName} به لیست بانک‌ها اضافه شد.`,
        });
      }
    } catch (error: any) {
      console.error('Error adding bank:', error);
      setFormErrors([
        `خطا در اضافه کردن بانک: ${error.message || 'لطفاً دوباره تلاش کنید'}`
      ]);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">تنظیمات</h1>
        
        {formErrors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              <ul className="list-disc pl-5 text-right">
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>مدیریت دسته‌بندی‌ها</CardTitle>
            <CardDescription>اضافه کردن و مدیریت دسته‌بندی‌های بدهی</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Input 
                type="text" 
                placeholder="نام دسته‌بندی جدید" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="text-right"
              />
              <Button onClick={addCategory}>اضافه کردن</Button>
            </div>
            <ul className="list-disc pl-5 text-right">
              {categories.map((category) => (
                <li key={category.id}>{category.name}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>مدیریت بانک‌ها</CardTitle>
            <CardDescription>اضافه کردن و مدیریت بانک‌های مرتبط با بدهی</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Input 
                type="text" 
                placeholder="نام بانک جدید" 
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                className="text-right"
              />
              <Button onClick={addBank}>اضافه کردن</Button>
            </div>
            <ul className="list-disc pl-5 text-right">
              {banks.map((bank) => (
                <li key={bank.id}>{bank.name}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
