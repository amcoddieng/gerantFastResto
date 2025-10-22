import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppShell from './component/AppShell.jsx'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
)
