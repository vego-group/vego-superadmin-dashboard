export type DeviceType   = "cabinet" | "charging";
export type DeviceStatus = "connected" | "disconnected" | "maintenance";

export interface Device {
  id:              string;
  type:            DeviceType;
  location:        string;
  city:            string;
  status:          DeviceStatus;
  slots:           number;
  availableSlots:  number;
  firmware:        string;
  lastHeartbeat:   string;
  todayOps:        number;
  uptime:          number;
}