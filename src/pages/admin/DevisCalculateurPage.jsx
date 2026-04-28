import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/DevisCalculateurPage.css'

/* ── Données mock ── */
const MOCK_CLIENTS = [
  { id: 1, nom: 'Martin Dupont' },
  { id: 2, nom: 'Sophie Lambert' },
  { id: 3, nom: 'Jean-Pierre Renard' },
  { id: 4, nom: 'Marie Lecomte' },
  { id: 5, nom: 'Ahmed Benali' },
]

const TYPES_TOITURE = [
  'Tuiles plates', 'Tuiles romanes', 'Ardoises naturelles',
  'Ardoises synthétiques', 'Zinc', 'Tôle nervurée', 'EPDM / membrane',
  'Shingle bitumé', 'Autre',
]

const UNITES = ['m²', 'm', 'pce', 'kg', 'L', 'forfait']

/* ── Libellés des étapes ── */
const STEPS = [
  { num: 1, label: 'Informations' },
  { num: 2, label: 'Matériaux' },
  { num: 3, label: 'MO & Machines' },
  { num: 4, label: 'Frais divers' },
  { num: 5, label: 'Récapitulatif' },
]

/* ── Helpers ── */
const fmt = (n) =>
  new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(n || 0)

function emptyMat(id) {
  return { id, description: '', quantite: '', unite: 'm²', prixUnit: '' }
}
function emptyMO(id) {
  return { id, description: '', ouvriers: '', jours: '', tauxH: '' }
}
function emptyMachine(id) {
  return { id, equipement: '', jours: '', prixJour: '' }
}
function emptyFrais(id) {
  return { id, description: '', detail: '', montant: '' }
}

function totalMat(l) {
  return (parseFloat(l.quantite) || 0) * (parseFloat(l.prixUnit) || 0)
}
function totalMO(l) {
  return (
    (parseFloat(l.ouvriers) || 0) *
    (parseFloat(l.jours) || 0) *
    8 *
    (parseFloat(l.tauxH) || 0)
  )
}
function totalMachine(l) {
  return (parseFloat(l.jours) || 0) * (parseFloat(l.prixJour) || 0)
}
function totalFrais(l) {
  return parseFloat(l.montant) || 0
}

