import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ShieldCheck, Mail, Phone, Clock, MessageSquare, Star, ArrowLeft } from 'lucide-react'

export const revalidate = 60

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )

  const { data: user, error } = await supabase
    .from('users')
    .select('*, properties(*)')
    .eq('id', params.id)
    .maybeSingle()

  if (error || !user) {
    return (
      <div className="min-h-screen bg-surface-mist flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-fraunces font-bold text-ink-teal-900 mb-2">Perfil no encontrado</h1>
        <p className="text-[#6b7280] mb-6">El usuario que buscas no existe o ha sido eliminado.</p>
        <Link href="/" className="px-6 py-2.5 bg-ink-teal-900 text-white font-semibold rounded-xl text-sm">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const nameParts = (user.name || 'Usuario').split(' ')
  const displayName = nameParts.length > 1 
    ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.` 
    : nameParts[0]

  const memberSince = new Date(user.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const trustIndex = user.trust_index || 0
  const isVerified = user.is_verified || false
  const properties = user.properties || []

  return (
    <div className="min-h-screen bg-surface-mist pb-24">
      <header className="bg-white border-b border-surface-mist-dark sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-surface-mist rounded-full transition-colors text-ink-teal-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-ink-teal-900 text-sm">Perfil de {displayName}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-surface-mist-dark rounded-2xl p-6 sticky top-24 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-surface-mist-dark border-2 border-surface-mist-dark">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-text-muted-custom">
                      {displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <h1 className="text-xl font-fraunces font-bold text-ink-teal-900">{displayName}</h1>
                <p className="text-xs text-[#6b7280] mt-1 capitalize">Miembro desde {memberSince}</p>

                <div className="mt-4 pt-4 border-t border-surface-mist-dark w-full text-left">
                  <h3 className="text-[11px] font-bold text-text-muted-custom uppercase tracking-wider mb-2">Índice de Confianza</h3>
                  <div className="flex items-center gap-1.5 mb-1">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div key={dot} className={`w-3.5 h-3.5 rounded-full ${isVerified && trustIndex > 0 && dot <= trustIndex ? 'bg-ink-teal-700' : (isVerified && trustIndex > 0 ? 'bg-gray-200' : 'bg-gray-200 border border-gray-300')}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-[#6b7280] font-medium">
                    {isVerified && trustIndex > 0 ? `Nivel ${trustIndex} de 5` : 'Miembro nuevo'}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-surface-mist-dark w-full text-left">
                  <h3 className="text-[11px] font-bold text-text-muted-custom uppercase tracking-wider mb-3">Información Verificada</h3>
                  <div className="space-y-3">
                    <div className={`flex items-center gap-2.5 text-xs ${isVerified ? 'text-ink-teal-900' : 'text-[#9ca3af]'}`}>
                      <ShieldCheck className={`w-4 h-4 ${isVerified ? 'text-[#10b981]' : ''}`} />
                      <span className="font-medium">{isVerified ? 'Identidad verificada' : 'Identidad no verificada'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-ink-teal-900">
                      <Mail className="w-4 h-4 text-[#10b981]" />
                      <span className="font-medium">Correo verificado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white border border-surface-mist-dark rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-fraunces font-bold text-ink-teal-900 mb-4">Sobre mí</h2>
              {user.bio ? (
                <div className="prose prose-sm prose-p:text-ink-teal-900 prose-p:leading-relaxed max-w-none">
                  {user.bio.split('\n').map((paragraph: string, i: number) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6b7280] italic">
                  {displayName} aún no ha completado su presentación fraternal.
                </p>
              )}

              {user.languages && user.languages.length > 0 && (
                <div className="mt-6 pt-6 border-t border-surface-mist-dark">
                  <h3 className="text-xs font-bold text-text-muted-custom uppercase tracking-wider mb-3">Idiomas que habla</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.languages.map((lang: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-surface-mist text-ink-teal-900 text-xs font-semibold rounded-full border border-surface-mist-dark">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
