import { useEffect, useState, type InputHTMLAttributes } from 'react'

type NumericInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: number | undefined
  onValueChange: (value: number) => void
  onEmpty?: () => void
  integer?: boolean
  minimum?: number
  maximum?: number
}

/**
 * A numeric text field that lets a person clear and retype a value.
 * It deliberately does not coerce an empty string to 0 while the person types.
 */
export function NumericInput({ value, onValueChange, onEmpty, integer = false, minimum, maximum, onFocus, onBlur, ...props }: NumericInputProps) {
  const displayValue = value === undefined ? '' : String(value)
  const [raw, setRaw] = useState(displayValue)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setRaw(displayValue)
  }, [displayValue, focused])

  const normalize = (next: string) => {
    const clean = integer ? next.replace(/\D/g, '') : next.replace(',', '.').replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
    setRaw(clean)
    if (!clean || clean === '.') { onEmpty?.(); return }
    const parsed = Number(clean)
    if (Number.isFinite(parsed)) onValueChange(parsed)
  }

  const commit = () => {
    const parsed = Number(raw)
    if (!raw || !Number.isFinite(parsed)) { setRaw(displayValue); return }
    const bounded = Math.min(maximum ?? Infinity, Math.max(minimum ?? -Infinity, parsed))
    setRaw(String(bounded))
    onValueChange(bounded)
  }

  return <input {...props} type="text" inputMode={integer ? 'numeric' : 'decimal'} value={raw} onFocus={(event) => { setFocused(true); onFocus?.(event) }} onBlur={(event) => { setFocused(false); commit(); onBlur?.(event) }} onChange={(event) => normalize(event.target.value)} />
}
