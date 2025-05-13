
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types';

// Define a different name for the imported UserRole to avoid naming conflicts
type AppUserRole = UserRole;

interface UserRoleSelectProps {
  defaultValue: AppUserRole;
  onValueChange: (value: AppUserRole) => void;
}

const UserRoleSelect = ({ defaultValue, onValueChange }: UserRoleSelectProps) => {
  return (
    <Select 
      defaultValue={defaultValue}
      onValueChange={(value) => onValueChange(value as AppUserRole)}
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
  );
};

export default UserRoleSelect;
