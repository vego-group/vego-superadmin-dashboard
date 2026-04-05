export type DeviceType = "cabinet" | "charging";
export type DeviceStatus = "active" | "inactive" | "maintenance"; // تم التحديث لتناسب الـ API

export interface Device {
  id: string; // المعرف النصي (cabinet_id أو dev_id)
  internalId: number; // المعرف الرقمي للـ API
  type: DeviceType;
  name: string;
  location: string;
  city: string;
  status: DeviceStatus;
  slots: number;
  availableSlots?: number; // للكبائن فقط
  createdAt: string;
}