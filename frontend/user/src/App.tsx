import { useLocation } from "@solidjs/router"
import { IStaticMethods } from "flyonui/flyonui"
import 'notyf/notyf.min.css'
import type { ParentComponent } from 'solid-js'
import { createEffect, createSignal } from "solid-js"
import { Footer } from "./components/Footer"
import { NavBar } from "./components/NavBar"
import { I18nContextProvider } from "./context/I18nContext"
import { NotifyContextProvider } from "./context/NotifyContext"

declare global {
  interface Window {
    HSStaticMethods: IStaticMethods
  }
}

const App: ParentComponent = (props) => {
  initFlyonui()

  return (
    <I18nContextProvider>
      <div class="flex flex-col min-h-screen">
        <div class="fixed top-0 w-full z-10">
          <NavBar />
        </div>

        <NotifyContextProvider>
          <div class="flex flex-grow mt-16">
            {props.children}
          </div>
        </NotifyContextProvider>

        <div class="w-full">
          <Footer></Footer>
        </div>
      </div>
    </I18nContextProvider>
  )
}

const initFlyonui = () => {
  const location = useLocation()
  const [_, setLoc] = createSignal(location.pathname)

  createEffect(() => {
    setLoc(location.pathname)

    window.HSStaticMethods.autoInit()
  })
}

export default App