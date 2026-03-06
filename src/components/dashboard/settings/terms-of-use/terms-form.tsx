// src/components/dashboard/settings/terms-of-use/terms-form.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Save, X,
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

// ─── Default content ──────────────────────────────────────────────────────────
const DEFAULT_CONTENT = `1. ACCEPTANCE OF TERMS By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.

2. DESCRIPTION OF SERVICE Our platform provides users with access to a comprehensive trading and e-commerce environment where users can buy, sell, and trade various products and services.

3. USER ACCOUNTS
3.1 Registration: Users must register for an account to access certain features of the platform.
3.2 Account Security: Users are responsible for maintaining the confidentiality of their account credentials.
3.3 Account Termination: We reserve the right to terminate accounts that violate these terms.

4. USER CONDUCT Users agree to:
- Provide accurate and truthful information
- Comply with all applicable laws and regulations
- Respect the rights of other users
- Not engage in fraudulent or deceptive practices

5. TRADING POLICIES
5.1 All trades must be conducted in good faith
5.2 Users must honor their trading commitments
5.3 Disputes will be handled through our resolution process

6. PRIVACY POLICY Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the platform.

7. INTELLECTUAL PROPERTY All content, trademarks, and other intellectual property on this platform are owned by us or our licensors.

8. LIMITATION OF LIABILITY We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.

9. MODIFICATIONS We reserve the right to modify these terms at any time. Users will be notified of significant changes.

10. GOVERNING LAW These terms shall be governed by and construed in accordance with applicable laws.

11. CONTACT INFORMATION For questions about these Terms of Use, please contact our support team.`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TermsForm() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState("12px");
  const [saved, setSaved] = useState(false);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const isActive = (command: string) => {
    try { return document.queryCommandState(command); } catch { return false; }
  };

  const handleSave = () => {
    const content = editorRef.current?.innerHTML ?? "";
    // TODO: PATCH /api/settings/terms-of-use
    console.log("[TermsOfUse] Save:", content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    if (editorRef.current) editorRef.current.innerText = DEFAULT_CONTENT;
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
        <h2 className="text-base font-semibold text-gray-900">Edit Terms of Use</h2>
        <p className="text-xs text-gray-400 mt-1">
          Update your terms of use content and legal information
        </p>
      </div>

      <div className="p-6">
        {/* Label */}
        <label className="block text-sm text-gray-700 mb-2">
          Terms Content
          <span className="text-red-500 ml-0.5">*</span>
        </label>

        {/* Editor */}
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">

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
            className="min-h-[320px] max-h-[480px] overflow-y-auto px-4 py-3 text-sm text-gray-600 leading-relaxed focus:outline-none whitespace-pre-wrap"
            style={{ fontFamily: "inherit" }}
            dangerouslySetInnerHTML={{ __html: DEFAULT_CONTENT }}
          />
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