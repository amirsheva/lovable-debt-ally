import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Category, Bank, AppSettings, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { queryCustomTable } from '@/utils/supabaseUtils';

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editBankId, setEditBankId] = useState<string | null>(null);
  const [editBankName, setEditBankName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // App settings
  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    reminders: false,
    requiredFields: {
      name: true,
      category: false,
      bank: false,
      description: true,
    },
    enabledFeatures: {
      categories: true,
      banks: true,
      notes: true,
    }
  });

  useEffect(() => {
    // Check if user is admin or god
    if (userRole === 'admin' || userRole === 'god') {
      setIsAdmin(true);
    }
    
    const loadCategories = async () => {
      try {
        const { data, error } = await queryCustomTable<Category>('debt_categories')
          .select('*')
          .order('is_system', { ascending: false })
          .get();
        
        if (error) throw error;
        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        toast({
          variant: 'destructive',
          title: 'خطا در بارگذاری دسته‌بندی‌ها',
          description: 'لطفاً صفحه را مجدداً بارگذاری کنید.',
        });
      }
    };
    
    const loadBanks = async () => {
      try {
        const { data, error } = await queryCustomTable<Bank>('banks')
          .select('*')
          .order('is_system', { ascending: false })
          .get();
        
        if (error) throw error;
        if (data) {
          setBanks(data);
        }
      } catch (error) {
        console.error('Error loading banks:', error);
        toast({
          variant: 'destructive',
          title: 'خطا در بارگذاری بانک‌ها',
          description: 'لطفاً صفحه را مجدداً بارگذاری کنید.',
        });
      }
    };
    
    // Load settings from localStorage or use defaults
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    };
    
    loadCategories();
    loadBanks();
    loadSettings();
  }, [toast, userRole]);
  
  const handleSettingChange = (
    section: 'general' | 'requiredFields' | 'enabledFeatures',
    key: string,
    value: boolean
  ) => {
    let updatedSettings = { ...settings };
    
    if (section === 'general') {
      updatedSettings = { ...updatedSettings, [key]: value };
    } else {
      updatedSettings = {
        ...updatedSettings,
        [section]: {
          ...updatedSettings[section],
          [key]: value
        }
      };
    }
    
    setSettings(updatedSettings);
    localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
    
    toast({
      title: 'تنظیمات ذخیره شد',
      description: 'تنظیمات با موفقیت به‌روزرسانی شد.',
    });
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const { data, error } = await queryCustomTable<Category>('debt_categories')
        .insert({ name: newCategoryName, is_system: isAdmin ? true : false });
        
      if (error) throw error;
      
      if (data) {
        setCategories([...categories, data[0]]);
        setNewCategoryName('');
        
        toast({
          title: 'دسته‌بندی اضافه شد',
          description: 'دسته‌بندی جدید با موفقیت اضافه شد.',
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در افزودن دسته‌بندی',
        description: 'مشکلی در افزودن دسته‌بندی جدید رخ داده است.',
      });
    }
  };
  
  const handleAddBank = async () => {
    if (!newBankName.trim()) return;
    
    try {
      const { data, error } = await queryCustomTable<Bank>('banks')
        .insert({ name: newBankName, is_system: isAdmin ? true : false });
        
      if (error) throw error;
      
      if (data) {
        setBanks([...banks, data[0]]);
        setNewBankName('');
        
        toast({
          title: 'بانک اضافه شد',
          description: 'بانک جدید با موفقیت اضافه شد.',
        });
      }
    } catch (error) {
      console.error('Error adding bank:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در افزودن بانک',
        description: 'مشکلی در افزودن بانک جدید رخ داده است.',
      });
    }
  };
  
  const handleUpdateCategory = async () => {
    if (!editCategoryId || !editCategoryName.trim()) return;
    
    try {
      const { error } = await queryCustomTable<Category>('debt_categories')
        .update({ name: editCategoryName })
        .eq('id', editCategoryId);
        
      if (error) throw error;
      
      setCategories(categories.map(category => 
        category.id === editCategoryId ? { ...category, name: editCategoryName } : category
      ));
      
      setEditCategoryId(null);
      setEditCategoryName('');
      
      toast({
        title: 'دسته‌بندی به‌روزرسانی شد',
        description: 'دسته‌بندی با موفقیت به‌روزرسانی شد.',
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در به‌روزرسانی دسته‌بندی',
        description: 'مشکلی در به‌روزرسانی دسته‌بندی رخ داده است.',
      });
    }
  };
  
  const handleUpdateBank = async () => {
    if (!editBankId || !editBankName.trim()) return;
    
    try {
      const { error } = await queryCustomTable<Bank>('banks')
        .update({ name: editBankName })
        .eq('id', editBankId);
        
      if (error) throw error;
      
      setBanks(banks.map(bank => 
        bank.id === editBankId ? { ...bank, name: editBankName } : bank
      ));
      
      setEditBankId(null);
      setEditBankName('');
      
      toast({
        title: 'بانک به‌روزرسانی شد',
        description: 'بانک با موفقیت به‌روزرسانی شد.',
      });
    } catch (error) {
      console.error('Error updating bank:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در به‌روزرسانی بانک',
        description: 'مشکلی در به‌روزرسانی بانک رخ داده است.',
      });
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await queryCustomTable<Category>('debt_categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setCategories(categories.filter(category => category.id !== id));
      
      toast({
        title: 'دسته‌بندی حذف شد',
        description: 'دسته‌بندی با موفقیت حذف شد.',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در حذف دسته‌بندی',
        description: 'مشکلی در حذف دسته‌بندی رخ داده است.',
      });
    }
  };
  
  const handleDeleteBank = async (id: string) => {
    try {
      const { error } = await queryCustomTable<Bank>('banks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setBanks(banks.filter(bank => bank.id !== id));
      
      toast({
        title: 'بانک حذف شد',
        description: 'بانک با موفقیت حذف شد.',
      });
    } catch (error) {
      console.error('Error deleting bank:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در حذف بانک',
        description: 'مشکلی در حذف بانک رخ داده است.',
      });
    }
  };
  
  const handleResetData = () => {
    toast({
      title: "این ویژگی هنوز فعال نیست",
      description: "بازنشانی داده‌ها در نسخه آینده فعال خواهد شد.",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">تنظیمات</h1>
        
        <Tabs defaultValue="user" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="user">تنظیمات کاربری</TabsTrigger>
            <TabsTrigger value="data">مدیریت داده‌ها</TabsTrigger>
            <TabsTrigger value="categories">دسته‌بندی‌ها</TabsTrigger>
            <TabsTrigger value="banks">بانک‌ها</TabsTrigger>
          </TabsList>
          
          <TabsContent value="user">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات کاربری</CardTitle>
                <CardDescription>تنظیمات مربوط به حساب کاربری و ترجیحات شما</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">اعلان‌ها</Label>
                    <p className="text-sm text-gray-500">دریافت اعلان برای پرداخت‌های سررسید</p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange('general', 'notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminders">یادآوری‌ها</Label>
                    <p className="text-sm text-gray-500">دریافت یادآوری یک روز قبل از سررسید</p>
                  </div>
                  <Switch 
                    id="reminders"
                    checked={settings.reminders}
                    onCheckedChange={(checked) => handleSettingChange('general', 'reminders', checked)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>فیلدهای ضروری</CardTitle>
                <CardDescription>تنظیم فیلدهای ضروری برای افزودن بدهی جدید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="req-name">نام بدهی</Label>
                  </div>
                  <Switch 
                    id="req-name" 
                    checked={settings.requiredFields.name}
                    onCheckedChange={(checked) => handleSettingChange('requiredFields', 'name', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="req-category">دسته‌بندی</Label>
                  </div>
                  <Switch 
                    id="req-category" 
                    checked={settings.requiredFields.category}
                    onCheckedChange={(checked) => handleSettingChange('requiredFields', 'category', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="req-bank">بانک (برای وام‌های بانکی)</Label>
                  </div>
                  <Switch 
                    id="req-bank" 
                    checked={settings.requiredFields.bank}
                    onCheckedChange={(checked) => handleSettingChange('requiredFields', 'bank', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="req-description">توضیحات</Label>
                  </div>
                  <Switch 
                    id="req-description" 
                    checked={settings.requiredFields.description}
                    onCheckedChange={(checked) => handleSettingChange('requiredFields', 'description', checked)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>ویژگی‌های فعال</CardTitle>
                <CardDescription>ویژگی‌های فعال در برنامه</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="feature-categories">دسته‌بندی‌ها</Label>
                  </div>
                  <Switch 
                    id="feature-categories" 
                    checked={settings.enabledFeatures.categories}
                    onCheckedChange={(checked) => handleSettingChange('enabledFeatures', 'categories', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="feature-banks">بانک‌ها</Label>
                  </div>
                  <Switch 
                    id="feature-banks" 
                    checked={settings.enabledFeatures.banks}
                    onCheckedChange={(checked) => handleSettingChange('enabledFeatures', 'banks', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="feature-notes">یادداشت‌ها</Label>
                  </div>
                  <Switch 
                    id="feature-notes" 
                    checked={settings.enabledFeatures.notes}
                    onCheckedChange={(checked) => handleSettingChange('enabledFeatures', 'notes', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>مدیریت داده‌ها</CardTitle>
                <CardDescription>گزینه‌های مربوط به مدیریت داده‌های شما</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="destructive" onClick={handleResetData}>
                  بازنشانی تمام داده‌ها
                </Button>
                <p className="text-sm text-gray-500">
                  توجه: این عملیات تمامی بدهی‌ها و پرداخت‌های ثبت شده را حذف می‌کند و قابل بازگشت نیست.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>دسته‌بندی‌های بدهی</span>
                  {(isAdmin || !settings.enabledFeatures.categories) && (
                    <div className="flex gap-2">
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="نام دسته‌بندی جدید"
                        className="max-w-48"
                      />
                      <Button size="sm" onClick={handleAddCategory}>
                        <Plus className="w-4 h-4 ml-1" /> افزودن
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>مدیریت دسته‌بندی‌های بدهی</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-right">نام دسته‌بندی</th>
                        <th className="border p-2 text-right">نوع</th>
                        <th className="border p-2 text-right">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="border p-2">{category.name}</td>
                          <td className="border p-2">{category.is_system ? 'سیستمی' : 'کاربر'}</td>
                          <td className="border p-2 flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled={(category.is_system && !isAdmin)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>ویرایش دسته‌بندی</DialogTitle>
                                  <DialogDescription>
                                    نام دسته‌بندی را تغییر دهید.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Label htmlFor="edit-category">نام دسته‌بندی</Label>
                                  <Input
                                    id="edit-category"
                                    value={editCategoryId === category.id ? editCategoryName : category.name}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    className="mt-2"
                                    onClick={() => {
                                      setEditCategoryId(category.id);
                                      setEditCategoryName(category.name);
                                    }}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button onClick={handleUpdateCategory}>
                                    ذخیره تغییرات
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              size="sm" 
                              variant="destructive"
                              disabled={(category.is_system && !isAdmin)}
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="banks">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>لیست بانک‌ها</span>
                  {(isAdmin || !settings.enabledFeatures.banks) && (
                    <div className="flex gap-2">
                      <Input
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                        placeholder="نام بانک جدید"
                        className="max-w-48"
                      />
                      <Button size="sm" onClick={handleAddBank}>
                        <Plus className="w-4 h-4 ml-1" /> افزودن
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>مدیریت لیست بانک‌ها برای وام‌های بانکی</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-right">نام بانک</th>
                        <th className="border p-2 text-right">نوع</th>
                        <th className="border p-2 text-right">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banks.map((bank) => (
                        <tr key={bank.id} className="hover:bg-gray-50">
                          <td className="border p-2">{bank.name}</td>
                          <td className="border p-2">{bank.is_system ? 'سیستمی' : 'کاربر'}</td>
                          <td className="border p-2 flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled={(bank.is_system && !isAdmin)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>ویرایش بانک</DialogTitle>
                                  <DialogDescription>
                                    نام بانک را تغییر دهید.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Label htmlFor="edit-bank">نام بانک</Label>
                                  <Input
                                    id="edit-bank"
                                    value={editBankId === bank.id ? editBankName : bank.name}
                                    onChange={(e) => setEditBankName(e.target.value)}
                                    className="mt-2"
                                    onClick={() => {
                                      setEditBankId(bank.id);
                                      setEditBankName(bank.name);
                                    }}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button onClick={handleUpdateBank}>
                                    ذخیره تغییرات
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              size="sm" 
                              variant="destructive"
                              disabled={(bank.is_system && !isAdmin)}
                              onClick={() => handleDeleteBank(bank.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
