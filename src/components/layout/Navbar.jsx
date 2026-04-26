import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import '../../styles/Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="navbar">
      <div className="navbar__container">

        {/* Logo */}
        <NavLink to="/" className="navbar__logo" onClick={closeMenu}>
          <span className="navbar__logo-badge">ADL</span>
          <span className="navbar__logo-text">Toiture</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className={`navbar__nav${menuOpen ? ' navbar__nav--open' : ''}`}>
          <ul className="navbar__links">
            <li><NavLink to="/" end onClick={closeMenu}>Accueil</NavLink></li>
            <li><NavLink to="/services" onClick={closeMenu}>Services</NavLink></li>
            <li><NavLink to="/about" onClick={closeMenu}>À propos</NavLink></li>
            <li><NavLink to="/contact" onClick={closeMenu}>Contact</NavLink></li>
          </ul>
        </nav>

        {/* Phone */}
        <a className="navbar__phone" href="tel:+32470000000">
          0470 00 00 00
        </a>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

      </div>
    </header>
  )
}
