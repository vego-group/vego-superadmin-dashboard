// src/types/dashboard/complaint.ts
// CR-6 contract: threaded complaints inbox.
//
// Status machine (7 states): new | in_review | awaiting_customer | awaiting_agent
// | resolved | closed. The legacy `replied` still arrives on input and in filter
// responses — it is normalised to `awaiting_customer` for display everywhere.
// awaiting_* are set automatically by replies and must never be offered as
// manual actions.

import { IsoCountryCode, toIsoCountryCodeOrNull } from "@/types/country";

export type ComplaintCategory = "charging" | "swap" | "payment" | "platform";

export const COMPLAINT_STATUSES = [
  "new",
  "in_review",
  "awaiting_customer",
  "awaiting_agent",
  "resolved",
  "closed",
] as const;

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

/** Legacy value the backend may still emit; display as awaiting_customer. */
export const normalizeComplaintStatus = (v: unknown): ComplaintStatus => {
  const s = String(v ?? "").toLowerCase();
  if (s === "replied") return "awaiting_customer";
  return (COMPLAINT_STATUSES as readonly string[]).includes(s)
    ? (s as ComplaintStatus)
    : "new";
};

// ─── Senders ──────────────────────────────────────────────────────────────────

export type ComplaintSender = "agent" | "user";

const AGENT_SENDERS = new Set([
  "agent",
  "admin",
  "staff",
  "super_admin",
  "superadmin",
  "support",
]);

export const normalizeSenderType = (v: unknown): ComplaintSender | null => {
  if (v === null || v === undefined || v === "") return null;
  return AGENT_SENDERS.has(String(v).toLowerCase()) ? "agent" : "user";
};

// ─── Attachments ──────────────────────────────────────────────────────────────

// Contract: max 5 files × 5 MB, jpg/jpeg/png/webp/heic/heif/pdf.
export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_EXTS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
  "pdf",
] as const;

export interface ComplaintAttachment {
  url: string;
  name: string;
  /** Lowercased extension derived from name/url, e.g. "heic". */
  ext: string;
  mime: string | null;
  size: number | null;
}

