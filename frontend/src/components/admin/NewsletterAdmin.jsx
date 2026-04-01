import React, { useState, useEffect } from 'react';
import { Send, Users, Mail, Loader2, CheckCircle, Download, AlertCircle } from 'lucide-react';
import WYSIWYGEditor from './WYSIWYGEditor';

const NewsletterAdmin = ({ credentials }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [totalSubs, setTotalSubs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/newsletter/subscribers`, {
        headers: { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
        setTotalSubs(data.total || 0);
      }
    } catch (err) {
      console.error('Fetch subscribers failed:', err);
    }
    setLoading(false);
  };

  const handleSendNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      setSendStatus({ type: 'error', message: 'Betreff und Inhalt sind erforderlich!' });
      return;
    }
    if (totalSubs === 0) {
      setSendStatus({ type: 'error', message: 'Keine Abonnenten vorhanden!' });
      return;
    }
    
    const confirmed = window.confirm(`Newsletter "${subject}" an ${totalSubs} Abonnent(en) senden?`);
    if (!confirmed) return;

    setSending(true);
    setSendStatus(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/newsletter/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
        },
        body: JSON.stringify({ subject, content })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendStatus({ type: 'success', message: data.message });
        setSubject('');
        setContent('');
      } else {
        setSendStatus({ type: 'error', message: data.detail || 'Senden fehlgeschlagen' });
      }
    } catch (err) {
      setSendStatus({ type: 'error', message: 'Verbindungsfehler' });
    }
    setSending(false);
  };

  const exportCSV = () => {
    if (!subscribers.length) return;
    const headers = ['E-Mail', 'Name'];
    const rows = subscribers.map(s => [s.email, s.name || '']);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-abonnenten-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" data-testid="newsletter-admin">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ea-dark">{totalSubs}</p>
              <p className="text-sm text-ea-dark/50">Abonnenten</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ea-dark">Brevo verbunden</p>
              <p className="text-xs text-ea-dark/40">Professioneller E-Mail-Versand</p>
            </div>
          </div>
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
      </div>

      {/* Compose Newsletter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h3 className="text-lg font-bold text-ea-dark flex items-center gap-2">
            <Send className="w-5 h-5 text-ea-gold" />
            Newsletter verfassen
          </h3>
          <button
            onClick={handleSendNewsletter}
            disabled={sending || !subject.trim() || !content.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all disabled:opacity-50 w-full sm:w-auto"
            data-testid="send-newsletter-btn"
          >
            {sending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Wird gesendet...</>
            ) : (
              <><Send className="w-5 h-5" /> An {totalSubs} Abonnent(en) senden</>
            )}
          </button>
        </div>

        {sendStatus && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-4 ${
            sendStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {sendStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">{sendStatus.message}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-ea-dark font-semibold text-sm mb-1.5">Betreff *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="z.B. Neue Investment-Chancen in Montenegro"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              data-testid="newsletter-subject"
            />
          </div>
          <div>
            <label className="block text-ea-dark font-semibold text-sm mb-1.5">Inhalt *</label>
            <WYSIWYGEditor
              key="newsletter-editor"
              value={content}
              onChange={setContent}
              placeholder="Newsletter-Inhalt hier eingeben..."
            />
          </div>

          {/* Email Preview */}
          <div>
            <label className="block text-ea-dark font-semibold text-sm mb-1.5">Vorschau der E-Mail</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-100">
              {/* Header */}
              <div className="bg-white py-6 px-8 text-center border-b-2 border-ea-gold">
                <img src="/euroadria-logo-email.png" alt="EuroAdria" className="h-16 mx-auto" />
              </div>
              {/* Content */}
              <div className="bg-white px-8 py-6 text-sm text-ea-dark/80 leading-relaxed min-h-[80px]">
                {content ? (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <p className="text-ea-dark/30 italic">Dein Newsletter-Inhalt erscheint hier...</p>
                )}
              </div>
              {/* Signature */}
              <div className="bg-white px-8 pb-6 border-t border-gray-100">
                <div className="flex gap-4 pt-4">
                  <img src="/euroadria-logo-email.png" alt="EuroAdria" className="w-24 h-auto object-contain shrink-0" />
                  <div className="text-[11px] text-gray-500 leading-relaxed">
                    <p className="text-sm font-bold text-ea-dark mb-0.5">EuroAdria</p>
                    <p className="text-[10px] text-gray-400 mb-1">a brand of <strong className="text-gray-600">Montaris & Co. d.o.o.</strong></p>
                    <p className="mb-1">Montaris & Co. d.o.o.<br/>Marka Miljanova 12<br/>21000 Novi Sad, Serbia</p>
                    <p className="mb-1">
                      Tel.: <span className="text-ea-gold">+382 68 559 776</span><br/>
                      E-Mail: <span className="text-ea-gold">office@euroadria.me</span><br/>
                      Web: <span className="text-ea-gold">www.euroadria.me</span><br/>
                      Investment: <span className="text-ea-gold">invest.euroadria.me</span>
                    </p>
                    <p className="text-[9px] text-gray-400">
                      Company registration no.: 22147382 | Tax ID (PIB): 115356237<br/>Director: Milena Bubanja
                    </p>
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="bg-[#04151F] py-3 px-8 text-center">
                <span className="text-gray-500 text-[10px]">Newsletter abbestellen</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-ea-dark">Abonnenten ({totalSubs})</h3>
          <div className="flex gap-2">
            <button
              onClick={fetchSubscribers}
              className="px-4 py-2 text-sm bg-gray-100 text-ea-dark/70 rounded-lg hover:bg-gray-200 transition-all"
            >
              Aktualisieren
            </button>
            {subscribers.length > 0 && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-ea-dark text-white rounded-lg hover:bg-ea-dark/90 transition-all"
                data-testid="export-subscribers-csv"
              >
                <Download className="w-4 h-4" />
                CSV Export
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-ea-gold" />
          </div>
        ) : subscribers.length > 0 ? (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 text-ea-dark/50 font-medium">#</th>
                  <th className="text-left py-2.5 text-ea-dark/50 font-medium">E-Mail</th>
                  <th className="text-left py-2.5 text-ea-dark/50 font-medium">Name</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 text-ea-dark/40">{i + 1}</td>
                    <td className="py-2.5 text-ea-dark font-medium">{sub.email}</td>
                    <td className="py-2.5 text-ea-dark/70">{sub.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-ea-dark/40">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Noch keine Abonnenten</p>
            <p className="text-xs mt-1">Sobald sich jemand auf der Website anmeldet, erscheint er hier.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterAdmin;
