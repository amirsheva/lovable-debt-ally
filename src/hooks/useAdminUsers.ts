
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { queryCustomTable } from '@/utils/supabaseUtils';

// Define interfaces for data types
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
export type AppUserRole = UserRole;

export interface AdminUser extends User {
  role: AppUserRole;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Define the Supabase RPC function with proper typing
  async function callRpcFunction<T>(functionName: string, params?: Record<string, any>) {
    const { data, error } = await supabase.rpc(functionName, params || {});
    return { data: data as T, error };
  }
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // First get all users from profiles
      const { data: profilesData, error: profilesError } = await queryCustomTable<UserProfile>('profiles')
        .select('*')
        .get();
        
      if (profilesError) throw profilesError;
      
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

  useEffect(() => {
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

  return { users, loading, handleRoleChange, fetchUsers };
};
