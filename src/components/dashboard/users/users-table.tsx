'use client';

import { useState } from 'react';
import { MoreVertical, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMobileCard from './user-mobile-card';
import UserActionsMenu from './user-actions-menu';
import UserDetailsModal from './user-details-modal';

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase();

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-3.5 w-3.5 ${
          star <= Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ))}
    <span className="text-sm text-gray-600 ml-1">{rating}</span>
  </div>
);

interface User {
  id: string;
  name: string;
  trips: number;
  rating: number;
  spending: number;
  status: string;
}

interface UsersTableProps {
  users: User[];
  onToggleBlock: (id: string) => void;
}

const USERS_PER_PAGE = 3;

export default function UsersTable({ users, onToggleBlock }: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginated = users.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Users</h2>
          <span className="text-sm text-gray-400">{users.length.toLocaleString()} total users</span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">User Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Number of Trips</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Average Rating</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Total Spending</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.trips}</td>
                  <td className="px-6 py-4"><StarRating rating={user.rating} /></td>
                  <td className="px-6 py-4 text-sm text-gray-700">${user.spending.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {user.status === 'active' ? 'Active' : 'Block'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                      {openMenuId === user.id && (
                        <UserActionsMenu
                          userId={user.id}
                          status={user.status}
                          onView={() => handleView(user)}
                          onToggleBlock={(id) => { onToggleBlock(id); setOpenMenuId(null); }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {paginated.map((user) => (
            <UserMobileCard
              key={user.id}
              user={user}
              onToggleBlock={onToggleBlock}
              onView={() => handleView(user)}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">
            Showing {(currentPage - 1) * USERS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * USERS_PER_PAGE, users.length)} of {users.length} results
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 px-3 text-xs rounded-lg">
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 text-xs rounded-lg p-0 ${currentPage === page ? 'bg-[#1C1FC1] hover:bg-[#1C1FC1]/90 text-white border-0' : ''}`}
              >
                {page}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 px-3 text-xs rounded-lg">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </>
  );
}