import { Metadata } from 'next';
import AdminsManagement from '@/components/dashboard/admins';

export const metadata: Metadata = {
  title: 'Admins Management - Vego Superadmin',
  description: 'Manage your assigned smart locker cabinets and admins',
};

export default function AdminsPage() {
  return <AdminsManagement />;
}