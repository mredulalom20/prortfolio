"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function RichTextEditor({ value, onChange }) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

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
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
      />
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
