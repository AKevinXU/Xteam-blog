"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const [preview, setPreview] = useState(false);

  const insertText = (before: string, after: string = "") => {
    const textarea = document.getElementById("editor-textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const newText = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  return (
    <div className="border rounded-lg dark:border-gray-700">
      <div className="flex items-center gap-2 p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button onClick={() => insertText("**", "**")} className="px-2 py-1 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded">B</button>
        <button onClick={() => insertText("*", "*")} className="px-2 py-1 text-sm italic hover:bg-gray-200 dark:hover:bg-gray-700 rounded">I</button>
        <button onClick={() => insertText("# ")} className="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded">H1</button>
        <button onClick={() => insertText("## ")} className="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded">H2</button>
        <button onClick={() => insertText("- ")} className="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded">List</button>
        <button onClick={() => insertText("```\n", "\n```")} className="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded">Code</button>
        <div className="flex-1"></div>
        <button 
          onClick={() => setPreview(!preview)} 
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {preview ? "编辑" : "预览"}
        </button>
      </div>

      <div className="flex min-h-[400px]">
        <div className={`${preview ? "hidden" : "block"} w-full`}>
          <textarea
            id="editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="开始写作..."
            className="w-full h-full min-h-[400px] p-4 resize-none outline-none bg-transparent dark:text-white"
          />
        </div>
        <div className={`${preview ? "block" : "hidden"} w-full p-4 prose dark:prose-invert max-w-none overflow-auto`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {value || "*预览内容*"}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
