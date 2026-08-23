import { BootScreen } from "@/components/site/boot-screen"
import { Contact } from "@/components/site/contact"
import { FlightLog } from "@/components/site/flight-log"
import { Footer } from "@/components/site/footer"
import { Hero } from "@/components/site/hero"
import { Nav } from "@/components/site/nav"
import { Pilot } from "@/components/site/pilot"
import { Reel } from "@/components/site/reel"
import { Rig } from "@/components/site/rig"
import { Cursor, CursorProvider } from "@/components/unlumen-ui/cursor"

function App() {
  return (
    <CursorProvider global>
      <Cursor />
      <BootScreen />
      <Nav />
      <main>
        <Hero />
        <Reel />
        <FlightLog />
        <Rig />
        <Pilot />
        <Contact />
      </main>
      <Footer />
    </CursorProvider>
  )
}

export default App
