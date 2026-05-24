"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import { getFileTooLargeMessage, getMaxUploadBytes, uploadDirectToStorage } from "../../lib/uploadClient";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [uploadError, setUploadError] = useState("");

  const insertImage = useCallback(async (file) => {
    if (!file) return;
    if (file.size > getMaxUploadBytes()) {
      setUploadError(getFileTooLargeMessage());
      return;
    }

    setUploadError("");
    try {
      const { url } = await uploadDirectToStorage(file);
      const editor = editorRef.current?.getEditor();
      const range = editor?.getSelection(true);
      editor?.insertEmbed(range?.index ?? editor.getLength(), "image", url, "user");
    } catch (e) {
      setUploadError(e?.message || "Image upload failed.");
    }
  }, []);

  const handleImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => insertImage(input.files?.[0]);
    input.click();
  }, [insertImage]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: handleImage,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }), [handleImage]);

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "link",
    "image",
  ];

  return (
    <div className="rich-text-editor bg-white text-black rounded-lg overflow-hidden">
      <ReactQuill
        ref={editorRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        onPaste={(e) => {
          const image = Array.from(e.clipboardData?.files || []).find((file) => file.type.startsWith("image/"));
          if (!image) return;
          e.preventDefault();
          insertImage(image);
        }}
      />
      {uploadError && <p className="bg-white px-4 py-2 text-sm font-bold text-red-600">{uploadError}</p>}
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #111827;
        }

        .rich-text-editor .ql-toolbar .ql-formats {
          display: flex;
          align-items: center;
          margin-right: 0.25rem;
        }

        .rich-text-editor .ql-toolbar button,
        .rich-text-editor .ql-toolbar .ql-picker-label,
        .rich-text-editor .ql-toolbar .ql-picker-item {
          color: #111827;
        }

        .rich-text-editor .ql-snow.ql-toolbar button .ql-stroke,
        .rich-text-editor .ql-snow .ql-toolbar button .ql-stroke,
        .rich-text-editor .ql-snow .ql-picker .ql-stroke {
          stroke: #111827;
        }

        .rich-text-editor .ql-snow.ql-toolbar button .ql-fill,
        .rich-text-editor .ql-snow .ql-toolbar button .ql-fill,
        .rich-text-editor .ql-snow .ql-picker .ql-fill {
          fill: #111827;
        }

        .rich-text-editor .ql-container {
          border-color: #cbd5e1;
          font-size: 1rem;
          min-height: 18rem;
        }

        .rich-text-editor .ql-editor {
          line-height: 1.7;
          min-height: 18rem;
        }

        .rich-text-editor .ql-editor p {
          margin-bottom: 1rem;
        }

        .rich-text-editor .ql-editor img {
          display: block;
          height: auto;
          margin: 1.25rem 0;
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}
