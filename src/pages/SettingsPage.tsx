
import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '../hooks/use-toast';

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  
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
              <Switch id="notifications" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reminders">یادآوری‌ها</Label>
                <p className="text-sm text-gray-500">دریافت یادآوری یک روز قبل از سررسید</p>
              </div>
              <Switch id="reminders" />
            </div>
          </CardContent>
        </Card>
        
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
      </div>
    </Layout>
  );
};

export default SettingsPage;
