import type { PropsWithChildren } from 'react'
import { X } from 'lucide-react'

export function Modal({ title, onClose, children }: PropsWithChildren<{ title: string; onClose: () => void }>) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}><header><h2 id="modal-title">{title}</h2><button type="button" aria-label="Fechar" onClick={onClose}><X size={20}/></button></header>{children}</section></div>
}
