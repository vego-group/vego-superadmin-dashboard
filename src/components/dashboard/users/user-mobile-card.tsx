import { Eye, Ban, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase();

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-3 w-3 ${
          star <= Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ))}
    <span className="text-xs text-gray-600 ml-1">{rating}</span>
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

interface UserMobileCardProps {
  user: User;
  onToggleBlock: (id: string) => void;
  onView: () => void;
}

export default function UserMobileCard({ user, onToggleBlock, onView }: UserMobileCardProps) {
  return (
    <div className="bg-white border-b p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
            <p className="text-xs text-gray-400">ID: {user.id}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {user.status === 'active' ? 'Active' : 'Block'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Trips</p>
          <p className="font-semibold">{user.trips}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Spending</p>
          <p className="font-semibold">${user.spending.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Rating</p>
          <StarRating rating={user.rating} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 text-xs"
          onClick={onView}
        >
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleBlock(user.id)}
          className={`flex-1 gap-1 text-xs ${
            user.status === 'active'
              ? 'text-red-600 hover:bg-red-50'
              : 'text-green-600 hover:bg-green-50'
          }`}
        >
          <Ban className="h-3.5 w-3.5" />
          {user.status === 'active' ? 'Block' : 'Unblock'}
        </Button>
      </div>
    </div>
  );
}