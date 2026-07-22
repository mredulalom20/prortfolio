"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getFileTooLargeMessage, getMaxUploadBytes, uploadDirectToStorage } from "../../lib/uploadClient";

const TOOLBAR_BUTTONS = [
  { label: "B", title: "Bold", command: "bold", className: "font-black" },
  { label: "I", title: "Italic", command: "italic", className: "italic" },
  { label: "U", title: "Underline", command: "underline", className: "underline" },
  { label: "H2", title: "Heading 2", block: "h2" },
  { label: "H3", title: "Heading 3", block: "h3" },
  { label: "Quote", title: "Blockquote", block: "blockquote" },
  { label: "• List", title: "Bullet List", command: "insertUnorderedList" },
  { label: "1. List", title: "Numbered List", command: "insertOrderedList" },
];

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor || editor.innerHTML === (value || "")) return;
    editor.innerHTML = value || "";
  }, [value]);

  const emitChange = useCallback(() => {
    onChange(editorRef.current?.innerHTML || "");
  }, [onChange]);

  const runCommand = useCallback((command, detail = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, detail);
    emitChange();
  }, [emitChange]);

  const setBlock = useCallback((tag) => {
    runCommand("formatBlock", tag);
  }, [runCommand]);

  const insertImage = useCallback(async (file) => {
    if (!file) return;
    if (file.size > getMaxUploadBytes()) {
      setUploadError(getFileTooLargeMessage());
      return;
    }

    setUploadError("");
    try {
      const { url } = await uploadDirectToStorage(file);
      runCommand("insertImage", url);
    } catch (e) {
      setUploadError(e?.message || "Image upload failed.");
    }
  }, [runCommand]);

  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    runCommand("createLink", url);
  }, [runCommand]);

  const handlePaste = useCallback((e) => {
    const image = Array.from(e.clipboardData?.files || []).find((file) => file.type.startsWith("image/"));
    if (!image) return;
    e.preventDefault();
    insertImage(image);
  }, [insertImage]);

  return (
    <div className="rich-text-editor overflow-hidden rounded-lg bg-white text-black">
      <div className="flex flex-wrap gap-1 border border-slate-300 bg-slate-50 p-2">
        {TOOLBAR_BUTTONS.map((button) => (
          <button
            key={button.title}
            type="button"
            title={button.title}
            onClick={() => button.block ? setBlock(button.block) : runCommand(button.command)}
            className={`rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 hover:bg-slate-200 ${button.className || ""}`}
          >
            {button.label}
          </button>
        ))}
        <button type="button" onClick={addLink} className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 hover:bg-slate-200">Link</button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 hover:bg-slate-200">Image</button>
        <button type="button" onClick={() => runCommand("removeFormat")} className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 hover:bg-slate-200">Clear</button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => insertImage(e.target.files?.[0])} />
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onPaste={handlePaste}
        className="prose min-h-72 max-w-none border-x border-b border-slate-300 p-4 text-slate-950 outline-none focus:ring-2 focus:ring-primary/40"
      />

      {uploadError && <p className="bg-white px-4 py-2 text-sm font-bold text-red-600">{uploadError}</p>}
    </div>
  );
}
