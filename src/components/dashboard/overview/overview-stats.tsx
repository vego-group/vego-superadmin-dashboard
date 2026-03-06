// overview-stats.tsx
import { Users, Grid2X2, Lock, User } from "lucide-react";
import StatsCard from "./stats-card";

export default function OverviewStats() {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      <StatsCard
        title="Total Users"
        value={12847}
        icon={<Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />}
        iconBg="bg-blue-100"
      />

      <StatsCard
        title="Total Lockers"
        value={156}
        icon={<Grid2X2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />}
        iconBg="bg-green-100"
      />

      <StatsCard
        title="Your Lockers"
        value={100}
        icon={<User className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
        iconBg="bg-purple-100"
      />

      <StatsCard
        title="Admins Lockers"
        value={45}
        icon={<Lock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />}
        iconBg="bg-orange-100"
      />
    </div>
  );
}