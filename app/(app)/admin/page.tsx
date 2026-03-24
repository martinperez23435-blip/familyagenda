'use client';

export default function AdminPage() {
  return (
    <div className="p-4">
      <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1b4332', marginBottom: '16px' }}>Administración</h1>
      <div className="flex flex-col gap-3">
        <a href="/admin/activities" style={{ background: '#d4e9d4', borderRadius: '16px', padding: '16px', borderLeft: '4px solid #1b4332', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <span style={{ fontSize: '24px' }}>📋</span>
          <div>
            <p style={{ fontWeight: 500, color: '#1b4332' }}>Actividades</p>
            <p style={{ fontSize: '13px', color: '#52796f' }}>Crear y editar actividades</p>
          </div>
        </a>
        <a href="/admin/minors" style={{ background: '#d6e4f0', borderRadius: '16px', padding: '16px', borderLeft: '4px solid #1a4971', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <span style={{ fontSize: '24px' }}>👶</span>
          <div>
            <p style={{ fontWeight: 500, color: '#1a4971' }}>Menores</p>
            <p style={{ fontSize: '13px', color: '#52796f' }}>Gestionar menores</p>
          </div>
        </a>
        <a href="/admin/feriados" style={{ background: '#f0e6d4', borderRadius: '16px', padding: '16px', borderLeft: '4px solid #7a4a1a', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <span style={{ fontSize: '24px' }}>🗓️</span>
          <div>
            <p style={{ fontWeight: 500, color: '#7a4a1a' }}>Feriados</p>
            <p style={{ fontSize: '13px', color: '#52796f' }}>Ver y editar feriados</p>
          </div>
        </a>
      </div>
    </div>
  );
}
