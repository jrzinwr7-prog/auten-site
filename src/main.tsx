import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource-variable/manrope'
import '@fontsource-variable/space-grotesk'
import App from './App'
import './styles/global.css'
import './styles/v2.css'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
