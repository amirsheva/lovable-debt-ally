
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, DollarSign, Calendar, PieChart, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut, userRole } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <div className="w-16 md:w-64 bg-white border-l shadow-sm flex flex-col">
        <div className="p-4 text-center border-b">
          <h1 className="text-xl font-bold hidden md:block">مدیریت بدهی‌ها</h1>
          <h1 className="text-xl font-bold md:hidden">مدبد</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/" className="flex items-center p-2 rounded-lg hover:bg-gray-100">
                <Home className="h-5 w-5" />
                <span className="mr-3 hidden md:block">خانه</span>
              </Link>
            </li>
            <li>
              <Link to="/debts" className="flex items-center p-2 rounded-lg hover:bg-gray-100">
                <DollarSign className="h-5 w-5" />
                <span className="mr-3 hidden md:block">بدهی‌ها</span>
              </Link>
            </li>
            <li>
              <Link to="/calendar" className="flex items-center p-2 rounded-lg hover:bg-gray-100">
                <Calendar className="h-5 w-5" />
                <span className="mr-3 hidden md:block">تقویم پرداخت</span>
              </Link>
            </li>
            <li>
              <Link to="/reports" className="flex items-center p-2 rounded-lg hover:bg-gray-100">
                <PieChart className="h-5 w-5" />
                <span className="mr-3 hidden md:block">گزارش‌ها</span>
              </Link>
            </li>
            {(userRole === 'admin' || userRole === 'god') && (
              <li>
                <Link to="/admin" className="flex items-center p-2 rounded-lg hover:bg-gray-100">
                  <User className="h-5 w-5" />
                  <span className="mr-3 hidden md:block">پنل مدیریت</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="p-4 border-t">
          <Link to="/settings" className="flex items-center p-2 rounded-lg hover:bg-gray-100">
            <Settings className="h-5 w-5" />
            <span className="mr-3 hidden md:block">تنظیمات</span>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center md:justify-start mt-2" 
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
            <span className="mr-3 hidden md:block">خروج</span>
          </Button>
          
          {user && (
            <div className="hidden md:flex items-center mt-4 pt-2 border-t">
              <div className="ml-3 text-sm">
                <p className="font-medium text-gray-700">{user.full_name || user.email}</p>
                <p className="text-gray-500">{userRole}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
