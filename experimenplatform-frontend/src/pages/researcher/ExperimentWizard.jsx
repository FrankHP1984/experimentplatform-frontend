import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as experimentsApi from '../../api/experiments'
import * as phasesApi      from '../../api/phases'
import * as groupsApi      from '../../api/groups'
import * as questionsApi   from '../../api/questions'
import styles from './ExperimentWizard.module.css'

/* ─── SVG helpers ─── */
const Ico = ({ children, size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: size, height: size, flexShrink: 0 }}>
    {children}
  </svg>
)
const IcoCheck  = () => <Ico><polyline points="20 6 9 17 4 12"/></Ico>
const IcoX      = () => <Ico><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ico>
const IcoPlus   = () => <Ico><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Ico>
const IcoLeft   = () => <Ico><polyline points="15 18 9 12 15 6"/></Ico>
const IcoRight  = () => <Ico><polyline points="9 18 15 12 9 6"/></Ico>
const IcoEdit   = () => <Ico><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Ico>
const IcoTrash  = () => <Ico><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></Ico>
const IcoBolt   = () => <Ico size={22}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Ico>
const IcoDrag   = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <circle cx="9" cy="5" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="9" cy="19" r="1.2"/>
    <circle cx="15" cy="5" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="15" cy="19" r="1.2"/>
  </svg>
)

/* ─── Constants ─── */
const DESIGN_LABELS = {
  PRETEST_POSTEST:  'Pretest–Postest',
  BETWEEN_SUBJECTS: 'Entre sujetos',
  LONGITUDINAL:     'Longitudinal',
  WITHIN_SUBJECTS:  'Intra sujeto',
  CROSS_SECTIONAL:  'Transversal',
}

const DESIGN_OPTIONS = [
  { id: 'PRETEST_POSTEST',  name: 'Pretest–Postest',  desc: 'Medicion antes y despues en los mismos sujetos.', color: '#6C4DE6' },
  { id: 'BETWEEN_SUBJECTS', name: 'Entre sujetos',    desc: 'Grupos diferentes reciben distintas condiciones.', color: '#00D4AA' },
  { id: 'LONGITUDINAL',     name: 'Longitudinal',     desc: 'Seguimiento en multiples momentos temporales.',   color: '#60A5FA' },
]

const Q_TYPE_LABELS = {
  NUMBER: 'Numerica', SCALE: 'Escala', TEXT: 'Texto',
  BOOLEAN: 'Si / No', MULTIPLE_CHOICE: 'Multiple',
}

const GROUP_COLORS = ['#6C4DE6','#00D4AA','#60A5FA','#F472B6','#FB923C','#A3E635','#F0A500','#E05C6B']

