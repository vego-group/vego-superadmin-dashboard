'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock lockers
const mockLockers = [
  { id: '1', name: 'Cabinet-DT-001', location: 'Downtown Plaza' },
  { id: '2', name: 'Cabinet-UN-002', location: 'University Campus' },
  { id: '3', name: 'Cabinet-BD-003', location: 'Business District' },
  { id: '4', name: 'Cabinet-ST-004', location: 'Shopping Center' },
  { id: '5', name: 'Cabinet-AP-005', location: 'Airport Plaza' },
];

const AddAdminPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [selectedLockers, setSelectedLockers] = useState<string[]>([]);
  const [showLockerDropdown, setShowLockerDropdown] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLocker = (lockerId: string) => {
    if (!selectedLockers.includes(lockerId)) {
      setSelectedLockers([...selectedLockers, lockerId]);
    }
    setShowLockerDropdown(false);
  };

  const handleRemoveLocker = (lockerId: string) => {
    setSelectedLockers(selectedLockers.filter(id => id !== lockerId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    console.log({
      ...formData,
      selectedLockers,
    });

    router.push('/dashboard/admins');
  };

  const getLockerDetails = (lockerId: string) => {
    return mockLockers.find(l => l.id === lockerId);
  };

  return (
    <div className="-m-4 md:-m-6 lg:-m-8 min-h-screen bg-white">
      {/* Header - مثل Login Page */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Add Admin</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Create a new admin account and assign lockers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container - مثل Login Page */}
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6">
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm text-gray-600">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-myvego-dark focus:border-myvego-dark transition"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm text-gray-600">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-myvego-dark focus:border-myvego-dark transition"
              />
            </div>

            {/* Password + Confirm - يصبح عمودي على الجوال */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-600">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-myvego-dark focus:border-myvego-dark transition"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-gray-600">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-myvego-dark focus:border-myvego-dark transition"
                />
              </div>
            </div>

            {/* Assign Locker */}
            <div className="space-y-3">
              <Label className="text-sm text-gray-600">Assign Locker</Label>

              {/* Selected Lockers */}
              {selectedLockers.length > 0 && (
                <div className="space-y-2">
                  {selectedLockers.map(lockerId => {
                    const locker = getLockerDetails(lockerId);
                    return (
                      <div
                        key={lockerId}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {locker?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {locker?.location}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveLocker(lockerId)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Assign Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLockerDropdown(!showLockerDropdown)}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl text-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Assign Locker
                </button>

                {/* Dropdown */}
                {showLockerDropdown && (
                  <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-auto">
                    {mockLockers
                      .filter(locker => !selectedLockers.includes(locker.id))
                      .map(locker => (
                        <button
                          key={locker.id}
                          type="button"
                          onClick={() => handleAddLocker(locker.id)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-0 transition"
                        >
                          <div className="text-sm font-medium text-gray-800">
                            {locker.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {locker.location}
                          </div>
                        </button>
                      ))}

                    {mockLockers.filter(
                      locker => !selectedLockers.includes(locker.id)
                    ).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-400 text-center">
                        No more lockers available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons - يصبح عمودي على الجوال */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-myvego-gradient hover:opacity-90 text-white font-medium py-3 rounded-xl text-sm transition"
              >
                + Create Admin
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/admins')}
                className="flex-1 border-2 border-primary text-primary hover:bg-primary/5 font-medium py-3 rounded-xl text-sm transition"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAdminPage;