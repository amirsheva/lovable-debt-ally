
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole as AppUserRole } from '../types';
import { queryCustomTable } from '@/utils/supabaseUtils';

// Define interfaces for our data types
interface UserProfile {
  id: string;
  full_name?: string;
}

interface UserRoleData {
  user_id: string;
  role: string;
}

interface AuthUserData {
  id: string;
  email: string;
}

interface AdminUser extends User {
  role: AppUserRole;
}

const AdminPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // First get all users from profiles
        const { data: profiles, error: profilesError } = await queryCustomTable('profiles')
          .select('id, full_name');
          
        if (profilesError) throw profilesError;
        
        // Then get user emails from auth.users (needs admin rights)
        const { data: authData, error: authError } = await supabase
          .rpc('get_users_data'); // This RPC needs to be created by a Supabase admin
          
        if (authError) {
          console.error('Error fetching user emails:', authError);
          // Continue with profiles only
        }
        
        // Then get all user roles
        const { data: roles, error: rolesError } = await queryCustomTable('user_roles')
          .select('user_id, role');
          
        if (rolesError) throw rolesError;
        
        // Ensure we have arrays to work with, even if empty
        const profilesArray = profiles as UserProfile[] || [];
        const authDataArray = authData as AuthUserData[] || [];
        const rolesArray = roles as UserRoleData[] || [];
        
        // Combine the data with proper type safety
        const userData: AdminUser[] = profilesArray.map((profile) => {
          // Find email from auth data
          const authUser = authDataArray.find((u) => u.id === profile.id);
          const userEmail = authUser ? authUser.email : '';
          
          // Find role from roles data
          const userRoleObj = rolesArray.find((r) => r.user_id === profile.id);
          const userRole = userRoleObj ? (userRoleObj.role as AppUserRole) : ('user' as AppUserRole);
          
          return {
            id: profile.id,
            email: userEmail || 'Email hidden',
            full_name: profile.full_name || 'Unknown',
            role: userRole
          };
        });
        
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: 'destructive',
          title: 'خطا در بارگذاری کاربران',
          description: 'مشکلی در بارگذاری اطلاعات کاربران رخ داده است.',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  const handleRoleChange = async (userId: string, newRole: AppUserRole) => {
    try {
      // Update role in the database
      const { error } = await queryCustomTable('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: 'نقش کاربر به‌روزرسانی شد',
        description: `نقش کاربر با موفقیت به ${newRole} تغییر یافت.`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در به‌روزرسانی نقش',
        description: 'مشکلی در به‌روزرسانی نقش کاربر رخ داده است.',
      });
    }
  };

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
            {loading ? (
              <div className="text-center py-4">در حال بارگذاری...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-right">نام</th>
                      <th className="border p-2 text-right">ایمیل</th>
                      <th className="border p-2 text-right">نقش</th>
                      <th className="border p-2 text-right">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="border p-2">{user.full_name}</td>
                        <td className="border p-2">{user.email}</td>
                        <td className="border p-2">{user.role}</td>
                        <td className="border p-2">
                          <Select 
                            defaultValue={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value as AppUserRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="انتخاب نقش" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">user</SelectItem>
                              <SelectItem value="admin">admin</SelectItem>
                              <SelectItem value="god">god</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminPage;
