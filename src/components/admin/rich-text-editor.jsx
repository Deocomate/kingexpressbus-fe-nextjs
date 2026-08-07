"use client";
// TipTap editor. Sanitization happens server-side at response time (nh3,
// see plan.md "HTML sanitization" decision) — this editor's HTML output is
// untrusted until the API sanitizes it on render; never trust it client-side.
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Redo, Strikethrough, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/cn";
export function RichTextEditor({
  value,
  onChange,
  className
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "min-h-40 max-w-none px-3 py-2 text-sm text-admin-ink focus:outline-none"
      }
    },
    onUpdate: ({
      editor
    }) => onChange(editor.getHTML())
  });
  if (!editor) return null;
  return <div className={cn("rounded-admin-md border border-admin-border-strong", className)}><div className="flex flex-wrap items-center gap-1 border-b border-admin-border p-1.5"><ToolbarToggle label="In đậm" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="size-4" /></ToolbarToggle><ToolbarToggle label="In nghiêng" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="size-4" /></ToolbarToggle><ToolbarToggle label="Gạch ngang" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="size-4" /></ToolbarToggle><Separator orientation="vertical" className="mx-1 h-5" /><ToolbarToggle label="Danh sách" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="size-4" /></ToolbarToggle><ToolbarToggle label="Danh sách số" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="size-4" /></ToolbarToggle><Separator orientation="vertical" className="mx-1 h-5" /><ToolbarToggle label="Hoàn tác" onClick={() => editor.chain().focus().undo().run()}><Undo className="size-4" /></ToolbarToggle><ToolbarToggle label="Làm lại" onClick={() => editor.chain().focus().redo().run()}><Redo className="size-4" /></ToolbarToggle></div><EditorContent editor={editor} /></div>;
}
function ToolbarToggle({
  label,
  active,
  onClick,
  children
}) {
  return <Button type="button" variant={active ? "secondary" : "ghost"} size="icon" aria-label={label} aria-pressed={active} onClick={onClick} className="size-8">{children}</Button>;
}