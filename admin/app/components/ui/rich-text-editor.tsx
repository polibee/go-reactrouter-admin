import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  Code,
  FileText,
  FolderOpen,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Palette,
  Plus,
  Quote,
  Redo,
  RemoveFormatting,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Type,
  Underline as UnderlineIcon,
  Undo,
  Unlink,
} from 'lucide-react'
import { htmlToMarkdown, markdownToHtml } from '~/lib/markdown'
import { MediaPickerModal } from '~/resources/media/components/media-picker-modal'
import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Input } from './input'
import { Label } from './label'

const textColorSwatches = [
  { color: '#09090b', title: 'common.editor.colorBlack' },
  { color: '#2563eb', title: 'common.editor.colorBlue' },
  { color: '#16a34a', title: 'common.editor.colorGreen' },
  { color: '#dc2626', title: 'common.editor.colorRed' },
  { color: '#d97706', title: 'common.editor.colorAmber' },
  { color: '#9333ea', title: 'common.editor.colorPurple' },
  { color: '#64748b', title: 'common.editor.colorGray' },
  { color: '#0284c7', title: 'common.editor.colorSkyBlue' },
] as const

const highlightSwatches = [
  { color: '#fef08a', title: 'common.editor.highlightYellow' },
  { color: '#bbf7d0', title: 'common.editor.highlightMint' },
  { color: '#bae6fd', title: 'common.editor.highlightSky' },
  { color: '#fbcfe8', title: 'common.editor.highlightPink' },
  { color: '#fed7aa', title: 'common.editor.highlightOrange' },
  { color: '#e9d5ff', title: 'common.editor.highlightLilac' },
  { color: '#e2e8f0', title: 'common.editor.highlightLightGray' },
  { color: 'transparent', title: 'common.editor.clearHighlight' },
] as const

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  disabled?: boolean
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = '360px',
  disabled = false,
  className = '',
}: RichTextEditorProps) {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder ?? t('common.editor.richPlaceholder')
  const [isMarkdownMode, setIsMarkdownMode] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)

  // Dialog states
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [linkNewTab, setLinkNewTab] = useState(true)

  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)

  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class:
            'text-primary underline font-medium hover:opacity-80 transition-opacity',
        },
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-3 border shadow-xs mx-auto',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4 border text-xs',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border bg-muted/50 font-semibold p-2 text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border p-2',
        },
      }),
      Placeholder.configure({
        placeholder: resolvedPlaceholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'tiptap ProseMirror prose dark:prose-invert max-w-none min-h-[320px] focus:outline-none p-4 text-sm leading-relaxed cursor-text',
      },
    },
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  // Synchronize external value with editor if changed externally
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !isMarkdownMode) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [value, editor, isMarkdownMode])

  // Sync disabled state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  // Link dialog handlers
  const handleOpenLinkDialog = () => {
    if (!editor) return
    const prevUrl = editor.getAttributes('link').href || ''
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')

    setLinkUrl(prevUrl)
    setLinkText(selectedText)
    setLinkNewTab(true)
    setLinkDialogOpen(true)
  }

  const handleApplyLink = () => {
    if (!editor || !linkUrl.trim()) return

    if (linkText.trim()) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .insertContent({
          type: 'text',
          text: linkText,
          marks: [
            {
              type: 'link',
              attrs: {
                href: linkUrl,
                target: linkNewTab ? '_blank' : '_self',
              },
            },
          ],
        })
        .run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({
          href: linkUrl,
          target: linkNewTab ? '_blank' : '_self',
        })
        .run()
    }

    setLinkDialogOpen(false)
  }

  const handleRemoveLink = () => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
    setLinkDialogOpen(false)
  }

  // Image dialog handlers
  const handleOpenImageDialog = () => {
    setImageUrl('')
    setImageAlt('')
    setImageDialogOpen(true)
  }

  const handleApplyImage = () => {
    if (!editor || !imageUrl.trim()) return

    editor
      .chain()
      .focus()
      .setImage({
        src: imageUrl,
        alt: imageAlt.trim() || undefined,
      })
      .run()

    setImageDialogOpen(false)
  }

  // Markdown mode toggle
  const handleToggleMarkdownMode = () => {
    if (isMarkdownMode) {
      // Switch from Markdown back to WYSIWYG
      const convertedHtml = markdownToHtml(markdownContent)
      if (editor) {
        editor.commands.setContent(convertedHtml, { emitUpdate: false })
      }
      onChange(convertedHtml)
      setIsMarkdownMode(false)
    } else {
      // Switch from WYSIWYG to Markdown
      const currentHtml = editor ? editor.getHTML() : value || ''
      const convertedMd = htmlToMarkdown(currentHtml)
      setMarkdownContent(convertedMd)
      setIsMarkdownMode(true)
    }
  }

  const handleMarkdownTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const val = e.target.value
    setMarkdownContent(val)
    onChange(markdownToHtml(val))
  }

  // Focus editor when clicking anywhere in canvas container
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isMarkdownMode || !editor) return
    // If click was on the outer padding or empty space below lines
    if (e.target === canvasRef.current) {
      editor.commands.focus('end')
    }
  }

  if (!editor) {
    return (
      <div
        style={{ minHeight }}
        className="bg-muted/20 text-muted-foreground flex items-center justify-center rounded-lg border text-xs"
      >
        <span>{t('common.editor.loadingTipTap')}</span>
      </div>
    )
  }

  // Character and word metrics
  const textContent = isMarkdownMode
    ? markdownContent
    : editor.state.doc.textContent
  const charCount = textContent.length
  const wordCount = textContent.trim()
    ? textContent.trim().split(/\s+/).filter(Boolean).length
    : 0

  return (
    <div
      className={`bg-card text-card-foreground focus-within:ring-ring flex flex-col overflow-hidden rounded-lg border shadow-xs transition-all focus-within:ring-1 ${className}`}
    >
      {/* 官方规范工具栏 (TipTap Official Standard Toolbar) */}
      <div className="bg-muted/20 text-muted-foreground flex flex-wrap items-center gap-1 border-b p-1.5 select-none">
        {/* 段落与标题选择 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled || isMarkdownMode}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hover:text-foreground hover:bg-muted/80 h-8 gap-1.5 px-2 text-xs font-normal"
            >
              <Type className="text-primary size-3.5" />
              <span className="font-medium">
                {editor.isActive('heading', { level: 1 })
                  ? t('common.editor.heading1')
                  : editor.isActive('heading', { level: 2 })
                    ? t('common.editor.heading2')
                    : editor.isActive('heading', { level: 3 })
                      ? t('common.editor.heading3')
                      : editor.isActive('blockquote')
                        ? t('common.editor.blockquote')
                        : editor.isActive('codeBlock')
                          ? t('common.editor.codeBlock')
                          : t('common.editor.paragraph')}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 text-xs">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={
                editor.isActive('paragraph') ? 'bg-muted font-semibold' : ''
              }
            >
              <span>{t('common.editor.paragraph')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                editor.isActive('heading', { level: 1 })
                  ? 'bg-muted font-semibold'
                  : ''
              }
            >
              <Heading1 className="text-primary mr-2 size-4" />
              <span className="text-sm font-bold">
                {t('common.editor.heading1')}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                editor.isActive('heading', { level: 2 })
                  ? 'bg-muted font-semibold'
                  : ''
              }
            >
              <Heading2 className="text-primary mr-2 size-4" />
              <span className="text-xs font-semibold">
                {t('common.editor.heading2')}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={
                editor.isActive('heading', { level: 3 })
                  ? 'bg-muted font-semibold'
                  : ''
              }
            >
              <Heading3 className="text-primary mr-2 size-4" />
              <span className="text-xs font-medium">
                {t('common.editor.heading3')}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={
                editor.isActive('blockquote') ? 'bg-muted font-semibold' : ''
              }
            >
              <Quote className="text-muted-foreground mr-2 size-3.5" />
              <span>{t('common.editor.blockquote')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={
                editor.isActive('codeBlock') ? 'bg-muted font-semibold' : ''
              }
            >
              <Code className="text-muted-foreground mr-2 size-3.5" />
              <span className="font-mono text-xs">
                {t('common.editor.codeBlock')}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="bg-border/60 mx-1 h-4 w-px" />

        {/* 基础行内排版 */}
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-muted text-foreground font-bold' : ''}`}
          title={t('common.editor.bold')}
          disabled={disabled || isMarkdownMode}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-muted text-foreground' : ''}`}
          title={t('common.editor.italic')}
          disabled={disabled || isMarkdownMode}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-muted text-foreground' : ''}`}
          title={t('common.editor.underline')}
          disabled={disabled || isMarkdownMode}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('strike') ? 'bg-muted text-foreground' : ''}`}
          title={t('common.editor.strikethrough')}
          disabled={disabled || isMarkdownMode}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive('code') ? 'secondary' : 'ghost'}
          size="sm"
          className={`h-8 w-8 p-0 font-mono text-xs ${editor.isActive('code') ? 'bg-muted text-foreground' : ''}`}
          title={t('common.editor.inlineCode')}
          disabled={disabled || isMarkdownMode}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="size-3.5" />
        </Button>

        {/* 文字调色 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled || isMarkdownMode}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title={t('common.editor.textColor')}
            >
              <Palette className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="grid w-36 grid-cols-4 gap-1 p-2"
          >
            {textColorSwatches.map((c) => (
              <button
                key={c.color}
                type="button"
                className="border-border/60 size-6 cursor-pointer rounded-full border transition-transform hover:scale-110"
                style={{ backgroundColor: c.color }}
                title={t(c.title)}
                onClick={() => editor.chain().focus().setColor(c.color).run()}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 荧光背景高亮 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled || isMarkdownMode}>
            <Button
              type="button"
              variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              title={t('common.editor.highlight')}
            >
              <Highlighter className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="grid w-36 grid-cols-4 gap-1 p-2"
          >
            {highlightSwatches.map((c) => (
              <button
                key={c.color}
                type="button"
                className="border-border/60 size-6 cursor-pointer rounded-full border transition-transform hover:scale-110"
                style={{ backgroundColor: c.color }}
                title={t(c.title)}
                onClick={() =>
                  c.color === 'transparent'
                    ? editor.chain().focus().unsetHighlight().run()
                    : editor
                        .chain()
                        .focus()
                        .setHighlight({ color: c.color })
                        .run()
                }
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="bg-border/60 mx-1 h-4 w-px" />

        {/* 对齐排版 */}
        <Button
          type="button"
          variant={
            editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'
          }
          size="sm"
          className="h-8 w-8 p-0"
          title={t('common.editor.alignLeft')}
          disabled={disabled || isMarkdownMode}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant={
            editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'
          }
          size="sm"
          className="h-8 w-8 p-0"
          title={t('common.editor.alignCenter')}
          disabled={disabled || isMarkdownMode}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant={
            editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'
          }
          size="sm"
          className="h-8 w-8 p-0"
          title={t('common.editor.alignRight')}
          disabled={disabled || isMarkdownMode}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant={
            editor.isActive({ textAlign: 'justify' }) ? 'secondary' : 'ghost'
          }
          size="sm"
          className="h-8 w-8 p-0"
          title={t('common.editor.alignJustify')}
          disabled={disabled || isMarkdownMode}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <AlignJustify className="size-3.5" />
        </Button>

        <div className="bg-border/60 mx-1 h-4 w-px" />

        {/* 列表 */}
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          title={t('common.editor.bulletList')}
          disabled={disabled || isMarkdownMode}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          title={t('common.editor.orderedList')}
          disabled={disabled || isMarkdownMode}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-3.5" />
        </Button>

        <div className="bg-border/60 mx-1 h-4 w-px" />

        {/* 插入超链接 */}
        <Button
          type="button"
          variant={editor.isActive('link') ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          title={t('common.editor.insertLink')}
          disabled={disabled || isMarkdownMode}
          onClick={handleOpenLinkDialog}
        >
          <LinkIcon className="size-3.5" />
        </Button>

        {/* 插入网络图片 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title={t('common.editor.insertImage')}
          disabled={disabled || isMarkdownMode}
          onClick={handleOpenImageDialog}
        >
          <ImageIcon className="size-3.5" />
        </Button>

        {/* 表格 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled || isMarkdownMode}>
            <Button
              type="button"
              variant={editor.isActive('table') ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              title={t('common.editor.table')}
            >
              <TableIcon className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="text-xs">
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
            >
              <Plus className="text-primary mr-2 size-3.5" />
              <span>{t('common.editor.insertTable')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!editor.isActive('table')}
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              {t('common.editor.insertRowBelow')}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!editor.isActive('table')}
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              {t('common.editor.deleteRow')}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!editor.isActive('table')}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              {t('common.editor.insertColumnRight')}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!editor.isActive('table')}
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              {t('common.editor.deleteColumn')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!editor.isActive('table')}
              className="text-destructive"
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              <Trash2 className="mr-2 size-3.5" />
              {t('common.editor.deleteTable')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 水平线 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title={t('common.editor.insertHorizontalRule')}
          disabled={disabled || isMarkdownMode}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-3.5" />
        </Button>

        {/* 清除格式 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title={t('common.editor.clearFormatting')}
          disabled={disabled || isMarkdownMode}
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <RemoveFormatting className="size-3.5" />
        </Button>

        <div className="bg-border/60 mx-1 h-4 w-px" />

        {/* 撤销 / 重做 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title={t('common.editor.undo')}
          disabled={disabled || isMarkdownMode || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title={t('common.editor.redo')}
          disabled={disabled || isMarkdownMode || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="size-3.5" />
        </Button>

        {/* 右侧：Markdown 切换模式（替代先前的 HTML 源码） */}
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            type="button"
            variant={isMarkdownMode ? 'default' : 'outline'}
            size="sm"
            className="h-7 cursor-pointer gap-1.5 px-2.5 font-mono text-xs transition-colors"
            onClick={handleToggleMarkdownMode}
            title={
              isMarkdownMode
                ? t('common.editor.backToVisual')
                : t('common.editor.switchToMarkdown')
            }
          >
            <FileText className="size-3.5" />
            <span>
              {isMarkdownMode
                ? t('common.editor.visualMode')
                : t('common.editor.markdownMode')}
            </span>
          </Button>
        </div>
      </div>

      {/* 编辑主体区域：全域点击聚焦支持 (Full-area Click-to-focus) */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ minHeight }}
        className="bg-background relative flex flex-1 cursor-text flex-col"
      >
        {isMarkdownMode ? (
          <textarea
            value={markdownContent}
            onChange={handleMarkdownTextareaChange}
            disabled={disabled}
            placeholder={t('common.editor.markdownTextareaPlaceholder')}
            style={{ minHeight }}
            className="text-foreground w-full flex-1 resize-y border-0 bg-transparent p-4 font-mono text-xs leading-relaxed focus:outline-none"
          />
        ) : (
          <div
            className="flex w-full flex-1 flex-col"
            onClick={() => {
              if (editor && !editor.isFocused) {
                editor.commands.focus('end')
              }
            }}
          >
            <EditorContent
              editor={editor}
              className="flex h-full w-full flex-1 flex-col [&_.ProseMirror]:min-h-[320px] [&_.ProseMirror]:flex-1 [&_.ProseMirror]:outline-none"
            />
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="bg-muted/20 text-muted-foreground flex items-center justify-between border-t px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-foreground font-semibold">TipTap</span>
          <span>·</span>
          <span>
            {isMarkdownMode
              ? t('common.editor.markdownMode')
              : t('common.editor.visualMode')}
          </span>
          <span>·</span>
          <span>
            {t('common.editor.stats', {
              chars: charCount,
              words: wordCount,
            })}
          </span>
        </div>
        <div className="text-xs opacity-75">
          {isMarkdownMode
            ? t('common.editor.markdownHint')
            : t('common.editor.visualHint')}
        </div>
      </div>

      {/* 插入/编辑超链接弹窗 */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <LinkIcon className="text-primary size-4" />
              {t('common.editor.linkDialogTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="link-text">{t('common.editor.linkText')}</Label>
              <Input
                id="link-text"
                placeholder={t('common.editor.linkTextPlaceholder')}
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="link-url">{t('common.editor.linkUrl')}</Label>
              <Input
                id="link-url"
                placeholder={t('common.editor.linkUrlPlaceholder')}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="link-newtab"
                checked={linkNewTab}
                onChange={(e) => setLinkNewTab(e.target.checked)}
                className="border-border text-primary focus:ring-primary rounded"
              />
              <Label
                htmlFor="link-newtab"
                className="cursor-pointer text-xs font-normal"
              >
                {t('common.editor.openInNewTab')}
              </Label>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between pt-2 sm:justify-between">
            {editor.isActive('link') ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={handleRemoveLink}
              >
                <Unlink className="size-3.5" />
                {t('common.editor.removeLink')}
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLinkDialogOpen(false)}
              >
                {t('common.actions.cancel')}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyLink}
                disabled={!linkUrl.trim()}
              >
                <Check className="mr-1 size-3.5" />
                {t('common.editor.applyLink')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 插入网络图片弹窗 */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <ImageIcon className="text-primary size-4" />
              {t('common.editor.insertImage')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            {/* 从媒体库快速选用 */}
            <div className="bg-muted/40 flex items-center justify-between gap-2 rounded-lg border border-dashed p-2.5">
              <div>
                <div className="text-foreground text-xs font-medium">
                  {t('common.editor.fromMediaLibrary')}
                </div>
                <div className="text-muted-foreground text-xs">
                  {t('common.editor.mediaLibraryHint')}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-primary border-primary/30 hover:bg-primary/5 h-7 shrink-0 gap-1 text-xs"
                onClick={() => setMediaPickerOpen(true)}
              >
                <FolderOpen className="size-3.5" />
                {t('common.editor.openMediaLibrary')}
              </Button>
            </div>

            <div className="relative flex items-center py-0.5">
              <div className="border-border/60 flex-grow border-t"></div>
              <span className="text-muted-foreground mx-2 flex-shrink text-xs">
                {t('common.editor.orEnterUrl')}
              </span>
              <div className="border-border/60 flex-grow border-t"></div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="img-url">{t('common.editor.imageUrl')}</Label>
              <Input
                id="img-url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="img-alt">{t('common.editor.imageAlt')}</Label>
              <Input
                id="img-alt"
                placeholder={t('common.editor.imageAltPlaceholder')}
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImageDialogOpen(false)}
            >
              {t('common.actions.cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApplyImage}
              disabled={!imageUrl.trim()}
            >
              <Check className="mr-1 size-3.5" />
              {t('common.editor.insertImageAction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 媒体库选择器弹窗 */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        allowedTypes={['image']}
        title={t('common.editor.mediaPickerTitle')}
        onSelect={(item) => {
          if (editor) {
            editor
              .chain()
              .focus()
              .setImage({
                src: item.url,
                alt: item.name,
              })
              .run()
            setImageDialogOpen(false)
            setMediaPickerOpen(false)
          }
        }}
      />
    </div>
  )
}
