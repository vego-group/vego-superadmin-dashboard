// src/components/dashboard/vehicle-control/group-vehicles.ts
import type { SuperadminVehicle, VehicleGroup, OwnerFilter, SuperadminDriver } from "./types";

/** Filters the flat vehicle list by owner type and a free-text query. */
export function filterVehicles(
  vehicles: SuperadminVehicle[],
  ownerFilter: OwnerFilter,
  query: string
): SuperadminVehicle[] {
  const q = query.trim().toLowerCase();
  return vehicles.filter((v) => {
    if (ownerFilter !== "all" && v.ownerType !== ownerFilter) return false;
    if (!q) return true;
    return (
      v.plateNumber.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.location.toLowerCase().includes(q) ||
      v.ownerName.toLowerCase().includes(q) ||
      (v.companyName ?? "").toLowerCase().includes(q) ||
      (v.assignedDriverName ?? "").toLowerCase().includes(q)
    );
  });
}

/** Groups vehicles by company → driver, with a single "Individual Users" bucket for individuals. */
export function groupVehicles(vehicles: SuperadminVehicle[]): VehicleGroup[] {
  const companies = new Map<string, VehicleGroup>();
  const individuals: VehicleGroup = {
    groupType: "user",
    groupId: "individuals",
    groupName: "Individual Users",
    subGroups: [],
  };
  const indivSub = new Map<string, VehicleGroup["subGroups"][number]>();

  for (const v of vehicles) {
    if (v.ownerType === "corporate_driver" && v.companyId) {
      let g = companies.get(v.companyId);
      if (!g) {
        g = { groupType: "company", groupId: v.companyId, groupName: v.companyName ?? "—", subGroups: [] };
        companies.set(v.companyId, g);
      }
      let sub = g.subGroups.find((s) => s.subId === v.ownerId);
      if (!sub) {
        sub = { subId: v.ownerId, subName: v.ownerName, vehicles: [] };
        g.subGroups.push(sub);
      }
      sub.vehicles.push(v);
    } else {
      let sub = indivSub.get(v.ownerId);
      if (!sub) {
        sub = { subId: v.ownerId, subName: v.ownerName, vehicles: [] };
        indivSub.set(v.ownerId, sub);
        individuals.subGroups.push(sub);
      }
      sub.vehicles.push(v);
    }
  }

  const result: VehicleGroup[] = [...companies.values()];
  if (individuals.subGroups.length) result.push(individuals);
  return result;
}

/**
 * Derives the list of assignable drivers from the loaded vehicles
 * (unique corporate drivers + any currently-assigned drivers).
 */
export function deriveDrivers(vehicles: SuperadminVehicle[]): SuperadminDriver[] {
  const map = new Map<string, SuperadminDriver>();
  for (const v of vehicles) {
    if (v.ownerType === "corporate_driver" && v.ownerId) {
      map.set(v.ownerId, {
        id: v.ownerId,
        name: v.ownerName,
        companyId: v.companyId,
        companyName: v.companyName,
      });
    }
    if (v.assignedDriverId && v.assignedDriverName && !map.has(v.assignedDriverId)) {
      map.set(v.assignedDriverId, { id: v.assignedDriverId, name: v.assignedDriverName });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
