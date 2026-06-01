import Hero from '../components/sections/Hero'
import Services from '../components/sections/Services'
import AvisClients from '../components/sections/AvisClients'
import About from '../components/sections/About'
import Contact from '../components/sections/Contact'

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <AvisClients />
      <About />
      <Contact />
    </main>
  )
}
