import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { AvatarConfig, AvatarPreset } from '../../types'
import AvatarSprite from '../ui/AvatarSprite'
import {
  SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS, EYE_COLORS,
  HAIRSTYLES_V2, CLOTHING_TOPS, CLOTHING_BOTTOMS, CLOTHING_SHOES,
  CLOTHING_OUTERWEAR, ACCESSORY_GLASSES, ACCESSORY_HEADWEAR, ACCESSORY_NECKWEAR,
} from '../../data/mockData'
import { drawAvatar, resolveAvatarClothing } from '../../utils/pixelArt'
import { ArrowLeft, ArrowRight, Save, Trash2, Star } from 'lucide-react'
import Button from '../ui/Button'

interface AvatarCreatorScreenProps {
  initial: AvatarConfig
  onSave: (config: AvatarConfig, name: string) => void
  onBack: () => void
}

type Tab = 'hair' | 'face' | 'clothing' | 'accessories' | 'presets'

const TABS: { id: Tab; label: string }[] = [
  { id: 'hair',        label: 'Skin & Hair' },
  { id: 'face',        label: 'Face' },
  { id: 'clothing',    label: 'Clothing' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'presets',     label: 'Presets' },
]

const PRESETS_KEY = 'vo_avatar_presets'

const OUTFIT_LOOKS: { id: string; label: string; patch: Partial<AvatarConfig> }[] = [
  { id: 'everyday', label: 'Everyday', patch: { top: 'tshirt', outfit: 'tshirt', topColor: '#658B86', outfitColor: '#658B86', bottom: 'jeans', bottomColor: '#283A50', shoes: 'sneakers', shoesColor: '#111A24', outerwear: 'none' } },
  { id: 'office', label: 'Office', patch: { top: 'shirt', outfit: 'shirt', topColor: '#F2E8D8', outfitColor: '#F2E8D8', bottom: 'trousers', bottomColor: '#192331', shoes: 'loafers', shoesColor: '#4A3728', outerwear: 'blazer', outerwearColor: '#303D4E', neckwear: 'tie' } },
  { id: 'cosy', label: 'Cosy', patch: { top: 'hoodie', outfit: 'hoodie', topColor: '#303D4E', outfitColor: '#303D4E', bottom: 'jeans', bottomColor: '#1A2535', shoes: 'sneakers', shoesColor: '#111A24', outerwear: 'none' } },
  { id: 'studio', label: 'Studio', patch: { top: 'blouse', outfit: 'blouse', topColor: '#C48F9A', outfitColor: '#C48F9A', bottom: 'skirt', bottomColor: '#192331', shoes: 'flats', shoesColor: '#F2E8D8', outerwear: 'none' } },
  { id: 'weekend', label: 'Weekend', patch: { top: 'crop', outfit: 'crop', topColor: '#E87050', outfitColor: '#E87050', bottom: 'shorts', bottomColor: '#283A50', shoes: 'sneakers', shoesColor: '#F2E8D8', outerwear: 'none' } },
  { id: 'layered', label: 'Layered', patch: { top: 'turtleneck', outfit: 'turtleneck', topColor: '#192331', outfitColor: '#192331', bottom: 'wide_leg', bottomColor: '#4A3728', shoes: 'boots', shoesColor: '#4A3728', outerwear: 'jacket', outerwearColor: '#658B86' } },
]

const BOTTOM_COLORS = ['#283A50', '#384A62', '#192331', '#1A2535', '#4A3728', '#6B4A30', '#303D4E', '#4A4A4A', '#C4444A', '#2A4A2A']
const SHOE_COLORS = ['#111A24', '#222E3C', '#4A3728', '#8B4513', '#F2E8D8', '#C44444', '#303D4E', '#1A2535']
const COAT_COLORS = ['#192331', '#303D4E', '#4A3728', '#658B86', '#C48F9A', '#E3B775', '#F2E8D8', '#5B7FA6']

function loadPresets(): AvatarPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function savePresetsToStorage(presets: AvatarPreset[]) {
  try { localStorage.setItem(PRESETS_KEY, JSON.stringify(presets)) } catch {}
}

