import { Device } from "./types";

export const MOCK_DEVICES: Device[] = [
  { id: "CAB-RYD-001", type: "cabinet",  location: "Al-Olaya – King Fahd Road",        city: "Riyadh", status: "connected",    slots: 20, availableSlots: 14, firmware: "v2.3.8", lastHeartbeat: "30s ago",  todayOps: 42, uptime: 99.8 },
  { id: "CAB-RYD-002", type: "cabinet",  location: "Al-Malaz – Salah Al-Din St.",       city: "Riyadh", status: "disconnected", slots: 20, availableSlots: 0,  firmware: "v2.3.5", lastHeartbeat: "45 min",   todayOps: 18, uptime: 94.2 },
  { id: "CAB-RYD-003", type: "cabinet",  location: "Al-Nakheel – Anas Bin Malik Rd.",   city: "Riyadh", status: "connected",    slots: 20, availableSlots: 11, firmware: "v2.3.8", lastHeartbeat: "15s ago",  todayOps: 35, uptime: 99.9 },
  { id: "CHG-RYD-001", type: "charging", location: "Al-Sulaimaniyah – Takhasussi St.",  city: "Riyadh", status: "connected",    slots: 4,  availableSlots: 4,  firmware: "v1.8.2", lastHeartbeat: "10s ago",  todayOps: 22, uptime: 99.5 },
  { id: "CHG-JED-001", type: "charging", location: "Al-Hamra – Prince Sultan Rd.",      city: "Jeddah", status: "maintenance",  slots: 4,  availableSlots: 0,  firmware: "v1.7.9", lastHeartbeat: "connected", todayOps: 0,  uptime: 89.1 },
  { id: "CAB-JED-001", type: "cabinet",  location: "Al-Safa – Palestine St.",           city: "Jeddah", status: "connected",    slots: 20, availableSlots: 9,  firmware: "v2.3.8", lastHeartbeat: "5s ago",   todayOps: 28, uptime: 99.6 },
  { id: "CAB-DMM-001", type: "cabinet",  location: "Al-Corniche – King Faisal Rd.",     city: "Dammam", status: "connected",    slots: 20, availableSlots: 16, firmware: "v2.3.8", lastHeartbeat: "20s ago",  todayOps: 15, uptime: 99.9 },
  { id: "CHG-DMM-001", type: "charging", location: "Al-Shati – Prince Mohammed Rd.",   city: "Dammam", status: "connected",    slots: 4,  availableSlots: 2,  firmware: "v1.8.2", lastHeartbeat: "8s ago",   todayOps: 19, uptime: 98.7 },
  { id: "CAB-MED-001", type: "cabinet",  location: "Al-Rawda – King Abdulaziz Rd.",    city: "Medina", status: "connected",    slots: 20, availableSlots: 7,  firmware: "v2.3.8", lastHeartbeat: "12s ago",  todayOps: 31, uptime: 99.4 },
  { id: "CHG-MED-001", type: "charging", location: "Al-Aziziyah – Hira St.",           city: "Medina", status: "maintenance",  slots: 4,  availableSlots: 0,  firmware: "v1.7.9", lastHeartbeat: "connected", todayOps: 0,  uptime: 91.3 },
];