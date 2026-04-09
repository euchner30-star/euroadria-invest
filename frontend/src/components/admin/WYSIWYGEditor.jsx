import React, { useRef, useCallback, useState, useEffect } from 'react';
import { 
  Bold, Italic, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Link2, Undo, Redo,
  HelpCircle
} from 'lucide-react';

// Tooltip Component — only shows on devices that support hover (no touch flicker)
const Tooltip = ({ text, children }) => (
  <div className="relative group inline-flex items-center">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-ea-dark text-white text-xs rounded-lg opacity-0 invisible [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:visible transition-all whitespace-nowrap z-50 max-w-xs pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ea-dark"></div>
    </div>
  </div>
);

// Help Icon with Tooltip
const HelpTooltip = ({ text }) => (
  <Tooltip text={text}>
    <HelpCircle className="w-4 h-4 text-ea-dark/40 hover:text-ea-gold cursor-help ml-1" />
  </Tooltip>
);

// WYSIWYG Editor Component with History
const WYSIWYGEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [history, setHistory] = useState(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedo = useRef(false);
  const saveTimeout = useRef(null);
  const isInitialized = useRef(false);
  const onChangeRef = useRef(onChange);
  const onChangeTimer = useRef(null);
  const lastSelectionRef = useRef(null);

  // Keep onChange ref in sync without causing re-renders
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize editor with value only once
  useEffect(() => {
    if (editorRef.current && value && !isInitialized.current) {
      editorRef.current.innerHTML = value;
      setHistory([value]);
      isInitialized.current = true;
    }
  }, [value]);

  // Debounced onChange - prevents React re-renders from disrupting cursor
  const notifyParent = useCallback((content) => {
    if (onChangeTimer.current) clearTimeout(onChangeTimer.current);
    onChangeTimer.current = setTimeout(() => {
      if (onChangeRef.current) onChangeRef.current(content);
    }, 300);
  }, []);

  // Save to history (debounced)
  const saveToHistory = useCallback((content) => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }
    
    // Clear existing timeout
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(() => {
      setHistory(prev => {
        // Remove future history if we're not at the end
        const newHistory = prev.slice(0, historyIndex + 1);
        // Don't save if content is same as last
        if (newHistory[newHistory.length - 1] === content) {
          return newHistory;
        }
        // Keep max 50 history entries
        const updated = [...newHistory, content];
        if (updated.length > 50) {
          updated.shift();
        }
        return updated;
      });
      setHistoryIndex(prev => {
        const newIndex = prev + 1;
        return Math.min(newIndex, 49);
      });
    }, 800);
  }, [historyIndex]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedo.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousContent = history[newIndex];
      if (editorRef.current) {
        editorRef.current.innerHTML = previousContent;
      }
      if (onChange) {
        onChange(previousContent);
      }
    }
  }, [history, historyIndex, onChange]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextContent = history[newIndex];
      if (editorRef.current) {
        editorRef.current.innerHTML = nextContent;
      }
      if (onChange) {
        onChange(nextContent);
      }
    }
  }, [history, historyIndex, onChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Execute formatting command
  const execCommand = useCallback((command, value = null) => {
    const editor = editorRef.current;
    // Restore selection if lost (mobile: tapping toolbar steals focus)
    const selection = window.getSelection();
    if (editor && (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode))) {
      if (lastSelectionRef.current && editor.contains(lastSelectionRef.current.startContainer)) {
        selection.removeAllRanges();
        selection.addRange(lastSelectionRef.current);
      } else {
        editor.focus();
      }
    }
    document.execCommand(command, false, value);
    editor?.focus();
    // Trigger onChange with new content (debounced)
    if (editor) {
      const newContent = editor.innerHTML;
      notifyParent(newContent);
      saveToHistory(newContent);
    }
  }, [notifyParent, saveToHistory]);

  // Format as heading — reliable direct DOM replacement (no execCommand quirks)
  const formatHeading = useCallback((level) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Restore selection if lost (mobile: tapping toolbar steals focus)
    let selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) {
      if (lastSelectionRef.current && editor.contains(lastSelectionRef.current.startContainer)) {
        selection.removeAllRanges();
        selection.addRange(lastSelectionRef.current);
      } else {
        editor.focus();
        return;
      }
    }

    const range = selection.getRangeAt(0);

    // Find the node containing the cursor/selection start
    let node = range.startContainer;
    if (node.nodeType === 3) node = node.parentNode;

    // Walk up to find the direct child of editor that contains the cursor
    let block = null;
    for (const child of editor.childNodes) {
      if (child === node || (child.contains && child.contains(node))) {
        block = child;
        break;
      }
    }

    // Handle bare text nodes that are direct children of editor
    if (!block) {
      for (const child of editor.childNodes) {
        if (child.nodeType === 3 && child === range.startContainer) {
          const p = document.createElement('p');
          child.parentNode.insertBefore(p, child);
          p.appendChild(child);
          block = p;
          break;
        }
      }
    }

    // Handle cursor at editor level
    if (!block && (node === editor || node.parentNode === editor)) {
      document.execCommand('formatBlock', false, `h${level}`);
      editor.focus();
      const newContent = editor.innerHTML;
      notifyParent(newContent);
      saveToHistory(newContent);
      return;
    }

    // Fallback: use execCommand
    if (!block) {
      document.execCommand('formatBlock', false, `h${level}`);
      editor.focus();
      const newContent = editor.innerHTML;
      notifyParent(newContent);
      saveToHistory(newContent);
      return;
    }

    // If the block is a text node, wrap it
    if (block.nodeType === 3) {
      const p = document.createElement('p');
      block.parentNode.insertBefore(p, block);
      p.appendChild(block);
      block = p;
    }

    const targetTag = `H${level}`;

    // Toggle: if already this heading level, revert to <p>
    const newTag = block.nodeName === targetTag ? 'p' : `h${level}`;
    const newEl = document.createElement(newTag);
    newEl.innerHTML = block.innerHTML;
    block.replaceWith(newEl);

    // Restore cursor inside the new element
    const newRange = document.createRange();
    newRange.selectNodeContents(newEl);
    newRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(newRange);

    editor.focus();
    const newContent = editor.innerHTML;
    notifyParent(newContent);
    saveToHistory(newContent);
  }, [notifyParent, saveToHistory]);

  // Handle content change - preserve cursor position naturally
  const handleInput = () => {
    // Mark as initialized on first user input to prevent useEffect overwriting content
    isInitialized.current = true;
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      notifyParent(newContent);
      saveToHistory(newContent);
    }
  };

  // Track selection changes so toolbar buttons can restore it on mobile
  useEffect(() => {
    const trackSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current) {
        const range = sel.getRangeAt(0);
        if (editorRef.current.contains(range.startContainer)) {
          lastSelectionRef.current = range.cloneRange();
        }
      }
    };
    document.addEventListener('selectionchange', trackSelection);
    return () => document.removeEventListener('selectionchange', trackSelection);
  }, []);

  // Handle focus - do NOT move cursor on mobile to prevent backward text issue
  const handleFocus = () => {
    // Intentionally empty - let browser handle cursor naturally
    // Moving cursor to end on focus causes backward text on mobile
  };

  // ── Smart Paste: Rich HTML + Markdown auto-detection ──────────────────

  // Clean pasted HTML — keep formatting, remove junk styles/classes
  const cleanPastedHtml = useCallback((html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    // Remove script, style, meta, link elements
    doc.querySelectorAll('script, style, meta, link, svg, img').forEach(el => el.remove());

    const allowed = new Set([
      'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'A', 'BR', 'HR',
      'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV',
      'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'CODE'
    ]);

    const clean = (node) => {
      if (node.nodeType === 3) return; // text node — keep
      if (node.nodeType !== 1) { node.remove(); return; }

      // Remove all attributes except href on <a>
      const tag = node.tagName;
      const attrs = [...node.attributes];
      attrs.forEach(a => {
        if (!(tag === 'A' && a.name === 'href')) node.removeAttribute(a.name);
      });

      // Unwrap non-allowed tags (keep their children)
      if (!allowed.has(tag)) {
        const parent = node.parentNode;
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
        return;
      }

      // Recurse into children (copy array since DOM changes during iteration)
      [...node.childNodes].forEach(clean);
    };

    [...doc.body.childNodes].forEach(clean);
    return doc.body.innerHTML;
  }, []);

  // Convert markdown-style plain text to HTML
  const markdownToHtml = useCallback((text) => {
    const lines = text.split('\n');
    const result = [];
    let inUl = false;
    let inOl = false;

    const closeList = () => {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
    };

    // Convert inline markdown + auto-bold labels before colons
    const inlineFormat = (line) => {
      let formatted = line
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        .replace(/__(.+?)__/g, '<b>$1</b>')
        .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<i>$1</i>')
        .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<i>$1</i>');
      return formatted;
    };

    // Auto-bold: "Label: rest of text" → "<b>Label:</b> rest of text"
    const autoBoldLabel = (line) => {
      // If line starts with 1-4 words followed by a colon, bold the label
      const labelMatch = line.match(/^([A-ZÄÖÜa-zäöüß][\w\-äöüÄÖÜß]*(?:\s+[\w\-äöüÄÖÜß]+){0,3}):\s+(.+)/);
      if (labelMatch && !line.includes('<b>')) {
        return `<b>${labelMatch[1]}:</b> ${labelMatch[2]}`;
      }
      return line;
    };

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const trimmed = raw.trim();

      if (!trimmed) {
        closeList();
        continue;
      }

      // Headings: # ## ###
      const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
      if (headingMatch) {
        closeList();
        const lvl = headingMatch[1].length;
        result.push(`<h${lvl}>${inlineFormat(headingMatch[2])}</h${lvl}>`);
        continue;
      }

      // "Seite N:" pattern → H2 heading
      const seiteMatch = trimmed.match(/^Seite\s+\d+[:\.]?\s*(.+)/i);
      if (seiteMatch) {
        closeList();
        result.push(`<h2>${inlineFormat(trimmed)}</h2>`);
        continue;
      }

      // Standalone label on its own line (e.g. "Inhalt:" or "Fazit:")
      const standaloneLabel = trimmed.match(/^([A-ZÄÖÜa-zäöüß][\w\-äöüÄÖÜß]*):$/);
      if (standaloneLabel) {
        closeList();
        result.push(`<p><b>${standaloneLabel[1]}:</b></p>`);
        continue;
      }

      // Bullet list: - item, * item, • item, ‣ item
      const bulletMatch = trimmed.match(/^[-*•‣]\s+(.+)/);
      if (bulletMatch) {
        if (inOl) { result.push('</ol>'); inOl = false; }
        if (!inUl) { result.push('<ul>'); inUl = true; }
        result.push(`<li>${autoBoldLabel(inlineFormat(bulletMatch[1]))}</li>`);
        continue;
      }

      // Numbered section heading: "1. Short Title" (short, no period at end)
      const numberedHeading = trimmed.match(/^(\d+)\.\s+(.+)/);
      if (numberedHeading) {
        const content = numberedHeading[2];
        const isShort = content.length < 70 && !content.endsWith('.');
        if (isShort) {
          closeList();
          result.push(`<h3>${numberedHeading[1]}. ${inlineFormat(content)}</h3>`);
          continue;
        }
        // Long numbered item → ordered list
        if (inUl) { result.push('</ul>'); inUl = false; }
        if (!inOl) { result.push('<ol>'); inOl = true; }
        result.push(`<li>${autoBoldLabel(inlineFormat(content))}</li>`);
        continue;
      }

      // Standalone bold line: **Title** or entirely bold → heading
      const boldLine = trimmed.match(/^\*\*(.+)\*\*$/);
      if (boldLine && trimmed.length < 100) {
        closeList();
        result.push(`<h2>${boldLine[1]}</h2>`);
        continue;
      }

      // Regular paragraph — still apply auto-bold for "Label: text" patterns
      closeList();
      result.push(`<p>${autoBoldLabel(inlineFormat(trimmed))}</p>`);
    }

    closeList();
    return result.join('');
  }, []);

  // Handle paste - rich HTML or smart markdown detection
  const handlePaste = (e) => {
    e.preventDefault();

    const html = e.clipboardData.getData('text/html');
    const plainText = e.clipboardData.getData('text/plain');

    if (html && html.trim()) {
      // Rich paste — clean and insert HTML
      const cleaned = cleanPastedHtml(html);
      document.execCommand('insertHTML', false, cleaned);
    } else if (plainText) {
      // Plain text — detect markdown patterns and convert
      const converted = markdownToHtml(plainText);
      document.execCommand('insertHTML', false, converted);
    }

    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      notifyParent(newContent);
      saveToHistory(newContent);
    }
  };

  // Handle Enter key for new lines
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (e.shiftKey) {
        // Shift+Enter = line break <br>
        document.execCommand('insertLineBreak');
      } else {
        // Enter = new paragraph
        document.execCommand('insertParagraph');
      }
      
      // Update content after Enter
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        notifyParent(newContent);
        saveToHistory(newContent);
      }
    }
  };

  // Toolbar Button Component
  const ToolbarButton = ({ onClick, icon: Icon, tooltip, disabled }) => (
    <Tooltip text={tooltip}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded transition-colors ${
          disabled 
            ? 'text-ea-dark/20 cursor-not-allowed' 
            : 'text-ea-dark/70 hover:bg-ea-gold/20 hover:text-ea-gold'
        }`}
      >
        <Icon className="w-4 h-4" />
      </button>
    </Tooltip>
  );

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar — scrollable on mobile, wraps on desktop. preventDefault stops focus theft */}
      <div
        className="flex items-center gap-0.5 md:gap-1 md:flex-wrap p-1.5 md:p-2 bg-ea-light border-b border-gray-200 overflow-x-auto scrollbar-hide"
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => { /* allow scroll but mark for focus keep */ }}
      >
        {/* Text Formatting */}
        <div className="flex items-center gap-0.5 md:gap-1 pr-1 md:pr-2 md:border-r md:border-gray-300 shrink-0">
          <ToolbarButton 
            onClick={() => execCommand('bold')} 
            icon={Bold} 
            tooltip="Fett (Strg+B)" 
          />
          <ToolbarButton 
            onClick={() => execCommand('italic')} 
            icon={Italic} 
            tooltip="Kursiv (Strg+I)" 
          />
        </div>

        {/* Headings & Text Size */}
        <div className="flex items-center gap-0.5 md:gap-1 px-1 md:px-2 md:border-r md:border-gray-300 shrink-0">
          <button
            type="button"
            onClick={() => formatHeading(1)}
            className="px-1.5 md:px-2 py-1 text-xs md:text-sm font-bold rounded hover:bg-ea-gold/20 text-ea-dark/70"
            data-testid="editor-h1-btn"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => formatHeading(2)}
            className="px-1.5 md:px-2 py-1 text-xs md:text-sm font-bold rounded hover:bg-ea-gold/20 text-ea-dark/70"
            data-testid="editor-h2-btn"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => formatHeading(3)}
            className="px-1.5 md:px-2 py-1 text-xs md:text-sm font-bold rounded hover:bg-ea-gold/20 text-ea-dark/70"
            data-testid="editor-h3-btn"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'p')}
            className="px-1.5 md:px-2 py-1 text-xs font-medium rounded hover:bg-ea-gold/20 text-ea-dark/70 bg-gray-100"
            data-testid="editor-normal-btn"
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => execCommand('fontSize', '2')}
            className="px-1.5 md:px-2 py-1 text-xs rounded hover:bg-ea-gold/20 text-ea-dark/70"
            data-testid="editor-small-btn"
          >
            Klein
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 md:gap-1 px-1 md:px-2 md:border-r md:border-gray-300 shrink-0">
          <ToolbarButton 
            onClick={() => execCommand('insertUnorderedList')} 
            icon={List} 
            tooltip="Aufzählungsliste" 
          />
          <ToolbarButton 
            onClick={() => execCommand('insertOrderedList')} 
            icon={ListOrdered} 
            tooltip="Nummerierte Liste" 
          />
        </div>

        {/* Quote & Link & Page Break */}
        <div className="flex items-center gap-0.5 md:gap-1 px-1 md:px-2 md:border-r md:border-gray-300 shrink-0">
          <ToolbarButton 
            onClick={() => execCommand('formatBlock', 'blockquote')} 
            icon={Quote} 
            tooltip="Zitat-Block" 
          />
          <button
            type="button"
            onClick={() => {
              const url = prompt('URL eingeben:');
              if (url) execCommand('createLink', url);
            }}
            className="p-1.5 md:p-2 rounded hover:bg-ea-gold/20 text-ea-dark/70"
            data-testid="editor-link-btn"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              document.execCommand('insertHTML', false,
                '<div data-pagebreak="true" contenteditable="false" style="border-top:2px dashed #C8A96A;text-align:center;padding:8px 0;margin:16px 0;color:#C8A96A;font-size:12px;user-select:none;">--- Seitenumbruch ---</div><p><br></p>'
              );
              if (editorRef.current) {
                const c = editorRef.current.innerHTML;
                notifyParent(c);
                saveToHistory(c);
              }
            }}
            className="p-1.5 md:p-2 rounded hover:bg-ea-gold/20 text-ea-dark/70"
            data-testid="editor-pagebreak-btn"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h4m10 0h4M8 12h8" /><path d="M3 4v4m0 8v4M21 4v4m0 8v4" />
            </svg>
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 md:gap-1 pl-1 md:pl-2 shrink-0">
          <ToolbarButton 
            onClick={handleUndo} 
            icon={Undo} 
            tooltip={`Rückgängig (Strg+Z)${canUndo ? '' : ' - Keine Änderungen'}`}
            disabled={!canUndo}
          />
          <ToolbarButton 
            onClick={handleRedo} 
            icon={Redo} 
            tooltip={`Wiederholen (Strg+Y)${canRedo ? '' : ' - Nichts zu wiederholen'}`}
            disabled={!canRedo}
          />
          <span className="hidden md:inline text-xs text-ea-dark/40 ml-1">
            {historyIndex + 1}/{history.length}
          </span>
        </div>
      </div>

      {/* Editor Area with Live Preview Styles */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        dir="ltr"
        className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none text-left
          [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-ea-dark [&>h1]:mb-4 [&>h1]:mt-6
          [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:text-ea-dark [&>h2]:mb-3 [&>h2]:mt-5
          [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-ea-dark [&>h3]:mb-2 [&>h3]:mt-4
          [&>p]:text-base [&>p]:text-ea-dark/80 [&>p]:mb-4 [&>p]:leading-relaxed
          [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4
          [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4
          [&>blockquote]:border-l-4 [&>blockquote]:border-ea-gold [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-ea-dark/70 [&>blockquote]:my-4
          [&>a]:text-ea-gold [&>a]:underline
          [&_strong]:font-bold [&_em]:italic"
        data-placeholder={placeholder}
        style={{ 
          minHeight: '300px',
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'normal',
          writingMode: 'horizontal-tb'
        }}
      />

      {/* Helper Text */}
      <div className="px-3 md:px-4 py-2 bg-ea-light/50 border-t border-gray-100 text-xs text-ea-dark/50">
        <span className="hidden md:inline">Enter = Neuer Absatz | Shift+Enter = Zeilenumbruch | Strg+B = Fett | Strg+I = Kursiv</span>
        <span className="md:hidden">Enter = Absatz | Strg+B = Fett</span>
      </div>
    </div>
  );
};

// Form Field with Label and Tooltip
export const FormField = ({ label, tooltip, required, children, className = '' }) => (
  <div className={className}>
    <label className="flex items-center text-ea-dark text-sm font-medium mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
      {tooltip && <HelpTooltip text={tooltip} />}
    </label>
    {children}
  </div>
);

// Slug Generator Function
export const generateSlug = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // German umlauts
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    // Remove special characters
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove multiple hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');
};

// Convert HTML to clean format for storage
export const htmlToCleanContent = (html) => {
  if (!html) return '';
  
  // Create a temporary element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Convert to clean text with markdown-like markers for backend
  let content = '';
  
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      content += node.textContent;
      return;
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      
      switch(tag) {
        case 'h1':
          content += '\n## ' + node.textContent + '\n';
          break;
        case 'h2':
          content += '\n### ' + node.textContent + '\n';
          break;
        case 'h3':
          content += '\n#### ' + node.textContent + '\n';
          break;
        case 'p':
          content += '\n' + node.textContent + '\n';
          break;
        case 'strong':
        case 'b':
          content += '**' + node.textContent + '**';
          break;
        case 'em':
        case 'i':
          content += '*' + node.textContent + '*';
          break;
        case 'ul':
          node.childNodes.forEach(li => {
            if (li.tagName?.toLowerCase() === 'li') {
              content += '\n- ' + li.textContent;
            }
          });
          content += '\n';
          break;
        case 'ol':
          let num = 1;
          node.childNodes.forEach(li => {
            if (li.tagName?.toLowerCase() === 'li') {
              content += '\n' + num + '. ' + li.textContent;
              num++;
            }
          });
          content += '\n';
          break;
        case 'blockquote':
          content += '\n> ' + node.textContent + '\n';
          break;
        case 'a':
          content += '[' + node.textContent + '](' + node.getAttribute('href') + ')';
          break;
        case 'br':
          content += '\n';
          break;
        default:
          node.childNodes.forEach(processNode);
      }
    }
  };
  
  temp.childNodes.forEach(processNode);
  
  return content.trim();
};

// Convert stored content to HTML for editor
export const contentToHtml = (content) => {
  if (!content) return '';
  
  let html = content;
  
  // Convert headers
  html = html.replace(/^#### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^### (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^## (.+)$/gm, '<h1>$1</h1>');
  
  // Convert bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  
  // Convert blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  
  // Convert bullet lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // Convert paragraphs (lines that aren't already wrapped)
  html = html.split('\n\n').map(para => {
    if (para.trim() && !para.startsWith('<')) {
      return `<p>${para}</p>`;
    }
    return para;
  }).join('');
  
  return html;
};

export default WYSIWYGEditor;
