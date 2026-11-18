import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react'
import { ChevronRight, Sparkles } from 'lucide-react'

export function Brand() {
  return <div className="brand" aria-label="BodyUp"><span className="brand-mark"><span /></span><span>Body<span>Up</span></span></div>
}

export function Card({ children, className = '', onClick }: PropsWithChildren<{ className?: string; onClick?: () => void }>) {
  return <section className={`card ${className}`} onClick={onClick}>{children}</section>
}

export function Pill({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'blue' | 'mint' | 'warning' }>) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

export function Button({ children, className = '', variant = 'primary', icon = true, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; icon?: boolean }>) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}{icon && <ChevronRight size={17} strokeWidth={2.4} />}</button>
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{action}</div>
}

export function Metric({ label, value, detail, accent = false }: { label: string; value: string; detail?: string; accent?: boolean }) {
  return <div className={`metric ${accent ? 'metric-accent' : ''}`}><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>
}

export function Insight({ children }: PropsWithChildren) {
  return <div className="insight"><span className="insight-icon"><Sparkles size={17} /></span><p>{children}</p></div>
}

export function Toggle({ checked, onChange, label, detail }: { checked: boolean; onChange: (next: boolean) => void; label: string; detail?: string }) {
  return <label className="toggle-row"><span><b>{label}</b>{detail && <small>{detail}</small>}</span><button type="button" className={`toggle ${checked ? 'is-on' : ''}`} aria-pressed={checked} onClick={() => onChange(!checked)}><i /></button></label>
}
