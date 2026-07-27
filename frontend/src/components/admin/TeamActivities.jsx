import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Clock, User, Filter, FileText, RefreshCw } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const timeAgo = (ts) => {
  if (!ts) return '';
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString('de-DE');
};

const ICON_MAP = {
  note: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
  email: { icon: Mail, color: 'text-[#C8A96A]', bg: 'bg-[#C8A96A]/10' },
  system: { icon: FileText, color: 'text-gray-400', bg: 'bg-gray-50' },
};

export default function TeamActivities({ credentials }) {
  const [activities, setActivities] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberFilter, setMemberFilter] = useState('');
  const [daysFilter, setDaysFilter] = useState(7);

  const authHeader = { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let url = `${API}/api/admin/activities?days=${daysFilter}&limit=150`;
      if (memberFilter) url += `&member=${encodeURIComponent(memberFilter)}`;
      const res = await fetch(url, { headers: authHeader });
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        setTeamMembers(data.team_members || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchActivities(); }, [memberFilter, daysFilter]);

  // Group by date
  const grouped = {};
  activities.forEach(a => {
    const date = a.timestamp ? new Date(a.timestamp).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Unknown';
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(a);
  });

  return (
    <div className="space-y-6" data-testid="team-activities">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-ea-dark">Team Aktivitäten</h2>
          <p className="text-sm text-ea-dark/40">{activities.length} activities in the last {daysFilter} days</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Member Filter */}
          <select
            value={memberFilter}
            onChange={e => setMemberFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8A96A]"
            data-testid="activity-member-filter"
          >
            <option value="">All Members</option>
            {teamMembers.map(m => (
              <option key={m.email} value={m.name}>{m.name}</option>
            ))}
          </select>
          {/* Days Filter */}
          <select
            value={daysFilter}
            onChange={e => setDaysFilter(parseInt(e.target.value))}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8A96A]"
            data-testid="activity-days-filter"
          >
            <option value={1}>Today</option>
            <option value={3}>Last 3 days</option>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button onClick={fetchActivities} className="p-2 rounded-lg hover:bg-gray-100 transition-all" data-testid="activity-refresh">
            <RefreshCw className={`w-4 h-4 text-ea-dark/40 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Activity Feed */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#C8A96A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-20 text-ea-dark/30">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No activities found for this period</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-ea-dark/40 mb-3 sticky top-0 bg-gray-50/80 backdrop-blur-sm py-2 px-1 -mx-1 z-10">{date}</h3>
              <div className="space-y-2">
                {items.map((a, i) => {
                  const config = ICON_MAP[a.type] || ICON_MAP.system;
                  const Icon = config.icon;
                  return (
                    <div key={`${a.timestamp}-${i}`} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all" data-testid={`activity-item-${i}`}>
                      <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-ea-dark">{a.author}</span>
                          {a.lead_name && (
                            <>
                              <span className="text-ea-dark/20">→</span>
                              <span className="text-sm text-[#C8A96A] font-medium truncate">{a.lead_name}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-ea-dark/60 line-clamp-2">{a.text}</p>
                      </div>
                      <span className="text-xs text-ea-dark/30 shrink-0 whitespace-nowrap">{timeAgo(a.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
