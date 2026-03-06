// src/components/dashboard/settings/warranty-policy/warranty-form.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Save, X,
} from "lucide-react";

// ─── Toolbar Button ───────────────────────────────────────────────────────────
const ToolbarBtn = ({
  onClick,
  active = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-colors ${
      active
        ? "bg-indigo-100 text-indigo-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-0.5" />;

// ─── Default content ──────────────────────────────────────────────────────────
const DEFAULT_CONTENT = `Our comprehensive warranty policy ensures customer satisfaction and product reliability. This warranty covers manufacturing defects and material failures under normal usage conditions.

WARRANTY COVERAGE:
• All products are covered for a period of 12 months from the date of purchase
• Coverage includes manufacturing defects, material failures, and functional issues
• Warranty applies to original purchaser only and is non-transferable

WHAT IS COVERED:
• Manufacturing defects in materials and workmanship
• Functional failures under normal use conditions
• Hardware malfunctions not caused by user error
• Component failures due to design or material defects

WHAT IS NOT COVERED:
• Physical damage due to misuse, abuse, or accidents
• Damage caused by unauthorized modifications or repairs
• Normal wear and tear from regular usage
• Damage from exposure to extreme conditions
• Consumable parts and accessories

CLAIM PROCESS:
1. Contact our customer service team within warranty period
2. Provide proof of purchase and product serial number
3. Describe the issue and provide supporting documentation
4. Follow the return/repair instructions provided`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WarrantyForm() {
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
    // TODO: PATCH /api/settings/warranty-policy
    console.log("[WarrantyPolicy] Save:", content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    if (editorRef.current) {
      editorRef.current.innerText = DEFAULT_CONTENT;
    }
  };

  const toolbarGroups = [
    // Format
    [
      { icon: <Bold size={13} />,          cmd: "bold",          title: "Bold"          },
      { icon: <Italic size={13} />,        cmd: "italic",        title: "Italic"        },
      { icon: <Underline size={13} />,     cmd: "underline",     title: "Underline"     },
      { icon: <Strikethrough size={13} />, cmd: "strikeThrough", title: "Strikethrough" },
    ],
    // Align
    [
      { icon: <AlignLeft size={13} />,    cmd: "justifyLeft",   title: "Align Left"    },
      { icon: <AlignCenter size={13} />,  cmd: "justifyCenter", title: "Align Center"  },
      { icon: <AlignRight size={13} />,   cmd: "justifyRight",  title: "Align Right"   },
      { icon: <AlignJustify size={13} />, cmd: "justifyFull",   title: "Justify"       },
    ],
    // Lists + extras
    [
      { icon: <List size={13} />,        cmd: "insertUnorderedList", title: "Bullet List"   },
      { icon: <ListOrdered size={13} />, cmd: "insertOrderedList",   title: "Numbered List" },
      { icon: <Quote size={13} />,       cmd: "formatBlock",         title: "Blockquote", value: "blockquote" },
      { icon: <Code size={13} />,        cmd: "formatBlock",         title: "Code",       value: "pre"        },
    ],
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Card Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">
          Warranty Policy Configuration
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Set up and manage your warranty policy information
        </p>
      </div>

      <div className="p-6">
        {/* Field Label */}
        <label className="block text-sm text-gray-700 mb-2">
          Warranty Policy Description
        </label>

        {/* Editor Container */}
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">

          {/* Toolbar */}
          <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50">
            {toolbarGroups.map((group, gi) => (
              <div key={gi} className="flex items-center gap-0.5">
                {gi > 0 && <Divider />}
                {group.map((btn) => (
                  <ToolbarBtn
                    key={btn.cmd + (btn.title)}
                    title={btn.title}
                    active={isActive(btn.cmd)}
                    onClick={() => exec(btn.cmd, (btn as any).value)}
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
                exec("fontSize", e.target.value === "12px" ? "2" : e.target.value === "14px" ? "3" : e.target.value === "16px" ? "4" : "5");
              }}
              className="h-7 text-xs border border-gray-200 rounded px-1.5 bg-white text-gray-600 focus:outline-none focus:border-indigo-300 cursor-pointer"
            >
              {["12px", "14px", "16px", "18px", "20px"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Color */}
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
            onInput={() => {}}
            className="min-h-[240px] max-h-[400px] overflow-y-auto px-4 py-3 text-sm text-gray-600 leading-relaxed focus:outline-none whitespace-pre-wrap"
            style={{ fontFamily: "inherit" }}
            dangerouslySetInnerHTML={{ __html: DEFAULT_CONTENT }}
          />
        </div>
      </div>

      {/* Footer Actions */}
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
          {saved ? "Saved ✓" : "Save Policy"}
        </button>
      </div>
    </div>
  );
}