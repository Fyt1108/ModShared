/* @refresh reload */
import "flyonui/flyonui"
import { render } from 'solid-js/web'

import { Router } from "@solidjs/router"
import App from "./App"
import './index.css'
import { Routes } from "./routes"

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  )
}

render(() => <Router root={App} >{Routes}</Router >, root!)