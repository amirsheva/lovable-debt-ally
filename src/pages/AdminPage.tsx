
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '../types';
import { queryCustomTable } from '@/utils/supabaseUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

// Use a different name for the imported UserRole to avoid naming conflicts
type AppUserRole = UserRole;

interface AdminUser extends User {
  role: AppUserRole;
}

const AdminPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // First get all users from profiles
        const { data: profilesData, error: profilesError } = await queryCustomTable<UserProfile>('profiles')
          .select('*')
          .get();
          
        if (profilesError) throw profilesError;
        
        // Define the Supabase RPC function with proper typing
        async function callRpcFunction<T>(functionName: string, params?: Record<string, any>) {
          const { data, error } = await supabase.rpc(functionName, params || {});
          return { data: data as T, error };
        }
        
        // Call the RPC function with proper typing
        const { data: authData, error: authError } = await callRpcFunction<AuthUserData[]>('get_users_data');
          
        if (authError) {
          console.error('Error fetching user emails:', authError);
          // Continue with profiles only
        }
        
        // Then get all user roles
        const { data: rolesData, error: rolesError } = await queryCustomTable<UserRoleData>('user_roles')
          .select('*')
          .get();
          
        if (rolesError) throw rolesError;
        
        // Ensure we have arrays to work with, even if empty
        const profilesArray = profilesData ?? [];
        const authDataArray = authData || [];
        const rolesArray = rolesData ?? [];
        
        // Combine the data with proper type safety
        const userData: AdminUser[] = profilesArray.map((profile) => {
          // Find email from auth data
          const authUser = authDataArray.find((u) => u.id === profile.id);
          const userEmail = authUser ? authUser.email : '';
          
          // Find role from roles data
          const userRoleObj = rolesArray.find((r) => r.user_id === profile.id);
          const userRole = userRoleObj 
            ? (userRoleObj.role as AppUserRole)
            : ('user' as AppUserRole);
          
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
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  const handleRoleChange = async (userId: string, newRole: AppUserRole) => {
    try {
      // Update role in the database
      const { error } = await queryCustomTable<UserRoleData>('user_roles')
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">نام</TableHead>
                      <TableHead className="text-right">ایمیل</TableHead>
                      <TableHead className="text-right">نقش</TableHead>
                      <TableHead className="text-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminPage;
