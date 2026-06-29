import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Visible browser-tab title. The static <title> in index.html stays "Future Corp"
// for SEO/crawlers; this overrides what the user sees in the tab.
// TODO: randomize per reload — pick from an array of taglines here.
document.title = 'The better you look, the more you see.'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)