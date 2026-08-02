"use client";

// CR-6: the complaint detail modal is a thread view — chronological messages
// (agent vs customer), internal notes, attachments with a lightbox, a composer
// posting to POST /complaints/{id}/messages, manual status actions
// (In Review / Resolve / Close-with-confirm) and assignment.

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Lock,
  Paperclip,
  Phone,
  RefreshCw,
  Send,
  Tag,
  Timer,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import {
  ALLOWED_ATTACHMENT_EXTS,
  Complaint,
  ComplaintAttachment,
  ComplaintStatus,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  attachmentExt,
  isImageAttachment,
} from "@/types/dashboard/complaint";
import { Admin } from "@/types/dashboard/admin";
import { useComplaintThread } from "@/hooks/use-complaint-thread";
import { useComplaintMutations } from "@/hooks/use-complaint-mutations";
import {
  categoryConfig,
  formatHours,
  getCurrentStaff,
  getInitials,
  statusConfig,
} from "./complaint-config";
import { AttachmentLightbox, AttachmentTile, formatBytes } from "./attachments";
import { useLang } from "@/lib/language-context";
import { dateLocale } from "@/lib/format-date";

interface Props {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  /** Staff members offered in the assign menu. */
  staffList: Admin[];
  /** In-place inbox row update — avoids refetch-reordering under the cursor. */
  onRowPatch: (id: number, patch: Partial<Complaint>) => void;
  /** Refresh the true totals (GET /complaints/stats) after a mutation. */
  onStatsChanged: () => void;
}

const ACCEPT = ALLOWED_ATTACHMENT_EXTS.map((e) => `.${e}`).join(",");