/* ══════════════════════════════
   Composant indicateur d'étapes
══════════════════════════════ */
function StepIndicator({ current }) {
  return (
    <div className="calc-steps">
      {STEPS.map((s, idx) => {
        const done = s.num < current
        const active = s.num === current
        return (
          <div key={s.num} style={{ display: 'contents' }}>
            <div
              className={
                'calc-step' +
                (active ? ' calc-step--active' : '') +
                (done ? ' calc-step--done' : '')
              }
            >
              <div className="calc-step__circle">
                {done ? '✓' : s.num}
              </div>
              <span className="calc-step__label">{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={'calc-connector' + (done ? ' calc-connector--done' : '')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════
   Étape 1 — Informations
══════════════════════════════ */
function Step1({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })
  return (
    <div className="calc-card">
      <h2 className="calc-card__title">Informations générales</h2>
      <div className="calc-form">
        <div className="calc-row">
          <div className="calc-field">
            <label className="calc-label">Client *</label>
            <select
              className="calc-select"
              value={data.clientId}
              onChange={(e) => set('clientId', e.target.value)}
            >
              <option value="">— Sélectionner un client —</option>
              {MOCK_CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="calc-field">
            <label className="calc-label">Date du devis *</label>
            <input
              type="date"
              className="calc-input"
              value={data.dateDevis}
              onChange={(e) => set('dateDevis', e.target.value)}
            />
          </div>
        </div>

        <div className="calc-row">
          <div className="calc-field">
            <label className="calc-label">Type de toiture</label>
            <select
              className="calc-select"
              value={data.typeToiture}
              onChange={(e) => set('typeToiture', e.target.value)}
            >
              <option value="">— Choisir —</option>
              {TYPES_TOITURE.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="calc-field">
            <label className="calc-label">Surface (m²)</label>
            <input
              type="number"
              min="0"
              className="calc-input"
              placeholder="ex. 120"
              value={data.surface}
              onChange={(e) => set('surface', e.target.value)}
            />
          </div>
        </div>

        <div className="calc-row">
          <div className="calc-field">
            <label className="calc-label">Pente (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="calc-input"
              placeholder="ex. 35"
              value={data.pente}
              onChange={(e) => set('pente', e.target.value)}
            />
          </div>
          <div className="calc-field">
            <label className="calc-label">Référence interne</label>
            <input
              type="text"
              className="calc-input"
              placeholder="ex. DEV-2024-001"
              value={data.reference}
              onChange={(e) => set('reference', e.target.value)}
            />
          </div>
        </div>

        <div className="calc-row calc-row--full">
          <div className="calc-field">
            <label className="calc-label">Adresse du chantier</label>
            <input
              type="text"
              className="calc-input"
              placeholder="Rue, numéro, code postal, ville"
              value={data.adresse}
              onChange={(e) => set('adresse', e.target.value)}
            />
          </div>
        </div>

        <div className="calc-row calc-row--full">
          <div className="calc-field">
            <label className="calc-label">Remarques</label>
            <textarea
              className="calc-input"
              rows={3}
              style={{ resize: 'vertical' }}
              placeholder="Notes internes, particularités du chantier…"
              value={data.remarques}
              onChange={(e) => set('remarques', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════
   Étape 2 — Matériaux
══════════════════════════════ */
function Step2({ lines, onChange }) {
  const nextId = useRef(1000)
  const addLine = () => {
    nextId.current += 1
    onChange([...lines, emptyMat(nextId.current)])
  }
  const delLine = (id) => onChange(lines.filter((l) => l.id !== id))
  const updLine = (id, k, v) =>
    onChange(lines.map((l) => (l.id === id ? { ...l, [k]: v } : l)))

  const sousTotal = lines.reduce((s, l) => s + totalMat(l), 0)

  return (
    <div className="calc-card">
      <h2 className="calc-card__title">Matériaux</h2>
      <div className="calc-lines">
        <div className="calc-lines__wrap">
          <table className="calc-lines__table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Description</th>
                <th style={{ width: '80px' }}>Qté</th>
                <th style={{ width: '80px' }}>Unité</th>
                <th style={{ width: '100px' }}>Prix unit.</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Total</th>
                <th style={{ width: '36px' }} />
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id}>
                  <td>
                    <input
                      className="calc-cell-input"
                      placeholder="ex. Ardoises 40×25"
                      value={l.description}
                      onChange={(e) => updLine(l.id, 'description', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="calc-cell-input calc-cell-input--number"
                      value={l.quantite}
                      onChange={(e) => updLine(l.id, 'quantite', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      className="calc-cell-select"
                      value={l.unite}
                      onChange={(e) => updLine(l.id, 'unite', e.target.value)}
                    >
                      {UNITES.map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="calc-cell-input calc-cell-input--number"
                      value={l.prixUnit}
                      onChange={(e) => updLine(l.id, 'prixUnit', e.target.value)}
                    />
                  </td>
                  <td className="calc-cell-total">{fmt(totalMat(l))}</td>
                  <td>
                    <button
                      className="calc-del-btn"
                      onClick={() => delLine(l.id)}
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      color: 'rgba(0,0,0,0.35)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    Aucun matériau — cliquez « + Ajouter » pour commencer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button className="calc-add-btn" onClick={addLine}>
          + Ajouter un matériau
        </button>

        <div className="calc-subtotal">
          <span>Sous-total matériaux</span>
          <span className="calc-subtotal__value">{fmt(sousTotal)}</span>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════
   Étape 3 — MO & Machines
══════════════════════════════ */
function Step3({ moLines, machLines, onChangeMO, onChangeMach }) {
  const moNextId = useRef(2000)
  const machNextId = useRef(3000)

  const addMO = () => {
    moNextId.current += 1
    onChangeMO([...moLines, emptyMO(moNextId.current)])
  }
  const delMO = (id) => onChangeMO(moLines.filter((l) => l.id !== id))
  const updMO = (id, k, v) =>
    onChangeMO(moLines.map((l) => (l.id === id ? { ...l, [k]: v } : l)))

  const addMach = () => {
    machNextId.current += 1
    onChangeMach([...machLines, emptyMachine(machNextId.current)])
  }
  const delMach = (id) => onChangeMach(machLines.filter((l) => l.id !== id))
  const updMach = (id, k, v) =>
    onChangeMach(machLines.map((l) => (l.id === id ? { ...l, [k]: v } : l)))

  const sousTotalMO = moLines.reduce((s, l) => s + totalMO(l), 0)
  const sousTotalMach = machLines.reduce((s, l) => s + totalMachine(l), 0)

  return (
    <>
      {/* ── Main d'œuvre ── */}
      <div className="calc-card">
        <h2 className="calc-card__title">Main d'œuvre</h2>
        <div className="calc-lines">
          <div className="calc-lines__wrap">
            <table className="calc-lines__table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Description</th>
                  <th style={{ width: '80px' }}>Ouvriers</th>
                  <th style={{ width: '80px' }}>Jours</th>
                  <th style={{ width: '100px' }}>Taux/h (€)</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Total</th>
                  <th style={{ width: '36px' }} />
                </tr>
              </thead>
              <tbody>
                {moLines.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <input
                        className="calc-cell-input"
                        placeholder="ex. Pose ardoises"
                        value={l.description}
                        onChange={(e) => updMO(l.id, 'description', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="calc-cell-input calc-cell-input--number"
                        value={l.ouvriers}
                        onChange={(e) => updMO(l.id, 'ouvriers', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="calc-cell-input calc-cell-input--number"
                        value={l.jours}
                        onChange={(e) => updMO(l.id, 'jours', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="calc-cell-input calc-cell-input--number"
                        value={l.tauxH}
                        onChange={(e) => updMO(l.id, 'tauxH', e.target.value)}
                      />
                    </td>
                    <td className="calc-cell-total">{fmt(totalMO(l))}</td>
                    <td>
                      <button
                        className="calc-del-btn"
                        onClick={() => delMO(l.id)}
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
                {moLines.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: 'center',
                        padding: '1rem',
                        color: 'rgba(0,0,0,0.35)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      Aucune ligne MO.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="calc-add-btn" onClick={addMO}>
            + Ajouter une ligne MO
          </button>
          <div className="calc-subtotal">
            <span>Sous-total main d'œuvre</span>
            <span className="calc-subtotal__value">{fmt(sousTotalMO)}</span>
          </div>
        </div>
      </div>

      {/* ── Machines / engins ── */}
      <div className="calc-card">
        <h2 className="calc-card__title">Machines & engins</h2>
        <div className="calc-lines">
          <div className="calc-lines__wrap">
            <table className="calc-lines__table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Équipement</th>
                  <th style={{ width: '80px' }}>Jours</th>
                  <th style={{ width: '110px' }}>Prix/jour (€)</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Total</th>
                  <th style={{ width: '36px' }} />
                </tr>
              </thead>
              <tbody>
                {machLines.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <input
                        className="calc-cell-input"
                        placeholder="ex. Nacelle élévatrice"
                        value={l.equipement}
                        onChange={(e) => updMach(l.id, 'equipement', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="calc-cell-input calc-cell-input--number"
                        value={l.jours}
                        onChange={(e) => updMach(l.id, 'jours', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="calc-cell-input calc-cell-input--number"
                        value={l.prixJour}
                        onChange={(e) => updMach(l.id, 'prixJour', e.target.value)}
                      />
                    </td>
                    <td className="calc-cell-total">{fmt(totalMachine(l))}</td>
                    <td>
                      <button
                        className="calc-del-btn"
                        onClick={() => delMach(l.id)}
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
                {machLines.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: 'center',
                        padding: '1rem',
                        color: 'rgba(0,0,0,0.35)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      Aucune machine.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="calc-add-btn" onClick={addMach}>
            + Ajouter une machine
          </button>
          <div className="calc-subtotal">
            <span>Sous-total machines</span>
            <span className="calc-subtotal__value">{fmt(sousTotalMach)}</span>
          </div>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════
   Étape 4 — Frais divers
══════════════════════════════ */
function Step4({ lines, onChange }) {
  const nextId = useRef(4000)
  const addLine = () => {
    nextId.current += 1
    onChange([...lines, emptyFrais(nextId.current)])
  }
  const delLine = (id) => onChange(lines.filter((l) => l.id !== id))
  const updLine = (id, k, v) =>
    onChange(lines.map((l) => (l.id === id ? { ...l, [k]: v } : l)))

  const sousTotal = lines.reduce((s, l) => s + totalFrais(l), 0)

  return (
    <div className="calc-card">
      <h2 className="calc-card__title">Frais divers</h2>
      <div className="calc-lines">
        <div className="calc-lines__wrap">
          <table className="calc-lines__table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Description</th>
                <th style={{ width: '35%' }}>Détail / justification</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Montant (€)</th>
                <th style={{ width: '36px' }} />
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id}>
                  <td>
                    <input
                      className="calc-cell-input"
                      placeholder="ex. Transport"
                      value={l.description}
                      onChange={(e) => updLine(l.id, 'description', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="calc-cell-input"
                      placeholder="ex. Aller-retour chantier"
                      value={l.detail}
                      onChange={(e) => updLine(l.id, 'detail', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="calc-cell-input calc-cell-input--number"
                      style={{ maxWidth: '100%' }}
                      value={l.montant}
                      onChange={(e) => updLine(l.id, 'montant', e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      className="calc-del-btn"
                      onClick={() => delLine(l.id)}
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      color: 'rgba(0,0,0,0.35)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    Aucun frais divers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button className="calc-add-btn" onClick={addLine}>
          + Ajouter un frais
        </button>
        <div className="calc-subtotal">
          <span>Sous-total frais divers</span>
          <span className="calc-subtotal__value">{fmt(sousTotal)}</span>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════
   Étape 5 — Récapitulatif
══════════════════════════════ */
function Step5({ data, onMargeChange, onTvaChange, onSave, onPDF, saving }) {
  const { infos, materiaux, mainOeuvre, machines, frais, marge, tva } = data

  const client = MOCK_CLIENTS.find((c) => String(c.id) === String(infos.clientId))

  const stMat = materiaux.reduce((s, l) => s + totalMat(l), 0)
  const stMO = mainOeuvre.reduce((s, l) => s + totalMO(l), 0)
  const stMach = machines.reduce((s, l) => s + totalMachine(l), 0)
  const stFrais = frais.reduce((s, l) => s + totalFrais(l), 0)
  const sousTotal = stMat + stMO + stMach + stFrais

  const margePct = parseFloat(marge) || 0
  const margeAmt = sousTotal * (margePct / 100)
  const baseHT = sousTotal + margeAmt
  const tvaAmt = baseHT * (tva / 100)
  const totalTTC = baseHT + tvaAmt

  return (
    <>
      {/* ── Infos client ── */}
      <div className="calc-card">
        <h2 className="calc-card__title">Informations du chantier</h2>
        <div className="calc-recap-infos">
          <div className="calc-recap-info__row">
            <span className="calc-recap-info__label">Client</span>
            <span className="calc-recap-info__value">
              {client ? client.nom : '—'}
            </span>
          </div>
          <div className="calc-recap-info__row">
            <span className="calc-recap-info__label">Date</span>
            <span className="calc-recap-info__value">
              {infos.dateDevis
                ? new Date(infos.dateDevis).toLocaleDateString('fr-BE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
          <div className="calc-recap-info__row">
            <span className="calc-recap-info__label">Type de toiture</span>
            <span className="calc-recap-info__value">{infos.typeToiture || '—'}</span>
          </div>
          <div className="calc-recap-info__row">
            <span className="calc-recap-info__label">Surface</span>
            <span className="calc-recap-info__value">
              {infos.surface ? `${infos.surface} m²` : '—'}
            </span>
          </div>
          <div className="calc-recap-info__row">
            <span className="calc-recap-info__label">Pente</span>
            <span className="calc-recap-info__value">
              {infos.pente ? `${infos.pente} %` : '—'}
            </span>
          </div>
          <div className="calc-recap-info__row">
            <span className="calc-recap-info__label">Référence</span>
            <span className="calc-recap-info__value">{infos.reference || '—'}</span>
          </div>
          {infos.adresse && (
            <div className="calc-recap-info__row" style={{ gridColumn: '1 / -1' }}>
              <span className="calc-recap-info__label">Adresse chantier</span>
              <span className="calc-recap-info__value">{infos.adresse}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Décomposition des coûts ── */}
      <div className="calc-card">
        <h2 className="calc-card__title">Décomposition des coûts</h2>

        <table className="calc-costs">
          <tbody>
            <tr>
              <td>Matériaux ({materiaux.length} ligne{materiaux.length !== 1 ? 's' : ''})</td>
              <td>{fmt(stMat)}</td>
            </tr>
            <tr>
              <td>Main d'œuvre ({mainOeuvre.length} ligne{mainOeuvre.length !== 1 ? 's' : ''})</td>
              <td>{fmt(stMO)}</td>
            </tr>
            <tr>
              <td>Machines & engins ({machines.length} ligne{machines.length !== 1 ? 's' : ''})</td>
              <td>{fmt(stMach)}</td>
            </tr>
            <tr>
              <td>Frais divers ({frais.length} ligne{frais.length !== 1 ? 's' : ''})</td>
              <td>{fmt(stFrais)}</td>
            </tr>
            <tr className="calc-costs__subtotal">
              <td>Sous-total HT</td>
              <td>{fmt(sousTotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* ── Marge + TVA + Total ── */}
        <div className="calc-financial">
          {/* Marge */}
          <div className="calc-financial__row">
            <span className="calc-financial__label">
              Marge commerciale
              <input
                type="number"
                min="0"
                max="100"
                className="calc-marge-input"
                value={marge}
                onChange={(e) => onMargeChange(e.target.value)}
              />
              %
            </span>
            <span className="calc-financial__value">{fmt(margeAmt)}</span>
          </div>

          <hr className="calc-financial__divider" />

          {/* Base HT */}
          <div className="calc-financial__row">
            <span className="calc-financial__label">Total HT</span>
            <span className="calc-financial__value">{fmt(baseHT)}</span>
          </div>

          {/* TVA */}
          <div className="calc-financial__row">
            <span className="calc-financial__label">
              TVA
              <div className="calc-tva-toggle">
                {[6, 21].map((rate) => (
                  <button
                    key={rate}
                    className={
                      'calc-tva-btn' + (tva === rate ? ' calc-tva-btn--active' : '')
                    }
                    onClick={() => onTvaChange(rate)}
                  >
                    {rate} %
                  </button>
                ))}
              </div>
            </span>
            <span className="calc-financial__value">{fmt(tvaAmt)}</span>
          </div>

          <hr className="calc-financial__divider" />

          {/* Total TTC */}
          <div className="calc-financial__total">
            <span className="calc-financial__total-label">Total TTC</span>
            <span className="calc-financial__total-value">{fmt(totalTTC)}</span>
          </div>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════
   Composant principal
══════════════════════════════ */
const INITIAL_INFOS = {
  clientId: '',
  dateDevis: new Date().toISOString().slice(0, 10),
  typeToiture: '',
  surface: '',
  pente: '',
  reference: '',
  adresse: '',
  remarques: '',
}

export default function DevisCalculateurPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [infos, setInfos] = useState(INITIAL_INFOS)
  const [materiaux, setMateriaux] = useState([])
  const [mainOeuvre, setMainOeuvre] = useState([])
  const [machines, setMachines] = useState([])
  const [frais, setFrais] = useState([])
  const [marge, setMarge] = useState('15')
  const [tva, setTva] = useState(6)

  /* ── Validation étape 1 ── */
  const step1Valid = infos.clientId && infos.dateDevis

  const canGoNext = () => {
    if (step === 1) return step1Valid
    return true
  }

  const goNext = () => {
    if (step < 5 && canGoNext()) setStep((s) => s + 1)
  }
  const goPrev = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  /* ── Génération PDF ── */
  const handlePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })

      /* Constantes de mise en page */
      const PW   = 210          /* largeur page A4 */
      const ML   = 14           /* marge gauche */
      const MR   = 196          /* bord droit pour align:'right' */
      const RED  = [85, 1, 1]   /* #550101 */
      const GRAY = [245, 245, 245]

      /* Formatage des montants : espace comme séparateur de milliers */
      const fmtPdf = (n) => {
        const fixed = (n || 0).toFixed(2)
        const [int, dec] = fixed.split('.')
        const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f')
        return `${intFmt},${dec} EUR`
      }

      /* ── Calculs ── */
      const client   = MOCK_CLIENTS.find((c) => String(c.id) === String(infos.clientId))
      const stMat    = materiaux.reduce((s, l) => s + totalMat(l), 0)
      const stMO     = mainOeuvre.reduce((s, l) => s + totalMO(l), 0)
      const stMach   = machines.reduce((s, l) => s + totalMachine(l), 0)
      const stFrais  = frais.reduce((s, l) => s + totalFrais(l), 0)
      const sousTotal = stMat + stMO + stMach + stFrais
      const margePct  = parseFloat(marge) || 0
      const margeAmt  = sousTotal * (margePct / 100)
      const baseHT    = sousTotal + margeAmt
      const tvaAmt    = baseHT * (tva / 100)
      const totalTTC  = baseHT + tvaAmt

      const dateStr = infos.dateDevis
        ? new Date(infos.dateDevis).toLocaleDateString('fr-BE', {
            day: '2-digit', month: 'long', year: 'numeric',
          })
        : '—'

      /* ══════════════════════════════
         HEADER — bande rouge pleine largeur
      ══════════════════════════════ */
      doc.setFillColor(...RED)
      doc.rect(0, 0, PW, 22, 'F')

      /* "ADL Toiture" à gauche, blanc gras */
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      doc.text('ADL Toiture', ML, 14)

      /* "DEVIS" à droite, blanc */
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('DEVIS', MR, 14, { align: 'right' })

      /* ══════════════════════════════
         DEUX COLONNES sous le header
         Gauche : infos du devis
         Droite : infos société
      ══════════════════════════════ */
      let y = 32
      const COL2 = 110  /* début colonne droite */

      doc.setFontSize(9)
      doc.setTextColor(100)

      /* Colonne gauche — infos devis */
      const leftRows = [
        ['Référence', infos.reference || '—'],
        ['Date',      dateStr],
        ['Client',    client ? client.nom : '—'],
        ['Chantier',  infos.adresse || '—'],
      ]
      leftRows.forEach(([lbl, val]) => {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100)
        doc.text(lbl, ML, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(30)
        doc.text(val, ML + 22, y)
        y += 6
      })

      /* Colonne droite — infos société */
      const companyRows = [
        '0470 00 00 00',
        'info@adltoiture.be',
        'Brabant wallon',
      ]
      let yRight = 32
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(30)
      doc.text('ADL Toiture', COL2, yRight)
      yRight += 6
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      companyRows.forEach((line) => {
        doc.text(line, COL2, yRight)
        yRight += 6
      })

      /* ══════════════════════════════
         TITRE DE SECTION
      ══════════════════════════════ */
      y = Math.max(y, yRight) + 8

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...RED)
      doc.text('Decomposition des couts', ML, y)

      /* Barre rouge sous le titre */
      y += 2
      doc.setFillColor(...RED)
      doc.rect(ML, y, PW - ML * 2, 0.8, 'F')
      y += 6

      /* ══════════════════════════════
         TABLEAU DES COÛTS
         Colonnes : Poste | Montant
         Lignes alternées gris clair
      ══════════════════════════════ */
      const ROW_H  = 8   /* hauteur de ligne */
      const COL_V  = 155 /* x début colonne montant */

      const tableRows = [
        { label: 'Materiaux',         value: fmtPdf(stMat),    bold: false },
        { label: "Main d'oeuvre",     value: fmtPdf(stMO),     bold: false },
        { label: 'Machines & engins', value: fmtPdf(stMach),   bold: false },
        { label: 'Frais divers',      value: fmtPdf(stFrais),  bold: false },
      ]

      tableRows.forEach((row, i) => {
        /* Fond alterné */
        if (i % 2 === 0) {
          doc.setFillColor(...GRAY)
          doc.rect(ML, y - ROW_H + 2, PW - ML * 2, ROW_H, 'F')
        }
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(30)
        doc.text(row.label, ML + 2, y)
        doc.text(row.value, MR, y, { align: 'right' })
        y += ROW_H
      })

      /* Ligne séparatrice avant Sous-total */
      doc.setDrawColor(200)
      doc.line(ML, y - 2, PW - ML, y - 2)
      y += 2

      /* ── Sous-total HT (gras) ── */
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(30)
      doc.text('Sous-total HT', ML + 2, y)
      doc.text(fmtPdf(sousTotal), MR, y, { align: 'right' })
      y += ROW_H

      /* ── Marge ── */
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Marge commerciale (${margePct} %)`, ML + 2, y)
      doc.text(fmtPdf(margeAmt), MR, y, { align: 'right' })
      y += ROW_H

      /* Ligne séparatrice */
      doc.setDrawColor(200)
      doc.line(ML, y - 2, PW - ML, y - 2)
      y += 2

      /* ── Total HT (gras) ── */
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(30)
      doc.text('Total HT', ML + 2, y)
      doc.text(fmtPdf(baseHT), MR, y, { align: 'right' })
      y += ROW_H

      /* ── TVA ── */
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`TVA (${tva} %)`, ML + 2, y)
      doc.text(fmtPdf(tvaAmt), MR, y, { align: 'right' })
      y += ROW_H

      /* Ligne séparatrice épaisse */
      doc.setDrawColor(...RED)
      doc.setLineWidth(0.5)
      doc.line(ML, y - 2, PW - ML, y - 2)
      doc.setLineWidth(0.2)
      y += 4

      /* ── Total TTC (plus grand, rouge) ── */
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(...RED)
      doc.text('Total TTC', ML + 2, y)
      doc.text(fmtPdf(totalTTC), MR, y, { align: 'right' })
      y += 10

      /* ── Remarques ── */
      if (infos.remarques) {
        y += 4
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(30)
        doc.text('Remarques :', ML, y)
        y += 5
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100)
        const remarqueLines = doc.splitTextToSize(infos.remarques, PW - ML * 2)
        doc.text(remarqueLines, ML, y)
      }

      /* ══════════════════════════════
         PIED DE PAGE
      ══════════════════════════════ */
      const PAGE_H = 297
      const footerY = PAGE_H - 12

      /* Ligne rouge fine */
      doc.setDrawColor(...RED)
      doc.setLineWidth(0.4)
      doc.line(ML, footerY - 4, PW - ML, footerY - 4)
      doc.setLineWidth(0.2)

      /* Texte centré gris */
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        'ADLToiture  —  Brabant wallon  —  info@adltoiture.be',
        PW / 2,
        footerY,
        { align: 'center' }
      )

      doc.save(`devis-${infos.reference || 'adl'}.pdf`)
    } catch (err) {
      console.error('jsPDF non disponible :', err)
      alert(
        'La generation PDF necessite le paquet jsPDF.\nInstallez-le via : npm install jspdf'
      )
    }
  }

  /* ── Sauvegarde ── */
  const handleSave = async () => {
    setSaving(true)
    const payload = { infos, materiaux, mainOeuvre, machines, frais, marge, tva }
    try {
      const res = await fetch('/api/devis.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      navigate('/admin/quotes')
    } catch {
      /* Simuler la sauvegarde en mode démo */
      await new Promise((r) => setTimeout(r, 600))
      console.info('[MOCK] Devis sauvegardé :', payload)
      navigate('/admin/quotes')
    } finally {
      setSaving(false)
    }
  }

  /* ── Rendu du contenu de l'étape courante ── */
  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 data={infos} onChange={setInfos} />
      case 2:
        return <Step2 lines={materiaux} onChange={setMateriaux} />
      case 3:
        return (
          <Step3
            moLines={mainOeuvre}
            machLines={machines}
            onChangeMO={setMainOeuvre}
            onChangeMach={setMachines}
          />
        )
      case 4:
        return <Step4 lines={frais} onChange={setFrais} />
      case 5:
        return (
          <Step5
            data={{ infos, materiaux, mainOeuvre, machines, frais, marge, tva }}
            onMargeChange={setMarge}
            onTvaChange={setTva}
            onSave={handleSave}
            onPDF={handlePDF}
            saving={saving}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="calc-page">
      {/* ── En-tête ── */}
      <div className="calc-page__header">
        <h1 className="calc-page__title">Calculateur de devis</h1>
        <p className="calc-page__subtitle">
          Étape {step} sur {STEPS.length} — {STEPS[step - 1].label}
        </p>
      </div>

      {/* ── Indicateur d'étapes ── */}
      <StepIndicator current={step} />

      {/* ── Contenu de l'étape ── */}
      {renderStep()}

      {/* ── Navigation ── */}
      <div className="calc-nav">
        {step > 1 && (
          <button className="calc-nav__prev" onClick={goPrev}>
            ← Précédent
          </button>
        )}

        <div className="calc-nav__right">
          {step < 5 ? (
            <button
              className="calc-nav__next"
              onClick={goNext}
              disabled={!canGoNext()}
              title={!canGoNext() ? 'Veuillez remplir les champs obligatoires' : undefined}
            >
              Suivant →
            </button>
          ) : (
            <>
              <button
                className="calc-nav__save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Sauvegarde…' : '💾 Sauvegarder'}
              </button>
              <button className="calc-nav__next" onClick={handlePDF}>
                📄 Générer le devis PDF
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
