import { ArrowUpRight, Check, ShieldCheck, WifiOff } from 'lucide-react'
import { Brand, Button, Pill } from '../components/ui'

export function Welcome({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  return <main className="welcome-page">
    <header className="welcome-header"><Brand /><Pill tone="blue">BETA LOCAL</Pill></header>
    <div className="welcome-orbit" aria-hidden="true"><span/><span/><i/></div>
    <div className="welcome-photo" aria-hidden="true"><img src="/images/bodyup-hero.jpg" alt=""/><div className="welcome-photo-chip"><span>01</span> seu primeiro passo</div></div>
    <section className="welcome-hero">
      <p className="eyebrow"><i className="live-dot"/> O seu plano, no seu ritmo</p>
      <h1>Ganhar massa não precisa ser <em>um caos.</em></h1>
      <p className="welcome-copy">Treino guiado, refeições possíveis e evolução clara — construídos para sua rotina, seu espaço e seu orçamento.</p>
      <Button onClick={onStart} className="welcome-cta">Montar meu plano</Button>
      <button type="button" className="demo-link" onClick={onDemo}>Explorar uma demonstração <ArrowUpRight size={16}/></button>
    </section>
    <section className="welcome-proof" aria-label="O que você encontrará no BodyUp">
      <div><span><Check size={15}/></span><p><b>Treino adaptável</b><small>Casa ou academia</small></p></div>
      <div><span><Check size={15}/></span><p><b>Comida de verdade</b><small>Orçamento em mente</small></p></div>
      <div><span><Check size={15}/></span><p><b>Progresso visível</b><small>Sem obsessão diária</small></p></div>
    </section>
    <footer className="welcome-footer"><span><ShieldCheck size={15}/> Seus dados ficam no seu dispositivo</span><span><WifiOff size={15}/> Funciona offline após instalar</span></footer>
  </main>
}
