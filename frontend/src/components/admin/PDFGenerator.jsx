import React, { useState } from 'react';
import { FileDown, Loader2, AlertCircle, CheckCircle, Type, AlignLeft } from 'lucide-react';
import WYSIWYGEditor from './WYSIWYGEditor';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PDFGenerator = ({ credentials }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGenerate = async () => {
    // Get content directly from editor DOM to avoid debounce timing issues
    const editorEl = document.querySelector('[contenteditable="true"]');
    const currentContent = editorEl ? editorEl.innerHTML : content;

    if (!title.trim()) {
      setError('Bitte geben Sie einen Titel ein.');
      return;
    }
    if (!currentContent || !currentContent.trim() || currentContent === '<br>' || currentContent === '<div><br></div>') {
      setError('Bitte geben Sie Inhalt ein.');
      return;
    }

    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/admin/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
        },
        body: JSON.stringify({ title, subtitle, content: currentContent })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || `Fehler ${response.status}`);
      }

      const blob = await response.blob();
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
      setSuccess('PDF wurde erfolgreich generiert und heruntergeladen!');
    } catch (err) {
      setError(err.message || 'PDF-Generierung fehlgeschlagen.');
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setSubtitle('');
    setContent('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-6" data-testid="pdf-generator">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ea-dark">PDF Generator</h2>
          <p className="text-sm text-gray-500 mt-1">
            Erstellen Sie professionelle PDFs im EuroAdria-Branding
          </p>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-gray-400 hover:text-ea-dark transition-colors"
          data-testid="pdf-reset-btn"
        >
          Zurücksetzen
        </button>
      </div>

      {/* Title Input */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-ea-dark mb-2">
              <Type className="w-4 h-4 text-ea-gold" />
              Titel *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. B2B Partnerprogramm Montenegro"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ea-gold/30 focus:border-ea-gold outline-none transition-all text-ea-dark"
              data-testid="pdf-title-input"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-ea-dark mb-2">
              <AlignLeft className="w-4 h-4 text-ea-gold" />
              Untertitel
              <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="z.B. Investmentmöglichkeiten für Unternehmer"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ea-gold/30 focus:border-ea-gold outline-none transition-all text-ea-dark"
              data-testid="pdf-subtitle-input"
            />
          </div>
        </div>
      </div>

      {/* WYSIWYG Editor */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-semibold text-ea-dark mb-3">
          <FileDown className="w-4 h-4 text-ea-gold" />
          Inhalt *
        </label>
        <WYSIWYGEditor
          key="pdf-generator-editor"
          value={content}
          onChange={setContent}
          placeholder="Schreiben Sie hier Ihren Text... Nutzen Sie die Toolbar für Überschriften, Listen, fetten Text usw."
        />
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm" data-testid="pdf-error">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm" data-testid="pdf-success">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Generate Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleGenerate}
          disabled={generating || !title.trim()}
          className="flex items-center gap-3 px-8 py-3.5 bg-ea-dark text-white rounded-xl font-semibold hover:bg-ea-dark/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-ea-dark/10"
          data-testid="pdf-generate-btn"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              PDF wird generiert...
            </>
          ) : (
            <>
              <FileDown className="w-5 h-5" />
              PDF generieren & herunterladen
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-ea-gold/5 border border-ea-gold/20 rounded-xl p-4">
        <p className="text-xs text-ea-dark/60 leading-relaxed">
          <b className="text-ea-dark/80">Hinweis:</b> Das PDF wird automatisch im EuroAdria-Branding erstellt — 
          mit Logo, Firmenfarben und professionellem Layout. Nutzen Sie Überschriften (H1, H2, H3), 
          Aufzählungen, fetten und kursiven Text für eine optimale Darstellung.
        </p>
      </div>
    </div>
  );
};

export default PDFGenerator;
