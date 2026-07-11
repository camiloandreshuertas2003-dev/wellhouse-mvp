'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// ─── WellScore preview (client-side estimation) ───────────────────────────────
function calcWellScorePreview(data: FormData, photos: string[], amenities: string[]): number {
  let score = 1.0
  if (data.title.length >= 10) score += 0.3
  if (data.description.length >= 80) score += 0.4
  if (data.city && data.country) score += 0.2
  if (Number(data.bedrooms) >= 1) score += 0.1
  if (Number(data.bathrooms) >= 1) score += 0.1
  if (Number(data.capacity) >= 2) score += 0.1
  score += Math.min(photos.length * 0.15, 0.9)
  score += Math.min(amenities.length * 0.08, 0.8)
  if (data.availableFrom && data.availableTo) score += 0.3
  if (data.rules.length >= 20) score += 0.1
  return Math.min(Math.round(score * 10) / 10, 5.0)
}

interface FormData {
  title: string; type: string; description: string; rules: string
  address: string; city: string; country: string; postalCode: string
  bedrooms: string; bathrooms: string; capacity: string; beds: string; areaSqm: string
  availableFrom: string; availableTo: string; minStay: string; maxStay: string
}

const STEPS = [
  { n: 1, label: 'Tipo', icon: '🏠' },
  { n: 2, label: 'Ubicación', icon: '📍' },
  { n: 3, label: 'Detalles', icon: '🛏️' },
  { n: 4, label: 'Fotos', icon: '📷' },
  { n: 5, label: 'Descripción', icon: '✍️' },
  { n: 6, label: 'Publicar', icon: '🚀' },
]

const AMENITIES = [
  { id: 'wifi', name: 'WiFi', icon: '📶', score: 0.1 },
  { id: 'kitchen', name: 'Cocina', icon: '🍳', score: 0.15 },
  { id: 'parking', name: 'Parking', icon: '🚗', score: 0.1 },
  { id: 'ac', name: 'A/A', icon: '❄️', score: 0.08 },
  { id: 'heating', name: 'Calefacción', icon: '🔥', score: 0.08 },
  { id: 'washer', name: 'Lavadora', icon: '🧺', score: 0.08 },
  { id: 'tv', name: 'Smart TV', icon: '📺', score: 0.05 },
  { id: 'pool', name: 'Piscina', icon: '🏊', score: 0.2 },
  { id: 'gym', name: 'Gimnasio', icon: '💪', score: 0.1 },
  { id: 'garden', name: 'Jardín', icon: '🌳', score: 0.12 },
  { id: 'balcony', name: 'Balcón', icon: '🌅', score: 0.1 },
  { id: 'elevator', name: 'Ascensor', icon: '🛗', score: 0.05 },
  { id: 'pets', name: 'Mascotas OK', icon: '🐾', score: 0.08 },
  { id: 'workspace', name: 'Escritorio', icon: '💻', score: 0.08 },
  { id: 'bbq', name: 'BBQ', icon: '🔥', score: 0.1 },
]

const PROPERTY_TYPES = [
  { id: 'Apartamento', label: 'Apartamento', icon: '🏢', desc: 'Piso en edificio' },
  { id: 'Casa', label: 'Casa', icon: '🏡', desc: 'Vivienda independiente' },
  { id: 'Estudio', label: 'Estudio', icon: '🛏️', desc: 'Espacio compacto' },
  { id: 'Loft', label: 'Loft', icon: '🏗️', desc: 'Espacio abierto' },
  { id: 'Villa', label: 'Villa', icon: '🏖️', desc: 'Lujo y privacidad' },
  { id: 'Cabaña', label: 'Cabaña', icon: '🌲', desc: 'Naturaleza y paz' },
]

