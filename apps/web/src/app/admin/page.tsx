'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Users, AlertOctagon, FileCheck, DollarSign, Ban, CheckCircle, 
  XCircle, ExternalLink, ShieldAlert, BarChart3, TrendingUp, CreditCard, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

type TabType = 'stats' | 'users' | 'reports' | 'verifications'

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('stats')

  // Data states
  const [userList, setUserList] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [verifications, setVerifications] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Status updates
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error || !userProfile) {
          router.push('/login')
          return
        }

        if (userProfile.role === 'ADMIN' || userProfile.role === 'SUPER_ADMIN') {
          setIsAdmin(true)
          setCurrentUser(userProfile)
          // Load dashboard data
          await loadAllData()
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Error verifying admin status:', err)
        setLoading(false)
      }
    }
    checkAdminAccess()
  }, [])

  async function loadAllData() {
    try {
      setLoading(true)
      // 1. Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      if (usersData) setUserList(usersData)

      // 2. Fetch reports with joined user and property details
      const { data: reportsData } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:reporter_id(name, email),
          reported_user:reported_user_id(name, email),
          reported_property:reported_property_id(title)
        `)
        .order('created_at', { ascending: false })
      if (reportsData) setReports(reportsData)

      // 3. Fetch verifications (documentos / identidad) with user details
      const { data: verifData } = await supabase
        .from('user_verifications')
        .select(`
          *,
          user:user_id(name, email)
        `)
        .order('created_at', { ascending: false })
      if (verifData) setVerifications(verifData)

      // 4. Fetch financial purchases
      const { data: purchasesData } = await supabase
        .from('wellpoint_purchases')
        .select(`
          *,
          user:user_id(name, email)
        `)
        .order('created_at', { ascending: false })
      if (purchasesData) setPurchases(purchasesData)

    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  // ─── ADMIN ACTIONS ──────────────────────────────────────────────────────────

  const handleUserBanToggle = async (userId: string, currentStatus: string) => {
    setActionLoading(`ban-${userId}`)
    const nextStatus = currentStatus === 'banned' ? 'active' : 'banned'
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: nextStatus })
        .eq('id', userId)

      if (error) throw error
      setUserList(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u))
    } catch (err) {
      alert('Error al actualizar el estado del usuario')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResolveReport = async (reportId: string) => {
    setActionLoading(`resolve-${reportId}`)
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', reportId)

      if (error) throw error
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved', resolved_at: new Date().toISOString() } : r))
    } catch (err) {
      alert('Error al resolver el reporte')
    } finally {
      setActionLoading(null)
    }
  }

  const handleVerificationApproval = async (verifId: string, userId: string, approve: boolean) => {
    setActionLoading(`verif-${verifId}`)
    const status = approve ? 'approved' : 'rejected'
    try {
      // 1. Update verification record
      const { error: verifError } = await supabase
        .from('user_verifications')
        .update({ 
          status, 
          verified_at: approve ? new Date().toISOString() : null 
        })
        .eq('id', verifId)

      if (verifError) throw verifError

      // 2. If approved, verify the user's profile
      if (approve) {
        const { error: userError } = await supabase
          .from('users')
          .update({ is_verified: true, trust_index: 100 })
          .eq('id', userId)

        if (userError) throw userError
      }

      setVerifications(prev => prev.map(v => v.id === verifId ? { ...v, status, verified_at: approve ? new Date().toISOString() : null } : v))
      // Update local users list too if loaded
      setUserList(prev => prev.map(u => u.id === userId && approve ? { ...u, is_verified: true, trust_index: 100 } : u))
    } catch (err) {
      alert('Error al procesar la verificación')
    } finally {
      setActionLoading(null)
    }
  }

  // ─── CALCULATE STATS ────────────────────────────────────────────────────────
  const totalRevenue = purchases.reduce((acc, p) => p.status === 'completed' ? acc + (p.amount_paid_cents / 100) : acc, 0)
  const totalWellpointsBought = purchases.reduce((acc, p) => p.status === 'completed' ? acc + p.wellpoints : acc, 0)
  const activeBannedUsers = userList.filter(u => u.status === 'banned').length
  const pendingVerifications = verifications.filter(v => v.status === 'pending').length
  const pendingReports = reports.filter(r => r.status === 'pending').length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
          <span className="font-inter text-sm text-text-muted-custom">Cargando panel de administración...</span>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="font-fraunces font-bold text-2xl text-ink-teal-900">Acceso Restringido</h1>
          <p className="font-inter text-sm text-text-muted-custom">
            No tienes los permisos administrativos necesarios para ingresar a este panel.
          </p>
          <Link href="/search" className="bg-[#0f766e] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#0d635c] transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-[1440px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0f766e] mb-1">
              <span className="px-2 py-0.5 bg-[#0f766e]/10 rounded-full">Super-Admin</span>
              <span>• Panel de Control</span>
            </div>
            <h1 className="font-fraunces font-bold text-3xl text-ink-teal-900">
              Hola, {currentUser?.name || 'Administrador'}
            </h1>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white border border-surface-mist-dark px-4 py-2.5 rounded-full font-bold text-sm text-ink-teal-900 shadow-sm hover:bg-surface-mist transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver a mi perfil
          </Link>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-surface-mist-dark gap-2 mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'stats', label: 'Estadísticas y Ventas', icon: BarChart3 },
            { id: 'users', label: `Moderación de Usuarios (${userList.length})`, icon: Users },
            { id: 'reports', label: `Reportes (${pendingReports} pendientes)`, icon: AlertOctagon },
            { id: 'verifications', label: `Manuales y Verificaciones (${pendingVerifications} pendientes)`, icon: FileCheck },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-bold text-sm transition-all flex-shrink-0 ${
                  isActive 
                    ? 'border-[#0f766e] text-[#0f766e]' 
                    : 'border-transparent text-[#6b7280] hover:text-[#0f766e]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* TAB 1: STATISTICS */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-surface-mist-dark shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-text-muted-custom uppercase">Ingresos Totales</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center"><DollarSign className="w-4 h-4" /></div>
                </div>
                <h3 className="font-fraunces font-bold text-3xl text-ink-teal-900">${totalRevenue.toFixed(2)} USD</h3>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-2"><TrendingUp className="w-3.5 h-3.5" /><span>100% Pasarela Stripe</span></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-surface-mist-dark shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-text-muted-custom uppercase">WellPoints Comprados</span>
                  <div className="w-8 h-8 rounded-full bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center">WP</div>
                </div>
                <h3 className="font-fraunces font-bold text-3xl text-ink-teal-900">{totalWellpointsBought} WP</h3>
                <p className="text-[11px] text-text-muted-custom font-inter mt-2">Ventas de paquetes de recarga</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-surface-mist-dark shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-text-muted-custom uppercase">Reportes Pendientes</span>
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center"><AlertOctagon className="w-4 h-4" /></div>
                </div>
                <h3 className="font-fraunces font-bold text-3xl text-ink-teal-900">{pendingReports}</h3>
                <p className="text-[11px] text-text-muted-custom font-inter mt-2">Requieren moderación inmediata</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-surface-mist-dark shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-text-muted-custom uppercase">Usuarios Baneados</span>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center"><Ban className="w-4 h-4" /></div>
                </div>
                <h3 className="font-fraunces font-bold text-3xl text-neutral-800">{activeBannedUsers}</h3>
                <p className="text-[11px] text-text-muted-custom font-inter mt-2">Cuentas inactivas / suspendidas</p>
              </div>
            </div>

            {/* Financial Transactions List */}
            <div className="bg-white rounded-2xl border border-surface-mist-dark shadow-sm overflow-hidden">
              <div className="p-6 border-b border-surface-mist-dark flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0f766e]" />
                <h2 className="font-fraunces font-bold text-lg text-ink-teal-900">Historial de Ventas</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-inter text-sm">
                  <thead className="bg-[#fafafa] border-b border-surface-mist-dark text-text-muted-custom font-semibold text-xs uppercase">
                    <tr>
                      <th className="p-4">ID Transacción</th>
                      <th className="p-4">Usuario</th>
                      <th className="p-4">WellPoints</th>
                      <th className="p-4">Monto Pagado</th>
                      <th className="p-4">Pasarela</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-mist">
                    {purchases.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-muted-custom">No hay transacciones registradas.</td>
                      </tr>
                    ) : (
                      purchases.map(p => (
                        <tr key={p.id} className="hover:bg-neutral-50">
                          <td className="p-4 font-mono text-xs">{p.id.substring(0, 8)}...</td>
                          <td className="p-4">
                            <div className="font-semibold text-neutral-800">{p.user?.name || 'Invitado'}</div>
                            <div className="text-xs text-text-muted-custom">{p.user?.email || '—'}</div>
                          </td>
                          <td className="p-4 font-bold text-[#0f766e]">+{p.wellpoints} WP</td>
                          <td className="p-4 font-semibold">${(p.amount_paid_cents / 100).toFixed(2)} {p.currency}</td>
                          <td className="p-4 text-xs font-medium text-neutral-600 capitalize">{p.payment_provider}</td>
                          <td className="p-4 text-xs text-text-muted-custom">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">Completado</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MODERATION */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-surface-mist-dark shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-inter text-sm">
                <thead className="bg-[#fafafa] border-b border-surface-mist-dark text-text-muted-custom font-semibold text-xs uppercase">
                  <tr>
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Verificado</th>
                    <th className="p-4">Índice Confianza</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-mist">
                  {userList.map(u => {
                    const isBanned = u.status === 'banned'
                    const actionKey = `ban-${u.id}`
                    return (
                      <tr key={u.id} className="hover:bg-neutral-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
                              <img src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="font-semibold text-neutral-800">{u.name}</div>
                              <div className="text-xs text-text-muted-custom">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            u.role === 'ADMIN' ? 'bg-[#0f766e]/10 text-[#0f766e]' : 'bg-neutral-100 text-neutral-600'
                          }`}>{u.role}</span>
                        </td>
                        <td className="p-4">
                          {u.is_verified ? (
                            <span className="text-emerald-600 font-bold text-xs">Sí</span>
                          ) : (
                            <span className="text-text-muted-custom text-xs">No</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-neutral-700">{u.trust_index || 0}%</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isBanned ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {isBanned ? 'Baneado' : 'Activo'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleUserBanToggle(u.id, u.status)}
                            disabled={actionLoading === actionKey || u.id === currentUser.id}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                              isBanned 
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' 
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-50'
                            }`}
                          >
                            {actionLoading === actionKey ? 'Procesando...' : isBanned ? 'Desbanear' : 'Banear'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REPORTS MODERATION */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-surface-mist-dark shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-inter text-sm">
                <thead className="bg-[#fafafa] border-b border-surface-mist-dark text-text-muted-custom font-semibold text-xs uppercase">
                  <tr>
                    <th className="p-4">Creado</th>
                    <th className="p-4">Denunciante</th>
                    <th className="p-4">Objetivo</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Descripción</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-mist">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-text-muted-custom">No hay denuncias activas en la plataforma.</td>
                    </tr>
                  ) : (
                    reports.map(r => {
                      const isPending = r.status === 'pending'
                      const actionKey = `resolve-${r.id}`
                      return (
                        <tr key={r.id} className="hover:bg-neutral-50">
                          <td className="p-4 text-xs text-text-muted-custom">{new Date(r.created_at).toLocaleDateString()}</td>
                          <td className="p-4">
                            <div className="font-semibold text-neutral-800">{r.reporter?.name}</div>
                            <div className="text-xs text-text-muted-custom">{r.reporter?.email}</div>
                          </td>
                          <td className="p-4">
                            {r.reported_user ? (
                              <div>
                                <div className="text-xs text-rose-500 font-bold uppercase">Usuario</div>
                                <div className="font-semibold">{r.reported_user.name}</div>
                              </div>
                            ) : r.reported_property ? (
                              <div>
                                <div className="text-xs text-amber-500 font-bold uppercase">Propiedad</div>
                                <div className="font-semibold truncate max-w-[150px]">{r.reported_property.title}</div>
                              </div>
                            ) : (
                              <span className="text-text-muted-custom">Desconocido</span>
                            )}
                          </td>
                          <td className="p-4 text-xs font-semibold text-neutral-700 capitalize">{r.type}</td>
                          <td className="p-4 max-w-[280px]">
                            <p className="text-xs leading-relaxed text-neutral-700 line-clamp-3">{r.description}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isPending ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {isPending ? 'Pendiente' : 'Resuelto'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {isPending ? (
                              <button
                                onClick={() => handleResolveReport(r.id)}
                                disabled={actionLoading === actionKey}
                                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors"
                              >
                                {actionLoading === actionKey ? 'Guardando...' : 'Marcar Resuelto'}
                              </button>
                            ) : (
                              <span className="text-xs text-text-muted-custom font-medium">
                                Resuelto el {new Date(r.resolved_at).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: VERIFICATIONS ("Manual de Viviendas") */}
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-2xl border border-surface-mist-dark shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-inter text-sm">
                <thead className="bg-[#fafafa] border-b border-surface-mist-dark text-text-muted-custom font-semibold text-xs uppercase">
                  <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Documento / Manual</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-mist">
                  {verifications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-muted-custom">No hay solicitudes de verificación pendientes.</td>
                    </tr>
                  ) : (
                    verifications.map(v => {
                      const isPending = v.status === 'pending'
                      const actionKey = `verif-${v.id}`
                      return (
                        <tr key={v.id} className="hover:bg-neutral-50">
                          <td className="p-4 text-xs text-text-muted-custom">{new Date(v.created_at).toLocaleDateString()}</td>
                          <td className="p-4">
                            <div className="font-semibold text-neutral-800">{v.user?.name}</div>
                            <div className="text-xs text-text-muted-custom">{v.user?.email}</div>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-semibold capitalize text-neutral-700">
                              {v.type === 'documento' ? 'Manual de Vivienda' : 'Documento Identidad'}
                            </span>
                          </td>
                          <td className="p-4">
                            {v.document_url ? (
                              <a 
                                href={v.document_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#0f766e] hover:underline text-xs font-semibold"
                              >
                                Ver documento
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-text-muted-custom text-xs">Sin archivo</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              v.status === 'pending' 
                                ? 'bg-amber-50 text-amber-700' 
                                : v.status === 'approved' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {v.status === 'pending' ? 'Pendiente' : v.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {isPending ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleVerificationApproval(v.id, v.user_id, true)}
                                  disabled={actionLoading === actionKey}
                                  className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                                  title="Aprobar"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleVerificationApproval(v.id, v.user_id, false)}
                                  disabled={actionLoading === actionKey}
                                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors"
                                  title="Rechazar"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-text-muted-custom font-medium">
                                Procesado el {new Date(v.verified_at || v.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
