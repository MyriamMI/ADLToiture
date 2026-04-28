import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./styles/LoginPage.css";

export default function LoginPage() {
  /* État du formulaire */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  /* Soumission du formulaire — appel API d'authentification */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ── Mock temporaire — supprimer ce bloc quand l'API PHP est prête ──
      if (username === "admin" && password === "admin123") {
        login("fake-jwt-token");
        navigate("/admin/dashboard");
      } else {
        setError("Identifiants incorrects");
      }

      // ── Vrai appel API — décommenter quand l'API PHP est prête ──
      // const response = await fetch('/api/auth/login.php', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password }),
      // })
      // const data = await response.json()
      // if (!response.ok) {
      //   setError(data.message || 'Identifiants incorrects. Veuillez réessayer.')
      //   return
      // }
      // login(data.token)
      // navigate('/admin/dashboard', { replace: true })
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* ── Colonne gauche — identité de marque ── */}
      <div className="login-page__brand">
        <div className="login-page__brand-top">
          {/* Badge logo */}
          <div className="login-page__logo">ADL</div>

          <div>
            <p className="login-page__brand-name">ADLToiture</p>
            <p className="login-page__brand-tagline">
              Espace d'administration — gérez vos rendez-vous, devis et clients
              depuis un seul endroit.
            </p>
          </div>
        </div>

        {/* Lien retour au site public — ancré en bas de la colonne */}
        <Link to="/" className="login-page__back">
          ← Retour au site public
        </Link>
      </div>

      {/* ── Colonne droite — formulaire de connexion ── */}
      <div className="login-page__form-wrapper">
        <div className="login-page__card">
          <h1 className="login-page__card-title">Connexion</h1>
          <p className="login-page__card-subtitle">
            Accès réservé aux administrateurs
          </p>

          {/* Formulaire d'authentification */}
          <form className="login-page__form" onSubmit={handleSubmit} noValidate>
            {/* Champ nom d'utilisateur */}
            <div className="login-page__field">
              <label className="login-page__label" htmlFor="username">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                className="login-page__input"
                type="text"
                autoComplete="username"
                placeholder="Votre identifiant"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Champ mot de passe */}
            <div className="login-page__field">
              <label className="login-page__label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                className="login-page__input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Lien mot de passe oublié */}
            <a href="#" className="login-page__forgot">
              Mot de passe oublié ?
            </a>

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="login-page__submit"
              disabled={loading}
            >
              {loading ? "Connexion…" : "Se Connecter"}
            </button>

            {/* Message d'erreur — affiché uniquement en cas d'échec */}
            {error && <p className="login-page__error">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