// ── HairThumbnail ─────────────────────────────────────────────────────────────
function HairThumbnail({ hairStyle, config, selected, onClick }: {
  hairStyle: string
  config: AvatarConfig
  selected: boolean
  onClick: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const offscreen = document.createElement('canvas')
    offscreen.width = 96
    offscreen.height = 96
    const ctx = offscreen.getContext('2d')
    if (!ctx) return

    const previewConfig = { ...config, hairStyle }
    drawAvatar(ctx, 48, 58, previewConfig, '', 'online', false, false, false, 0)

    // Crop head region: x=[30,66], y=[16,62]
    const cropX = 30, cropY = 16, cropW = 36, cropH = 46
    const thumb = canvasRef.current
    if (!thumb) return
    const tctx = thumb.getContext('2d')
    if (!tctx) return
    tctx.clearRect(0, 0, thumb.width, thumb.height)
    tctx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, thumb.width, thumb.height)
  }, [hairStyle, config])

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all focus:outline-none
        ${selected
          ? 'border-olive bg-olive-soft'
          : 'border-border bg-canvas hover:border-border-strong'}`}
      title={hairStyle}
    >
      <canvas
        ref={canvasRef}
        width={44}
        height={52}
        style={{ imageRendering: 'pixelated', width: 44, height: 52 }}
        aria-hidden="true"
      />
    </button>
  )
}

function ClothingThumbnail({ config, patch, label, selected, onClick }: {
  config: AvatarConfig
  patch: Partial<AvatarConfig>
  label: string
  selected: boolean
  onClick: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const patchKey = JSON.stringify(patch)

  useEffect(() => {
    const offscreen = document.createElement('canvas')
    offscreen.width = 96
    offscreen.height = 96
    const ctx = offscreen.getContext('2d')
    if (!ctx) return
    drawAvatar(ctx, 48, 56, { ...config, ...patch }, '', 'online', false, false, false, 0)
    const thumb = canvasRef.current
    if (!thumb) return
    const tctx = thumb.getContext('2d')
    if (!tctx) return
    tctx.imageSmoothingEnabled = false
    tctx.clearRect(0, 0, thumb.width, thumb.height)
    tctx.drawImage(offscreen, 16, 8, 64, 86, 0, 0, thumb.width, thumb.height)
  }, [config, patchKey, patch])

  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
      className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/60
        ${selected
          ? 'border-olive bg-olive-soft'
          : 'border-border bg-canvas hover:border-border-strong'}`}
    >
      <canvas
        ref={canvasRef}
        width={48}
        height={64}
        style={{ imageRendering: 'pixelated', width: 48, height: 64 }}
        aria-hidden="true"
      />
      <span className={`text-[10px] leading-tight text-center ${selected ? 'text-olive' : 'text-ink-2'}`}>{label}</span>
    </button>
  )
}

// ── Colour swatch ─────────────────────────────────────────────────────────────
function Swatch({ color, selected, onClick, label }: {
  color: string; selected: boolean; onClick: () => void; label?: string
}) {
  return (
    <button
      onClick={onClick}
      title={label || color}
      aria-label={label || color}
      className={`w-6 h-6 rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/60
        ${selected ? 'border-ink scale-110 ring-2 ring-olive/40' : 'border-border hover:scale-105'}`}
      style={{ background: color }}
    />
  )
}

