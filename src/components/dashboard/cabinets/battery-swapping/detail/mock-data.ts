export const MOCK_CABINET = {
  id: "CAB-RYD-001",
  name: "Al-Olaya Cabinet",
  location: "Al-Olaya – King Fahd Road",
  city: "Riyadh",
  status: "connected" as const,
  uptime: 99.8,
  lastHeartbeat: "30s ago",
  firmware: "v2.3.8",
  totalSlots: 20,
  availableBatteries: 14,
  charging: 3,
  faulty: 2,
  blocked: 1,
};

export type SlotStatus = "available" | "charging" | "faulty" | "blocked" | "empty";

export interface Slot {
  id: string;
  number: number;
  status: SlotStatus;
  batteryId?: string;
  batteryType?: string;
  soc?: number;
  soh?: number;
  cycles?: number;
  lastSwap?: string;
  eligible?: boolean;
}

export const MOCK_SLOTS: Slot[] = [
  { id: "S1",  number: 1,  status: "available", batteryId: "BAT-0412", batteryType: "Li-Ion 72V 120Ah", soc: 95, soh: 94, cycles: 312, lastSwap: "14/02 – 11:30 AM", eligible: true  },
  { id: "S2",  number: 2,  status: "available", batteryId: "BAT-0389", batteryType: "Li-Ion 72V 120Ah", soc: 88, soh: 91, cycles: 287, lastSwap: "14/02 – 10:15 AM", eligible: true  },
  { id: "S3",  number: 3,  status: "available", batteryId: "BAT-0401", batteryType: "Li-Ion 72V 120Ah", soc: 62, soh: 89, cycles: 334, lastSwap: "14/02 – 09:45 AM", eligible: false },
  { id: "S4",  number: 4,  status: "available", batteryId: "BAT-0356", batteryType: "Li-Ion 72V 120Ah", soc: 100, soh: 96, cycles: 201, lastSwap: "13/02 – 03:20 PM", eligible: true  },
  { id: "S5",  number: 5,  status: "available", batteryId: "BAT-0423", batteryType: "Li-Ion 72V 120Ah", soc: 99, soh: 93, cycles: 256, lastSwap: "14/02 – 08:30 AM", eligible: true  },
  { id: "S6",  number: 6,  status: "empty",     },
  { id: "S7",  number: 7,  status: "available", batteryId: "BAT-0378", batteryType: "Li-Ion 72V 120Ah", soc: 82, soh: 88, cycles: 412, lastSwap: "13/02 – 05:10 PM", eligible: true  },
  { id: "S8",  number: 8,  status: "charging",  batteryId: "BAT-0445", batteryType: "Li-Ion 72V 120Ah", soc: 45, soh: 92, cycles: 178, lastSwap: "14/02 – 11:00 AM", eligible: false },
  { id: "S9",  number: 9,  status: "available", batteryId: "BAT-0367", batteryType: "Li-Ion 72V 120Ah", soc: 87, soh: 90, cycles: 298, lastSwap: "14/02 – 07:45 AM", eligible: true  },
  { id: "S10", number: 10, status: "available", batteryId: "BAT-0434", batteryType: "Li-Ion 72V 120Ah", soc: 85, soh: 95, cycles: 223, lastSwap: "13/02 – 04:30 PM", eligible: true  },
  { id: "S11", number: 11, status: "available", batteryId: "BAT-0391", batteryType: "Li-Ion 72V 120Ah", soc: 83, soh: 87, cycles: 389, lastSwap: "14/02 – 06:20 AM", eligible: true  },
  { id: "S12", number: 12, status: "available", batteryId: "BAT-0412", batteryType: "Li-Ion 72V 120Ah", soc: 79, soh: 91, cycles: 267, lastSwap: "13/02 – 06:45 PM", eligible: true  },
  { id: "S13", number: 13, status: "blocked",   batteryId: "BAT-0398", batteryType: "Li-Ion 72V 120Ah", soc: 100, soh: 78, cycles: 501, lastSwap: "12/02 – 02:30 PM", eligible: false },
  { id: "S14", number: 14, status: "charging",  batteryId: "BAT-0467", batteryType: "Li-Ion 72V 120Ah", soc: 38, soh: 94, cycles: 145, lastSwap: "14/02 – 11:20 AM", eligible: false },
  { id: "S15", number: 15, status: "empty",     },
  { id: "S16", number: 16, status: "charging",  batteryId: "BAT-0489", batteryType: "Li-Ion 72V 120Ah", soc: 90, soh: 96, cycles: 189, lastSwap: "14/02 – 10:50 AM", eligible: false },
  { id: "S17", number: 17, status: "available", batteryId: "BAT-0412", batteryType: "Li-Ion 72V 120Ah", soc: 90, soh: 93, cycles: 234, lastSwap: "14/02 – 09:10 AM", eligible: true  },
  { id: "S18", number: 18, status: "available", batteryId: "BAT-0356", batteryType: "Li-Ion 72V 120Ah", soc: 88, soh: 90, cycles: 312, lastSwap: "13/02 – 08:30 PM", eligible: true  },
  { id: "S19", number: 19, status: "available", batteryId: "BAT-0423", batteryType: "Li-Ion 72V 120Ah", soc: 82, soh: 88, cycles: 278, lastSwap: "14/02 – 07:00 AM", eligible: true  },
  { id: "S20", number: 20, status: "faulty",    batteryId: "BAT-0445", batteryType: "Li-Ion 72V 120Ah", soc: 84, soh: 65, cycles: 612, lastSwap: "10/02 – 03:15 PM", eligible: false },
];

export const MOCK_POLICY = {
  minSocForSwap: 80,
  minSohThreshold: 70,
  maxCycles: 1000,
  lowSohPenalty: "+2.50 SAR",
  rejectBelowSoh: 60,
  policyVersion: "v3.2",
};