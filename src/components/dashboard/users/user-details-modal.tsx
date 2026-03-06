// src/components/dashboard/users/user-details-modal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, MapPin, Clock, DollarSign, Activity } from 'lucide-react';

interface User {
  id: string;
  name: string;
  trips: number;
  rating: number;
  spending: number;
  status: string;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase();

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${
          star <= Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ))}
    <span className="text-sm text-gray-600 ml-1">{rating}</span>
  </div>
);

const mockTrips = [
  { id: 'T001', location: 'Downtown Plaza', date: '2024-03-20', amount: 15.50, duration: '45 min' },
  { id: 'T002', location: 'University Campus', date: '2024-03-18', amount: 12.00, duration: '30 min' },
  { id: 'T003', location: 'Business District', date: '2024-03-15', amount: 20.00, duration: '60 min' },
];

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {/* User Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">ID: {user.id}</p>
            <div className="mt-1">
              <StarRating rating={user.rating} />
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            {user.status === 'active' ? 'Active' : 'Blocked'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <Activity className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-700">{user.trips}</p>
            <p className="text-xs text-blue-600">Total Trips</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-700">${user.spending.toFixed(0)}</p>
            <p className="text-xs text-green-600">Total Spent</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 text-center">
            <Star className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-yellow-700">{user.rating}</p>
            <p className="text-xs text-yellow-600">Avg Rating</p>
          </div>
        </div>

        {/* Recent Trips */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Recent Trips</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {mockTrips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <MapPin className="h-4 w-4 text-[#1C1FC1]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{trip.location}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{trip.duration}</span>
                      <span>•</span>
                      <span>{trip.date}</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">${trip.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}