export default function CreatePropertyPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [amenities, setAmenities] = useState<string[]>([])
  const [wellScore, setWellScore] = useState(1.0)

  const [form, setForm] = useState<FormData>({
    title: '', type: '', description: '', rules: '',
    address: '', city: '', country: '', postalCode: '',
    bedrooms: '', bathrooms: '', capacity: '', beds: '', areaSqm: '',
    availableFrom: '', availableTo: '', minStay: '1', maxStay: '30',
  })

  // Guard against hydration mismatch — only render on client
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
    })
  }, [router])

  // Recalculate WellScore on every change
  useEffect(() => {
    setWellScore(calcWellScorePreview(form, photos, amenities))
  }, [form, photos, amenities])

  const set = (field: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleAmenity = (id: string) =>
    setAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])

  const uploadPhotos = useCallback(async (files: FileList) => {
    if (!userId) return
    setUploadingPhoto(true)
    setError(null)
    const newUrls: string[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const rand = Math.random().toString(36).substring(2, 7)
        const path = `properties/${userId}/${Date.now()}_${i}_${rand}.${ext}`
        const { error: upErr } = await supabase.storage.from('property-photos').upload(path, file)
        if (upErr) throw upErr
        const { data } = supabase.storage.from('property-photos').getPublicUrl(path)
        newUrls.push(data.publicUrl)
      }
      setPhotos(prev => [...prev, ...newUrls].slice(0, 8))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir algunas fotos')
    } finally {
      setUploadingPhoto(false)
    }
  }, [userId])

  const movePhoto = useCallback((index: number, direction: 'left' | 'right') => {
    setPhotos(prev => {
      const next = [...prev]
      const targetIndex = direction === 'left' ? index - 1 : index + 1
      if (targetIndex >= 0 && targetIndex < next.length) {
        const temp = next[index]
        next[index] = next[targetIndex]
        next[targetIndex] = temp
      }
      return next
    })
  }, [])

  // Only render the full wizard on the client (prevents SSR hydration mismatch)
  if (!mounted) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(129,140,248,0.3)', borderTopColor: '#818cf8', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const handlePublish = async () => {
    if (!userId) return
    if (!form.availableFrom || !form.availableTo) {
      setError('Debes definir el período de disponibilidad antes de publicar.')
      return
    }
    if (!form.title || !form.city || !form.country) {
      setError('Completa título, ciudad y país antes de publicar.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      // Refresh session to ensure a fresh JWT token
      await supabase.auth.refreshSession()

      // Call SECURITY DEFINER RPC — bypasses RLS and unique constraint issues
      const { error: saveErr } = await supabase.rpc('upsert_property', {
        p_user_id:        userId,
        p_title:          form.title,
        p_description:    form.description || null,
        p_type:           form.type || null,
        p_country:        form.country,
        p_city:           form.city,
        p_address:        form.address || null,
        p_capacity:       form.capacity ? parseInt(form.capacity) : null,
        p_bedrooms:       form.bedrooms ? parseInt(form.bedrooms) : null,
        p_bathrooms:      form.bathrooms ? parseInt(form.bathrooms) : null,
        p_amenities:      amenities,
        p_images:         photos,
        p_available_from: form.availableFrom || null,
        p_available_to:   form.availableTo || null,
        p_min_stay:       parseInt(form.minStay),
        p_max_stay:       parseInt(form.maxStay),
        p_rules:          form.rules || null,
        p_status:         'draft',
        p_wellscore:      wellScore,
      })

      if (saveErr) throw saveErr
      router.push('/dashboard?published=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar')
      setSaving(false)
    }
  }

  const scoreColor = wellScore >= 4 ? '#10b981' : wellScore >= 2.5 ? '#f59e0b' : '#6366f1'
  const scoreLabel = wellScore >= 4 ? 'Excelente' : wellScore >= 2.5 ? 'Bueno' : 'En progreso'
  const progressPct = Math.min(((step - 1) / (STEPS.length - 1)) * 100, 100)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .wizard-input { width:100%; padding:12px 16px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:12px; color:#f1f5f9; font-size:15px; outline:none; transition:all .2s; }
        .wizard-input:focus { border-color:#818cf8; background:rgba(129,140,248,0.1); box-shadow:0 0 0 3px rgba(129,140,248,0.15); }
        .wizard-input::placeholder { color:rgba(148,163,184,0.6); }
        .wizard-label { display:block; font-size:13px; font-weight:600; color:#94a3b8; margin-bottom:8px; letter-spacing:.5px; text-transform:uppercase; }
        .card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:32px; backdrop-filter:blur(20px); }
        .btn-primary { background:linear-gradient(135deg,#818cf8,#6366f1); color:white; border:none; padding:14px 32px; border-radius:12px; font-weight:700; font-size:15px; cursor:pointer; transition:all .2s; }
        .btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 25px rgba(99,102,241,.4); }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .btn-ghost { background:rgba(255,255,255,0.06); color:#94a3b8; border:1px solid rgba(255,255,255,0.1); padding:14px 24px; border-radius:12px; font-weight:600; cursor:pointer; transition:all .2s; }
        .btn-ghost:hover { background:rgba(255,255,255,0.1); color:#f1f5f9; }
        .btn-ghost:disabled { opacity:.3; cursor:not-allowed; }
        .amenity-chip { padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); cursor:pointer; transition:all .2s; text-align:center; }
        .amenity-chip.selected { border-color:#818cf8; background:rgba(129,140,248,0.15); }
        .amenity-chip:hover { border-color:rgba(129,140,248,0.5); }
        .type-card { padding:20px; border-radius:16px; border:2px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); cursor:pointer; transition:all .2s; text-align:center; }
        .type-card.selected { border-color:#818cf8; background:rgba(129,140,248,0.15); transform:scale(1.03); }
        .type-card:hover:not(.selected) { border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.07); }
        .photo-slot { aspect-ratio:4/3; border-radius:12px; overflow:hidden; border:2px dashed rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.03); cursor:pointer; transition:all .2s; }
        .photo-slot:hover { border-color:#818cf8; background:rgba(129,140,248,0.08); }
        textarea.wizard-input { resize:vertical; min-height:120px; }
      `}</style>

      {/* Top bar */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Cancelar
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg,#818cf8,#a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>wellhouse</span>
        </div>
        {/* WellScore badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, padding: '6px 16px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: scoreColor, boxShadow: `0 0 8px ${scoreColor}` }} />
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>{wellScore.toFixed(1)} WP/noche</span>
          <span style={{ color: scoreColor, fontSize: 12, fontWeight: 600 }}>{scoreLabel}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#818cf8,#a5b4fc)', transition: 'width .5s ease' }} />
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '20px 24px 0' }}>
        {STEPS.map(s => (
          <div key={s.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: step === s.n ? 1 : 0.4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              background: step > s.n ? 'rgba(16,185,129,0.2)' : step === s.n ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.04)',
              border: `2px solid ${step > s.n ? '#10b981' : step === s.n ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
              transition: 'all .3s',
            }}>
              {step > s.n ? '✓' : s.icon}
            </div>
            <span style={{ fontSize: 11, color: step === s.n ? '#a5b4fc' : '#64748b', fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 720, margin: '32px auto', padding: '0 24px' }}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, color: '#fca5a5', fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <div className="card">
          {step === 1 && <Step1Type form={form} set={set} />}
          {step === 2 && <Step2Location form={form} set={set} />}
          {step === 3 && <Step3Details form={form} set={set} amenities={amenities} toggleAmenity={toggleAmenity} />}
          {step === 4 && <Step4Photos photos={photos} onUpload={uploadPhotos} uploading={uploadingPhoto} onRemove={(url) => setPhotos(p => p.filter(x => x !== url))} onMove={movePhoto} />}
          {step === 5 && <Step5Description form={form} set={set} />}
          {step === 6 && <Step6Review form={form} photos={photos} amenities={amenities} wellScore={wellScore} scoreColor={scoreColor} set={set} />}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingBottom: 48 }}>
          <button className="btn-ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
            ← Anterior
          </button>
          {step < 6 ? (
            <button className="btn-primary" onClick={() => setStep(s => Math.min(6, s + 1))}>
              Siguiente →
            </button>
          ) : (
            <button className="btn-primary" onClick={handlePublish} disabled={saving} style={{ background: saving ? undefined : 'linear-gradient(135deg,#10b981,#059669)' }}>
              {saving ? '⏳ Publicando...' : '🚀 Publicar vivienda'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── STEP 1: Tipo de vivienda ─────────────────────────────────────────────────
function Step1Type({ form, set }: { form: FormData; set: (f: keyof FormData, v: string) => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>¿Qué tipo de vivienda es?</h2>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>Elige la categoría que mejor la describa</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {PROPERTY_TYPES.map(t => (
          <div key={t.id} className={`type-card${form.type === t.id ? ' selected' : ''}`} onClick={() => set('type', t.id)}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{t.icon}</div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>{t.label}</div>
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{t.desc}</div>
          </div>
        ))}
      </div>
      {form.type && (
        <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(129,140,248,0.1)', borderRadius: 10, border: '1px solid rgba(129,140,248,0.2)', color: '#a5b4fc', fontSize: 14 }}>
          ✓ Seleccionaste: <strong>{form.type}</strong>
        </div>
      )}
    </div>
  )
}

// ─── STEP 2: Ubicación ────────────────────────────────────────────────────────
function Step2Location({ form, set }: { form: FormData; set: (f: keyof FormData, v: string) => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>¿Dónde está tu vivienda?</h2>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>La dirección exacta solo se muestra a huéspedes confirmados</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="wizard-label">País *</label>
          <input className="wizard-input" value={form.country} onChange={e => set('country', e.target.value)} placeholder="Ej: Colombia" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="wizard-label">Ciudad *</label>
            <input className="wizard-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Ej: Medellín" />
          </div>
          <div>
            <label className="wizard-label">Código Postal</label>
            <input className="wizard-input" value={form.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="050001" />
          </div>
        </div>
        <div>
          <label className="wizard-label">Dirección (privada)</label>
          <input className="wizard-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Calle 10 #43-25" />
        </div>
        <div style={{ padding: '14px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <p style={{ color: '#a5b4fc', fontSize: 13, margin: 0 }}>La dirección exacta solo se revela a usuarios con intercambios <strong>confirmados</strong>. El mapa público muestra el barrio aproximado.</p>
        </div>
      </div>
    </div>
  )
}

// ─── STEP 3: Detalles + Amenities ─────────────────────────────────────────────
function Step3Details({ form, set, amenities, toggleAmenity }: {
  form: FormData; set: (f: keyof FormData, v: string) => void
  amenities: string[]; toggleAmenity: (id: string) => void
}) {
  const Counter = ({ field, label }: { field: keyof FormData; label: string }) => (
    <div style={{ textAlign: 'center' }}>
      <label className="wizard-label" style={{ textAlign: 'center', display: 'block' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => set(field, String(Math.max(0, (Number(form[field]) || 0) - 1)))}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#f1f5f9', fontSize: 18, cursor: 'pointer' }}>−</button>
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 20, minWidth: 24, textAlign: 'center' }}>{form[field] || '0'}</span>
        <button onClick={() => set(field, String((Number(form[field]) || 0) + 1))}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#f1f5f9', fontSize: 18, cursor: 'pointer' }}>+</button>
      </div>
    </div>
  )

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Capacidad y amenities</h2>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>Cada amenity sube tu WellScore™</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32, padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
        <Counter field="capacity" label="Huéspedes" />
        <Counter field="bedrooms" label="Habitaciones" />
        <Counter field="bathrooms" label="Baños" />
        <Counter field="beds" label="Camas" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase' }}>
          Amenities · {amenities.length} seleccionados
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {AMENITIES.map(a => (
          <div key={a.id} className={`amenity-chip${amenities.includes(a.id) ? ' selected' : ''}`} onClick={() => toggleAmenity(a.id)}>
            <div style={{ fontSize: 22 }}>{a.icon}</div>
            <div style={{ color: '#e2e8f0', fontSize: 11, fontWeight: 600, marginTop: 4 }}>{a.name}</div>
            {amenities.includes(a.id) && <div style={{ color: '#818cf8', fontSize: 10, marginTop: 2 }}>+{(a.score * 10).toFixed(0)}% WS</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── STEP 4: Fotos ────────────────────────────────────────────────────────────
function Step4Photos({ photos, onUpload, uploading, onRemove, onMove }: {
  photos: string[]; onUpload: (f: FileList) => void; uploading: boolean; onRemove: (url: string) => void; onMove: (idx: number, dir: 'left' | 'right') => void
}) {
  const handleFiles = (files: FileList | null) => {
    if (!files) return
    onUpload(files)
  }

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Fotos de tu vivienda</h2>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 12 }}>Más fotos = mayor WellScore™. Añade al menos 3 para mejores resultados.</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {['Sala', 'Dormitorio', 'Cocina', 'Baño', 'Exterior', 'Vista'].map(tip => (
          <span key={tip} style={{ padding: '4px 10px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 20, color: '#a5b4fc', fontSize: 12 }}>📸 {tip}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {photos.map((url, i) => (
          <div key={i} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden' }}>
            <img src={url} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => onRemove(url)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: 'white', cursor: 'pointer', fontSize: 14, zIndex: 10 }}>×</button>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.65)', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>{i === 0 ? '⭐ Portada' : `${i + 1}°`}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button type="button" disabled={i === 0} onClick={() => onMove(i, 'left')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 4, width: 22, height: 22, color: 'white', cursor: i === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, opacity: i === 0 ? 0.3 : 1 }}>◀</button>
                <button type="button" disabled={i === photos.length - 1} onClick={() => onMove(i, 'right')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 4, width: 22, height: 22, color: 'white', cursor: i === photos.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, opacity: i === photos.length - 1 ? 0.3 : 1 }}>▶</button>
              </div>
            </div>
          </div>
        ))}
        {photos.length < 8 && (
          <label className="photo-slot" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            <input type="file" accept="image/*" multiple hidden onChange={e => handleFiles(e.target.files)} disabled={uploading} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{uploading ? '⏳' : '+'}</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{uploading ? 'Subiendo...' : 'Agregar fotos'}</div>
            </div>
          </label>
        )}
      </div>

      <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.08)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: 13 }}>
        💡 <strong>Tip:</strong> La primera foto será la portada. Fotos bien iluminadas reciben 40% más solicitudes.
      </div>
    </div>
  )
}

// ─── STEP 5: Título + Descripción ─────────────────────────────────────────────
function Step5Description({ form, set }: { form: FormData; set: (f: keyof FormData, v: string) => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Cuéntanos más</h2>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>Un buen título y descripción aumentan tu WellScore™</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="wizard-label">Título de tu vivienda *</label>
          <input className="wizard-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Penthouse con terraza y vista al mar en Cartagena" maxLength={80} />
          <div style={{ textAlign: 'right', color: '#475569', fontSize: 12, marginTop: 4 }}>{form.title.length}/80</div>
        </div>
        <div>
          <label className="wizard-label">Descripción</label>
          <textarea className="wizard-input" value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Describe tu vivienda, el barrio, qué la hace especial, qué actividades hay cerca..."
            style={{ minHeight: 140 }} />
          <div style={{ textAlign: 'right', color: form.description.length >= 80 ? '#10b981' : '#475569', fontSize: 12, marginTop: 4 }}>
            {form.description.length >= 80 ? '✓ Descripción completa (+WellScore)' : `${form.description.length}/80 mínimos`}
          </div>
        </div>
        <div>
          <label className="wizard-label">Reglas de la casa</label>
          <textarea className="wizard-input" value={form.rules} onChange={e => set('rules', e.target.value)}
            placeholder="Ej: No fumar, no mascotas, check-in después de las 15:00..."
            style={{ minHeight: 80 }} />
        </div>
      </div>
    </div>
  )
}

// ─── STEP 6: Calendario + Revisión ───────────────────────────────────────────
function Step6Review({ form, photos, amenities, wellScore, scoreColor, set }: {
  form: FormData; photos: string[]; amenities: string[]; wellScore: number; scoreColor: string; set?: (f: keyof FormData, v: string) => void
}) {
  const setFn = set || (() => {})
  const completionItems = [
    { label: 'Tipo de vivienda', done: !!form.type },
    { label: 'Ciudad y país', done: !!(form.city && form.country) },
    { label: 'Título', done: form.title.length >= 5 },
    { label: 'Al menos 1 foto', done: photos.length >= 1 },
    { label: 'Descripción', done: form.description.length >= 20 },
    { label: 'Disponibilidad definida', done: !!(form.availableFrom && form.availableTo) },
  ]
  const completed = completionItems.filter(i => i.done).length

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>¡Casi listo para publicar! 🚀</h2>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>Define tu disponibilidad y revisa que todo esté completo</p>

      {/* Availability */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.5px' }}>📅 Disponibilidad *</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="wizard-label">Desde</label>
            <input type="date" className="wizard-input" value={form.availableFrom} onChange={e => setFn('availableFrom', e.target.value)} style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className="wizard-label">Hasta</label>
            <input type="date" className="wizard-input" value={form.availableTo} onChange={e => setFn('availableTo', e.target.value)} style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className="wizard-label">Estancia mínima (noches)</label>
            <input type="number" min="1" className="wizard-input" value={form.minStay} onChange={e => setFn('minStay', e.target.value)} />
          </div>
          <div>
            <label className="wizard-label">Estancia máxima (noches)</label>
            <input type="number" min="1" className="wizard-input" value={form.maxStay} onChange={e => setFn('maxStay', e.target.value)} />
          </div>
        </div>
      </div>

      {/* WellScore display */}
      <div style={{ background: `linear-gradient(135deg, ${scoreColor}18, ${scoreColor}08)`, border: `1px solid ${scoreColor}40`, borderRadius: 16, padding: 20, marginBottom: 24, textAlign: 'center' }}>
        <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>TU WELLSCORE™ ESTIMADO</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: scoreColor }}>{wellScore.toFixed(1)}</div>
        <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>WP por noche que ganarás al hospedar</div>
      </div>

      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>COMPLETITUD: {completed}/{completionItems.length}</div>
        {completionItems.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${item.done ? '#10b981' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: item.done ? '#10b981' : '#475569' }}>
              {item.done ? '✓' : ''}
            </div>
            <span style={{ color: item.done ? '#e2e8f0' : '#64748b', fontSize: 14 }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: '14px 18px', background: 'rgba(16,185,129,0.08)', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: 13 }}>
        🎉 Al publicar aparecerás en búsquedas y otros miembros podrán solicitarte intercambios. Puedes editar o despublicar en cualquier momento desde tu dashboard.
      </div>
    </div>
  )
}
