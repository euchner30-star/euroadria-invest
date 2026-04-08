import React, { useRef, useCallback, useState, useEffect } from 'react';
import { 
  Bold, Italic, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Link2, Undo, Redo,
  HelpCircle
} from 'lucide-react';

// Tooltip Component
const Tooltip = ({ text, children }) => (
  <div className="relative group inline-flex items-center">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-ea-dark text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 max-w-xs">
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
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    // Trigger onChange with new content (debounced)
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      notifyParent(newContent);
      saveToHistory(newContent);
    }
  }, [notifyParent, saveToHistory]);

  // Format as heading
  const formatHeading = (level) => {
    execCommand('formatBlock', `h${level}`);
  };

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

  // Handle focus - do NOT move cursor on mobile to prevent backward text issue
  const handleFocus = () => {
    // Intentionally empty - let browser handle cursor naturally
    // Moving cursor to end on focus causes backward text on mobile
  };

  // Handle paste - clean up formatting
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
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
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-ea-light border-b border-gray-200">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
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
        <div className="flex items-center gap-1 px-2 border-r border-gray-300">
          <Tooltip text="H1 = Hauptüberschrift für SEO/GEO. Nur 1x pro Artikel verwenden!">
            <button
              type="button"
              onClick={() => formatHeading(1)}
              className="px-2 py-1 text-sm font-bold rounded hover:bg-ea-gold/20 text-ea-dark/70"
            >
              H1
            </button>
          </Tooltip>
          <Tooltip text="H2 = Sektions-Überschrift. Für Hauptabschnitte verwenden.">
            <button
              type="button"
              onClick={() => formatHeading(2)}
              className="px-2 py-1 text-sm font-bold rounded hover:bg-ea-gold/20 text-ea-dark/70"
            >
              H2
            </button>
          </Tooltip>
          <Tooltip text="H3 = Unter-Überschrift. Für Unterabschnitte verwenden.">
            <button
              type="button"
              onClick={() => formatHeading(3)}
              className="px-2 py-1 text-sm font-bold rounded hover:bg-ea-gold/20 text-ea-dark/70"
            >
              H3
            </button>
          </Tooltip>
          <Tooltip text="Normaler Fließtext (Standard-Größe)">
            <button
              type="button"
              onClick={() => execCommand('formatBlock', 'p')}
              className="px-2 py-1 text-xs font-medium rounded hover:bg-ea-gold/20 text-ea-dark/70 bg-gray-100"
            >
              Normal
            </button>
          </Tooltip>
          <Tooltip text="Kleiner Text (für Hinweise, Fußnoten, Disclaimer)">
            <button
              type="button"
              onClick={() => execCommand('fontSize', '2')}
              className="px-2 py-1 text-xs rounded hover:bg-ea-gold/20 text-ea-dark/70"
            >
              Klein
            </button>
          </Tooltip>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-300">
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

        {/* Quote & Link */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-300">
          <ToolbarButton 
            onClick={() => execCommand('formatBlock', 'blockquote')} 
            icon={Quote} 
            tooltip="Zitat-Block (für wichtige Aussagen)" 
          />
          <Tooltip text="Link einfügen">
            <button
              type="button"
              onClick={() => {
                const url = prompt('URL eingeben:');
                if (url) execCommand('createLink', url);
              }}
              className="p-2 rounded hover:bg-ea-gold/20 text-ea-dark/70"
            >
              <Link2 className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 pl-2">
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
          <span className="text-xs text-ea-dark/40 ml-2">
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
      <div className="px-4 py-2 bg-ea-light/50 border-t border-gray-100 text-xs text-ea-dark/50">
        💡 Enter = Neuer Absatz | Shift+Enter = Zeilenumbruch | Strg+B = Fett | Strg+I = Kursiv
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