export const attachmentExt = (nameOrUrl: string): string => {
  const clean = nameOrUrl.split(/[?#]/)[0];
  const dot = clean.lastIndexOf(".");
  return dot === -1 ? "" : clean.slice(dot + 1).toLowerCase();
};

export const isHeicAttachment = (a: ComplaintAttachment): boolean =>
  a.ext === "heic" ||
  a.ext === "heif" ||
  a.mime === "image/heic" ||
  a.mime === "image/heif";

export const isImageAttachment = (a: ComplaintAttachment): boolean =>
  ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(a.ext) ||
  (a.mime !== null && a.mime.startsWith("image/"));

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const parseAttachment = (raw: unknown): ComplaintAttachment | null => {
  if (typeof raw === "string") {
    if (!raw.trim()) return null;
    const name = raw.split("/").pop()?.split(/[?#]/)[0] || "attachment";
    return { url: raw, name, ext: attachmentExt(raw), mime: null, size: null };
  }
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const url = str(r.url) ?? str(r.file_url) ?? str(r.path) ?? str(r.file_path);
  if (!url) return null;
  const name =
    str(r.name) ??
    str(r.file_name) ??
    str(r.original_name) ??
    url.split("/").pop()?.split(/[?#]/)[0] ??
    "attachment";
  return {
    url,
    name,
    ext: attachmentExt(name) || attachmentExt(url),
    mime: str(r.mime) ?? str(r.mime_type) ?? str(r.content_type),
    size: num(r.size) ?? num(r.file_size),
  };
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface ComplaintMessage {
  id: number | string;
  body: string;
  /** Internal notes are agent-only — never visible to the customer. */
  isInternalNote: boolean;
  senderType: ComplaintSender;
  authorName: string | null;
  attachments: ComplaintAttachment[];
  createdAt: string;
}

const authorNameOf = (r: Record<string, unknown>): string | null => {
  for (const key of ["author", "sender", "admin", "user", "staff"]) {
    const v = r[key];
    if (v && typeof v === "object") {
      const name = str((v as Record<string, unknown>).name);
      if (name) return name;
    }
  }
  return str(r.author_name) ?? str(r.sender_name);
};

export const parseComplaintMessage = (raw: unknown): ComplaintMessage | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const body = str(r.body) ?? str(r.message) ?? str(r.text) ?? "";
  const attachments = Array.isArray(r.attachments)
    ? r.attachments.map(parseAttachment).filter((a): a is ComplaintAttachment => a !== null)
    : [];
  if (!body && attachments.length === 0) return null;
  return {
    id: (r.id as number | string) ?? `${str(r.created_at) ?? ""}-${body.slice(0, 20)}`,
    body,
    isInternalNote: Boolean(r.is_internal_note ?? r.internal ?? r.is_internal),
    senderType:
      normalizeSenderType(r.sender_type ?? r.author_type ?? r.sender) ?? "user",
    authorName: authorNameOf(r),
    attachments,
    createdAt: str(r.created_at) ?? "",
  };
};

// ─── Complaint (inbox row) ────────────────────────────────────────────────────

export interface ComplaintUser {
  id: number;
  name: string;
  phone: string;
}

export interface ComplaintAssignee {
  id: number;
  name: string | null;
}

export interface Complaint {
  id: number;
  user_id: number;
  title: string;
  category: ComplaintCategory;
  description: string;
  /** Normalised — legacy `replied` already mapped to awaiting_customer. */
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
  user: ComplaintUser;
  /** ISO country ("SA" | "JO") — §0.2. Validated into the branded type at parse time. */
  isoCountryCode: IsoCountryCode | null;
  // CR-6 inbox fields
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  lastSenderType: ComplaintSender | null;
  unreadForAgent: number;
  assignedTo: ComplaintAssignee | null;
  slaAgeHours: number | null;
  waitingHours: number | null;
}

const parseAssignee = (raw: unknown): ComplaintAssignee | null => {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "number" || typeof raw === "string") {
    const id = num(raw);
    return id === null ? null : { id, name: null };
  }
  if (typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = num(r.id);
  return id === null ? null : { id, name: str(r.name) };
};

export const parseComplaint = (raw: Record<string, unknown>): Complaint => {
  const user = (raw.user ?? {}) as Record<string, unknown>;
  return {
    id: num(raw.id) ?? 0,
    user_id: num(raw.user_id) ?? 0,
    title: str(raw.title) ?? "",
    category: (str(raw.category) as ComplaintCategory) ?? "platform",
    description: str(raw.description) ?? "",
    status: normalizeComplaintStatus(raw.status),
    created_at: str(raw.created_at) ?? "",
    updated_at: str(raw.updated_at) ?? "",
    user: {
      id: num(user.id) ?? 0,
      name: str(user.name) ?? "—",
      phone: str(user.phone) ?? "",
    },
    isoCountryCode:
      toIsoCountryCodeOrNull(raw.iso_country_code) ?? toIsoCountryCodeOrNull(user.iso_country_code),
    lastMessagePreview:
      str(raw.last_message_preview) ?? str(raw.last_message) ?? null,
    lastMessageAt: str(raw.last_message_at) ?? null,
    lastSenderType: normalizeSenderType(raw.last_sender_type),
    unreadForAgent:
      typeof raw.unread_for_agent === "boolean"
        ? raw.unread_for_agent
          ? 1
          : 0
        : num(raw.unread_for_agent) ?? 0,
    assignedTo: parseAssignee(raw.assigned_to ?? raw.assignee),
    slaAgeHours: num(raw.sla_age_hours),
    waitingHours: num(raw.waiting_hours),
  };
};

// ─── Thread (detail view) ─────────────────────────────────────────────────────

export interface ComplaintThread extends Complaint {
  messages: ComplaintMessage[];
}

export const parseComplaintThread = (
  raw: Record<string, unknown>
): ComplaintThread => {
  const base = parseComplaint(raw);
  const rawMessages = Array.isArray(raw.messages)
    ? raw.messages
    : Array.isArray(raw.thread)
      ? raw.thread
      : [];
  let messages = rawMessages
    .map(parseComplaintMessage)
    .filter((m): m is ComplaintMessage => m !== null);

  // Legacy fallback: rows created before the thread migration may carry only
  // description + single reply — synthesise them so the thread is never empty.
  //
  // LOAD-BEARING GUARD (backend answers §7): the backend CONFIRMS that
  // `description`, `reply`, `replied_at` and `replied_by` are still populated
  // ALONGSIDE messages[] — description is also message #1 in the thread, and
  // the reply trio mirrors the most recent non-internal agent message.
  // Synthesising when messages[] is non-empty would therefore duplicate the
  // first and last messages of every thread. Only synthesise when messages[]
  // is empty.
  if (messages.length === 0) {
    if (base.description) {
      messages.push({
        id: `legacy-desc-${base.id}`,
        body: base.description,
        isInternalNote: false,
        senderType: "user",
        authorName: base.user.name,
        attachments: [],
        createdAt: base.created_at,
      });
    }
    const reply = str(raw.reply);
    if (reply) {
      const repliedBy = (raw.replied_by ?? {}) as Record<string, unknown>;
      messages.push({
        id: `legacy-reply-${base.id}`,
        body: reply,
        isInternalNote: false,
        senderType: "agent",
        authorName: str(repliedBy.name),
        attachments: [],
        createdAt: str(raw.replied_at) ?? "",
      });
    }
  }

  messages = messages
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));

  return { ...base, messages };
};

// ─── Stats (GET /super-admin/complaints/stats) ───────────────────────────────

export interface ComplaintStats {
  total: number;
  byStatus: Record<ComplaintStatus, number>;
}

export const parseComplaintStats = (raw: unknown): ComplaintStats => {
  const data = (
    raw && typeof raw === "object" ? raw : {}
  ) as Record<string, unknown>;
  const src = (
    data.by_status && typeof data.by_status === "object"
      ? data.by_status
      : data.statuses && typeof data.statuses === "object"
        ? data.statuses
        : data
  ) as Record<string, unknown>;

  const count = (k: string) => num(src[k]) ?? 0;
  const byStatus: Record<ComplaintStatus, number> = {
    new: count("new"),
    in_review: count("in_review"),
    // Legacy `replied` rows are awaiting_customer — fold them in.
    awaiting_customer: count("awaiting_customer") + count("replied"),
    awaiting_agent: count("awaiting_agent"),
    resolved: count("resolved"),
    closed: count("closed"),
  };

  const total =
    num(data.total) ??
    num(data.total_complaints) ??
    Object.values(byStatus).reduce((a, b) => a + b, 0);

  return { total, byStatus };
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface ComplaintsPagination {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}
