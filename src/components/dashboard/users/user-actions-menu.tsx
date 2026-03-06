import { Eye, Ban } from 'lucide-react';

interface UserActionsMenuProps {
  userId: string;
  status: string;
  onView: () => void;
  onToggleBlock: (id: string) => void;
}

export default function UserActionsMenu({ userId, status, onView, onToggleBlock }: UserActionsMenuProps) {
  return (
    <div className="absolute right-0 top-8 z-10 bg-white border border-gray-100 rounded-xl shadow-lg w-36 overflow-hidden">
      <button
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
        onClick={onView}
      >
        <Eye className="h-4 w-4" /> View
      </button>
      <button
        className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition ${
          status === 'active'
            ? 'text-red-600 hover:bg-red-50'
            : 'text-green-600 hover:bg-green-50'
        }`}
        onClick={() => onToggleBlock(userId)}
      >
        <Ban className="h-4 w-4" />
        {status === 'active' ? 'Block' : 'Unblock'}
      </button>
    </div>
  );
}