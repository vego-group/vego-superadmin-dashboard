"use client";

import { useLang } from "@/lib/language-context";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wifi, WifiOff, Clock, MapPin, Hash } from "lucide-react";
import { useCabinetDetail, StationSlot } from "@/hooks/use-cabinet-detail";
import { Loader2 } from "lucide-react";
import { API_ENDPOINTS, authHeaders } from "@/config/api";

// ─── Slot status config ───────────────────────────────────────────────────────
const statusCfg: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  reserved:    { bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-300", icon: "🔋" },
  occupied:    { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-300",   icon: "⚡" },
  charging:    { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-300",   icon: "⚡" },
  available:   { bg: "bg-green-50",   text: "text-green-700",  border: "border-green-300",  icon: "○"  },
  empty:       { bg: "bg-gray-50",    text: "text-gray-400",   border: "border-gray-200",   icon: "○"  },
  maintenance: { bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-300", icon: "🛠" },
  faulty:      { bg: "bg-red-50",     text: "text-red-700",    border: "border-red-300",    icon: "⚠"  },
};

// ─── Stats Row ────────────────────────────────────────────────────────────────
/** Derive occupancy from battery presence — slot.status is a maintenance flag. */
function slotOccupancy(slot: StationSlot): "occupied" | "empty" | "maintenance" {
  if (slot.status === "maintenance" || slot.status === "faulty") return "maintenance";
  if (slot.battery || slot.battery_id) return "occupied";
  return "empty";
}

function StatsRow({ slots }: { slots: StationSlot[] }) {
  const { t } = useLang();
  const occupied = slots.filter((s) => slotOccupancy(s) === "occupied").length;
  const empty = slots.filter((s) => slotOccupancy(s) === "empty").length;
  const maintenance = slots.filter((s) => slotOccupancy(s) === "maintenance").length;
  const stats = [
    { label: t("Total Slots", "إجمالي الفتحات"), value: slots.length, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
    { label: t("Occupied", "مشغولة"), value: occupied, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { label: t("Maintenance", "صيانة"), value: maintenance, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
    { label: t("Empty", "فارغة"), value: empty, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
    { label: t("Door Open", "الباب مفتوح"), value: slots.filter((s) => s.door_open).length, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4 text-center`}>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-gray-500 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Slot Map ─────────────────────────────────────────────────────────────────
function SlotMap({ slots, selected, onSelect }: {
  slots: StationSlot[];
  selected: StationSlot;
  onSelect: (s: StationSlot) => void;
}) {
  const { t } = useLang();
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {t("Slot Map", "خريطة الفتحات")} ({slots.length} {t("slots", "فتحات")})
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {t("Click a slot to view battery details", "انقر على فتحة لعرض تفاصيل البطارية")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {(["occupied", "empty", "maintenance"] as const).map((status) => {
            const cfg = statusCfg[status];
            return (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded border ${cfg.bg} ${cfg.border}`} />
                <span className="text-[10px] text-gray-500 capitalize">{status}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {slots.map((slot) => {
            const occupancy = slotOccupancy(slot);
            const cfg = statusCfg[occupancy] ?? statusCfg.empty;
            const isSelected = selected.id === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => onSelect(slot)}
                className={`flex flex-col items-center justify-center rounded-xl border-2 p-2 transition-all ${cfg.bg} ${cfg.border} ${
                  isSelected ? "ring-2 ring-indigo-500 ring-offset-1 scale-105" : "hover:scale-105"
                }`}
              >
                <span className="text-base leading-none">{cfg.icon}</span>
                {slot.battery && (
                  <span className={`text-[10px] font-bold mt-1 ${cfg.text}`}>
                    {slot.battery.battery_percentage}%
                  </span>
                )}
                <span className={`text-[9px] mt-0.5 ${cfg.text}`}>S{slot.slot_number}</span>
                {slot.door_open && <span className="text-[8px] text-red-500 mt-0.5">🔓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Slot Detail Panel ────────────────────────────────────────────────────────
/** Actions accepted by MyVego PATCH /cabinet/{id}/slot/{n}. `reserve` was removed. */
type SlotAction = "maintenance" | "empty" | "in_service" | "open_door" | "sync_engine";

function SlotDetailPanel({
  slot,
  cabinetId,
  cabinetSerial,
  onChanged,
}: {
  slot: StationSlot;
  cabinetId: string;
  /** Physical/engine identifier (e.g. MXS…) — preferred for station-iot routes. */
  cabinetSerial: string;
  onChanged?: () => void;
}) {
  const { t } = useLang();
  const b = slot.battery;
  const [loading, setLoading] = useState<SlotAction | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const inMaintenance = slot.status === "maintenance" || slot.status === "faulty";
  const iotId = cabinetSerial || cabinetId;

  const handleAction = async (action: SlotAction) => {
    setLoading(action);
    setFeedback(null);
    try {
      const res = await fetch(API_ENDPOINTS.CABINET_SLOT_ACTION(cabinetId, slot.slot_number), {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setFeedback({
        type: res.ok ? "success" : "error",
        msg: data.message || (res.ok ? "Done successfully" : "Action failed"),
      });
      if (res.ok) onChanged?.();
    } catch {
      setFeedback({ type: "error", msg: "Network error" });
    } finally {
      setLoading(null);
    }
  };

  /** Physical door open via Vego engine — not a DB-only flag. */
  const handleOpenDoor = async () => {
    setLoading("open_door");
    setFeedback(null);
    try {
      const res = await fetch(API_ENDPOINTS.STATION_IOT_OPEN_SLOT(iotId), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ box_no: slot.slot_number }),
      });
      const data = await res.json().catch(() => ({})) as Record<string, unknown>;
      const ok = res.ok && data.success === true;
      const delivery =
        data.data && typeof data.data === "object"
          ? String((data.data as Record<string, unknown>).delivery_status ?? "")
          : "";
      const errCode = typeof data.error_code === "string" ? data.error_code : "";
      const msg =
        (typeof data.message === "string" && data.message) ||
        errCode ||
        delivery ||
        (ok
          ? t("Open-door command sent", "تم إرسال أمر فتح الباب")
          : t("Open-door failed", "فشل فتح الباب"));
      setFeedback({ type: ok ? "success" : "error", msg });
      if (ok) onChanged?.();
    } catch {
      setFeedback({ type: "error", msg: "Network error" });
    } finally {
      setLoading(null);
    }
  };

  const occupancy = slotOccupancy(slot);
  const occupancyLabel =
    occupancy === "maintenance"
      ? t("Maintenance", "صيانة")
      : occupancy === "occupied"
        ? t("Occupied", "مشغولة")
        : t("Empty", "فارغة");
  const rows = b ? [
    { label: t("Slot No.", "رقم الفتحة"), value: `Slot ${slot.slot_number}` },
    { label: t("Status", "الحالة"), value: occupancyLabel },
    { label: t("Ops flag", "علم التشغيل"), value: slot.status },
    { label: t("Door", "الباب"), value: slot.door_open ? "🔓 " + t("Open", "مفتوح") : "🔒 " + t("Closed", "مغلق") },
    { label: t("Battery ID", "معرف البطارية"), value: b.battery_id },
    { label: t("Type", "النوع"), value: b.battery_type },
    { label: t("SOC", "نسبة الشحن"), value: `${b.battery_percentage}%` },
    { label: t("SOH", "نسبة الصحة"), value: `${b.soh}%` },
    { label: t("Cycles", "دورات الشحن"), value: b.cycle_count },
    { label: t("Physical Dmg", "ضرر جسدي"), value: b.physical_damage ? "⚠️ " + t("Yes", "نعم") : "✅ " + t("No", "لا") },
    { label: t("Battery Status", "حالة البطارية"), value: b.status },
  ] : [
    { label: t("Slot No.", "رقم الفتحة"), value: `Slot ${slot.slot_number}` },
    { label: t("Status", "الحالة"), value: occupancyLabel },
    { label: t("Ops flag", "علم التشغيل"), value: slot.status },
    { label: t("Door", "الباب"), value: slot.door_open ? "🔓 " + t("Open", "مفتوح") : "🔒 " + t("Closed", "مغلق") },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">
          {t("Slot Details", "تفاصيل الفتحة")} – S{slot.slot_number}
        </h3>
      </div>

      <div className="px-5 py-4 divide-y divide-gray-50">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <p className="text-xs text-gray-400">{row.label}</p>
            <p className="text-xs font-semibold text-gray-800">{String(row.value)}</p>
          </div>
        ))}
      </div>

      {b && (
        <div className="px-5 space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t("SOC", "نسبة الشحن")}</span><span>{b.battery_percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${b.battery_percentage}%` }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t("SOH", "نسبة الصحة")}</span><span>{b.soh}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${parseFloat(b.soh)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`mx-5 mt-3 px-3 py-2 rounded-lg text-xs font-medium ${
          feedback.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-600 border border-red-200"
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Physical IoT + ops flags */}
      <div className="px-5 py-4 flex flex-wrap gap-2 border-t border-gray-50">
        <button
          onClick={handleOpenDoor}
          disabled={!!loading}
          className="flex-1 min-w-[7rem] py-2 rounded-xl border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {loading === "open_door" ? <Loader2 className="h-3 w-3 animate-spin" /> : "🔓"}{" "}
          {t("Open door", "فتح الباب")}
        </button>
        {!inMaintenance && (
          <button
            onClick={() => handleAction("maintenance")}
            disabled={!!loading}
            className="flex-1 min-w-[7rem] py-2 rounded-xl border border-orange-200 text-orange-600 text-xs font-medium hover:bg-orange-50 transition disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {loading === "maintenance" ? <Loader2 className="h-3 w-3 animate-spin" /> : "🛠"}{" "}
            {t("Maintenance", "صيانة")}
          </button>
        )}
        {b && (
          <button
            onClick={() => handleAction("empty")}
            disabled={!!loading}
            className="flex-1 min-w-[7rem] py-2 rounded-xl border border-indigo-200 text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {loading === "empty" ? <Loader2 className="h-3 w-3 animate-spin" /> : "📭"}{" "}
            {t("Empty", "تفريغ")}
          </button>
        )}
        {inMaintenance && (
          <button
            onClick={() => handleAction("in_service")}
            disabled={!!loading}
            className="flex-1 min-w-[7rem] py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {loading === "in_service" ? <Loader2 className="h-3 w-3 animate-spin" /> : "✅"}{" "}
            {t("In service", "إعادة للخدمة")}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props { cabinetId: string; }

export default function CabinetDetailIndex({ cabinetId }: Props) {
  const { t } = useLang();
  const router = useRouter();
  const { data, loading, error, refetch } = useCabinetDetail(cabinetId);
  const [selectedSlot, setSelectedSlot] = useState<StationSlot | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const syncFromEngine = async () => {
    if (!data) return;
    const iotId = data.cabinet_id || cabinetId;
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch(API_ENDPOINTS.STATION_IOT_SYNC(iotId), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ create_missing: true }),
      });
      const json = await res.json().catch(() => ({})) as Record<string, unknown>;
      const ok = res.ok && json.success === true;
      setSyncMsg(
        (typeof json.message === "string" && json.message) ||
          (ok ? t("Synced from engine", "تمت المزامنة من المحرك") : t("Sync failed", "فشلت المزامنة")),
      );
      if (ok) refetch();
    } catch {
      setSyncMsg(t("Network error", "خطأ في الشبكة"));
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-red-500 text-sm">{error ?? t("Cabinet not found", "الخزانة غير موجودة")}</p>
      <button onClick={() => router.back()} className="text-indigo-600 text-sm underline">
        {t("Go back", "العودة")}
      </button>
    </div>
  );

  const active = selectedSlot ?? data.station_slots[0];
  const isActive = data.status === "active";

  return (
    <div className="space-y-5">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {t("Cabinet Management", "إدارة الخزانة")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {t("Monitor slots & batteries – detailed view", "مراقبة الفتحات والبطاريات – عرض تفصيلي")}
          </p>
        </div>
      </div>

      {/* Cabinet Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-indigo-600" />
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <span className="text-indigo-600 font-bold text-xs">CAB</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{data.cabinet_id}</p>
              <p className="text-xs text-gray-500">{data.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{data.address}, {data.city}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Hash className="h-4 w-4 text-gray-400" />
              <span>{data.slots_count} {t("slots", "فتحات")}</span>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
            }`}>
              {isActive ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
            </span>
            <button
              onClick={syncFromEngine}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 transition disabled:opacity-50"
            >
              {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
              {t("Sync from engine", "مزامنة من المحرك")}
            </button>
          </div>
        </div>
        {syncMsg && (
          <p className="px-5 pb-3 text-xs text-gray-500">{syncMsg}</p>
        )}
      </div>

      {/* Stats Row */}
      <StatsRow slots={data.station_slots} />

      {/* Slot Map + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SlotMap slots={data.station_slots} selected={active} onSelect={setSelectedSlot} />
        </div>
        <div>
          <SlotDetailPanel
            slot={active}
            cabinetId={cabinetId}
            cabinetSerial={data.cabinet_id}
            onChanged={() => {
              refetch();
            }}
          />
        </div>
      </div>
    </div>
  );
}