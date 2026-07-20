'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseForm() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .insert({
          email: formData.email,
          name: formData.name,
          phone: formData.phone || null,
          bio: formData.bio || null,
          role: 'user',
          plan: 'free',
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      setMessage({ type: 'success', text: `Usuario creado exitosamente en Supabase! ID: ${data.id}` });
      setFormData({ email: '', name: '', phone: '', bio: '' });
      
      // Recargar la página para ver el nuevo usuario en la tabla
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Crear Usuario en Supabase</h3>
      <p className="text-gray-600 mb-4 text-sm">
        Este formulario inserta datos directamente en Supabase. Los cambios se reflejarán en tiempo real en la base de datos.
      </p>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="usuario@ejemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+57 300 123 4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Biografía
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cuéntanos sobre ti..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Guardando en Supabase...' : 'Guardar en Supabase'}
        </button>
      </form>
    </div>
  );
}
