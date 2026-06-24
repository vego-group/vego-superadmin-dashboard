"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  Calendar,
  Tag,
  MessageSquare,
  Clock,
  CheckCircle2,
  RefreshCw,
  Send,
} from "lucide-react";
import { Complaint } from "@/types/dashboard/complaint";
import { useComplaintMutations } from "@/hooks/use-complaint-mutations";
import { useLang } from "@/lib/language-context";

interface Props {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updated: Complaint) => void;
  fetchComplaints: () => Promise<void>;
}

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ComplaintDetailModal({
  complaint,
  isOpen,
  onClose,
  onUpdated,
  fetchComplaints,
}: Props) {
  const { t } = useLang();
  const { replyToComplaint, updateComplaintStatus } =
    useComplaintMutations(fetchComplaints);

  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!complaint) return null;

  const statusConfig = {
    new: {
      label: t("New", "جديدة"),
      cls: "bg-blue-100 text-blue-700",
    },
    in_review: {
      label: t("In Review", "قيد المراجعة"),
      cls: "bg-yellow-100 text-yellow-700",
    },
    replied: {
      label: t("Replied", "تم الرد"),
      cls: "bg-green-100 text-green-700",
    },
  };

  const categoryConfig = {
    charging: {
      label: t("Charging", "الشحن"),
      cls: "bg-blue-50 text-blue-600 border border-blue-200",
    },
    swap: {
      label: t("Battery Swap", "تبديل البطارية"),
      cls: "bg-green-50 text-green-600 border border-green-200",
    },
    payment: {
      label: t("Financial", "مالية"),
      cls: "bg-orange-50 text-orange-600 border border-orange-200",
    },
    platform: {
      label: t("Platform", "المنصة"),
      cls: "bg-purple-50 text-purple-600 border border-purple-200",
    },
  };

  const statusCfg = statusConfig[complaint.status] ?? statusConfig.new;
  const catCfg =
    categoryConfig[complaint.category] ?? categoryConfig.platform;

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    setActionError(null);
    try {
      await replyToComplaint(complaint.id, replyText.trim());
      setReplyText("");
      onClose();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : t("Failed to send reply", "فشل إرسال الرد")
      );
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    setActionError(null);
    try {
      await updateComplaintStatus(complaint.id, newStatus);
      onClose();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : t("Failed to update status", "فشل تحديث الحالة")
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{t("Complaint Details", "تفاصيل الشكوى")}</span>
            <span className="text-sm font-normal text-gray-400">#{complaint.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Header card */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-gray-900 text-base leading-snug flex-1">
                {complaint.title}
              </h3>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusCfg.cls}`}
              >
                {statusCfg.label}
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${catCfg.cls}`}
            >
              <Tag className="h-3 w-3" />
              {catCfg.label}
            </span>
          </div>

          {/* User info */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {t("User", "المستخدم")}
            </h4>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {getInitials(complaint.user.name)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">
                  {complaint.user.name}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" />
                  {complaint.user.phone}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                  <Calendar className="h-3 w-3" />
                  {formatDate(complaint.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              {t("Description", "الوصف")}
            </h4>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>
          </div>

          {/* Status actions */}
          {complaint.status !== "replied" && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                {t("Update Status", "تحديث الحالة")}
              </h4>
              <div className="flex gap-2 flex-wrap">
                {complaint.status !== "new" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange("new")}
                    className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {t("Mark as New", "تعيين كجديدة")}
                  </Button>
                )}
                {complaint.status !== "in_review" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange("in_review")}
                    className="gap-1.5 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                  >
                    {isUpdatingStatus ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                    {t("Mark as In Review", "تعيين قيد المراجعة")}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Existing reply */}
          {complaint.reply && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                {t("Reply Sent", "الرد المرسل")}
              </h4>
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-2">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {complaint.reply}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-green-200">
                  <p className="text-xs text-gray-500">
                    {t("By", "بواسطة")}{" "}
                    <span className="font-medium text-gray-700">
                      {complaint.replied_by?.name ?? "—"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(complaint.replied_at)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reply form */}
          {complaint.status !== "replied" && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" />
                {t("Send Reply", "إرسال رد")}
              </h4>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t(
                  "Write your reply to the user…",
                  "اكتب ردك للمستخدم…"
                )}
                rows={4}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#1C1FC1]/20 focus:border-[#1C1FC1] transition"
              />
              <Button
                disabled={isReplying || !replyText.trim()}
                onClick={handleReply}
                className="gap-2 text-white"
                style={{ backgroundColor: "#1C1FC1" }}
              >
                {isReplying ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isReplying
                  ? t("Sending…", "جارٍ الإرسال…")
                  : t("Send Reply", "إرسال الرد")}
              </Button>
            </div>
          )}

          {/* Error */}
          {actionError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {actionError}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
