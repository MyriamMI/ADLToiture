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
import { getStats } from '../../services/api'
import './styles/StatistiquesPage.css'

/* ── Palette couleurs (frontend) ── */
const STATUT_COLORS  = ['#059669', '#d97706', '#2563eb', '#dc2626']
const SERVICE_COLORS = ['#550101', '#2563eb', '#059669', '#d97706', '#9ca3af']

/* ── Helpers ── */
const fmt = (n) =>
  new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const BAR_LAST  = '#550101'
const BAR_OTHER = '#bfdbfe'

/* ── Tooltips ── */
function TooltipCA({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="st-tooltip">
      <span className="st-tooltip__label">{label}</span>
      <span className="st-tooltip__value">{fmt(payload[0].value)}</span>
    </div>
  )
}

function TooltipRDV({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="st-tooltip">
      <span className="st-tooltip__label">{label}</span>
      <span className="st-tooltip__value">{payload[0].value} RDV</span>
    </div>
  )
}

/* ── Barres horizontales ── */
function HorizontalBars({ data, maxValue, showPct }) {
  return (
    <div className="st-hbars">
      {data.map((row) => {
        const width = maxValue > 0 ? Math.round((row.value ?? row.pct) / maxValue * 100) : 0
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

/* ══════════════════════════════════════════
   Composant principal
══════════════════════════════════════════ */
export default function StatistiquesPage() {
  const [loading, setLoading]             = useState(true)
  const [kpi, setKpi]                     = useState(null)
  const [rdvParMois, setRdvParMois]       = useState([])
  const [caParMois, setCaParMois]         = useState([])
  const [statutsDevis, setStatutsDevis]   = useState([])
  const [servicesDemandes, setServicesDemandes] = useState([])
  useEffect(() => {
    getStats()
      .then((d) => {
        setKpi(d.kpi)
        setRdvParMois(d.rdvParMois ?? [])
        setCaParMois(d.caParMois ?? [])
        setStatutsDevis(
          (d.statutsDevis ?? []).map((s, i) => ({ ...s, color: STATUT_COLORS[i] ?? '#9ca3af' }))
        )
        setServicesDemandes(
          (d.servicesDemandes ?? []).map((s, i) => ({ ...s, color: SERVICE_COLORS[i] ?? '#9ca3af' }))
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="st-page">
        <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>Chargement…</p>
      </div>
    )
  }

  if (!kpi) {
    return (
      <div className="st-page">
        <p style={{ color: '#c0392b', fontSize: '0.875rem' }}>Impossible de charger les statistiques.</p>
      </div>
    )
  }

  const maxDevis   = Math.max(...statutsDevis.map((d) => d.value), 1)
  const maxService = 100
  const caTotalPeriode = caParMois.reduce((s, m) => s + m.ca, 0)

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

        <div className="st-kpi">
          <span className="st-kpi__label">CA du mois</span>
          <span className="st-kpi__value">{fmt(kpi.caMois)}</span>
          <span className={'st-kpi__sub' + (kpi.caEvolution >= 0 ? ' st-kpi__sub--green' : ' st-kpi__sub--red')}>
            {kpi.caEvolution >= 0 ? <i className="fas fa-caret-up" /> : <i className="fas fa-caret-down" />}&nbsp;
            {Math.abs(kpi.caEvolution)} % vs mois dernier
          </span>
        </div>

        <div className="st-kpi">
          <span className="st-kpi__label">RDV ce mois</span>
          <span className="st-kpi__value">{kpi.rdvMois}</span>
          <span className="st-kpi__sub st-kpi__sub--orange">
            {kpi.rdvEnAttente} en attente
          </span>
        </div>

        <div className="st-kpi">
          <span className="st-kpi__label">Devis acceptés</span>
          <span className="st-kpi__value">{kpi.devisAcceptes}</span>
          <span className="st-kpi__sub">sur {kpi.devisEnvoyes} envoyés</span>
        </div>

        <div className="st-kpi">
          <span className="st-kpi__label">Taux de conversion</span>
          <span className="st-kpi__value">{kpi.tauxConversion} %</span>
          <span className={'st-kpi__sub' + (kpi.tauxConversion >= kpi.tauxObjectif ? ' st-kpi__sub--green' : ' st-kpi__sub--orange')}>
            Objectif {kpi.tauxObjectif} %
          </span>
        </div>

      </div>

      {/* ══════════════════════════════
          Grille de graphiques (2 col)
      ══════════════════════════════ */}
      <div className="st-charts-grid">

        {/* 1. RDV par mois */}
        <div className="st-chart-card">
          <h2 className="st-chart-card__title">Rendez-vous par mois</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rdvParMois} barCategoryGap="35%" margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipRDV />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="nb" radius={[4, 4, 0, 0]}>
                {rdvParMois.map((_, i) => (
                  <Cell key={i} fill={i === rdvParMois.length - 1 ? BAR_LAST : BAR_OTHER} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 2. CA par mois */}
        <div className="st-chart-card">
          <div className="st-chart-card__head">
            <h2 className="st-chart-card__title">Chiffre d&apos;affaires</h2>
            <span className="st-chart-card__badge">{fmt(caTotalPeriode)}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={caParMois} barCategoryGap="35%" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<TooltipCA />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="ca" radius={[4, 4, 0, 0]}>
                {caParMois.map((_, i) => (
                  <Cell key={i} fill={i === caParMois.length - 1 ? BAR_LAST : BAR_OTHER} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Statuts des devis */}
        <div className="st-chart-card">
          <h2 className="st-chart-card__title">Statuts des devis</h2>
          <HorizontalBars data={statutsDevis} maxValue={maxDevis} showPct={false} />
        </div>

        {/* 4. Services demandés */}
        <div className="st-chart-card">
          <h2 className="st-chart-card__title">Services demandés</h2>
          <HorizontalBars data={servicesDemandes} maxValue={maxService} showPct={true} />
        </div>

      </div>


    </div>
  )
}
