import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import './styles/PublicLayout.css'

/* Mise en page commune à toutes les pages publiques.
   Encapsule la navigation (Header → Navbar) et le pied de page
   autour du contenu de la route active via <Outlet />. */
export default function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}
