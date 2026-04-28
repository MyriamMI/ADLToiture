import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import './styles/StatistiquesPage.css'

/* ══════════════════════════════
   Données statiques — remplacer
   par /api/stats.php plus tard
══════════════════════════════ */

/* ── KPI ── */
const MOCK_KPI = {
  caMois: 18450,
  caEvolution: +12.4,        /* % vs mois précédent */
  rdvMois: 23,
  rdvEnAttente: 5,
  devisAcceptes: 9,
  devisEnvoyes: 14,
  tauxConversion: 64,        /* % */
  tauxObjectif: 70,
}

/* ── Rendez-vous par mois (6 derniers mois) ── */
const MOCK_RDV_MOIS = [
  { mois: 'Nov', nb: 15 },
  { mois: 'Déc', nb: 11 },
  { mois: 'Jan', nb: 18 },
  { mois: 'Fév', nb: 20 },
  { mois: 'Mar', nb: 17 },
  { mois: 'Avr', nb: 23 },
]

/* ── Chiffre d'affaires par mois ── */
const MOCK_CA_MOIS = [
  { mois: 'Nov', ca: 12800 },
  { mois: 'Déc', ca: 9400 },
  { mois: 'Jan', ca: 14200 },
  { mois: 'Fév', ca: 16750 },
  { mois: 'Mar', ca: 15300 },
  { mois: 'Avr', ca: 18450 },
]

/* ── Statuts des devis ── */
const MOCK_STATUTS_DEVIS = [
  { label: 'Acceptés',  value: 9,  color: '#059669' },
  { label: 'En attente', value: 5, color: '#d97706' },
  { label: 'Envoyés',   value: 4,  color: '#2563eb' },
  { label: 'Refusés',   value: 2,  color: '#dc2626' },
]

/* ── Services demandés ── */
const MOCK_SERVICES = [
  { label: 'Nettoyage HP',  pct: 32, color: '#550101' },
  { label: 'Rénovation',    pct: 27, color: '#2563eb' },
  { label: 'Zinguerie',     pct: 18, color: '#059669' },
  { label: 'Isolation',     pct: 14, color: '#d97706' },
  { label: 'Autres',        pct: 9,  color: '#9ca3af' },
]

/* ── Top services du mois ── */
const MOCK_TOP_SERVICES = [
  { service: 'Nettoyage HP',  rdv: 8,  ca: 4200,  evolution: +18 },
  { service: 'Rénovation',    rdv: 6,  ca: 7800,  evolution: +5  },
  { service: 'Zinguerie',     rdv: 4,  ca: 2950,  evolution: -3  },
  { service: 'Isolation',     rdv: 3,  ca: 2100,  evolution: +11 },
  { service: 'Urgences',      rdv: 2,  ca: 1400,  evolution: 0   },
]

/* ── Helpers ── */
const fmt = (n) =>
  new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

/* Couleur barre : dernière = rouge primaire, autres = bleu clair */
const BAR_LAST  = '#550101'
const BAR_OTHER = '#bfdbfe'

/* ══════════════════════════════
   Tooltip personnalisé — montant
══════════════════════════════ */
function TooltipCA({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="st-tooltip">
      <span className="st-tooltip__label">{label}</span>
      <span className="st-tooltip__value">{fmt(payload[0].value)}</span>
    </div>
  )
}

/* Tooltip générique pour les RDV */
function TooltipRDV({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="st-tooltip">
      <span className="st-tooltip__label">{label}</span>
      <span className="st-tooltip__value">{payload[0].value} RDV</span>
    </div>
  )
}

