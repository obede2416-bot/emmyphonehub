import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LifeBuoy, Plus, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fetchTickets, createTicket } from '@/lib/api';
import type { SupportTicket } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function SupportPage() {
  const { user, loading } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });

  useEffect(() => {
    if (user) fetchTickets(user.id).then((d) => setTickets(d as SupportTicket[]));
  }, [user]);

  if (loading) return <div className="container-app section-padding py-20"><div className="skeleton h-64 rounded-2xl" /></div>;
  if (!user) return <Navigate to="/login?redirect=/support" replace />;

  const handleSubmit = async () => {
    if (!form.subject || !form.message) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const ticket = await createTicket({ user_id: user.id, ...form });
      setTickets((prev) => [ticket, ...prev] as SupportTicket[]);
      setForm({ subject: '', message: '', priority: 'medium' });
      setShowForm(false);
      toast.success('Ticket created');
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to create ticket');
    }
  };

  const statusColors: Record<string, string> = {
    open: 'bg-primary-100 text-primary-700',
    in_progress: 'bg-secondary-100 text-secondary-700',
    resolved: 'bg-accent-100 text-accent-700',
    closed: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="container-app section-padding py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Support Center</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary btn-sm"><Plus size={16} /> New Ticket</button>
      </div>

      {/* FAQ */}
      <div className="card p-5 mb-6">
        <h3 className="font-bold mb-3 flex items-center gap-2"><LifeBuoy size={18} /> Quick Help</h3>
        <div className="space-y-2">
          {[
            { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days. Express delivery arrives in 1-2 days.' },
            { q: 'What is your return policy?', a: 'You can return any phone within 30 days of delivery for a full refund.' },
            { q: 'Do you offer warranty?', a: 'All phones come with a 2-year manufacturer warranty.' },
            { q: 'How can I track my order?', a: 'Use the Track Order page with your order number to see real-time status.' },
          ].map((faq, i) => (
            <details key={i} className="group rounded-xl border border-slate-100 dark:border-slate-800 p-3">
              <summary className="cursor-pointer font-semibold text-sm flex items-center justify-between">
                {faq.q}
                <span className="text-slate-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-2 text-sm text-slate-500">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Tickets */}
      <h3 className="font-bold mb-3">Your Tickets</h3>
      {tickets.length === 0 ? (
        <div className="card p-8 text-center">
          <MessageSquare size={40} className="mx-auto text-slate-300" />
          <p className="text-slate-500 mt-2">No support tickets yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{t.subject}</div>
                <span className={`badge ${statusColors[t.status]} capitalize`}>{t.status.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-slate-500">{t.message}</p>
              <div className="text-xs text-slate-400 mt-2">{formatDate(t.created_at)} · {t.priority} priority</div>
            </div>
          ))}
        </div>
      )}

      {/* New ticket modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="card p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-4">New Support Ticket</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Subject</label>
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="input" />
              </div>
              <button onClick={handleSubmit} className="btn-primary w-full"><Send size={18} /> Submit Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
