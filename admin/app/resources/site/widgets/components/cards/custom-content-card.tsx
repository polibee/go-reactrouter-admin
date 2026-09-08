import {
  Code2,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Sparkles,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '~/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import type { SiteWidgetConfig } from '../../../types'
import { useWidgetContext } from '../widget-context'

export interface CustomContentCardProps {
  widget: SiteWidgetConfig
}

export function CustomContentCard({ widget }: CustomContentCardProps) {
  const { t } = useTranslation()
  const { density, showCardDividers } = useWidgetContext()
  const isCompact = density === 'compact'
  const jsContainerRef = useRef<HTMLDivElement>(null)

  // Parse link list items from multi-line text: "标题 | URL | 标签"
  const parsedLinks = (widget.linkItemsText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim())
      return {
        title:
          parts[0] ||
          t('resources.site.widgets.cards.custom.fallbackLinkTitle'),
        url: parts[1] || '#',
        badge: parts[2] || '',
      }
    })

  // Execute custom JS if specified
  useEffect(() => {
    if (
      widget.cardType === 'custom_js' &&
      widget.jsCode &&
      jsContainerRef.current
    ) {
      try {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.text = `(function(container){ ${widget.jsCode} })(document.getElementById('widget-js-${widget.id}'));`
        jsContainerRef.current.appendChild(script)
        return () => {
          if (script.parentNode) script.parentNode.removeChild(script)
        }
      } catch (e) {
        console.error('Failed to run widget custom JS', e)
      }
    }
  }, [widget])

  // 1. 图片超链接卡片 (Image Banner)
  if (widget.cardType === 'image_banner') {
    if (!widget.imageUrl) {
      return (
        <Card className="text-muted-foreground border p-3 text-center text-xs shadow-xs">
          <ImageIcon className="mx-auto mb-1 size-5 opacity-50" />
          <span>
            {widget.title} (
            {t('resources.site.widgets.cards.custom.imageNotConfigured')})
          </span>
        </Card>
      )
    }

    return (
      <Card className="group overflow-hidden border shadow-xs">
        <a
          href={widget.targetUrl || '#'}
          target={widget.targetWindow || '_blank'}
          rel={widget.targetWindow === '_blank' ? 'noreferrer' : undefined}
          className="relative block overflow-hidden"
        >
          <img
            src={widget.imageUrl}
            alt={widget.title}
            className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isCompact ? 'h-20 sm:h-22' : 'h-28 sm:h-32'
            }`}
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-semibold drop-shadow-xs">
                <ImageIcon className="size-3" />
                {widget.title}
              </span>
              {widget.targetUrl && (
                <ExternalLink className="size-2.5 opacity-80" />
              )}
            </div>
            {widget.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-white/80">
                {widget.description}
              </p>
            )}
          </div>
        </a>
      </Card>
    )
  }

  // 2. 文本超链接集合卡片 (Link List)
  if (widget.cardType === 'link_list') {
    return (
      <Card className="border shadow-xs">
        <CardHeader
          className={`${isCompact ? 'p-2 px-2.5 pb-1' : 'p-3 pb-2'} ${showCardDividers ? 'border-b' : ''}`}
        >
          <CardTitle className="text-foreground flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Link2 className="text-primary size-3" />
              {widget.title}
            </span>
            {widget.description && (
              <span className="text-muted-foreground max-w-[120px] truncate text-[9px] font-normal">
                {widget.description}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className={isCompact ? 'p-2 px-2.5' : 'p-3 pt-2'}>
          {parsedLinks.length === 0 ? (
            <p className="text-muted-foreground py-2 text-center text-xs">
              {t('resources.site.widgets.cards.custom.noLinks')}
            </p>
          ) : (
            <div className="divide-border/50 divide-y">
              {parsedLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target={widget.targetWindow || '_blank'}
                  rel={
                    widget.targetWindow === '_blank' ? 'noreferrer' : undefined
                  }
                  className={`hover:text-primary text-muted-foreground group flex items-center justify-between transition-colors first:pt-0 last:pb-0 ${
                    isCompact ? 'py-1' : 'py-1.5'
                  }`}
                >
                  <span className="group-hover:text-foreground truncate pr-2 text-xs font-medium">
                    {item.title}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="h-3.5 px-1 py-0 text-[8px] sm:text-[9px]"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    <ExternalLink className="size-2 opacity-60 group-hover:opacity-100" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 3. 自定义 HTML / CSS 卡片 (Custom HTML)
  if (widget.cardType === 'custom_html') {
    return (
      <Card className="border shadow-xs">
        <CardHeader
          className={`${isCompact ? 'p-2 px-2.5 pb-1' : 'p-3 pb-2'} ${showCardDividers ? 'border-b' : ''}`}
        >
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
            <Code2 className="text-primary size-3" />
            {widget.title}
          </CardTitle>
          {widget.description && (
            <CardDescription className="text-[9px]">
              {widget.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className={isCompact ? 'p-2 px-2.5 pt-1.5' : 'p-3 pt-2'}>
          <div
            className="overflow-hidden text-xs leading-relaxed"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: renders admin-authored custom widget HTML
            dangerouslySetInnerHTML={{ __html: widget.customContent || '' }}
          />
        </CardContent>
      </Card>
    )
  }

  // 4. 自定义 JS 外部脚本挂件卡片 (Custom JS)
  if (widget.cardType === 'custom_js') {
    return (
      <Card className="border shadow-xs">
        <CardHeader
          className={`${isCompact ? 'p-2 px-2.5 pb-1' : 'p-3 pb-2'} ${showCardDividers ? 'border-b' : ''}`}
        >
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
            <Code2 className="size-3 text-amber-500" />
            {widget.title}
          </CardTitle>
          {widget.description && (
            <CardDescription className="text-[9px]">
              {widget.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className={isCompact ? 'p-2 px-2.5 pt-1.5' : 'p-3 pt-2'}>
          <div
            id={`widget-js-${widget.id}`}
            ref={jsContainerRef}
            className="min-h-6 text-xs"
          />
          {widget.customContent && (
            <div
              className="mt-1.5 text-xs leading-relaxed"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: renders admin-authored custom widget HTML
              dangerouslySetInnerHTML={{ __html: widget.customContent }}
            />
          )}
        </CardContent>
      </Card>
    )
  }

  // 5. 自定义 Markdown / 纯文本卡片 (Custom Text)
  return (
    <Card className="border shadow-xs">
      <CardHeader
        className={`${isCompact ? 'p-2 px-2.5 pb-1' : 'p-3 pb-2'} ${showCardDividers ? 'border-b' : ''}`}
      >
        <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
          <Sparkles className="text-primary size-3" />
          {widget.title}
        </CardTitle>
        {widget.description && (
          <CardDescription className="text-[9px]">
            {widget.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={isCompact ? 'p-2 px-2.5 pt-1.5' : 'p-3 pt-2'}>
        <div className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">
          {widget.customContent ||
            t('resources.site.widgets.cards.custom.noContent')}
        </div>
      </CardContent>
    </Card>
  )
}
