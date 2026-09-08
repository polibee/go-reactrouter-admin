/**
 * Lightweight bidirectional HTML <-> Markdown converter for TipTap Editor.
 * Zero external dependencies, SSR-safe, handles headings, lists, tables,
 * links, images, blockquotes, codeblocks, formatting, and paragraphs.
 */

export function htmlToMarkdown(html: string): string {
  if (!html || !html.trim()) return ''

  let md = html

  // Remove script and style tags completely
  md = md.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  md = md.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // Pre / Code blocks
  md = md.replace(
    /<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/gi,
    (_, lang, code) => {
      const unescaped = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
      return `\n\n\`\`\`${lang || ''}\n${unescaped.trim()}\n\`\`\`\n\n`
    },
  )

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows: string[][] = []
    const rowMatches = tableContent.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const r of rowMatches) {
      const cells: string[] = []
      const cellMatches =
        r.match(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi) || []
      for (const c of cellMatches) {
        const text = c
          .replace(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi, '$1')
          .replace(/<[^>]+>/g, '')
          .trim()
        cells.push(text)
      }
      if (cells.length > 0) rows.push(cells)
    }

    if (rows.length === 0) return ''

    let tableMd = '\n\n'
    tableMd += `| ${rows[0].join(' | ')} |\n`
    tableMd += `| ${rows[0].map(() => '---').join(' | ')} |\n`
    for (let i = 1; i < rows.length; i++) {
      tableMd += `| ${rows[i].join(' | ')} |\n`
    }
    tableMd += '\n'
    return tableMd
  })

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n')
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n')
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n\n##### $1\n\n')
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n\n###### $1\n\n')

  // Blockquotes
  md = md.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    (_, content) => {
      const lines = content
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '\n')
        .trim()
        .split('\n')
      return `\n\n${lines.map((l: string) => `> ${l.trim()}`).join('\n')}\n\n`
    },
  )

  // Images
  md = md.replace(
    /<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
    '![$2]($1)',
  )
  md = md.replace(
    /<img[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*\/?>/gi,
    '![$1]($2)',
  )
  md = md.replace(/<img[^>]*src="([^"]+)"[^>]*\/?>/gi, '![]($1)')

  // Links
  md = md.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')

  // Unordered list
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []
    return (
      '\n\n' +
      items
        .map((item: string) => {
          const clean = item
            .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '$1')
            .replace(/<[^>]+>/g, '')
            .trim()
          return `- ${clean}`
        })
        .join('\n') +
      '\n\n'
    )
  })

  // Ordered list
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []
    return (
      '\n\n' +
      items
        .map((item: string, idx: number) => {
          const clean = item
            .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '$1')
            .replace(/<[^>]+>/g, '')
            .trim()
          return `${idx + 1}. ${clean}`
        })
        .join('\n') +
      '\n\n'
    )
  })

  // Inline formatting
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
  md = md.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, '~~$1~~')
  md = md.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, '~~$1~~')
  md = md.replace(/<strike[^>]*>([\s\S]*?)<\/strike>/gi, '~~$1~~')
  md = md.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '<u>$1</u>')
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
  md = md.replace(/<hr[^>]*\/?>/gi, '\n\n---\n\n')

  // Paragraphs and breaks
  md = md.replace(/<br\s*\/?>/gi, '\n')
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n')

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '')

  // Clean excessive blank lines
  md = md.replace(/\n{3,}/g, '\n\n')

  return md.trim()
}

export function markdownToHtml(md: string): string {
  if (!md || !md.trim()) return ''

  const lines = md.split('\n')
  const htmlChunks: string[] = []
  let inCodeBlock = false
  let codeBlockLang = ''
  let codeBlockLines: string[] = []
  let inTable = false
  let tableRows: string[][] = []

  const flushTable = () => {
    if (!inTable || tableRows.length === 0) return
    let tableHtml =
      '<table class="border-collapse table-auto w-full my-4 border text-xs">'
    if (tableRows.length > 0) {
      tableHtml += '<thead><tr>'
      for (const th of tableRows[0]) {
        tableHtml += `<th class="border bg-muted/50 font-semibold p-2 text-left">${th}</th>`
      }
      tableHtml += '</tr></thead>'
    }
    if (tableRows.length > 1) {
      tableHtml += '<tbody>'
      for (let i = 1; i < tableRows.length; i++) {
        tableHtml += '<tr>'
        for (const td of tableRows[i]) {
          tableHtml += `<td class="border p-2">${td}</td>`
        }
        tableHtml += '</tr>'
      }
      tableHtml += '</tbody>'
    }
    tableHtml += '</table>'
    htmlChunks.push(tableHtml)
    inTable = false
    tableRows = []
  }

  const flushCodeBlock = () => {
    if (!inCodeBlock) return
    const codeContent = codeBlockLines
      .join('\n')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    htmlChunks.push(
      `<pre><code${codeBlockLang ? ` class="language-${codeBlockLang}"` : ''}>${codeContent}</code></pre>`,
    )
    inCodeBlock = false
    codeBlockLang = ''
    codeBlockLines = []
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    // Fenced Code Block
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock()
      } else {
        flushTable()
        inCodeBlock = true
        codeBlockLang = trimmed.slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine)
      continue
    }

    // Markdown Table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (/^\|(?:\s*:?-+:?\s*\|)+$/.test(trimmed)) {
        continue
      }
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim())
      inTable = true
      tableRows.push(cells)
      continue
    } else if (inTable) {
      flushTable()
    }

    if (!trimmed) {
      continue
    }

    // Horizontal Rule
    if (/^(?:---|\*\*\*|___)$/.test(trimmed)) {
      htmlChunks.push('<hr />')
      continue
    }

    // Headings
    if (trimmed.startsWith('###### ')) {
      htmlChunks.push(`<h6>${formatInline(trimmed.slice(7))}</h6>`)
      continue
    }
    if (trimmed.startsWith('##### ')) {
      htmlChunks.push(`<h5>${formatInline(trimmed.slice(6))}</h5>`)
      continue
    }
    if (trimmed.startsWith('#### ')) {
      htmlChunks.push(`<h4>${formatInline(trimmed.slice(5))}</h4>`)
      continue
    }
    if (trimmed.startsWith('### ')) {
      htmlChunks.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`)
      continue
    }
    if (trimmed.startsWith('## ')) {
      htmlChunks.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`)
      continue
    }
    if (trimmed.startsWith('# ')) {
      htmlChunks.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`)
      continue
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      htmlChunks.push(
        `<blockquote><p>${formatInline(trimmed.slice(2))}</p></blockquote>`,
      )
      continue
    }

    // Bullet List item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      htmlChunks.push(`<ul><li>${formatInline(trimmed.slice(2))}</li></ul>`)
      continue
    }

    // Numbered List item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (numMatch) {
      htmlChunks.push(`<ol><li>${formatInline(numMatch[2])}</li></ol>`)
      continue
    }

    // Paragraph
    htmlChunks.push(`<p>${formatInline(trimmed)}</p>`)
  }

  if (inCodeBlock) flushCodeBlock()
  if (inTable) flushTable()

  let result = htmlChunks.join('')
  result = result.replace(/<\/ul><ul>/g, '')
  result = result.replace(/<\/ol><ol>/g, '')

  return result
}

function formatInline(str: string): string {
  let s = str
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
  )
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  s = s.replace(/~~([^~]+)~~/g, '<s>$1</s>')
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>')

  return s
}
