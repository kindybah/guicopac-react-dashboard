import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/tailwind.css'
import App from './App'
import { ensureDefaults } from './lib/storage'
import { AuthProvider } from './lib/auth'
import { DataProvider } from './lib/data'
import { ensureDefaults } from "./lib/storage";

ensureDefaults()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </AuthProvider>
  </React.StrictMode>
)
