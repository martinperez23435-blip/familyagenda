'use client';

export default function AdminPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Administración</h1>
      <div className="flex flex-col gap-3">
        <a
          href="/admin/activities"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
        >
          <span className="text-2xl">📋</span>
          <div>
            <p className="font-medium">Actividades</p>
            <p className="text-sm text-gray-500">Crear y editar actividades</p>
          </div>
        </a>
        <a
          href="/admin/minors"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
        >
          <span className="text-2xl">👶</span>
          <div>
            <p className="font-medium">Menores</p>
            <p className="text-sm text-gray-500">Gestionar menores</p>
          </div>
        </a>
      </div>
    </div>
  );
}
