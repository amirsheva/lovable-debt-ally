
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  PlusCircle, 
  ListOrdered, 
  BarChart2, 
  CalendarCheck, 
  Settings,
  CreditCard
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-primary flex items-center">
            <CreditCard className="h-5 w-5 mr-2" /> مدیریت بدهی‌ها
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/" className={`flex items-center rounded-md p-3 ${isActive('/')}`}>
            <Home className="h-5 w-5 ml-2" /> داشبورد
          </Link>
          <Link to="/debts" className={`flex items-center rounded-md p-3 ${isActive('/debts')}`}>
            <ListOrdered className="h-5 w-5 ml-2" /> لیست بدهی‌ها
          </Link>
          <Link to="/add-debt" className={`flex items-center rounded-md p-3 ${isActive('/add-debt')}`}>
            <PlusCircle className="h-5 w-5 ml-2" /> افزودن بدهی جدید
          </Link>
          <Link to="/calendar" className={`flex items-center rounded-md p-3 ${isActive('/calendar')}`}>
            <CalendarCheck className="h-5 w-5 ml-2" /> تقویم پرداخت‌ها
          </Link>
          <Link to="/reports" className={`flex items-center rounded-md p-3 ${isActive('/reports')}`}>
            <BarChart2 className="h-5 w-5 ml-2" /> گزارش‌ها
          </Link>
        </nav>
        
        <div className="p-4 border-t">
          <Link to="/settings" className={`flex items-center rounded-md p-3 ${isActive('/settings')}`}>
            <Settings className="h-5 w-5 ml-2" /> تنظیمات
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {children}
      </div>
    </div>
  );
};

export default Layout;
