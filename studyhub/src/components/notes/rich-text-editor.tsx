"use client";

import * as React from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListTodo,
  type LucideIcon,
  Quote,
  Redo2,
  Sigma,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { MathInline } from "./math-node";
import { cn } from "@/lib/utils";

function ToolbarButton({
  icon: Icon,
  active,
  disabled,
  onClick,
  label,
}: {
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-30",
        active && "bg-surface-2 text-[var(--color-signal-2)]"
      )}
    >
      <Icon className="size-[15px]" />
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
      <ToolbarButton icon={Bold} label="Fett" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolbarButton icon={Italic} label="Kursiv" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolbarButton icon={Strikethrough} label="Durchgestrichen" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} />
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton icon={Heading1} label="Überschrift" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton icon={Heading2} label="Unterüberschrift" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton icon={List} label="Aufzählung" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarButton icon={ListOrdered} label="Nummerierte Liste" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolbarButton icon={ListTodo} label="Aufgabenliste" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} />
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton icon={Quote} label="Zitat" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <ToolbarButton icon={Code} label="Codeblock" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
      <ToolbarButton
        icon={LinkIcon}
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          const url = window.prompt("URL", editor.getAttributes("link").href ?? "https://");
          if (url === null) return;
          if (url === "") editor.chain().focus().unsetLink().run();
          else editor.chain().focus().setLink({ href: url }).run();
        }}
      />
      <ToolbarButton
        icon={ImageIcon}
        label="Bild"
        onClick={() => {
          const url = window.prompt("Bild-URL");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
      />
      <ToolbarButton
        icon={Sigma}
        label="Formel"
        onClick={() => {
          const latex = window.prompt("LaTeX", "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}");
          if (latex) editor.chain().focus().insertContent({ type: "mathInline", attrs: { latex } }).run();
        }}
      />
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton icon={Undo2} label="Rückgängig" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
      <ToolbarButton icon={Redo2} label="Wiederholen" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing…",
  editable = true,
  className,
}: {
  content: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, autolink: true }),
      ImageExtension,
      TaskList,
      TaskItem.configure({ nested: true }),
      MathInline,
    ],
    content,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "ProseMirror prose-study max-w-none focus:outline-none min-h-[50vh] px-1 py-3",
      },
    },
  });

  React.useEffect(() => {
    if (editor && editable !== editor.isEditable) editor.setEditable(editable);
  }, [editable, editor]);

  if (!editor) return null;

  return (
    <div className={cn("flex flex-col", className)}>
      {editable && <Toolbar editor={editor} />}
      <div className="flex-1 overflow-y-auto px-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
