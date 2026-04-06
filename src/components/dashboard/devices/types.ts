export type DeviceType   = "cabinet" | "charging";
export type DeviceStatus = "active" | "inactive" | "maintenance";

export interface Device {
  id:             string;
  internalId:     number;
  type:           DeviceType;
  name:           string | null;   // ← ممكن null
  location:       string;
  city:           string;
  status:         DeviceStatus;
  slots:          number;
  availableSlots?: number;
  createdAt:      string;
}