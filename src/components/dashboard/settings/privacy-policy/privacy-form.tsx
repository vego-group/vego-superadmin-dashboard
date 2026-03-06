// src/components/dashboard/settings/privacy-policy/privacy-form.tsx
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

2. INFORMATION WE COLLECT We collect information you provide directly to us, such as when you create an account, make a transaction, or contact us for support.
- Personal identification information (name, email address, phone number)
- Account credentials and profile information
- Transaction and usage data
- Device and technical information

3. HOW WE USE YOUR INFORMATION We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send technical notices and support messages
- Respond to comments and questions

4. INFORMATION SHARING We do not sell, trade, or otherwise transfer your personal information to outside parties except:
- With your consent
- To comply with legal obligations
- To protect our rights and safety

5. DATA SECURITY We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

6. COOKIES We use cookies and similar tracking technologies to track activity on our platform and hold certain information to improve your experience.

7. THIRD-PARTY LINKS Our platform may contain links to third-party websites. We have no control over and assume no responsibility for the content or privacy practices of any third-party sites.

8. CHILDREN'S PRIVACY Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.

9. CHANGES TO THIS POLICY We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.

10. CONTACT US If you have any questions about this Privacy Policy, please contact our support team.`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PrivacyForm() {
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
    // TODO: PATCH /api/settings/privacy-policy
    console.log("[PrivacyPolicy] Save:", content);
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
        <h2 className="text-base font-semibold text-gray-900">Privacy Policy</h2>
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