export default function ComplaintDetailModal({
  complaint,
  isOpen,
  onClose,
  staffList,
  onRowPatch,
  onStatsChanged,
}: Props) {
  const { t, lang } = useLang();
  const complaintId = isOpen && complaint ? complaint.id : null;

  const { thread, isLoading, error, refetchThread } = useComplaintThread(
    complaintId,
    (id) => onRowPatch(id, { unreadForAgent: 0 })
  );
  const { postMessage, assignComplaint, updateComplaintStatus } = useComplaintMutations();

  // Composer
  const [messageText, setMessageText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Actions
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Lightbox
  const [lightbox, setLightbox] = useState<{
    images: ComplaintAttachment[];
    index: number;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messageCount = thread?.messages.length ?? 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageCount, isLoading]);

  // Reset per-complaint state when switching tickets / reopening.
  useEffect(() => {
    setMessageText("");
    setAttachments([]);
    setIsInternalNote(false);
    setComposerError(null);
    setActionError(null);
    setNotice(null);
    setConfirmClose(false);
    setLightbox(null);
  }, [complaintId]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 7000);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!complaint) return null;

  // Thread data wins; the inbox row keeps the header rendering instantly.
  const view: Complaint = thread ?? complaint;
  const sCfg = statusConfig(t);
  const catCfg = categoryConfig(t)[view.category] ?? categoryConfig(t).platform;
  const statusCfg = sCfg[view.status];
  const isClosed = view.status === "closed";
  const currentStaff = getCurrentStaff();

  const formatDateTime = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(dateLocale(lang), {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const applyThreadUpdate = (updated: Complaint | null, prevStatus: ComplaintStatus) => {
    if (!updated) return;
    onRowPatch(updated.id, {
      status: updated.status,
      assignedTo: updated.assignedTo,
      lastMessagePreview: updated.lastMessagePreview,
      lastMessageAt: updated.lastMessageAt,
      lastSenderType: updated.lastSenderType,
      unreadForAgent: 0,
    });
    onStatsChanged();
    if (updated.status !== prevStatus) {
      setNotice(
        `${t("Status changed automatically to", "تغيّرت الحالة تلقائيًا إلى")} “${
          sCfg[updated.status].label
        }”`
      );
    }
  };

  // ── Composer ────────────────────────────────────────────────────────────────

  const handleFilesSelected = (list: FileList | null) => {
    if (!list) return;
    setComposerError(null);
    const next = [...attachments];
    const errors: string[] = [];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_ATTACHMENTS) {
        errors.push(
          t(`Maximum ${MAX_ATTACHMENTS} files per message`, `الحد الأقصى ${MAX_ATTACHMENTS} ملفات لكل رسالة`)
        );
        break;
      }
      const ext = attachmentExt(file.name);
      if (!(ALLOWED_ATTACHMENT_EXTS as readonly string[]).includes(ext)) {
        errors.push(
          `${file.name}: ${t("unsupported file type", "نوع ملف غير مدعوم")} (${ALLOWED_ATTACHMENT_EXTS.join(", ")})`
        );
        continue;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        errors.push(`${file.name}: ${t("larger than 5 MB", "أكبر من 5 ميجابايت")}`);
        continue;
      }
      next.push(file);
    }
    setAttachments(next);
    if (errors.length) setComposerError(errors.join(" · "));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    const body = messageText.trim();
    if (!body && attachments.length === 0) return;
    setIsSending(true);
    setComposerError(null);
    const prevStatus = view.status;
    try {
      await postMessage(view.id, { body, attachments, isInternalNote });
      setMessageText("");
      setAttachments([]);
      const updated = await refetchThread();
      applyThreadUpdate(updated, prevStatus);
    } catch (err) {
      setComposerError(
        err instanceof Error ? err.message : t("Failed to send message", "فشل إرسال الرسالة")
      );
    } finally {
      setIsSending(false);
    }
  };

  // ── Status + assignment actions ─────────────────────────────────────────────

  const handleStatusChange = async (status: "in_review" | "resolved" | "closed") => {
    setIsUpdatingStatus(true);
    setActionError(null);
    try {
      await updateComplaintStatus(view.id, status);
      const updated = await refetchThread();
      applyThreadUpdate(updated, status); // no auto-transition notice for the action itself
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : t("Failed to update status", "فشل تحديث الحالة")
      );
    } finally {
      setIsUpdatingStatus(false);
      setConfirmClose(false);
    }
  };

  const handleAssign = async (staffId: number, staffName: string) => {
    setIsAssigning(true);
    setActionError(null);
    const prevStatus = view.status;
    try {
      await assignComplaint(view.id, staffId);
      const updated = await refetchThread();
      applyThreadUpdate(updated, prevStatus);
      if (updated && prevStatus === "new" && updated.status === "in_review") {
        // Backend side effect (CR-6 §4): picking up a new ticket starts review.
        setNotice(
          `${t("Assigned to", "تم الإسناد إلى")} ${staffName} — ${t(
            "status moved automatically to In Review",
            "انتقلت الحالة تلقائيًا إلى قيد المراجعة"
          )}`
        );
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : t("Failed to assign complaint", "فشل إسناد الشكوى")
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const canSend = (messageText.trim().length > 0 || attachments.length > 0) && !isSending;
  const assignedToMe =
    currentStaff !== null && view.assignedTo !== null && view.assignedTo.id === currentStaff.id;
  const assigneeName =
    view.assignedTo === null
      ? t("Unassigned", "غير مسندة")
      : view.assignedTo.name ??
        staffList.find((s) => Number(s.id) === view.assignedTo?.id)?.name ??
        `#${view.assignedTo.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[88vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* ── Header ── */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-100 space-y-3">
          <DialogTitle className="flex items-center gap-3 flex-wrap pe-8">
            <span>{t("Complaint", "شكوى")}</span>
            <span className="text-sm font-normal text-gray-400">#{view.id}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.cls}`}>
              {statusCfg.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${catCfg.cls}`}
            >
              <Tag className="h-3 w-3" />
              {catCfg.label}
            </span>
          </DialogTitle>

          {/* Subject + user + SLA */}
          <div className="space-y-2">
            <p className="font-medium text-gray-900 text-sm leading-snug">{view.title}</p>
            <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="h-6 w-6 rounded-full bg-gradient-to-br from-[#1C1FC1] to-[#3E1596] flex items-center justify-center text-white text-[10px] font-bold">
                  {getInitials(view.user.name)}
                </span>
                <span className="font-medium text-gray-700">{view.user.name}</span>
              </span>
              {view.user.phone && (
                <span className="flex items-center gap-1" dir="ltr">
                  <Phone className="h-3 w-3" />
                  {view.user.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDateTime(view.created_at)}
              </span>
              {view.slaAgeHours !== null && (
                <span className="flex items-center gap-1 text-gray-600">
                  <Timer className="h-3 w-3" />
                  {t("SLA age", "عمر الشكوى")}: {formatHours(view.slaAgeHours)}
                </span>
              )}
              {view.waitingHours !== null && (
                <span
                  className={`flex items-center gap-1 ${
                    view.status === "awaiting_agent" ? "text-red-600 font-medium" : "text-gray-600"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  {t("Waiting", "بالانتظار")}: {formatHours(view.waitingHours)}
                </span>
              )}
            </div>
          </div>

          {/* Actions row: assignment + manual status transitions only.
              awaiting_* are automatic — never offered as buttons. */}
          <div className="flex items-center gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isAssigning || isClosed}
                  className="gap-1.5 h-8 text-xs"
                >
                  {isAssigning ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5" />
                  )}
                  {assigneeName}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[220px] max-h-[280px] overflow-y-auto">
                {currentStaff && !assignedToMe && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleAssign(currentStaff.id, currentStaff.name || t("me", "أنا"))}
                      className="font-medium text-[#1C1FC1]"
                    >
                      <UserPlus className="h-3.5 w-3.5 me-1.5" />
                      {t("Assign to me", "إسناد إليّ")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {staffList.map((s) => (
                  <DropdownMenuItem
                    key={s.id}
                    onClick={() => handleAssign(Number(s.id), s.name)}
                    className={view.assignedTo?.id === Number(s.id) ? "bg-gray-100" : ""}
                  >
                    {s.name}
                  </DropdownMenuItem>
                ))}
                {staffList.length === 0 && (
                  <DropdownMenuItem disabled>{t("No staff found", "لا يوجد موظفون")}</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="flex-1" />

            {!["in_review", "resolved", "closed"].includes(view.status) && (
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange("in_review")}
                className="gap-1.5 h-8 text-xs text-yellow-700 border-yellow-200 hover:bg-yellow-50"
              >
                <Clock className="h-3.5 w-3.5" />
                {t("Mark In Review", "قيد المراجعة")}
              </Button>
            )}
            {!["resolved", "closed"].includes(view.status) && (
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange("resolved")}
                className="gap-1.5 h-8 text-xs text-green-700 border-green-200 hover:bg-green-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("Resolve", "حلّ")}
              </Button>
            )}
            {!isClosed && (
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdatingStatus}
                onClick={() => setConfirmClose(true)}
                className="gap-1.5 h-8 text-xs text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                {t("Close", "إغلاق")}
              </Button>
            )}
          </div>

          {(notice || actionError || error) && (
            <div className="space-y-1.5">
              {notice && (
                <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 flex-shrink-0" />
                  {notice}
                </p>
              )}
              {(actionError || error) && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {actionError || error}
                </p>
              )}
            </div>
          )}
        </DialogHeader>

        {/* ── Thread ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50/60">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400 gap-2 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              {t("Loading thread…", "جارٍ تحميل المحادثة…")}
            </div>
          ) : messageCount === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              {t("No messages yet", "لا توجد رسائل بعد")}
            </div>
          ) : (
            thread!.messages.map((m) => {
              const isAgent = m.senderType === "agent";
              const images = m.attachments.filter(isImageAttachment);
              const files = m.attachments.filter((a) => !isImageAttachment(a));
              return (
                <div key={m.id} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 space-y-2 ${
                      m.isInternalNote
                        ? "bg-amber-50 border border-dashed border-amber-300"
                        : isAgent
                          ? "bg-[#1C1FC1]/5 border border-[#1C1FC1]/15"
                          : "bg-white border border-gray-200"
                    }`}
                  >
                    {/* Internal notes are agent-only — label it explicitly. */}
                    {m.isInternalNote && (
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
                        <Lock className="h-3 w-3" />
                        {t(
                          "Internal note — not visible to the customer",
                          "ملاحظة داخلية — غير مرئية للعميل"
                        )}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-800">
                        {m.authorName ?? (isAgent ? t("Agent", "موظف الدعم") : view.user.name)}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          isAgent ? "bg-[#1C1FC1]/10 text-[#1C1FC1]" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isAgent ? t("Agent", "موظف") : t("Customer", "عميل")}
                      </span>
                      <span className="text-[10px] text-gray-400">{formatDateTime(m.createdAt)}</span>
                    </div>
                    {m.body && (
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        {m.body}
                      </p>
                    )}
                    {images.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {images.map((att, i) => (
                          <AttachmentTile
                            key={att.url}
                            attachment={att}
                            onOpen={() => setLightbox({ images, index: i })}
                          />
                        ))}
                      </div>
                    )}
                    {files.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {files.map((att) => (
                          <AttachmentTile key={att.url} attachment={att} onOpen={() => {}} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Composer ── */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-3">
          {isClosed ? (
            <p className="text-sm text-gray-500 flex items-center gap-2 justify-center py-2">
              <Lock className="h-4 w-4" />
              {t("This complaint is closed — the thread is read-only.", "هذه الشكوى مغلقة — المحادثة للقراءة فقط.")}
            </p>
          ) : (
            <>
              {/* Reply / internal-note toggle */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setIsInternalNote(false)}
                    className={`px-3 py-1.5 transition ${
                      !isInternalNote ? "bg-[#1C1FC1] text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {t("Reply to customer", "رد على العميل")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInternalNote(true)}
                    className={`px-3 py-1.5 transition flex items-center gap-1 ${
                      isInternalNote ? "bg-amber-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Lock className="h-3 w-3" />
                    {t("Internal note", "ملاحظة داخلية")}
                  </button>
                </div>
                {isInternalNote && (
                  <span className="text-[11px] text-amber-700 font-medium">
                    {t("Not visible to the customer", "غير مرئية للعميل")}
                  </span>
                )}
              </div>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={
                  isInternalNote
                    ? t("Write an internal note for the team…", "اكتب ملاحظة داخلية للفريق…")
                    : t("Write your reply to the customer…", "اكتب ردك للعميل…")
                }
                rows={3}
                className={`w-full px-4 py-3 text-sm border rounded-xl resize-none focus:outline-none focus:ring-2 transition ${
                  isInternalNote
                    ? "bg-amber-50/60 border-amber-300 focus:ring-amber-300/30 focus:border-amber-400"
                    : "border-gray-200 focus:ring-[#1C1FC1]/20 focus:border-[#1C1FC1]"
                }`}
              />

              {/* Selected attachments */}
              {attachments.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {attachments.map((file, i) => (
                    <span
                      key={`${file.name}-${i}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-700 max-w-[220px]"
                    >
                      <Paperclip className="h-3 w-3 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-gray-400 whitespace-nowrap">{formatBytes(file.size)}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                        className="p-0.5 hover:bg-gray-200 rounded transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {composerError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {composerError}
                </p>
              )}

              <div className="flex items-center justify-between gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPT}
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachments.length >= MAX_ATTACHMENTS}
                  className="gap-1.5 text-xs h-9"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  {t("Attach", "إرفاق")} ({attachments.length}/{MAX_ATTACHMENTS})
                </Button>
                <Button
                  disabled={!canSend}
                  onClick={handleSend}
                  className="gap-2 text-white h-9"
                  style={{ backgroundColor: isInternalNote ? "#d97706" : "#1C1FC1" }}
                >
                  {isSending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : isInternalNote ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isSending
                    ? t("Sending…", "جارٍ الإرسال…")
                    : isInternalNote
                      ? t("Add Internal Note", "إضافة ملاحظة داخلية")
                      : t("Send Reply", "إرسال الرد")}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ── Close = terminal ⇒ explicit confirmation ── */}
        {confirmClose && (
          <div className="absolute inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl p-5 max-w-sm w-full space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {t("Close this complaint?", "إغلاق هذه الشكوى؟")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {t(
                      "Closing is permanent — the thread becomes read-only and no further replies can be sent.",
                      "الإغلاق نهائي — تصبح المحادثة للقراءة فقط ولا يمكن إرسال ردود بعد ذلك."
                    )}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmClose(false)}
                  disabled={isUpdatingStatus}
                >
                  {t("Cancel", "إلغاء")}
                </Button>
                <Button
                  size="sm"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange("closed")}
                  className="gap-1.5 text-white bg-red-600 hover:bg-red-700"
                >
                  {isUpdatingStatus && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {t("Close complaint", "إغلاق الشكوى")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {lightbox && (
          <AttachmentLightbox
            attachments={lightbox.images}
            index={lightbox.index}
            onClose={() => setLightbox(null)}
            onNavigate={(index) => setLightbox((lb) => (lb ? { ...lb, index } : lb))}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
