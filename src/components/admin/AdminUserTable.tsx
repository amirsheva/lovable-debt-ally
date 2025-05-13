
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import UserRoleSelect from './UserRoleSelect';
import { AdminUser } from '@/hooks/useAdminUsers';

interface AdminUserTableProps {
  users: AdminUser[];
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  loading: boolean;
}

const AdminUserTable = ({ users, onRoleChange, loading }: AdminUserTableProps) => {
  if (loading) {
    return <div className="text-center py-4">در حال بارگذاری...</div>;
  }

  return (
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
                <UserRoleSelect 
                  defaultValue={user.role}
                  onValueChange={(value) => onRoleChange(user.id, value)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminUserTable;
