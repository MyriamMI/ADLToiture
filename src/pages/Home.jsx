import Hero from '../components/sections/Hero'
import Services from '../components/sections/Services'
import About from '../components/sections/About'
import References from '../components/sections/References'
import Contact from '../components/sections/Contact'

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <About />
      <References />
      <Contact />
    </main>
  )
}
