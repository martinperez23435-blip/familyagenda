'use client';

import { useState, useEffect } from 'react';
import { getFeriados, addFeriado, deleteFeriado, initFeriados } from '@/lib/services/feriadoService';
import { Feriado } from '@/lib/data/feriados2026';

export default function FeriadosPage() {
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState('');
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    await initFeriados();
    const data = await getFeriados();
    setFeriados(data.sort((a, b) => a.date.localeCompare(b.date)));
    setLoading(false);
  }

  async function handleAdd() {
    if (!date || !nombre.trim()) return;
    setSaving(true);
    await addFeriado({ date, nombre, tipo: 'local' });
    setShowForm(false);
    setDate('');
    setNombre('');
    await load();
    setSaving(false);
  }

  async function handleDelete(f: Feriado) {
    if (!confirm(`¿Eliminar "${f.nombre}"?`)) return;
    await deleteFeriado(f.date);
    await load();
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1b4332' }}>Feriados</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
        >
          + Agregar
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#52796f' }}>Cargando...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {feriados.map((f) => (
            <div
              key={f.date}
              style={{ background: f.tipo === 'local' ? '#d6e4f0' : '#d4e9d4', borderRadius: '12px', padding: '12px 14px', borderLeft: `4px solid ${f.tipo === 'local' ? '#1a4971' : '#1b4332'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: f.tipo === 'local' ? '#1a4971' : '#1b4332' }}>{f.nombre}</p>
                <p style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{f.date} · {f.tipo === 'local' ? 'Local' : 'Nacional'}</p>
              </div>
              <button
                onClick={() => handleDelete(f)}
                style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 500, color: '#1b4332', marginBottom: '16px' }}>Nuevo feriado local</h2>
            <div className="flex flex-col gap-3">
              <div>
                <p style={{ fontSize: '13px', color: '#52796f', marginBottom: '6px' }}>Fecha</p>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border rounded-lg px-4 py-3 text-sm w-full outline-none"
                  style={{ borderColor: '#c8dfc8' }}
                />
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#52796f', marginBottom: '6px' }}>Nombre</p>
                <input
                  type="text"
                  placeholder="Ej: Feriado provincial"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="border rounded-lg px-4 py-3 text-sm w-full outline-none"
                  style={{ borderColor: '#c8dfc8' }}
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setShowForm(false)} style={{ flex: 1, border: '1px solid #c8dfc8', borderRadius: '10px', padding: '12px', fontSize: '13px', background: 'none', cursor: 'pointer', color: '#555' }}>
                  Cancelar
                </button>
                <button onClick={handleAdd} disabled={saving || !date || !nombre.trim()} style={{ flex: 1, background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', opacity: (!date || !nombre.trim()) ? 0.5 : 1 }}>
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
