// src/components/dashboard/settings/about-us/about-form.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Save, X,
  ImageIcon, Facebook, Instagram, Linkedin, Twitter,
} from "lucide-react";

// ─── Toolbar helpers ──────────────────────────────────────────────────────────
const ToolbarBtn = ({
  onClick, active = false, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-colors ${
      active ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-0.5" />;

const DEFAULT_DESCRIPTION = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et magn a aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur....`;

// ─── Social Media Field ───────────────────────────────────────────────────────
const SocialField = ({
  icon, label, value, onChange, placeholder,
}: {
  icon: React.ReactNode; label: string; value: string;
  onChange: (v: string) => void; placeholder: string;
}) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
      {icon}{label}
    </label>
    <input
      type="url"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AboutForm() {
  const editorRef   = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fontSize, setFontSize]     = useState("12px");
  const [saved, setSaved]           = useState(false);
  const [companyTitle, setCompanyTitle] = useState("");
  const [logoPreview, setLogoPreview]   = useState<string | null>(null);
  const [social, setSocial] = useState({
    facebook:  "",
    instagram: "",
    x:         "",
    linkedin:  "",
  });

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const isActive = (command: string) => {
    try { return document.queryCommandState(command); } catch { return false; }
  };

  // Logo upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const description = editorRef.current?.innerHTML ?? "";
    // TODO: PATCH /api/settings/about-us
    console.log("[AboutUs] Save:", { companyTitle, description, social, logo: logoPreview });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    setCompanyTitle("");
    setLogoPreview(null);
    setSocial({ facebook: "", instagram: "", x: "", linkedin: "" });
    if (editorRef.current) editorRef.current.innerText = DEFAULT_DESCRIPTION;
  };

  const toolbarGroups: { icon: React.ReactNode; cmd: string; title: string; value?: string }[][] = [
    [
      { icon: <Bold size={13} />,          cmd: "bold",          title: "Bold"          },
      { icon: <Italic size={13} />,        cmd: "italic",        title: "Italic"        },
      { icon: <Underline size={13} />,     cmd: "underline",     title: "Underline"     },
      { icon: <Strikethrough size={13} />, cmd: "strikeThrough", title: "Strikethrough" },
    ],
    [
      { icon: <AlignLeft size={13} />,    cmd: "justifyLeft",   title: "Align Left"   },
      { icon: <AlignCenter size={13} />,  cmd: "justifyCenter", title: "Align Center" },
      { icon: <AlignRight size={13} />,   cmd: "justifyRight",  title: "Align Right"  },
      { icon: <AlignJustify size={13} />, cmd: "justifyFull",   title: "Justify"      },
    ],
    [
      { icon: <List size={13} />,        cmd: "insertUnorderedList", title: "Bullet List"   },
      { icon: <ListOrdered size={13} />, cmd: "insertOrderedList",   title: "Numbered List" },
      { icon: <Quote size={13} />,       cmd: "formatBlock",         title: "Blockquote",   value: "blockquote" },
      { icon: <Code size={13} />,        cmd: "formatBlock",         title: "Code",         value: "pre" },
    ],
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Card Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Company Information</h2>
        <p className="text-xs text-gray-400 mt-1">
          Update your company's about us information and social media presence.
        </p>
      </div>

      <div className="p-6 flex flex-col gap-6">

        {/* Company Title */}
        <div>
          <label className="block text-sm text-gray-700 mb-1.5">Company Title</label>
          <input
            type="text"
            value={companyTitle}
            onChange={(e) => setCompanyTitle(e.target.value)}
            placeholder="Enter company title"
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-colors"
          />
        </div>

        {/* About Us Description — Rich Text */}
        <div>
          <label className="block text-sm text-gray-700 mb-1.5">About Us Description</label>
          <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">

            {/* Toolbar */}
            <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50">
              {toolbarGroups.map((group, gi) => (
                <div key={gi} className="flex items-center gap-0.5">
                  {gi > 0 && <Divider />}
                  {group.map((btn) => (
                    <ToolbarBtn
                      key={btn.title}
                      title={btn.title}
                      active={isActive(btn.cmd)}
                      onClick={() => exec(btn.cmd, btn.value)}
                    >
                      {btn.icon}
                    </ToolbarBtn>
                  ))}
                </div>
              ))}

              <Divider />

              {/* Font Size */}
              <select
                value={fontSize}
                onChange={(e) => {
                  setFontSize(e.target.value);
                  const sizeMap: Record<string, string> = {
                    "12px": "2", "14px": "3", "16px": "4", "18px": "5", "20px": "6",
                  };
                  exec("fontSize", sizeMap[e.target.value] ?? "2");
                }}
                className="h-7 text-xs border border-gray-200 rounded px-1.5 bg-white text-gray-600 focus:outline-none focus:border-indigo-300 cursor-pointer"
              >
                {["12px", "14px", "16px", "18px", "20px"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Color picker */}
              <Divider />
              <label title="Text Color" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 cursor-pointer">
                <input
                  type="color"
                  defaultValue="#1C1FC1"
                  onChange={(e) => exec("foreColor", e.target.value)}
                  className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
              </label>
            </div>

            {/* Editable Area */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="min-h-[160px] max-h-[300px] overflow-y-auto px-4 py-3 text-sm text-gray-400 leading-relaxed focus:outline-none whitespace-pre-wrap"
              style={{ fontFamily: "inherit" }}
              dangerouslySetInnerHTML={{ __html: DEFAULT_DESCRIPTION }}
            />
          </div>
        </div>

        {/* Company Logo */}
        <div>
          <label className="block text-sm text-gray-700 mb-1.5">Company Logo</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-lg px-4 py-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="max-h-24 max-w-[200px] object-contain rounded" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <p className="text-xs text-indigo-500">
              {logoPreview ? "Click to change logo" : "Drop your logo here or click to browse"}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="px-4 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Social Media Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SocialField
              icon={<Facebook className="h-3.5 w-3.5 text-blue-600" />}
              label="Facebook"
              value={social.facebook}
              onChange={(v) => setSocial({ ...social, facebook: v })}
              placeholder="https://facebook.com/yourpage"
            />
            <SocialField
              icon={<Instagram className="h-3.5 w-3.5 text-pink-500" />}
              label="Instagram"
              value={social.instagram}
              onChange={(v) => setSocial({ ...social, instagram: v })}
              placeholder="https://instagram.com/yourprofile"
            />
            <SocialField
              icon={<Twitter className="h-3.5 w-3.5 text-gray-800" />}
              label="X"
              value={social.x}
              onChange={(v) => setSocial({ ...social, x: v })}
              placeholder="https://twitter.com/yourhandle"
            />
            <SocialField
              icon={<Linkedin className="h-3.5 w-3.5 text-blue-700" />}
              label="LinkedIn"
              value={social.linkedin}
              onChange={(v) => setSocial({ ...social, linkedin: v })}
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: saved ? "#10b981" : "#1C1FC1" }}
        >
          <Save className="h-4 w-4" />
          {saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}