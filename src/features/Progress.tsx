import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Camera, ChevronRight, CircleGauge, ImagePlus, Plus, Ruler, Scale, Trophy, Upload } from 'lucide-react'
import { Modal } from '../components/Modal'
import { Button, Card, Metric, Pill, SectionHeading } from '../components/ui'
import { NumericInput } from '../components/NumericInput'
import { calculateForecast, currentWeight, formatKg, formatShortDate } from '../domain/calculations'
import type { Measurements, Profile, ProgressPhoto, WeightEntry } from '../domain/types'

function WeightChart({ entries, profile }: { entries: WeightEntry[]; profile: Profile }) {
  const points = entries.length ? entries : [{ id: 'initial', date: profile.createdAt, weightKg: profile.weightKg }]
  const all = [...points.map((item) => item.weightKg), profile.goalWeightKg]
  const min = Math.min(...all) - .7
  const max = Math.max(...all) + .7
  const width = 340
  const height = 150
  const coords = points.map((point, index) => {
    const x = points.length === 1 ? 14 : 14 + (index / (points.length - 1)) * (width - 28)
    const y = height - 24 - ((point.weightKg - min) / (max - min)) * (height - 48)
    return { x, y, ...point }
  })
  const line = coords.map((point) => `${point.x},${point.y}`).join(' ')
  const goalY = height - 24 - ((profile.goalWeightKg - min) / (max - min)) * (height - 48)
  return <div className="weight-chart"><div className="chart-label chart-goal" style={{ top: `${goalY / height * 100}%` }}>meta {formatKg(profile.goalWeightKg)}</div><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label="Gráfico de evolução do peso"><defs><linearGradient id="areaBlue" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#5E8CFF" stopOpacity=".45"/><stop offset="1" stopColor="#5E8CFF" stopOpacity="0"/></linearGradient></defs><line x1="0" x2={width} y1={goalY} y2={goalY} stroke="#79E7FF" strokeDasharray="4 5" opacity=".6"/><path d={`M${coords[0].x},${height} L${line.replaceAll(' ', ' L')} L${coords[coords.length - 1].x},${height} Z`} fill="url(#areaBlue)"/><polyline points={line} fill="none" stroke="#79E7FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{coords.map((point) => <circle key={point.id} cx={point.x} cy={point.y} r="4" fill="#10172B" stroke="#79E7FF" strokeWidth="2"/>)}</svg><div className="chart-axis"><span>{formatShortDate(points[0].date)}</span><span>hoje</span></div></div>
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('Não foi possível processar a imagem.'))
      image.onload = () => {
        const maxWidth = 1080
        const scale = Math.min(1, maxWidth / image.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', .78))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export function Progress({ profile, weightEntries, measurements, photos, openWeightModal, onLogWeight, onLogMeasurements, onAddPhoto }: { profile: Profile; weightEntries: WeightEntry[]; measurements: Measurements[]; photos: ProgressPhoto[]; openWeightModal: number; onLogWeight: (weight: number) => void; onLogMeasurements: (values: Omit<Measurements, 'id' | 'date'>) => void; onAddPhoto: (photo: Omit<ProgressPhoto, 'id' | 'date'>) => void }) {
  const [weightOpen, setWeightOpen] = useState(false)
  const [measureOpen, setMeasureOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)
  const current = currentWeight(profile, weightEntries)
  const gained = current - profile.weightKg
  const toGoal = Math.max(0, profile.goalWeightKg - current)
  const forecast = calculateForecast({ ...profile, weightKg: current })
  const latestMeasures = measurements[measurements.length - 1]
  const sortedPhotos = [...photos].sort((a, b) => b.date.localeCompare(a.date))
  useEffect(() => { if (openWeightModal > 0) setWeightOpen(true) }, [openWeightModal])
  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try { onAddPhoto({ dataUrl: await compressImage(file) }); setPhotoOpen(false) } catch { /* UI stays usable if a file cannot be handled */ }
  }

  return <>
    <section className="page-intro"><p className="eyebrow">EVOLUÇÃO REAL, NÃO PERFEITA</p><h1>Veja a tendência, <span>não só o dia.</span></h1><p className="page-lead">Peso, medidas e fotos viram um registro seu. Nada é enviado para fora deste dispositivo.</p></section>
    <section className="metrics-grid progress-metrics"><Metric label="Peso atual" value={formatKg(current)} detail={gained > 0 ? `+${gained.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg desde o início` : 'seu ponto de partida'} accent/><Metric label="Falta para meta" value={formatKg(toGoal)} detail={`${forecast.minWeeks}–${forecast.maxWeeks} sem. na faixa inicial`}/></section>
    <section className="section-block"><SectionHeading eyebrow="PESO · SEMANAL" title="Sua curva" action={<button type="button" className="text-action" onClick={() => setWeightOpen(true)}>Registrar <Plus size={15}/></button>}/><Card className="weight-card"><div className="weight-card-top"><div><span>Meta</span><strong>{formatKg(profile.goalWeightKg)}</strong></div><Pill tone="blue">0,4–0,6 kg/sem</Pill></div><WeightChart entries={weightEntries} profile={profile}/><p>Registre em condições parecidas, idealmente uma vez por semana. O ritmo varia e a faixa é apenas uma projeção.</p></Card></section>
    <section className="section-block"><SectionHeading eyebrow="MEDIDAS · MENSAL" title="Mais do que a balança" action={<button type="button" className="text-action" onClick={() => setMeasureOpen(true)}>Adicionar <Plus size={15}/></button>}/>{latestMeasures ? <Card className="measures-card"><div className="measure-grid">{([['Braço', latestMeasures.armCm], ['Peito', latestMeasures.chestCm], ['Coxa', latestMeasures.thighCm], ['Cintura', latestMeasures.waistCm]] as Array<[string, number | undefined]>).map(([label, value]) => <div key={label}><span>{label}</span><b>{value ? `${value} cm` : '—'}</b></div>)}</div><small>última atualização: {formatShortDate(latestMeasures.date)}</small></Card> : <button type="button" className="empty-card" onClick={() => setMeasureOpen(true)}><span><Ruler size={20}/></span><div><b>Seu primeiro retrato mensal</b><p>Registre medidas para acompanhar mudanças que o peso não mostra.</p></div><ChevronRight size={18}/></button>}</section>
    <section className="section-block"><SectionHeading eyebrow="FOTOS · QUINZENAL" title="Progresso visual" action={<button type="button" className="text-action" onClick={() => setPhotoOpen(true)}>Adicionar <Plus size={15}/></button>}/>{sortedPhotos.length ? <div className="photos-grid">{sortedPhotos.slice(0, 4).map((photo) => <figure key={photo.id}><img src={photo.dataUrl} alt={`Foto de progresso de ${formatShortDate(photo.date)}`}/><figcaption>{formatShortDate(photo.date)}</figcaption></figure>)}<button type="button" className="photo-add" onClick={() => setPhotoOpen(true)}><ImagePlus size={20}/>Adicionar</button></div> : <button type="button" className="photo-empty" onClick={() => setPhotoOpen(true)}><Camera size={22}/><b>Fotos só para você</b><span>Salvas localmente, em seu dispositivo.</span></button>}</section>
    <Card className="milestone-card"><span><Trophy size={20}/></span><div><small>PRÓXIMO MARCO</small><b>{toGoal > 0 ? `Faltam ${formatKg(Math.min(1, toGoal))} para o próximo +1 kg` : 'Meta alcançada — hora de revisar o próximo passo'}</b></div><CircleGauge size={23}/></Card>
    {weightOpen && <WeightModal current={current} onClose={() => setWeightOpen(false)} onSave={(weight) => { onLogWeight(weight); setWeightOpen(false) }}/>}
    {measureOpen && <MeasureModal onClose={() => setMeasureOpen(false)} onSave={(values) => { onLogMeasurements(values); setMeasureOpen(false) }}/>}
    {photoOpen && <Modal title="Adicionar foto" onClose={() => setPhotoOpen(false)}><div className="photo-upload"><Upload size={26}/><b>Escolha uma foto de progresso</b><p>A imagem é comprimida e salva apenas no banco local deste navegador.</p><input ref={photoRef} type="file" accept="image/*" onChange={handleImage}/></div></Modal>}
  </>
}

