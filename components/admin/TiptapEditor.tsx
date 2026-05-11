"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useRef, useCallback, useEffect, useState } from "react";
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Heading3,
    List, ListOrdered, Quote, Code, Minus,
    Image as ImageIcon, Link as LinkIcon, Loader2,
    AlignLeft, AlignCenter, AlignRight,
    Highlighter, Undo, Redo, Pilcrow, RemoveFormatting,
    Link2Off
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface TiptapEditorProps {
    content: string;
    onChange: (html: string) => void;
    onImageUpload?: (file: File) => Promise<string | null>;
    placeholder?: string;
    isUploading?: boolean;
}

export default function TiptapEditor({ content, onChange, onImageUpload, placeholder = "Viết nội dung...", isUploading = false }: TiptapEditorProps) {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkOpen, setLinkOpen] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] }, codeBlock: false }),
            Image.configure({ HTMLAttributes: { class: "rounded-md max-w-full mx-auto my-3" } }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline underline-offset-2 cursor-pointer" } }),
            Placeholder.configure({ placeholder }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Underline,
            Highlight.configure({ multicolor: true }),
            TextStyle,
            Color,
        ],
        content,
        editorProps: {
            attributes: { class: "prose prose-sm max-w-none min-h-[360px] px-4 py-3 focus:outline-none text-[13.5px] leading-relaxed text-gray-800" },
        },
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) editor.commands.setContent(content, { emitUpdate: false });
    }, [content]);

    const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onImageUpload) return;
        const url = await onImageUpload(file);
        if (url && editor) editor.chain().focus().setImage({ src: url, alt: file.name }).run();
        e.target.value = "";
    }, [editor, onImageUpload]);

    const setLink = useCallback(() => {
        if (!editor) return;
        if (!linkUrl) editor.chain().focus().extendMarkRange("link").unsetLink().run();
        else editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
        setLinkUrl(""); setLinkOpen(false);
    }, [editor, linkUrl]);

    if (!editor) return null;

    const Btn = ({ active, onClick, title, children, disabled }: any) => (
        <button
            onClick={onClick} title={title} disabled={disabled} type="button"
            className={`h-7 w-7 flex items-center justify-center rounded transition-colors disabled:opacity-30 ${active ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
        >{children}</button>
    );
    const D = () => <div className="w-px h-4 bg-gray-200 mx-0.5" />;
    const I = "w-3.5 h-3.5";

    return (
        <div className="border-t border-gray-100">
            {/* Compact Toolbar */}
            <div className="flex items-center gap-px px-2 py-1 border-b border-gray-50 bg-gray-50/50 flex-wrap">
                <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}><Undo className={I}/></Btn>
                <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}><Redo className={I}/></Btn>
                <D/>
                <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold className={I}/></Btn>
                <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic className={I}/></Btn>
                <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon className={I}/></Btn>
                <Btn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strike"><Strikethrough className={I}/></Btn>
                <Btn active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight"><Highlighter className={I}/></Btn>
                <D/>
                <Btn active={editor.isActive("heading",{level:1})} onClick={() => editor.chain().focus().toggleHeading({level:1}).run()} title="H1"><Heading1 className={I}/></Btn>
                <Btn active={editor.isActive("heading",{level:2})} onClick={() => editor.chain().focus().toggleHeading({level:2}).run()} title="H2"><Heading2 className={I}/></Btn>
                <Btn active={editor.isActive("heading",{level:3})} onClick={() => editor.chain().focus().toggleHeading({level:3}).run()} title="H3"><Heading3 className={I}/></Btn>
                <D/>
                <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="List"><List className={I}/></Btn>
                <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered"><ListOrdered className={I}/></Btn>
                <Btn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote"><Quote className={I}/></Btn>
                <Btn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Code"><Code className={I}/></Btn>
                <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="HR"><Minus className={I}/></Btn>
                <D/>
                <Btn active={editor.isActive({textAlign:"left"})} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Left"><AlignLeft className={I}/></Btn>
                <Btn active={editor.isActive({textAlign:"center"})} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Center"><AlignCenter className={I}/></Btn>
                <Btn active={editor.isActive({textAlign:"right"})} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Right"><AlignRight className={I}/></Btn>
                <D/>
                {/* Link */}
                <div className="relative">
                    <Btn active={editor.isActive("link")} onClick={() => setLinkOpen(!linkOpen)} title="Link"><LinkIcon className={I}/></Btn>
                    {linkOpen && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-64">
                            <div className="flex gap-1.5">
                                <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="h-7 text-xs" onKeyDown={(e) => e.key === "Enter" && setLink()} />
                                <button onClick={setLink} className="h-7 px-2.5 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-800 shrink-0">OK</button>
                            </div>
                            {editor.isActive("link") && <button onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 mt-1.5 w-full"><Link2Off className="w-3 h-3"/>Bỏ link</button>}
                        </div>
                    )}
                </div>
                <Btn onClick={() => imageInputRef.current?.click()} title="Image" disabled={isUploading}>
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <ImageIcon className={I}/>}
                </Btn>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect}/>
                <D/>
                <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear"><RemoveFormatting className={I}/></Btn>
            </div>
            <EditorContent editor={editor}/>
        </div>
    );
}
