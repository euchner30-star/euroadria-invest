import React, { useState, useRef } from 'react';
import { FileDown, Loader2, AlertCircle, CheckCircle, Type, AlignLeft, Eye, X, RotateCcw } from 'lucide-react';
import WYSIWYGEditor from './WYSIWYGEditor';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PDFGenerator = ({ credentials }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const previewRef = useRef(null);

  const getEditorContent = () => {
    const editorEl = document.querySelector('[contenteditable="true"]');
    return editorEl ? editorEl.innerHTML : content;
  };

  const generatePdf = async (isPreview = false) => {
    const currentContent = getEditorContent();

    if (!title.trim()) {
      setError('Bitte geben Sie einen Titel ein.');
      return;
    }
    if (!currentContent || !currentContent.trim() || currentContent === '<br>' || currentContent === '<div><br></div>') {
      setError('Bitte geben Sie Inhalt ein.');
      return;
    }

    if (isPreview) setPreviewing(true);
    else setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/admin/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
        },
        body: JSON.stringify({ title, subtitle, content: currentContent, preview: isPreview })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || `Fehler ${response.status}`);
      }

      const blob = await response.blob();

      if (isPreview) {
        if (previewUrl) window.URL.revokeObjectURL(previewUrl);
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
      } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeTitle = title.replace(/[^a-zA-Z0-9äöüÄÖÜß\s_-]/g, '').replace(/\s+/g, '_');
        const date = new Date().toLocaleDateString('de-DE').replace(/\./g, '-');
        a.download = `EuroAdria_${safeTitle}_${date}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setSuccess('PDF wurde erfolgreich heruntergeladen!');
      }
    } catch (err) {
      setError(err.message || 'PDF-Generierung fehlgeschlagen.');
    } finally {
      setGenerating(false);
      setPreviewing(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) window.URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleReset = () => {
    setTitle('');
    setSubtitle('');
    setContent('');
    setError('');
    setSuccess('');
    closePreview();
  };

  return (
    <div className="space-y-5" data-testid="pdf-generator">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ea-dark">PDF Generator</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Professionelle PDFs im EuroAdria-Branding erstellen
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-ea-dark transition-colors"
          data-testid="pdf-reset-btn"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Zurücksetzen
        </button>
      </div>

      {/* Title & Subtitle Inputs */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-ea-dark mb-1.5">
            <Type className="w-4 h-4 text-[#C8A96A]" />
            Titel *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. B2B Partnerprogramm Montenegro"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C8A96A]/30 focus:border-[#C8A96A] outline-none transition-all text-ea-dark"
            data-testid="pdf-title-input"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-ea-dark mb-1.5">
            <AlignLeft className="w-4 h-4 text-[#C8A96A]" />
            Untertitel
            <span className="text-xs text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="z.B. Investmentmöglichkeiten für Unternehmer"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C8A96A]/30 focus:border-[#C8A96A] outline-none transition-all text-ea-dark"
            data-testid="pdf-subtitle-input"
          />
        </div>
      </div>

      {/* WYSIWYG Editor */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-semibold text-ea-dark mb-2">
          <FileDown className="w-4 h-4 text-[#C8A96A]" />
          Inhalt *
        </label>
        <WYSIWYGEditor
          key="pdf-generator-editor"
          value={content}
          onChange={setContent}
          placeholder="Schreiben oder einfügen (Gemini, ChatGPT etc. wird automatisch formatiert)..."
        />
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm" data-testid="pdf-error">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm" data-testid="pdf-success">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => generatePdf(true)}
          disabled={previewing || generating || !title.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#C8A96A] text-ea-dark rounded-xl font-medium hover:bg-[#C8A96A]/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          data-testid="pdf-preview-btn"
        >
          {previewing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Vorschau...</>
          ) : (
            <><Eye className="w-4 h-4 text-[#C8A96A]" /> Vorschau</>
          )}
        </button>

        <button
          onClick={() => generatePdf(false)}
          disabled={generating || previewing || !title.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-ea-dark text-white rounded-xl font-semibold hover:bg-ea-dark/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-ea-dark/10"
          data-testid="pdf-generate-btn"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generiert...</>
          ) : (
            <><FileDown className="w-4 h-4" /> PDF herunterladen</>
          )}
        </button>
      </div>

      {/* PDF Preview */}
      {previewUrl && (
        <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg" data-testid="pdf-preview-container">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-ea-dark">PDF Vorschau</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => generatePdf(false)}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-ea-dark text-white rounded-lg hover:bg-ea-dark/90 transition-all"
              >
                <FileDown className="w-3.5 h-3.5" />
                Herunterladen
              </button>
              <button
                onClick={closePreview}
                className="p-1 text-gray-400 hover:text-ea-dark transition-colors rounded-lg hover:bg-gray-100"
                data-testid="pdf-preview-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <iframe
            ref={previewRef}
            src={previewUrl}
            title="PDF Vorschau"
            className="w-full border-0"
            style={{ height: '700px' }}
          />
        </div>
      )}

      {/* Info Box */}
      <div className="bg-[#C8A96A]/5 border border-[#C8A96A]/15 rounded-xl p-3.5">
        <p className="text-xs text-ea-dark/50 leading-relaxed">
          <b className="text-ea-dark/70">Tipp:</b> Kopieren Sie Text aus Gemini, ChatGPT oder Google Docs — 
          Formatierungen wie <b>fett</b>, Überschriften und Listen werden automatisch erkannt. 
          Nutzen Sie die Vorschau um das Ergebnis vor dem Download zu prüfen.
        </p>
      </div>
    </div>
  );
};

export default PDFGenerator;