function WeightModal({ current, onClose, onSave }: { current: number; onClose: () => void; onSave: (weight: number) => void }) {
  const [weight, setWeight] = useState(current)
  return <Modal title="Registrar peso" onClose={onClose}><p className="modal-copy">Tente pesar-se em condições parecidas. Uma vez por semana já é suficiente para enxergar a tendência.</p><label className="field"><span>Peso de hoje (kg)</span><NumericInput autoFocus minimum={20} maximum={300} value={weight} onValueChange={setWeight}/><small className="numeric-hint">Você pode apagar e digitar novamente sem o campo inserir zero.</small></label><Button className="wide" onClick={() => onSave(weight)}>Salvar registro</Button></Modal>
}

function MeasureModal({ onClose, onSave }: { onClose: () => void; onSave: (values: Omit<Measurements, 'id' | 'date'>) => void }) {
  const [values, setValues] = useState<Record<string, number | undefined>>({ armCm: undefined, chestCm: undefined, thighCm: undefined, calfCm: undefined, waistCm: undefined })
  const labels: Array<[keyof Omit<Measurements, 'id' | 'date'>, string]> = [['armCm', 'Braço'], ['chestCm', 'Peito'], ['thighCm', 'Coxa'], ['calfCm', 'Panturrilha'], ['waistCm', 'Cintura']]
  return <Modal title="Registrar medidas" onClose={onClose}><p className="modal-copy">Registre uma vez por mês, de preferência no mesmo horário e nas mesmas condições.</p><div className="two-fields">{labels.map(([key, label]) => <label className="field" key={key}><span>{label} (cm)</span><NumericInput minimum={0} value={values[key]} onValueChange={(value) => setValues((current) => ({ ...current, [key]: value }))} onEmpty={() => setValues((current) => ({ ...current, [key]: undefined }))}/></label>)}</div><Button className="wide" onClick={() => onSave(Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)))}>Salvar medidas</Button></Modal>
}
