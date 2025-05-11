
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata.full_name,
          };
          setUser(userData);
          
          // Fetch user role
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userData.id)
                .single();

              if (data && !error) {
                setUserRole(data.role as UserRole);
                
                // If no role found, set default to 'user'
                if (!data.role) {
                  // Insert default role
                  await supabase
                    .from('user_roles')
                    .insert({ user_id: userData.id, role: 'user' });
                  setUserRole('user');
                }
              } else {
                // If no role found, set default to 'user'
                await supabase
                  .from('user_roles')
                  .insert({ user_id: userData.id, role: 'user' });
                setUserRole('user');
              }
            } catch (error) {
              console.error('Error fetching user role:', error);
              setUserRole('user'); // Default role
            }
          }, 0);
        } else {
          setUser(null);
          setUserRole(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata.full_name,
          };
          setUser(userData);
          
          // Fetch user role
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userData.id)
            .single();

          if (data && !error) {
            setUserRole(data.role as UserRole);
          } else {
            // If no role found, set default to 'user'
            await supabase
              .from('user_roles')
              .insert({ user_id: userData.id, role: 'user' });
            setUserRole('user');
          }
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        toast({
          variant: 'destructive',
          title: 'خطا در بارگذاری اطلاعات کاربر',
          description: 'لطفاً صفحه را مجدداً بارگذاری کنید.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'خروج موفقیت‌آمیز',
        description: 'با موفقیت از حساب کاربری خود خارج شدید.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در خروج',
        description: 'مشکلی در خروج از حساب کاربری رخ داده است.',
      });
    }
  };

  const value = {
    user,
    userRole,
    isLoading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
