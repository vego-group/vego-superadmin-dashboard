"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  X,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ZoneMap from "./zone-map-client";
import ZoneCard from "./zone-card";
import ZoneFormDrawer, { ZoneFormState } from "./zone-form-drawer";
import { useZones } from "@/hooks/use-zones";
import { useZoneMutations } from "@/hooks/use-zone-mutations";
import { useLang } from "@/lib/language-context";
import { Zone, ZonePoint } from "@/types/dashboard/zone";

const DEFAULT_FORM: ZoneFormState = {
  name_en: "",
  name_ar: "",
  type: "normal",
  speedLimitKmh: 25,
  active: true,
};

export default function ZonesManagement() {
  const { t } = useLang();
  const { zones, ownZones, fleetZones, isLoading, error, fetchZones } = useZones();
  const { createZone, updateZone, deleteZone } = useZoneMutations(fetchZones);

  const [search, setSearch] = useState("");
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  // Drawing / form flow
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<ZonePoint[]>([]);
  const [form, setForm] = useState<ZoneFormState>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Delete
  const [deletingZone, setDeletingZone] = useState<Zone | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const term = search.trim().toLowerCase();
  const matchesSearch = (z: Zone) =>
    !term ||
    z.name_en.toLowerCase().includes(term) ||
    z.name_ar.toLowerCase().includes(term);

  const filteredOwn = ownZones.filter(matchesSearch);
  const filteredFleet = fleetZones.filter(matchesSearch);

  const mapZones = zones
    .filter(matchesSearch)
    .filter((z) => !hiddenIds.has(z.id));

  const patchForm = (patch: Partial<ZoneFormState>) =>
    setForm((f) => ({ ...f, ...patch }));

  // ─── Visibility ──────────────────────────────────────────────────────────
  const toggleVisible = (zone: Zone) =>
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(zone.id)) next.delete(zone.id);
      else next.add(zone.id);
      return next;
    });

  // ─── Drawing flow ────────────────────────────────────────────────────────
  const startCreate = () => {
    setEditingZone(null);
    setForm(DEFAULT_FORM);
    setDrawingPoints([]);
    setFormError(null);
    setDrawerOpen(false);
    setIsDrawing(true);
  };

  const cancelFlow = () => {
    setIsDrawing(false);
    setDrawerOpen(false);
    setEditingZone(null);
    setDrawingPoints([]);
    setFormError(null);
  };

  const finishDrawing = () => {
    if (drawingPoints.length < 3) return;
    setIsDrawing(false);
    setDrawerOpen(true);
  };

  const addPoint = (p: ZonePoint) => setDrawingPoints((prev) => [...prev, p]);

  const startEdit = (zone: Zone) => {
    if (zone.source === "fleet") return;
    setEditingZone(zone);
    setForm({
      name_en: zone.name_en,
      name_ar: zone.name_ar,
      type: zone.type,
      speedLimitKmh: zone.speedLimitKmh || 25,
      active: zone.active,
    });
    setDrawingPoints(zone.polygon);
    setFormError(null);
    setIsDrawing(false);
    setDrawerOpen(true);
  };

  const redraw = () => {
    setDrawerOpen(false);
    setDrawingPoints([]);
    setIsDrawing(true);
  };

  const handleSave = async () => {
    setFormError(null);
    if (!form.name_en.trim() && !form.name_ar.trim()) {
      setFormError(t("Zone name is required.", "اسم المنطقة مطلوب."));
      return;
    }
    if (drawingPoints.length < 3) {
      setFormError(
        t(
          "Draw at least 3 points on the map.",
          "ارسم 3 نقاط على الأقل على الخريطة."
        )
      );
      return;
    }
    if (
      form.type === "slow" &&
      (!form.speedLimitKmh || form.speedLimitKmh <= 0)
    ) {
      setFormError(
        t(
          "A speed limit is required for slow zones.",
          "حد السرعة مطلوب للمناطق البطيئة."
        )
      );
      return;
    }

    const values = {
      name_en: form.name_en.trim(),
      name_ar: form.name_ar.trim(),
      type: form.type,
      speedLimitKmh: form.type === "restricted" ? 0 : form.speedLimitKmh,
      active: form.active,
      polygon: drawingPoints,
    };

    setIsSaving(true);
    try {
      if (editingZone) {
        await updateZone(editingZone.id, values);
      } else {
        await createZone(values);
      }
      cancelFlow();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : t("Failed to save zone", "فشل حفظ المنطقة")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (zone: Zone) => {
    setActionError(null);
    try {
      await updateZone(zone.id, {
        name_en: zone.name_en,
        name_ar: zone.name_ar,
        type: zone.type,
        speedLimitKmh: zone.speedLimitKmh,
        active: !zone.active,
        polygon: zone.polygon,
      });
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : t("Failed to update zone", "فشل تحديث المنطقة")
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingZone) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteZone(deletingZone.id);
      setDeletingZone(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : t("Failed to delete zone", "فشل حذف المنطقة")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            {t("Zone Control", "إدارة المناطق")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              "Create and manage geographic zones",
              "إنشاء وإدارة المناطق الجغرافية"
            )}
          </p>
        </div>

        {isDrawing ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={cancelFlow}
              className="h-11 px-4 rounded-xl gap-2"
            >
              <X className="h-4 w-4" />
              {t("Cancel", "إلغاء")}
            </Button>
            <Button
              onClick={finishDrawing}
              disabled={drawingPoints.length < 3}
              className="h-11 px-4 rounded-xl gap-2 text-white"
              style={{ backgroundColor: "#1C1FC1" }}
            >
              <Check className="h-4 w-4" />
              {t("Finish Drawing", "إنهاء الرسم")}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={fetchZones}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
              title={t("Refresh", "تحديث")}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <Button
              onClick={startCreate}
              className="h-11 px-4 rounded-xl text-white gap-2"
              style={{ backgroundColor: "#1C1FC1" }}
            >
              <Plus className="h-4 w-4" />
              {t("Add New Zone", "إضافة منطقة جديدة")}
            </Button>
          </div>
        )}
      </div>

      {/* Errors */}
      {(error || actionError) && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error || actionError}</span>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
        {/* Left: search + cards */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("Search by Zone …", "ابحث عن المنطقة …")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-300 w-full"
            />
          </div>

          <div className="space-y-5 lg:max-h-[640px] lg:overflow-y-auto lg:pr-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 gap-2 text-sm">
                <RefreshCw className="h-4 w-4 animate-spin" />
                {t("Loading zones…", "جارٍ تحميل المناطق…")}
              </div>
            ) : filteredOwn.length === 0 && filteredFleet.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400 text-sm">
                {t("No zones found", "لا توجد مناطق")}
              </div>
            ) : (
              <>
                {/* My zones (super-admin → individual users) */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#1C1FC1]" />
                      <h2 className="text-sm font-semibold text-gray-700">
                        {t("My Zones (Users)", "مناطقي (المستخدمون)")}
                      </h2>
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                      {filteredOwn.length}
                    </span>
                  </div>
                  {filteredOwn.length === 0 ? (
                    <p className="text-xs text-gray-400 px-1 py-2">
                      {t(
                        "You haven't created any zones yet.",
                        "لم تقم بإنشاء أي مناطق بعد."
                      )}
                    </p>
                  ) : (
                    filteredOwn.map((zone) => (
                      <ZoneCard
                        key={zone.id}
                        zone={zone}
                        hidden={hiddenIds.has(zone.id)}
                        onToggleVisible={toggleVisible}
                        onEdit={startEdit}
                        onDelete={setDeletingZone}
                        onToggleActive={toggleActive}
                      />
                    ))
                  )}
                </section>

                {/* Fleet zones (read-only) */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                      <h2 className="text-sm font-semibold text-gray-700">
                        {t("Fleet Zones", "مناطق الأساطيل")}
                      </h2>
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                      {filteredFleet.length}
                    </span>
                  </div>
                  {filteredFleet.length === 0 ? (
                    <p className="text-xs text-gray-400 px-1 py-2">
                      {t("No fleet zones.", "لا توجد مناطق للأساطيل.")}
                    </p>
                  ) : (
                    filteredFleet.map((zone) => (
                      <ZoneCard
                        key={zone.id}
                        zone={zone}
                        hidden={hiddenIds.has(zone.id)}
                        onToggleVisible={toggleVisible}
                        onEdit={startEdit}
                        onDelete={setDeletingZone}
                        onToggleActive={toggleActive}
                      />
                    ))
                  )}
                </section>
              </>
            )}
          </div>
        </div>

        {/* Right: map */}
        <ZoneMap
          zones={mapZones}
          activePoints={drawingPoints}
          activeType={form.type}
          isDrawing={isDrawing}
          onAddPoint={addPoint}
          onZoneClick={startEdit}
        />
      </div>

      {/* Form drawer */}
      <ZoneFormDrawer
        isOpen={drawerOpen}
        isEdit={!!editingZone}
        form={form}
        onChange={patchForm}
        pointsCount={drawingPoints.length}
        onRedraw={redraw}
        onSave={handleSave}
        onClose={cancelFlow}
        isSaving={isSaving}
        error={formError}
      />

      {/* Delete confirmation */}
      <Dialog
        open={!!deletingZone}
        onOpenChange={(o) => {
          if (!o) {
            setDeletingZone(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              {t("Delete Zone", "حذف المنطقة")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t("Are you sure you want to delete", "هل أنت متأكد من حذف")}{" "}
              <span className="font-semibold text-gray-900">
                {deletingZone?.name_en || deletingZone?.name}
              </span>
              {t("? This action cannot be undone.", "؟ لا يمكن التراجع عن هذا الإجراء.")}
            </p>
            {deleteError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {deleteError}
              </p>
            )}
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletingZone(null)}
                disabled={isDeleting}
              >
                {t("Cancel", "إلغاء")}
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting && <RefreshCw className="h-4 w-4 animate-spin" />}
                {isDeleting ? t("Deleting…", "جارٍ الحذف…") : t("Delete", "حذف")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
