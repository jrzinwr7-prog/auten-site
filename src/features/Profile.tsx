import { ChangeEvent, useRef, useState } from 'react'
import { BookOpenCheck, ChevronRight, Download, FileUp, LockKeyhole, Pencil, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { Button, Card, Pill, SectionHeading } from '../components/ui'
import { lessons } from '../data/education'
import type { PersistedAppState, Profile } from '../domain/types'

export function ProfileView({ profile, onUpdate, onExport, onImport, onReset }: { profile: Profile; onUpdate: (profile: Profile) => void; onExport: () => void; onImport: (file: File) => Promise<boolean>; onReset: () => void }) {
  const [editing, setEditing] = useState(false)
  const [openLesson, setOpenLesson] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) await onImport(file)
    event.target.value = ''
  }
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => onUpdate({ ...profile, [key]: value })
  return <>
    <section className="profile-hero"><span className="profile-avatar"><UserRound size={24}/></span><div><p className="eyebrow">SEU PERFIL</p><h1>{profile.displayName?.trim() || 'Seu plano'}<span>.</span></h1><p>{profile.location === 'casa' ? 'Treino em casa' : 'Treino na academia'} · {profile.daysPerWeek} dias por semana</p></div><button type="button" className="round-button" aria-label="Editar perfil" onClick={() => setEditing(!editing)}><Pencil size={17}/></button></section>
    {editing && <Card className="edit-profile"><div className="edit-profile-head"><b>Ajustar plano</b><button type="button" onClick={() => setEditing(false)}>Concluir</button></div><div className="two-fields"><label className="field"><span>Seu nome <small>opcional</small></span><input value={profile.displayName ?? ''} onChange={(event) => update('displayName', event.target.value)}/></label><label className="field"><span>Peso atual</span><input type="number" step=".1" value={profile.weightKg} onChange={(event) => update('weightKg', Number(event.target.value))}/></label></div><div className="two-fields"><label className="field"><span>Meta (kg)</span><input type="number" step=".1" value={profile.goalWeightKg} onChange={(event) => update('goalWeightKg', Number(event.target.value))}/></label><label className="field"><span>Orçamento mensal</span><input type="number" value={profile.foodBudget} onChange={(event) => update('foodBudget', Number(event.target.value))}/></label></div><label className="range-field"><span>Dias de treino <b>{profile.daysPerWeek}x por semana</b></span><input type="range" min="2" max="4" value={profile.daysPerWeek} onChange={(event) => update('daysPerWeek', Number(event.target.value))}/></label></Card>}
    <section className="profile-stat-row"><div><span>Ponto de partida</span><b>{profile.weightKg.toLocaleString('pt-BR')} kg</b></div><div><span>Meta</span><b>{profile.goalWeightKg.toLocaleString('pt-BR')} kg</b></div><div><span>Orçamento</span><b>R$ {profile.foodBudget}</b></div></section>
    <section className="section-block"><SectionHeading eyebrow="APRENDER EM 2 MIN" title="Base antes do hype"/><div className="lesson-list">{lessons.map((lesson) => <Card key={lesson.id} className={`lesson-card ${openLesson === lesson.id ? 'is-open' : ''}`}><button type="button" onClick={() => setOpenLesson(openLesson === lesson.id ? null : lesson.id)}><span className="lesson-icon"><BookOpenCheck size={19}/></span><div><Pill tone="blue">{lesson.tag}</Pill><b>{lesson.title}</b><small>{lesson.time} de leitura</small></div><ChevronRight size={18}/></button>{openLesson === lesson.id && <p>{lesson.text}</p>}</Card>)}</div></section>
    <section className="section-block"><SectionHeading eyebrow="PRIVACIDADE" title="Seus dados, seu controle"/><Card className="privacy-card"><span><LockKeyhole size={20}/></span><div><b>Nenhuma conta necessária</b><p>Perfil, histórico e fotos permanecem neste navegador. Limpar dados do navegador pode apagá-los.</p></div><Pill tone="mint">LOCAL</Pill></Card><div className="data-actions"><button type="button" onClick={onExport}><Download size={18}/><span><b>Exportar meu backup</b><small>Baixe seus dados em JSON</small></span><ChevronRight size={18}/></button><button type="button" onClick={() => fileInput.current?.click()}><FileUp size={18}/><span><b>Importar backup</b><small>Restaure dados deste dispositivo</small></span><ChevronRight size={18}/></button><input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={importData}/></div><div className="privacy-note"><ShieldCheck size={17}/><p>Uma futura sincronização só será adicionada com escolha explícita, política de privacidade e controles de conta.</p></div><button type="button" className="reset-button" onClick={() => { if (window.confirm('Apagar todos os dados locais do BodyUp? Esta ação não pode ser desfeita.')) onReset() }}><Trash2 size={16}/>Apagar dados deste dispositivo</button></section>
  </>
}

export function downloadState(state: PersistedAppState) {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data: state }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `bodyup-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function parseBackup(file: File): Promise<PersistedAppState | null> {
  try {
    const parsed = JSON.parse(await file.text())
    const data = parsed.data as PersistedAppState
    if (!data || data.id !== 'current' || !Array.isArray(data.weightEntries) || !Array.isArray(data.workoutLogs)) return null
    return data
  } catch { return null }
}
