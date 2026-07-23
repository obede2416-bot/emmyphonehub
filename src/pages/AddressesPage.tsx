import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { MapPin, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fetchAddresses, saveAddress, deleteAddress } from '@/lib/api';
import type { Address } from '@/lib/types';
import toast from 'react-hot-toast';

export function AddressesPage() {
  const { user, loading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState<Partial<Address>>({ label: 'Home', country: 'Nigeria' });

  useEffect(() => {
    if (user) fetchAddresses(user.id).then((d) => setAddresses(d as Address[]));
  }, [user]);

  if (loading) return <div className="container-app section-padding py-20"><div className="skeleton h-64 rounded-2xl" /></div>;
  if (!user) return <Navigate to="/login?redirect=/addresses" replace />;

  const openAdd = () => {
    setEditing(null);
    setForm({ label: 'Home', country: 'Nigeria' });
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm(addr);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (!form.full_name || !form.phone || !form.address_line1 || !form.city || !form.state) {
        toast.error('Please fill all required fields');
        return;
      }
      const data = await saveAddress({ ...form, user_id: user.id });
      if (editing) {
        setAddresses((prev) => prev.map((a) => (a.id === editing.id ? data : a)));
      } else {
        setAddresses((prev) => [...prev, data]);
      }
      setShowForm(false);
      toast.success('Address saved');
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to save address');
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success('Address deleted');
  };

  return (
    <div className="container-app section-padding py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">My Addresses</h1>
        <button onClick={openAdd} className="btn-primary btn-sm"><Plus size={16} /> Add Address</button>
      </div>

      {addresses.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin size={48} className="mx-auto text-slate-300" />
          <p className="text-lg font-semibold mt-3">No addresses saved</p>
          <p className="text-slate-500 text-sm">Add a shipping address to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="badge bg-primary-100 text-primary-700">{addr.label}</span>
                  {addr.is_default && <span className="badge bg-accent-100 text-accent-700">Default</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(addr)} className="text-slate-400 hover:text-primary-600 p-1"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(addr.id)} className="text-slate-400 hover:text-secondary-500 p-1"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <div className="font-semibold">{addr.full_name}</div>
                <div className="text-slate-500">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</div>
                <div className="text-slate-500">{addr.city}, {addr.state}, {addr.country}</div>
                <div className="text-slate-500">{addr.phone}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{editing ? 'Edit Address' : 'Add Address'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Label</label>
                <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input">
                  <option>Home</option>
                  <option>Work</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Full Name *</label>
                  <input value={form.full_name ?? ''} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Address Line 1 *</label>
                <input value={form.address_line1 ?? ''} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Address Line 2</label>
                <input value={form.address_line2 ?? ''} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">City *</label>
                  <input value={form.city ?? ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">State *</label>
                  <input value={form.state ?? ''} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Country</label>
                  <input value={form.country ?? ''} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">Postal Code</label>
                  <input value={form.postal_code ?? ''} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="input" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_default ?? false} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="accent-primary-600" />
                Set as default address
              </label>
              <button onClick={handleSave} className="btn-primary w-full"><Check size={18} /> Save Address</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