const STEPS = [
  { n: 1, label: 'Configuracion basica',    sub: (st) => st.basic.title ? 'Completado' : 'Pendiente' },
  { n: 2, label: 'Fases del experimento',   sub: (st) => st.phases.length > 0 ? `${st.phases.length} fases definidas` : 'Pendiente' },
  { n: 3, label: 'Grupos',                  sub: (st) => st.groups.length > 0 ? `${st.groups.length} grupos` : 'Pendiente' },
  { n: 4, label: 'Preguntas',               sub: (st) => { const t = Object.values(st.questions).reduce((a,b) => a + b.length, 0); return t > 0 ? `${t} preguntas` : 'Pendiente' } },
  { n: 5, label: 'Revision y publicacion',  sub: () => 'Paso final' },
]

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtShort(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

/* ─── Small modal wrapper ─── */
function Modal({ open, onClose, title, sub, children, footer }) {
  if (!open) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>{title}</h2>
        {sub && <p className={styles.modalSub}>{sub}</p>}
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalActions}>{footer}</div>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN WIZARD COMPONENT
═══════════════════════════════════════════ */
export default function ExperimentWizard() {
  const { id }   = useParams()
  const navigate = useNavigate()

  /* ── state ── */
  const [step, setStep]       = useState(1)
  const [saving, setSaving]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const [basic, setBasic] = useState({
    title: '', description: '', design: 'PRETEST_POSTEST',
    startDate: '', endDate: '', rgpd: true, anonymize: true, notify: false,
  })
  const [phases,   setPhases]   = useState([])
  const [groups,   setGroups]   = useState([])
  const [questions,setQuestions]= useState({})  // { phaseId: [...] }
  const [activePhaseTab, setActivePhaseTab] = useState(null)

  /* ── modals ── */
  const [phaseModal,    setPhaseModal]    = useState({ open: false, editing: null })
  const [groupModal,    setGroupModal]    = useState({ open: false, editing: null })
  const [questionModal, setQuestionModal] = useState({ open: false })
  const [phaseForm,     setPhaseForm]     = useState({ name: '', startDate: '', endDate: '', description: '' })
  const [groupForm,     setGroupForm]     = useState({ name: '', description: '', color: '#6C4DE6' })
  const [qForm,         setQForm]         = useState({ text: '', type: 'NUMBER', required: true })
  const [modalError,    setModalError]    = useState('')

  /* ── load experiment ── */
  useEffect(() => {
    const load = async () => {
      try {
        const [exp, phasesData, groupsData] = await Promise.all([
          experimentsApi.getExperiment(id),
          phasesApi.getPhases(id),
          groupsApi.getGroups(id),
        ])
        setBasic({
          title: exp.title || '',
          description: exp.description || '',
          design: exp.design || 'PRETEST_POSTEST',
          startDate: exp.startDate?.slice(0, 10) || '',
          endDate:   exp.endDate?.slice(0, 10)   || '',
          rgpd: exp.rgpd ?? true,
          anonymize: exp.anonymize ?? true,
          notify: exp.notify ?? false,
        })
        setPhases(phasesData)
        setGroups(groupsData)
        if (phasesData.length > 0) setActivePhaseTab(phasesData[0].id)

        // load questions for all phases
        const qMap = {}
        await Promise.all(phasesData.map(async p => {
          try { qMap[p.id] = await questionsApi.getQuestions(p.id) }
          catch { qMap[p.id] = [] }
        }))
        setQuestions(qMap)
      } catch (err) {
        setError(err.message || 'Error al cargar el experimento')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  /* ── computed ── */
  const totalQuestions = Object.values(questions).reduce((a, b) => a + b.length, 0)
  const completeness = (() => {
    let p = 0
    if (basic.title)                       p += 20
    if (phases.length >= 2)                p += 20
    if (groups.length >= 2)                p += 20
    if (totalQuestions > 0)                p += 20
    if (basic.startDate && basic.endDate)  p += 20
    return p
  })()

  /* ── step state for nav ── */
  const stateForSubs = { basic, phases, groups, questions }
  const getStepState = (n) => {
    if (n < step) return 'done'
    if (n === step) return 'active'
    return 'pending'
  }

  /* ── save basic ── */
  const saveBasic = useCallback(async () => {
    setSaving(true)
    try {
      await experimentsApi.updateExperiment(id, {
        title: basic.title, description: basic.description,
        design: basic.design,
        startDate: basic.startDate || null,
        endDate:   basic.endDate   || null,
      })
    } catch { /* silent — will retry */ }
    finally { setSaving(false) }
  }, [id, basic])

  /* ── phase CRUD ── */
  const openPhaseModal = (editing = null) => {
    setPhaseForm(editing
      ? { name: editing.name, startDate: editing.startDate?.slice(0,10) || '', endDate: editing.endDate?.slice(0,10) || '', description: editing.description || '' }
      : { name: '', startDate: '', endDate: '', description: '' }
    )
    setModalError('')
    setPhaseModal({ open: true, editing })
  }

  const confirmPhase = async () => {
    if (!phaseForm.name.trim()) { setModalError('El nombre es obligatorio'); return }
    setModalError(''); setSaving(true)
    try {
      const data = { name: phaseForm.name.trim(), startDate: phaseForm.startDate || null, endDate: phaseForm.endDate || null, description: phaseForm.description }
      if (phaseModal.editing) {
        const updated = await phasesApi.updatePhase(id, phaseModal.editing.id, data)
        setPhases(ps => ps.map(p => p.id === updated.id ? updated : p))
      } else {
        const created = await phasesApi.createPhase(id, data)
        setPhases(ps => [...ps, created])
        setQuestions(q => ({ ...q, [created.id]: [] }))
        setActivePhaseTab(created.id)
      }
      setPhaseModal({ open: false, editing: null })
    } catch (err) { setModalError(err.message || 'Error al guardar') }
    finally { setSaving(false) }
  }

  const deletePhase = async (phaseId) => {
    if (!window.confirm('¿Eliminar esta fase? Se borraran sus preguntas.')) return
    try {
      await phasesApi.deletePhase(id, phaseId)
      setPhases(ps => ps.filter(p => p.id !== phaseId))
      setQuestions(q => { const n = {...q}; delete n[phaseId]; return n })
      if (activePhaseTab === phaseId) {
        const remaining = phases.filter(p => p.id !== phaseId)
        setActivePhaseTab(remaining[0]?.id || null)
      }
    } catch (err) { alert(err.message) }
  }

  /* ── group CRUD ── */
  const openGroupModal = (editing = null) => {
    setGroupForm(editing
      ? { name: editing.name, description: editing.description || '', color: editing.color || '#6C4DE6' }
      : { name: '', description: '', color: '#6C4DE6' }
    )
    setModalError('')
    setGroupModal({ open: true, editing })
  }

  const confirmGroup = async () => {
    if (!groupForm.name.trim()) { setModalError('El nombre es obligatorio'); return }
    setModalError(''); setSaving(true)
    try {
      const data = { name: groupForm.name.trim(), description: groupForm.description.trim(), color: groupForm.color }
      if (groupModal.editing) {
        const updated = await groupsApi.updateGroup(id, groupModal.editing.id, data)
        setGroups(gs => gs.map(g => g.id === updated.id ? updated : g))
      } else {
        const created = await groupsApi.createGroup(id, data)
        setGroups(gs => [...gs, created])
      }
      setGroupModal({ open: false, editing: null })
    } catch (err) { setModalError(err.message || 'Error al guardar') }
    finally { setSaving(false) }
  }

  const deleteGroup = async (groupId) => {
    if (!window.confirm('¿Eliminar este grupo?')) return
    try {
      await groupsApi.deleteGroup(id, groupId)
      setGroups(gs => gs.filter(g => g.id !== groupId))
    } catch (err) { alert(err.message) }
  }

  /* ── question CRUD ── */
  const openQuestionModal = () => {
    setQForm({ text: '', type: 'NUMBER', required: true })
    setModalError('')
    setQuestionModal({ open: true })
  }

  const confirmQuestion = async () => {
    if (!qForm.text.trim())  { setModalError('El texto es obligatorio'); return }
    if (!activePhaseTab)     { setModalError('Selecciona una fase primero'); return }
    setModalError(''); setSaving(true)
    try {
      const created = await questionsApi.createQuestion(activePhaseTab, {
        text: qForm.text.trim(), type: qForm.type, required: qForm.required,
      })
      setQuestions(q => ({ ...q, [activePhaseTab]: [...(q[activePhaseTab] || []), created] }))
      setQuestionModal({ open: false })
    } catch (err) { setModalError(err.message || 'Error al guardar') }
    finally { setSaving(false) }
  }

  const deleteQuestion = async (phaseId, qId) => {
    try {
      await questionsApi.deleteQuestion(phaseId, qId)
      setQuestions(q => ({ ...q, [phaseId]: (q[phaseId] || []).filter(x => x.id !== qId) }))
    } catch (err) { alert(err.message) }
  }

  /* ── nav ── */
  const goTo = (n) => { if (n >= 1 && n <= 5) setStep(n) }

  const handleNext = async () => {
    if (step === 1) await saveBasic()
    if (step < 5) goTo(step + 1)
    else handleFinish()
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      await saveBasic()
      navigate(`/experiments/${id}`)
    } catch { setSaving(false) }
  }

  const handleActivate = async () => {
    setSaving(true)
    try {
      await saveBasic()
      await experimentsApi.patchExperimentStatus(id, 'ACTIVE')
      navigate(`/experiments/${id}`)
    } catch (err) {
      alert(err.message || 'Error al activar')
      setSaving(false)
    }
  }

  /* ─────────────────────────────────────────
     RENDERS
  ───────────────────────────────────────── */
  if (loading) return (
    <div className={styles.loading}>Cargando experimento...</div>
  )
  if (error) return (
    <div className={styles.loading} style={{ color: 'var(--danger)' }}>{error}</div>
  )

  const currentPhaseQuestions = activePhaseTab ? (questions[activePhaseTab] || []) : []

  return (
    <div className={styles.page}>

      {/* ── TOPBAR ── */}
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <div className={styles.logo}>Empiri<span className={styles.logoAccent}>a</span></div>
          <span className={styles.topbarTitle}>Configurar experimento</span>
        </div>
        <div className={styles.topbarRight}>
          <button className={styles.btnGhostMuted} onClick={handleFinish} disabled={saving}>
            Guardar borrador
          </button>
          <button className={styles.btnGhost} onClick={() => navigate(`/experiments/${id}`)}>
            <IcoX />
            Salir
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className={styles.body}>

        {/* ── LEFT STEP NAV ── */}
        <nav className={styles.stepNav}>
          <div className={styles.stepNavTitle}>Pasos</div>
          {STEPS.map(s => {
            const state2 = getStepState(s.n)
            return (
              <div
                key={s.n}
                className={`${styles.stepItem} ${styles['step' + state2.charAt(0).toUpperCase() + state2.slice(1)]}`}
                onClick={() => goTo(s.n)}
              >
                <div className={`${styles.stepCircle} ${styles['circle' + state2.charAt(0).toUpperCase() + state2.slice(1)]}`}>
                  {state2 === 'done' ? <IcoCheck /> : s.n}
                </div>
                <div>
                  <div className={styles.stepLabel}>{s.label}</div>
                  <div className={styles.stepSub}>{s.sub(stateForSubs)}</div>
                </div>
              </div>
            )
          })}
        </nav>

        {/* ── MAIN CONTENT ── */}
        <main className={styles.main}>

          {/* ════ STEP 1: Basic ════ */}
          {step === 1 && (
            <>
              <div className={styles.stepHeader}>
                <div className={styles.stepEyebrow}>Paso 1 de 5</div>
                <h1 className={styles.stepTitle}>Configuracion basica</h1>
                <p className={styles.stepDesc}>Define el nombre, objetivo y estructura temporal del experimento.</p>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Identificacion</div>
                <div className={styles.field} style={{ marginBottom: 16 }}>
                  <label className={`${styles.fieldLabel} ${styles.required}`}>Titulo del experimento</label>
                  <input
                    className={styles.fieldInput}
                    value={basic.title}
                    onChange={e => setBasic(b => ({ ...b, title: e.target.value }))}
                    placeholder="Escribe un titulo claro y descriptivo..."
                    maxLength={120}
                  />
                  <div className={styles.fieldChar}>{basic.title.length} / 120</div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Descripcion del estudio</label>
                  <textarea
                    className={styles.fieldTextarea}
                    value={basic.description}
                    onChange={e => setBasic(b => ({ ...b, description: e.target.value }))}
                    placeholder="Explica el objetivo del estudio. Los participantes la veran al recibir la invitacion."
                    rows={3}
                  />
                  <div className={styles.fieldHint}>Visible para participantes al recibir la invitacion.</div>
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Diseno experimental</div>
                <div className={styles.designGrid}>
                  {DESIGN_OPTIONS.map(d => (
                    <div
                      key={d.id}
                      className={`${styles.designCard} ${basic.design === d.id ? styles.designCardSelected : ''}`}
                      onClick={() => setBasic(b => ({ ...b, design: d.id }))}
                    >
                      <div className={styles.designCheck}><IcoCheck /></div>
                      <div className={styles.designIcon} style={{ background: d.color + '22', border: `1px solid ${d.color}44` }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke={d.color} strokeWidth="2" style={{ width: 16, height: 16 }}>
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                      </div>
                      <div className={styles.designName}>{d.name}</div>
                      <div className={styles.designDesc}>{d.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Periodo del estudio</div>
                <div className={styles.formGrid2}>
                  <div className={styles.field}>
                    <label className={`${styles.fieldLabel} ${styles.required}`}>Fecha de inicio</label>
                    <input className={styles.fieldInput} type="date" value={basic.startDate} onChange={e => setBasic(b => ({ ...b, startDate: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label className={`${styles.fieldLabel} ${styles.required}`}>Fecha de fin estimada</label>
                    <input className={styles.fieldInput} type="date" value={basic.endDate} onChange={e => setBasic(b => ({ ...b, endDate: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Opciones adicionales</div>
                <div className={styles.togglesBox}>
                  {[
                    { key: 'rgpd',      label: 'Consentimiento RGPD obligatorio',         sub: 'Los participantes deben aceptar el uso de datos antes de inscribirse' },
                    { key: 'anonymize', label: 'Anonimizar respuestas en exportacion',    sub: 'Los nombres se reemplazaran por identificadores anonimos en CSV/JSON' },
                    { key: 'notify',    label: 'Notificar al investigador en cada respuesta', sub: 'Recibe un email cada vez que un participante completa una fase' },
                  ].map(opt => (
                    <div key={opt.key} className={styles.toggleRow}>
                      <div>
                        <div className={styles.toggleLabel}>{opt.label}</div>
                        <div className={styles.toggleSub}>{opt.sub}</div>
                      </div>
                      <div
                        className={`${styles.toggle} ${basic[opt.key] ? styles.toggleOn : ''}`}
                        onClick={() => setBasic(b => ({ ...b, [opt.key]: !b[opt.key] }))}
                      >
                        <div className={styles.toggleKnob} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ════ STEP 2: Phases ════ */}
          {step === 2 && (
            <>
              <div className={styles.stepHeader}>
                <div className={styles.stepEyebrow}>Paso 2 de 5</div>
                <h1 className={styles.stepTitle}>Fases del experimento</h1>
                <p className={styles.stepDesc}>Divide el experimento en fases temporales. Cada fase tendra su propio cuestionario.</p>
              </div>

              <div className={styles.phasesList}>
                {phases.map((p, i) => (
                  <div key={p.id}>
                    <div className={styles.phaseCard}>
                      <div className={styles.phaseCardHeader}>
                        <div className={styles.phaseNum}>{i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className={styles.phaseCardName}>{p.name}</div>
                          <div className={styles.phaseCardMeta}>
                            {p.startDate ? `${fmtDate(p.startDate)}${p.endDate ? ' — ' + fmtDate(p.endDate) : ''}` : 'Sin fechas definidas'}
                          </div>
                        </div>
                        <div className={styles.phaseCardActions}>
                          <button className={styles.iconBtn} onClick={() => openPhaseModal(p)}>
                            <IcoEdit />
                          </button>
                          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => deletePhase(p.id)}>
                            <IcoTrash />
                          </button>
                        </div>
                      </div>
                      {p.description && (
                        <div className={styles.phaseExpandInner}>{p.description}</div>
                      )}
                    </div>
                    {i < phases.length - 1 && (
                      <div className={styles.phaseConnector}>
                        <div className={styles.phaseConnectorLine} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button className={styles.addBtn} onClick={() => openPhaseModal()}>
                <IcoPlus />
                Añadir fase
              </button>

              <div className={styles.tipBox}>
                <strong>Consejo:</strong> Para un diseno pretest-postest se recomiendan al menos dos fases (medicion inicial y medicion final).
              </div>
            </>
          )}

          {/* ════ STEP 3: Groups ════ */}
          {step === 3 && (
            <>
              <div className={styles.stepHeader}>
                <div className={styles.stepEyebrow}>Paso 3 de 5</div>
                <h1 className={styles.stepTitle}>Grupos experimentales</h1>
                <p className={styles.stepDesc}>Define los grupos en los que se dividira a los participantes.</p>
              </div>

              <div className={styles.groupsGrid}>
                {groups.map(g => (
                  <div key={g.id} className={styles.groupCard}>
                    <div className={styles.groupColorBar} style={{ background: g.color || '#6C4DE6' }} />
                    <div className={styles.groupNameRow}>
                      <div className={styles.groupColorDot} style={{ background: g.color || '#6C4DE6' }} />
                      <div className={styles.groupCardName}>{g.name}</div>
                    </div>
                    <div className={styles.groupCardMeta}>{g.description || 'Sin descripcion'}</div>
                    <div className={styles.groupCardActions}>
                      <button className={styles.iconBtn} onClick={() => openGroupModal(g)}><IcoEdit /></button>
                      <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => deleteGroup(g.id)}><IcoTrash /></button>
                    </div>
                  </div>
                ))}
                <button className={styles.addGroupBtn} onClick={() => openGroupModal()}>
                  <IcoPlus />
                  <span>Nuevo grupo</span>
                </button>
              </div>

              <div className={styles.tipBox} style={{ marginTop: 16 }}>
                Los participantes seran asignados a estos grupos al inscribirse. Podras cambiar la asignacion desde el detalle del participante.
              </div>
            </>
          )}

          {/* ════ STEP 4: Questions ════ */}
          {step === 4 && (
            <>
              <div className={styles.stepHeader}>
                <div className={styles.stepEyebrow}>Paso 4 de 5</div>
                <h1 className={styles.stepTitle}>Preguntas por fase</h1>
                <p className={styles.stepDesc}>Añade las preguntas que los participantes respondera en cada fase.</p>
              </div>

              {phases.length === 0 ? (
                <div className={styles.emptyBox}>
                  Sin fases definidas. Vuelve al paso 2 para crear fases.
                </div>
              ) : (
                <>
                  <div className={styles.phaseTabBar}>
                    {phases.map(p => (
                      <button
                        key={p.id}
                        className={`${styles.phaseTab} ${activePhaseTab === p.id ? styles.phaseTabActive : ''}`}
                        onClick={() => setActivePhaseTab(p.id)}
                      >
                        {p.name}
                        <span className={styles.phaseTabCount}>{(questions[p.id] || []).length}</span>
                      </button>
                    ))}
                  </div>

                  {currentPhaseQuestions.length === 0 ? (
                    <div className={styles.emptyBox}>
                      Esta fase no tiene preguntas. Añade al menos una para poder activar el experimento.
                    </div>
                  ) : (
                    <div className={styles.questionsList}>
                      {currentPhaseQuestions.map((q, i) => (
                        <div key={q.id} className={styles.questionCard}>
                          <div className={styles.qDrag}><IcoDrag /></div>
                          <div className={styles.qOrder}>{i + 1}</div>
                          <div className={styles.qContent}>
                            <div className={styles.qTextPreview}>{q.text}</div>
                            <div className={styles.qMetaRow}>
                              <span className={`${styles.qTypeBadge} ${styles['qt' + q.type]}`}>
                                {Q_TYPE_LABELS[q.type] || q.type}
                              </span>
                              {q.required && <div className={styles.qRequiredDot} title="Obligatoria" />}
                            </div>
                          </div>
                          <div className={styles.qActions}>
                            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                              onClick={() => deleteQuestion(activePhaseTab, q.id)}>
                              <IcoTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button className={styles.addBtn} onClick={openQuestionModal}>
                    <IcoPlus />
                    Añadir pregunta a &ldquo;{phases.find(p => p.id === activePhaseTab)?.name}&rdquo;
                  </button>

                  <div className={styles.tipBox} style={{ marginTop: 12 }}>
                    Tipos disponibles: Numerica, Escala 1–10, Si/No, Opcion multiple y Texto libre.
                  </div>
                </>
              )}
            </>
          )}

          {/* ════ STEP 5: Summary ════ */}
          {step === 5 && (
            <>
              <div className={styles.stepHeader}>
                <div className={styles.stepEyebrow}>Paso 5 de 5</div>
                <h1 className={styles.stepTitle}>Revision y publicacion</h1>
                <p className={styles.stepDesc}>Revisa la configuracion antes de guardar o activar el experimento.</p>
              </div>

              {/* Summary sections */}
              <div className={styles.summarySection}>
                <div className={styles.summaryHeader}>
                  <div className={styles.summarySectionTitle}>Configuracion basica</div>
                  <button className={styles.summaryEditBtn} onClick={() => goTo(1)}>Editar</button>
                </div>
                <div className={styles.summaryRow}><span className={styles.summaryLabel}>Titulo</span><span className={styles.summaryVal}>{basic.title || '—'}</span></div>
                <div className={styles.summaryRow}><span className={styles.summaryLabel}>Diseno</span><span className={styles.summaryVal}>{DESIGN_LABELS[basic.design] || basic.design}</span></div>
                <div className={styles.summaryRow}><span className={styles.summaryLabel}>Periodo</span><span className={styles.summaryVal}>{basic.startDate ? `${fmtDate(basic.startDate)} — ${fmtDate(basic.endDate)}` : '—'}</span></div>
              </div>

              <div className={styles.summarySection}>
                <div className={styles.summaryHeader}>
                  <div className={styles.summarySectionTitle}>Fases ({phases.length})</div>
                  <button className={styles.summaryEditBtn} onClick={() => goTo(2)}>Editar</button>
                </div>
                {phases.length === 0
                  ? <div className={styles.summaryEmpty}>Sin fases configuradas</div>
                  : phases.map((p, i) => (
                    <div key={p.id} className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Fase {i + 1}</span>
                      <span className={styles.summaryVal}>{p.name}{p.startDate ? ` · ${fmtDate(p.startDate)}` : ''}</span>
                    </div>
                  ))
                }
              </div>

              <div className={styles.summarySection}>
                <div className={styles.summaryHeader}>
                  <div className={styles.summarySectionTitle}>Grupos ({groups.length})</div>
                  <button className={styles.summaryEditBtn} onClick={() => goTo(3)}>Editar</button>
                </div>
                {groups.length === 0
                  ? <div className={styles.summaryEmpty}>Sin grupos configurados</div>
                  : groups.map(g => (
                    <div key={g.id} className={styles.summaryRow}>
                      <span className={styles.summaryLabel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, display: 'inline-block', flexShrink: 0 }} />
                        {g.name}
                      </span>
                      <span className={styles.summaryVal}>{g.description || '—'}</span>
                    </div>
                  ))
                }
              </div>

              <div className={styles.summarySection}>
                <div className={styles.summaryHeader}>
                  <div className={styles.summarySectionTitle}>Preguntas ({totalQuestions})</div>
                  <button className={styles.summaryEditBtn} onClick={() => goTo(4)}>Editar</button>
                </div>
                {phases.map(p => (
                  <div key={p.id} className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{p.name}</span>
                    <span className={styles.summaryVal}>{(questions[p.id] || []).length} pregunta(s)</span>
                  </div>
                ))}
              </div>

              {/* Checklist */}
              <div className={styles.summarySection}>
                <div className={styles.summarySectionTitle} style={{ marginBottom: 16 }}>Lista de verificacion</div>
                <div className={styles.checklist}>
                  {[
                    { ok: basic.title.length > 0,   text: 'Titulo del experimento' },
                    { ok: phases.length >= 2,         text: `${phases.length} fase(s) definida(s)`,    hint: phases.length < 2 ? 'Se recomiendan al menos 2 fases' : '' },
                    { ok: groups.length >= 2,         text: `${groups.length} grupo(s) configurado(s)`, hint: groups.length < 2 ? 'Necesitas al menos 2 grupos' : '', warn: groups.length === 1 },
                    { ok: totalQuestions > 0,         text: `${totalQuestions} pregunta(s) en total`,   hint: totalQuestions === 0 ? 'Añade preguntas en el paso anterior' : '' },
                    { ok: true,                       text: 'Consentimiento RGPD activado' },
                    { ok: true,                       text: 'Anonimizacion de datos activada' },
                  ].map((c, i) => (
                    <div key={i} className={styles.checkItem}>
                      <div className={`${styles.checkCircle} ${c.ok ? (c.warn ? styles.checkWarn : styles.checkOk) : styles.checkErr}`}>
                        {c.ok ? <IcoCheck /> : <IcoX />}
                      </div>
                      <div>
                        <div className={styles.checkText}>{c.text}</div>
                        {c.hint && <div className={styles.checkHint}>{c.hint}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Launch box */}
              {(() => {
                const allOk = phases.length > 0 && groups.length >= 2 && totalQuestions > 0
                return (
                  <div className={styles.launchBox}>
                    <div className={styles.launchIcon}><IcoBolt /></div>
                    <div className={styles.launchText}>
                      <div className={styles.launchTitle}>{allOk ? 'Listo para activar' : 'Guardar como borrador'}</div>
                      <div className={styles.launchSub}>
                        {allOk
                          ? 'El experimento cumple todos los requisitos. Puedes activarlo ahora o guardarlo como borrador.'
                          : 'Completa los pasos pendientes para poder activar el experimento.'}
                      </div>
                    </div>
                    <div className={styles.launchActions}>
                      <button className={styles.btnCyan} onClick={handleActivate} disabled={saving}>
                        {allOk ? 'Activar experimento' : 'Guardar borrador'}
                      </button>
                      {allOk && (
                        <button className={styles.btnGhostSm} onClick={handleFinish} disabled={saving}>
                          Solo guardar borrador
                        </button>
                      )}
                    </div>
                  </div>
                )
              })()}
            </>
          )}

        </main>

        {/* ── RIGHT PREVIEW PANEL ── */}
        <aside className={styles.rightPanel}>
          <div className={styles.rightPanelTitle}>Vista previa</div>

          <div className={styles.previewCard}>
            <div className={styles.previewName}>{basic.title || 'Sin titulo'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span className={styles.previewTag}>{DESIGN_LABELS[basic.design] || basic.design}</span>
              {basic.startDate && (
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {fmtShort(basic.startDate)} — {fmtShort(basic.endDate)}
                </span>
              )}
            </div>
          </div>

          <div className={styles.previewCard}>
            <div className={styles.previewSectionLabel}>Progreso</div>
            <div className={styles.completenessLabel}>
              <span>Configuracion</span>
              <span>{completeness}%</span>
            </div>
            <div className={styles.completenessBar}>
              <div className={styles.completenessFill} style={{ width: `${completeness}%` }} />
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Fases',     val: phases.length || '—' },
                { label: 'Grupos',    val: groups.length || '—', muted: groups.length === 0 },
                { label: 'Preguntas', val: totalQuestions || '—', muted: totalQuestions === 0 },
              ].map(s => (
                <div key={s.label} className={styles.previewStat}>
                  <span className={styles.previewStatLabel}>{s.label}</span>
                  <span className={styles.previewStatVal} style={{ color: s.muted ? 'var(--muted)' : 'var(--text)' }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {phases.length > 0 && (
            <div className={styles.previewCard}>
              <div className={styles.previewSectionLabel}>Fases</div>
              <div className={styles.previewPhases}>
                {phases.map((p, i) => (
                  <div key={p.id} className={styles.previewPhase}>
                    <div className={styles.ppDot} style={{ background: i % 2 === 0 ? 'rgba(108,77,230,.7)' : 'rgba(0,212,170,.7)' }} />
                    <span className={styles.ppName}>{p.name}</span>
                    {p.startDate && <span className={styles.ppDate}>{fmtShort(p.startDate)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {groups.length > 0 && (
            <div className={styles.previewCard}>
              <div className={styles.previewSectionLabel}>Grupos</div>
              <div className={styles.previewGroups}>
                {groups.map(g => (
                  <div key={g.id} className={styles.previewGroupPill} style={{ background: g.color + '22', border: `1px solid ${g.color}44` }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text)' }}>{g.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

      </div>
      {/* /body */}

      {/* ── BOTTOM NAV ── */}
      <div className={styles.wizardNav}>
        <div className={styles.navStepInfo}>
          Paso <strong>{step}</strong> de <strong>5</strong>
        </div>
        <div className={styles.navBtns}>
          <button className={styles.btnGhost} onClick={() => goTo(step - 1)} disabled={step === 1} style={{ opacity: step === 1 ? 0.35 : 1 }}>
            <IcoLeft />
            Anterior
          </button>
          <button className={styles.btnPrimary} onClick={handleNext} disabled={saving}>
            {step === 5
              ? <><IcoCheck /> Finalizar</>
              : <>Siguiente <IcoRight /></>
            }
          </button>
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Phase modal */}
      <Modal
        open={phaseModal.open}
        onClose={() => setPhaseModal({ open: false, editing: null })}
        title={phaseModal.editing ? 'Editar fase' : 'Nueva fase'}
        sub="Define el nombre, fechas y descripcion de esta fase del experimento."
        footer={
          <>
            <button className={styles.btnGhost} onClick={() => setPhaseModal({ open: false, editing: null })}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={confirmPhase} disabled={saving}>
              {phaseModal.editing ? 'Guardar cambios' : 'Añadir fase'}
            </button>
          </>
        }
      >
        <div className={styles.field}>
          <label className={`${styles.fieldLabel} ${styles.required}`}>Nombre de la fase</label>
          <input className={styles.fieldInput} value={phaseForm.name} onChange={e => { setPhaseForm(f => ({...f, name: e.target.value})); setModalError('') }} placeholder="Ej. Pre-test, Post-test, Seguimiento..." autoFocus />
        </div>
        <div className={styles.formGrid2}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Fecha de inicio</label>
            <input className={styles.fieldInput} type="date" value={phaseForm.startDate} onChange={e => setPhaseForm(f => ({...f, startDate: e.target.value}))} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Fecha de fin</label>
            <input className={styles.fieldInput} type="date" value={phaseForm.endDate} onChange={e => setPhaseForm(f => ({...f, endDate: e.target.value}))} />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Descripcion</label>
          <textarea className={styles.fieldTextarea} value={phaseForm.description} onChange={e => setPhaseForm(f => ({...f, description: e.target.value}))} placeholder="Describe los objetivos de esta fase..." rows={2} />
        </div>
        {modalError && <p className={styles.modalError}>{modalError}</p>}
      </Modal>

      {/* Group modal */}
      <Modal
        open={groupModal.open}
        onClose={() => setGroupModal({ open: false, editing: null })}
        title={groupModal.editing ? 'Editar grupo' : 'Nuevo grupo'}
        sub="Los grupos permiten dividir a los participantes para comparar condiciones."
        footer={
          <>
            <button className={styles.btnGhost} onClick={() => setGroupModal({ open: false, editing: null })}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={confirmGroup} disabled={saving}>
              {groupModal.editing ? 'Guardar cambios' : 'Añadir grupo'}
            </button>
          </>
        }
      >
        <div className={styles.field}>
          <label className={`${styles.fieldLabel} ${styles.required}`}>Nombre del grupo</label>
          <input className={styles.fieldInput} value={groupForm.name} onChange={e => { setGroupForm(f => ({...f, name: e.target.value})); setModalError('') }} placeholder="Ej. Control, Experimental, Grupo A..." autoFocus />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Descripcion</label>
          <input className={styles.fieldInput} value={groupForm.description} onChange={e => setGroupForm(f => ({...f, description: e.target.value}))} placeholder="Ej. Sin intervencion, Protocolo HIIT..." />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Color identificativo</label>
          <div className={styles.colorPicker}>
            {GROUP_COLORS.map(c => (
              <div
                key={c}
                className={`${styles.colorSwatch} ${groupForm.color === c ? styles.colorSwatchSelected : ''}`}
                style={{ background: c }}
                onClick={() => setGroupForm(f => ({...f, color: c}))}
              />
            ))}
          </div>
        </div>
        {modalError && <p className={styles.modalError}>{modalError}</p>}
      </Modal>

      {/* Question modal */}
      <Modal
        open={questionModal.open}
        onClose={() => setQuestionModal({ open: false })}
        title="Nueva pregunta"
        sub="Configura el tipo de respuesta y el texto de la pregunta."
        footer={
          <>
            <button className={styles.btnGhost} onClick={() => setQuestionModal({ open: false })}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={confirmQuestion} disabled={saving}>Añadir pregunta</button>
          </>
        }
      >
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Tipo de respuesta</label>
          <div className={styles.typeSelector}>
            {[
              { type: 'NUMBER',  label: 'Numerico',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
              { type: 'SCALE',   label: 'Escala',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
              { type: 'TEXT',    label: 'Texto',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg> },
              { type: 'BOOLEAN', label: 'Si / No',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="8" cy="12" r="3"/></svg> },
              { type: 'MULTIPLE_CHOICE', label: 'Multiple', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg> },
            ].map(opt => (
              <div
                key={opt.type}
                className={`${styles.typeOption} ${qForm.type === opt.type ? styles.typeOptionSelected : ''}`}
                onClick={() => setQForm(f => ({...f, type: opt.type}))}
              >
                {opt.icon}
                <div className={styles.typeOptionName}>{opt.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.field}>
          <label className={`${styles.fieldLabel} ${styles.required}`}>Texto de la pregunta</label>
          <textarea className={styles.fieldTextarea} value={qForm.text} onChange={e => { setQForm(f => ({...f, text: e.target.value})); setModalError('') }} placeholder="Escribe la pregunta tal como la vera el participante..." rows={3} autoFocus />
        </div>
        <div className={styles.toggleRow}>
          <div>
            <div className={styles.toggleLabel}>Respuesta obligatoria</div>
            <div className={styles.toggleSub}>El participante no podra avanzar sin responder</div>
          </div>
          <div
            className={`${styles.toggle} ${qForm.required ? styles.toggleOn : ''}`}
            onClick={() => setQForm(f => ({...f, required: !f.required}))}
          >
            <div className={styles.toggleKnob} />
          </div>
        </div>
        {modalError && <p className={styles.modalError}>{modalError}</p>}
      </Modal>

    </div>
  )
}