/* ══════════════════════════════
   Graphique horizontal custom
   (barres + étiquette à droite)
══════════════════════════════ */
function HorizontalBars({ data, maxValue, showPct }) {
  return (
    <div className="st-hbars">
      {data.map((row) => {
        const width = Math.round((row.value ?? row.pct) / maxValue * 100)
        return (
          <div key={row.label} className="st-hbar">
            <span className="st-hbar__label">{row.label}</span>
            <div className="st-hbar__track">
              <div
                className="st-hbar__fill"
                style={{ width: `${width}%`, backgroundColor: row.color }}
              />
            </div>
            <span className="st-hbar__val">
              {showPct ? `${row.pct} %` : row.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════
   Composant principal
══════════════════════════════ */
export default function StatistiquesPage() {
  const [kpi, setKpi] = useState(MOCK_KPI)
  const [rdvMois, setRdvMois]   = useState(MOCK_RDV_MOIS)
  const [caMois, setCaMois]     = useState(MOCK_CA_MOIS)

  /* ── Chargement depuis l'API (avec fallback mock) ── */
  useEffect(() => {
    fetch('/api/stats.php')
      .then((r) => r.json())
      .then((d) => {
        if (d.kpi)     setKpi(d.kpi)
        if (d.rdvMois) setRdvMois(d.rdvMois)
        if (d.caMois)  setCaMois(d.caMois)
      })
      .catch(() => { /* données mock déjà chargées */ })
  }, [])

  /* ── Valeur max pour les barres horizontales ── */
  const maxDevis   = Math.max(...MOCK_STATUTS_DEVIS.map((d) => d.value))
  const maxService = 100 /* les services sont en % */

  /* ── CA total sur 6 mois ── */
  const caTotalPeriode = caMois.reduce((s, m) => s + m.ca, 0)

  return (
    <div className="st-page">

      {/* ── En-tête ── */}
      <div className="st-header">
        <h1 className="st-title">Statistiques</h1>
        <p className="st-subtitle">Aperçu de l&apos;activité — 6 derniers mois</p>
      </div>

      {/* ══════════════════════════════
          Cartes KPI (2 × 2)
      ══════════════════════════════ */}
      <div className="st-kpi-grid">

        {/* CA du mois */}
        <div className="st-kpi">
          <span className="st-kpi__label">CA du mois</span>
          <span className="st-kpi__value">{fmt(kpi.caMois)}</span>
          <span
            className={
              'st-kpi__sub' +
              (kpi.caEvolution >= 0 ? ' st-kpi__sub--green' : ' st-kpi__sub--red')
            }
          >
            {kpi.caEvolution >= 0 ? '▲' : '▼'}&nbsp;
            {Math.abs(kpi.caEvolution)} % vs mois dernier
          </span>
        </div>

        {/* RDV ce mois */}
        <div className="st-kpi">
          <span className="st-kpi__label">RDV ce mois</span>
          <span className="st-kpi__value">{kpi.rdvMois}</span>
          <span className="st-kpi__sub st-kpi__sub--orange">
            {kpi.rdvEnAttente} en attente
          </span>
        </div>

        {/* Devis acceptés */}
        <div className="st-kpi">
          <span className="st-kpi__label">Devis acceptés</span>
          <span className="st-kpi__value">{kpi.devisAcceptes}</span>
          <span className="st-kpi__sub">
            sur {kpi.devisEnvoyes} envoyés
          </span>
        </div>

        {/* Taux de conversion */}
        <div className="st-kpi">
          <span className="st-kpi__label">Taux de conversion</span>
          <span className="st-kpi__value">{kpi.tauxConversion} %</span>
          <span
            className={
              'st-kpi__sub' +
              (kpi.tauxConversion >= kpi.tauxObjectif
                ? ' st-kpi__sub--green'
                : ' st-kpi__sub--orange')
            }
          >
            Objectif {kpi.tauxObjectif} %
          </span>
        </div>

      </div>

      {/* ══════════════════════════════
          Grille de graphiques (2 col)
      ══════════════════════════════ */}
      <div className="st-charts-grid">

        {/* ── 1. RDV par mois ── */}
        <div className="st-chart-card">
          <h2 className="st-chart-card__title">Rendez-vous par mois</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rdvMois} barCategoryGap="35%" margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
              <XAxis
                dataKey="mois"
                tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<TooltipRDV />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="nb" radius={[4, 4, 0, 0]}>
                {rdvMois.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === rdvMois.length - 1 ? BAR_LAST : BAR_OTHER}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── 2. CA par mois ── */}
        <div className="st-chart-card">
          <div className="st-chart-card__head">
            <h2 className="st-chart-card__title">Chiffre d&apos;affaires</h2>
            <span className="st-chart-card__badge">{fmt(caTotalPeriode)}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={caMois} barCategoryGap="35%" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
              <XAxis
                dataKey="mois"
                tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<TooltipCA />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="ca" radius={[4, 4, 0, 0]}>
                {caMois.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === caMois.length - 1 ? BAR_LAST : BAR_OTHER}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── 3. Statuts des devis ── */}
        <div className="st-chart-card">
          <h2 className="st-chart-card__title">Statuts des devis</h2>
          <HorizontalBars
            data={MOCK_STATUTS_DEVIS}
            maxValue={maxDevis}
            showPct={false}
          />
        </div>

        {/* ── 4. Services demandés ── */}
        <div className="st-chart-card">
          <h2 className="st-chart-card__title">Services demandés</h2>
          <HorizontalBars
            data={MOCK_SERVICES}
            maxValue={maxService}
            showPct={true}
          />
        </div>

      </div>

      {/* ══════════════════════════════
          Top services ce mois
          (masqué sur mobile)
      ══════════════════════════════ */}
      <div className="st-top-card">
        <h2 className="st-top-card__title">Top services ce mois</h2>
        <div className="st-top-wrap">
          <table className="st-top-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Nb RDV</th>
                <th>CA généré</th>
                <th>Évolution</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TOP_SERVICES.map((row) => (
                <tr key={row.service}>
                  <td className="st-top-table__service">{row.service}</td>
                  <td>{row.rdv}</td>
                  <td>{fmt(row.ca)}</td>
                  <td>
                    <span
                      className={
                        'st-evol' +
                        (row.evolution > 0
                          ? ' st-evol--up'
                          : row.evolution < 0
                          ? ' st-evol--down'
                          : ' st-evol--flat')
                      }
                    >
                      {row.evolution > 0 && '▲ '}
                      {row.evolution < 0 && '▼ '}
                      {row.evolution === 0 ? '—' : `${Math.abs(row.evolution)} %`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
