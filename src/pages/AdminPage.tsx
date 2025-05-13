
import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import AdminUserTable from '@/components/admin/AdminUserTable';

const AdminPage = () => {
  const { users, loading, handleRoleChange } = useAdminUsers();

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">پنل مدیریت</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>مدیریت کاربران</CardTitle>
            <CardDescription>مشاهده و مدیریت کاربران سیستم</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminUserTable 
              users={users}
              loading={loading}
              onRoleChange={handleRoleChange}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminPage;
