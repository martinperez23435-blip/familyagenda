'use client';

import { useState, useEffect } from 'react';
import { getMinors, createMinor, updateMinor } from '@/lib/services/minorService';
import { Minor } from '@/lib/types/minor.types';
import { useAuthStore } from '@/store/authStore';

const COLORS = [
  '#4A90D9', '#E74C3C', '#2ECC71', '#F39C12',
  '#9B59B6', '#1ABC9C', '#E67E22', '#E91E63',
];

export default function MinorsPage() {
  const { user } = useAuthStore();
  const [minors, setMinors] = useState<Minor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMinor, setEditingMinor] = useState<Minor | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMinors();
  }, []);

  async function loadMinors() {
    setLoading(true);
    const data = await getMinors();
    setMinors(data);
    setLoading(false);
  }

  function openNew() {
    setEditingMinor(null);
    setName('');
    setColor(COLORS[0]);
    setShowForm(true);
  }

  function openEdit(minor: Minor) {
    setEditingMinor(minor);
    setName(minor.name);
    setColor(minor.color);
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim() || !user) return;
    setSaving(true);
    try {
      if (editingMinor) {
        await updateMinor(editingMinor.id, { name, color });
      } else {
        await createMinor({
          name,
          color,
          photoURL: null,
          isActive: true,
          createdBy: user.id,
        });
      }
      setShowForm(false);
      await loadMinors();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(minor: Minor) {
    if (!confirm(`¿Desactivar a ${minor.name}?`)) return;
    await updateMinor(minor.id, { isActive: false });
    await loadMinors();
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Menores</h1>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Agregar
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : minors.length === 0 ? (
        <p className="text-gray-500">No hay menores cargados aún.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {minors.map((minor) => (
            <div
              key={minor.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: minor.color }}
                >
                  {minor.name[0].toUpperCase()}
                </div>
                <span className="font-medium">{minor.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(minor)}
                  className="text-sm text-blue-600 font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeactivate(minor)}
                  className="text-sm text-red-500 font-medium"
                >
                  Desactivar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-bold mb-4">
              {editingMinor ? 'Editar menor' : 'Nuevo menor'}
            </h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm text-gray-500 mb-2">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        color === c ? 'border-gray-800' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-3 text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