// ── Chip button ───────────────────────────────────────────────────────────────
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 border text-[12px] font-medium rounded transition-all cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/60
        ${active
          ? 'bg-olive-soft border-olive/40 text-olive'
          : 'bg-canvas border-border text-ink-2 hover:border-border-strong hover:text-ink'}`}
    >
      {label}
    </button>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="type-small text-ink-3 uppercase tracking-wider mb-2.5">{title}</p>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AvatarCreatorScreen({ initial, onSave, onBack }: AvatarCreatorScreenProps) {
  const [config, setConfig] = useState<AvatarConfig>(initial)
  const [name, setName] = useState('You')
  const [tab, setTab] = useState<Tab>('hair')
  const [presets, setPresets] = useState<AvatarPreset[]>(loadPresets)
  const [presetName, setPresetName] = useState('')

  const update = useCallback((partial: Partial<AvatarConfig>) => {
    setConfig(c => ({ ...c, ...partial }))
  }, [])

  const savePreset = () => {
    if (!presetName.trim()) return
    const preset: AvatarPreset = {
      id: `preset_${Date.now()}`,
      name: presetName.trim(),
      config: { ...config },
    }
    const next = [...presets, preset].slice(-5)
    setPresets(next)
    savePresetsToStorage(next)
    setPresetName('')
  }

  const deletePreset = (id: string) => {
    const next = presets.filter(p => p.id !== id)
    setPresets(next)
    savePresetsToStorage(next)
  }

  const loadPreset = (p: AvatarPreset) => {
    setConfig(p.config)
    setTab('hair')
  }

  const setDefault = (id: string) => {
    const next = presets.map(p => ({ ...p, isDefault: p.id === id }))
    setPresets(next)
    savePresetsToStorage(next)
  }

  return (
    <div className="h-screen bg-canvas flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-surface px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-ink-2 hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/60"
        >
          <ArrowLeft size={14} strokeWidth={1.75} /> Back
        </button>
        <h1 className="type-h3 text-ink flex-1 text-center">Customise your avatar</h1>
        <div className="w-14" />
      </div>

      {/* Body — centered two-column layout */}
      <div className="flex flex-1 overflow-hidden max-w-3xl mx-auto w-full">
        {/* Left: controls */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Display name */}
          <div className="mb-5">
            <p className="type-small text-ink-3 uppercase tracking-wider mb-2">Display name</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full h-9 bg-canvas border border-border rounded px-3 text-[14px] text-ink
                placeholder-ink-3 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/30"
              maxLength={24}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 overflow-x-auto pb-0.5">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 text-[12px] font-medium rounded whitespace-nowrap border transition-all focus:outline-none
                  ${tab === t.id
                    ? 'bg-olive-soft border-olive/40 text-olive'
                    : 'bg-surface border-border text-ink-2 hover:text-ink'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'hair' && (
            <div>
              <Section title="Skin tone">
                <div className="flex gap-2 flex-wrap">
                  {SKIN_TONES.map(t => (
                    <Swatch
                      key={t.id}
                      color={t.color}
                      selected={config.skinTone === t.color}
                      onClick={() => update({ skinTone: t.color })}
                      label={t.name}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Hair style">
                <div className="grid grid-cols-5 gap-1.5">
                  {HAIRSTYLES_V2.map(h => (
                    <HairThumbnail
                      key={h.id}
                      hairStyle={h.id}
                      config={config}
                      selected={config.hairStyle === h.id}
                      onClick={() => update({ hairStyle: h.id })}
                    />
                  ))}
                </div>
                {/* Current style label */}
                {config.hairStyle && (
                  <p className="mt-2 text-[12px] text-ink-2 text-center">
                    {HAIRSTYLES_V2.find(h => h.id === config.hairStyle)?.label ?? config.hairStyle}
                  </p>
                )}
              </Section>

              <Section title="Hair colour">
                <div className="flex gap-1.5 flex-wrap">
                  {HAIR_COLORS.map(c => (
                    <Swatch key={c} color={c} selected={config.hairColor === c} onClick={() => update({ hairColor: c })} />
                  ))}
                </div>
              </Section>
            </div>
          )}

          {tab === 'face' && (
            <div>
              <Section title="Eye colour">
                <div className="flex gap-1.5 flex-wrap">
                  {EYE_COLORS.map(c => (
                    <Swatch key={c} color={c} selected={(config.eyeColor ?? '#0E1820') === c} onClick={() => update({ eyeColor: c })} />
                  ))}
                </div>
              </Section>

              <Section title="Eye shape">
                <div className="flex flex-wrap gap-1.5">
                  {(['round', 'almond', 'wide'] as const).map(shape => (
                    <Chip key={shape} label={shape.charAt(0).toUpperCase() + shape.slice(1)} active={(config.eyeShape ?? 'round') === shape} onClick={() => update({ eyeShape: shape })} />
                  ))}
                </div>
              </Section>

              <Section title="Brow style">
                <div className="flex flex-wrap gap-1.5">
                  {(['default', 'arched', 'thick'] as const).map(brow => (
                    <Chip key={brow} label={brow.charAt(0).toUpperCase() + brow.slice(1)} active={(config.browStyle ?? 'default') === brow} onClick={() => update({ browStyle: brow })} />
                  ))}
                </div>
              </Section>

              <Section title="Freckles">
                <button
                  onClick={() => update({ freckles: !config.freckles })}
                  className={`px-4 py-2 border text-[13px] font-medium rounded transition-all focus:outline-none
                    ${config.freckles
                      ? 'bg-olive-soft border-olive/40 text-olive'
                      : 'bg-canvas border-border text-ink-2 hover:text-ink'}`}
                >
                  {config.freckles ? 'Freckles on' : 'Add freckles'}
                </button>
              </Section>
            </div>
          )}

          {tab === 'clothing' && (
            <div>
              <Section title="Full looks">
                <div className="grid grid-cols-3 gap-1.5">
                  {OUTFIT_LOOKS.map(look => {
                    const worn = resolveAvatarClothing(config)
                    const selected = worn.top === look.patch.top
                      && worn.bottom === look.patch.bottom
                      && worn.shoes === look.patch.shoes
                      && worn.outerwear === (look.patch.outerwear || 'none')
                    return (
                      <ClothingThumbnail
                        key={look.id}
                        label={look.label}
                        config={config}
                        patch={look.patch}
                        selected={selected}
                        onClick={() => update(look.patch)}
                      />
                    )
                  })}
                </div>
              </Section>

              <Section title="Tops">
                <div className="grid grid-cols-4 gap-1.5">
                  {CLOTHING_TOPS.map(t => (
                    <ClothingThumbnail
                      key={t.id}
                      label={t.label}
                      config={config}
                      patch={{ top: t.id, outfit: t.id }}
                      selected={resolveAvatarClothing(config).top === t.id}
                      onClick={() => update({ top: t.id, outfit: t.id })}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Top colour">
                <div className="flex gap-1.5 flex-wrap">
                  {OUTFIT_COLORS.map(c => (
                    <Swatch key={c} color={c} selected={(config.topColor ?? config.outfitColor) === c} onClick={() => update({ topColor: c, outfitColor: c })} />
                  ))}
                </div>
              </Section>

              <Section title="Bottoms">
                <div className="grid grid-cols-4 gap-1.5">
                  {CLOTHING_BOTTOMS.map(b => (
                    <ClothingThumbnail
                      key={b.id}
                      label={b.label}
                      config={config}
                      patch={{ bottom: b.id }}
                      selected={resolveAvatarClothing(config).bottom === b.id}
                      onClick={() => update({ bottom: b.id })}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Bottom colour">
                <div className="flex gap-1.5 flex-wrap">
                  {BOTTOM_COLORS.map(c => (
                    <Swatch key={c} color={c} selected={(config.bottomColor ?? '#283A50') === c} onClick={() => update({ bottomColor: c })} />
                  ))}
                </div>
              </Section>

              <Section title="Shoes">
                <div className="grid grid-cols-4 gap-1.5">
                  {CLOTHING_SHOES.map(s => (
                    <ClothingThumbnail
                      key={s.id}
                      label={s.label}
                      config={config}
                      patch={{ shoes: s.id }}
                      selected={resolveAvatarClothing(config).shoes === s.id}
                      onClick={() => update({ shoes: s.id })}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Shoe colour">
                <div className="flex gap-1.5 flex-wrap">
                  {SHOE_COLORS.map(c => (
                    <Swatch key={c} color={c} selected={(config.shoesColor ?? '#111A24') === c} onClick={() => update({ shoesColor: c })} />
                  ))}
                </div>
              </Section>

              <Section title="Outerwear">
                <div className="grid grid-cols-4 gap-1.5">
                  {CLOTHING_OUTERWEAR.map(o => (
                    <ClothingThumbnail
                      key={o.id}
                      label={o.label}
                      config={config}
                      patch={{ outerwear: o.id, outerwearColor: config.outerwearColor || '#303D4E' }}
                      selected={resolveAvatarClothing(config).outerwear === (o.id === 'none' ? 'none' : o.id)}
                      onClick={() => update({ outerwear: o.id, outerwearColor: config.outerwearColor || '#303D4E' })}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Outerwear colour">
                <div className="flex gap-1.5 flex-wrap">
                  {COAT_COLORS.map(c => (
                    <Swatch key={c} color={c} selected={(config.outerwearColor ?? '#303D4E') === c} onClick={() => update({ outerwearColor: c })} />
                  ))}
                </div>
              </Section>
            </div>
          )}

          {tab === 'accessories' && (
            <div>
              <Section title="Glasses">
                <div className="flex flex-wrap gap-1.5">
                  {ACCESSORY_GLASSES.map(a => (
                    <Chip key={a.id} label={a.label} active={(config.glasses ?? 'none') === a.id} onClick={() => update({ glasses: a.id })} />
                  ))}
                </div>
              </Section>

              <Section title="Headwear">
                <div className="flex flex-wrap gap-1.5">
                  {ACCESSORY_HEADWEAR.map(a => (
                    <Chip key={a.id} label={a.label} active={(config.headwear ?? 'none') === a.id} onClick={() => update({ headwear: a.id })} />
                  ))}
                </div>
              </Section>

              <Section title="Neckwear">
                <div className="flex flex-wrap gap-1.5">
                  {ACCESSORY_NECKWEAR.map(a => (
                    <Chip key={a.id} label={a.label} active={(config.neckwear ?? 'none') === a.id} onClick={() => update({ neckwear: a.id })} />
                  ))}
                </div>
              </Section>
            </div>
          )}

          {tab === 'presets' && (
            <div>
              <Section title="Save current look">
                <div className="flex gap-2">
                  <input
                    value={presetName}
                    onChange={e => setPresetName(e.target.value)}
                    placeholder="Preset name…"
                    onKeyDown={e => e.key === 'Enter' && savePreset()}
                    className="flex-1 h-9 bg-canvas border border-border rounded px-3 text-[14px] text-ink
                      placeholder-ink-3 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/30"
                    maxLength={24}
                  />
                  <Button size="sm" onClick={savePreset} disabled={!presetName.trim()}>
                    <Save size={14} strokeWidth={1.75} />
                  </Button>
                </div>
                {presets.length >= 5 && (
                  <p className="mt-1.5 text-[11px] text-ink-3">Delete a preset to save another (max 5)</p>
                )}
              </Section>

              <Section title="Saved presets">
                {presets.length === 0 ? (
                  <p className="text-[13px] text-ink-3">No presets saved yet.</p>
                ) : (
                  <div className="space-y-2">
                    {presets.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-surface"
                      >
                        <AvatarSprite config={p.config} status="online" name="" size={48} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-ink truncate">{p.name}</p>
                          {p.isDefault && (
                            <p className="text-[11px] text-olive">Default</p>
                          )}
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => loadPreset(p)}
                            className="px-2 py-1 text-[11px] border border-border rounded text-ink-2 hover:text-ink hover:border-border-strong transition-all focus:outline-none"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => setDefault(p.id)}
                            className={`p-1 border rounded transition-all focus:outline-none
                              ${p.isDefault ? 'border-olive text-olive' : 'border-border text-ink-3 hover:text-ink hover:border-border-strong'}`}
                            title="Set as default"
                          >
                            <Star size={12} strokeWidth={1.75} fill={p.isDefault ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => deletePreset(p.id)}
                            className="p-1 border border-border rounded text-ink-3 hover:text-error hover:border-error transition-all focus:outline-none"
                            title="Delete preset"
                          >
                            <Trash2 size={12} strokeWidth={1.75} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}
        </div>

        {/* Right: preview */}
        <div className="hidden sm:flex flex-col self-start sticky top-6 mx-6 mb-6">
          <div className="rounded-2xl border border-border bg-surface shadow-sm p-5 flex flex-col items-center gap-3 w-[220px]">
            <p className="type-small text-ink-3 uppercase tracking-wider">Preview</p>
            <div className="rounded-xl bg-canvas border border-border p-2">
              <AvatarSprite
                config={config}
                status="online"
                name=""
                size={96}
                className="block"
                style={{ width: '180px', height: '180px' }}
              />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-ink">{name || 'Your name'}</p>
              <p className="mt-1 text-[11px] leading-snug text-ink-2">
                {[
                  CLOTHING_TOPS.find(t => t.id === resolveAvatarClothing(config).top)?.label,
                  CLOTHING_BOTTOMS.find(b => b.id === resolveAvatarClothing(config).bottom)?.label,
                  CLOTHING_SHOES.find(s => s.id === resolveAvatarClothing(config).shoes)?.label,
                  resolveAvatarClothing(config).outerwear !== 'none'
                    ? CLOTHING_OUTERWEAR.find(o => o.id === resolveAvatarClothing(config).outerwear)?.label
                    : null,
                ].filter(Boolean).join(' · ')}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="type-small text-ink-2">Online</span>
              </div>
            </div>
            <Button
              className="w-full"
              size="md"
              onClick={() => onSave(config, name)}
              iconRight={<ArrowRight size={15} strokeWidth={1.75} />}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile: bottom save bar */}
      <div className="sm:hidden flex-shrink-0 bg-surface border-t border-border px-4 py-3">
        <Button
          className="w-full"
          size="lg"
          onClick={() => onSave(config, name)}
          iconRight={<ArrowRight size={16} strokeWidth={1.75} />}
        >
          Save & Continue
        </Button>
      </div>
    </div>
  )
}
