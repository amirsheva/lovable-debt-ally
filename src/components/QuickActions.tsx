
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  ArrowUpCircle, 
  Calendar, 
  BarChart3 
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'افزودن بدهی',
      icon: <PlusCircle className="h-6 w-6" />,
      description: 'ثبت بدهی جدید در سیستم',
      link: '/add-debt',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'ثبت پرداخت',
      icon: <ArrowUpCircle className="h-6 w-6" />,
      description: 'ثبت پرداخت برای بدهی‌های موجود',
      link: '/debts',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'تقویم پرداخت‌ها',
      icon: <Calendar className="h-6 w-6" />,
      description: 'مشاهده برنامه پرداخت‌ها',
      link: '/calendar',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'گزارشات',
      icon: <BarChart3 className="h-6 w-6" />,
      description: 'مشاهده گزارش‌های آماری',
      link: '/reports',
      color: 'bg-amber-100 text-amber-600'
    }
  ];

  return (
    <Card className="p-4 mb-8 shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-right">عملیات سریع</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link to={action.link} key={index} className="block">
            <div className="border rounded-lg p-4 hover:border-primary transition-all hover:shadow-md h-full">
              <div className={`${action.color} p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3 mx-auto`}>
                {action.icon}
              </div>
              <h3 className="font-medium text-center">{action.title}</h3>
              <p className="text-sm text-gray-500 text-center mt-1">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;
