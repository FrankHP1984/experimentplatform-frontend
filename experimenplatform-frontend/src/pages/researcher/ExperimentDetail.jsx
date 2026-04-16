import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as experimentsApi from '../../api/experiments'
import * as phasesApi      from '../../api/phases'
import * as groupsApi      from '../../api/groups'
import * as questionsApi   from '../../api/questions'
import * as enrollmentsApi from '../../api/enrollments'
import styles from './ExperimentDetail.module.css'

/* ─── SVG Icons ─── */
const Ico = ({ d, children, size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: size, height: size, flexShrink: 0 }}>
    {d ? <path d={d} /> : children}
  </svg>
)
const IcoPlus      = () => <Ico><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Ico>
const IcoEdit      = () => <Ico><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Ico>
const IcoTrash     = () => <Ico><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></Ico>
const IcoLink      = () => <Ico><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Ico>
const IcoPlay      = () => <Ico><circle cx="12" cy="12" r="10"/><polyline points="10 8 16 12 10 16"/></Ico>
const IcoPause     = () => <Ico><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></Ico>
const IcoCal       = () => <Ico><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ico>
const IcoChev      = () => <Ico><polyline points="9 18 15 12 9 6"/></Ico>
const IcoDoc       = () => <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></Ico>
const IcoList      = () => <Ico><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></Ico>
const IcoPeople    = () => <Ico><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ico>
const IcoPerson    = () => <Ico><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></Ico>
const IcoWave      = () => <Ico><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Ico>
const IcoCopy      = () => <Ico><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Ico>
const IcoDownload  = () => <Ico><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Ico>
const IcoDots      = () => <Ico><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/><circle cx="5" cy="12" r="1" fill="currentColor"/></Ico>
const IcoX         = () => <Ico><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ico>
const IcoDrag      = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
    <circle cx="9" cy="5" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="9" cy="19" r="1.2"/>
    <circle cx="15" cy="5" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="15" cy="19" r="1.2"/>
  </svg>
)

/* ─── Status helpers ─── */
const STATUS_LABEL = { DRAFT: 'Borrador', ACTIVE: 'Activo', PAUSED: 'Pausado', FINISHED: 'Finalizado' }
const STATUS_CSS   = { DRAFT: 'draft', ACTIVE: 'active', PAUSED: 'paused', FINISHED: 'finished' }

const DESIGN_LABEL = {
  PRETEST_POSTEST:  'Pretest–Postest',
  BETWEEN_SUBJECTS: 'Entre grupos',
  WITHIN_SUBJECTS:  'Intra sujeto',
  LONGITUDINAL:     'Longitudinal',
  CROSS_SECTIONAL:  'Transversal',
}

const Q_TYPE_LABEL = {
  TEXT: 'Texto', NUMBER: 'Numerica', SCALE: 'Escala',
  MULTIPLE_CHOICE: 'Multiple', BOOLEAN: 'Si / No',
}
const Q_TYPE_CSS = {
  TEXT: 'typeText', NUMBER: 'typeNumber', SCALE: 'typeScale',
  MULTIPLE_CHOICE: 'typeMultiple', BOOLEAN: 'typeBoolean',
}

const ENROLL_STATUS_LABEL = { ACTIVE: 'Activo', PENDING: 'Pendiente', COMPLETED: 'Completado', WITHDRAWN: 'Retirado' }
const ENROLL_STATUS_CSS   = { ACTIVE: 'eActive', PENDING: 'ePending', COMPLETED: 'eCompleted', WITHDRAWN: 'eWithdrawn' }

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ─── Confirm modal ─── */
function ConfirmModal({ open, title, desc, danger, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className={styles.modal} style={{ maxWidth: 380 }}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>{title}</span>
          <button className={styles.modalClose} onClick={onCancel}><IcoX /></button>
        </div>
        <p className={styles.modalSub}>{desc}</p>
        <div className={styles.modalFooter}>
          <button className={`${styles.btnModal} ${styles.btnGhost}`} onClick={onCancel}>Cancelar</button>
          <button
            className={`${styles.btnModal} ${danger ? styles.btnDanger : styles.btnPrimary}`}
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Phase modal ─── */
function PhaseModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', ...initial })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (open) setForm({ name: '', startDate: '', endDate: '', ...initial }) }, [open, initial])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true); setError('')
    try { await onSave({ name: form.name.trim(), startDate: form.startDate || null, endDate: form.endDate || null }); onClose() }
    catch (err) { setError(err.message || 'Error al guardar') }
    finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>{initial?.id ? 'Editar fase' : 'Nueva fase'}</span>
          <button className={styles.modalClose} onClick={onClose}><IcoX /></button>
        </div>
        <p className={styles.modalSub}>Define el nombre y el periodo temporal de esta fase.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre de la fase</label>
            <input className={styles.formInput} value={form.name} onChange={e => { setForm(f => ({...f, name: e.target.value})); setError('') }} placeholder="Ej. Pretest, Intervencion, Postest..." autoFocus />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha de inicio <span className={styles.opt}>(opcional)</span></label>
              <input className={styles.formInput} type="date" value={form.startDate || ''} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha de fin <span className={styles.opt}>(opcional)</span></label>
              <input className={styles.formInput} type="date" value={form.endDate || ''} onChange={e => setForm(f => ({...f, endDate: e.target.value}))} />
            </div>
          </div>
          {error && <p className={styles.formError}>{error}</p>}
          <div className={styles.modalFooter}>
            <button type="button" className={`${styles.btnModal} ${styles.btnGhost}`} onClick={onClose}>Cancelar</button>
            <button type="submit" className={`${styles.btnModal} ${styles.btnPrimary}`} disabled={loading}>{loading ? 'Guardando...' : 'Guardar fase'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Group modal ─── */
const GROUP_COLORS = ['#6C4DE6','#00D4AA','#4A8BF5','#F59E0B','#EC4899','#10B981']

function GroupModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#6C4DE6', ...initial })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (open) setForm({ name: '', description: '', color: '#6C4DE6', ...initial }) }, [open, initial])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true); setError('')
    try { await onSave({ name: form.name.trim(), description: form.description.trim(), color: form.color }); onClose() }
    catch (err) { setError(err.message || 'Error al guardar') }
    finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>{initial?.id ? 'Editar grupo' : 'Nuevo grupo'}</span>
          <button className={styles.modalClose} onClick={onClose}><IcoX /></button>
        </div>
        <p className={styles.modalSub}>Los grupos permiten comparar subconjuntos de participantes.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre del grupo</label>
            <input className={styles.formInput} value={form.name} onChange={e => { setForm(f => ({...f, name: e.target.value})); setError('') }} placeholder="Ej. Grupo Control, Grupo Experimental..." autoFocus />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripcion <span className={styles.opt}>(opcional)</span></label>
            <textarea className={`${styles.formInput} ${styles.textarea}`} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Describe brevemente este grupo..." rows={2} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Color identificador</label>
            <div className={styles.colorPicker}>
              {GROUP_COLORS.map(c => (
                <button key={c} type="button" className={`${styles.colorDot} ${form.color === c ? styles.colorDotActive : ''}`}
                  style={{ background: c }} onClick={() => setForm(f => ({...f, color: c}))} />
              ))}
            </div>
          </div>
          {error && <p className={styles.formError}>{error}</p>}
          <div className={styles.modalFooter}>
            <button type="button" className={`${styles.btnModal} ${styles.btnGhost}`} onClick={onClose}>Cancelar</button>
            <button type="submit" className={`${styles.btnModal} ${styles.btnPrimary}`} disabled={loading}>{loading ? 'Guardando...' : 'Guardar grupo'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Question modal ─── */
function QuestionModal({ open, initial, phases, defaultPhaseId, onClose, onSave }) {
  const [form, setForm] = useState({ text: '', type: 'TEXT', required: true, phaseId: defaultPhaseId || '', ...initial })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) setForm({ text: '', type: 'TEXT', required: true, phaseId: defaultPhaseId || '', ...initial })
  }, [open, initial, defaultPhaseId])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.text.trim()) { setError('El texto es obligatorio'); return }
    if (!form.phaseId)     { setError('Selecciona una fase'); return }
    setLoading(true); setError('')
    try { await onSave({ text: form.text.trim(), type: form.type, required: form.required, phaseId: form.phaseId }); onClose() }
    catch (err) { setError(err.message || 'Error al guardar') }
    finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>{initial?.id ? 'Editar pregunta' : 'Nueva pregunta'}</span>
          <button className={styles.modalClose} onClick={onClose}><IcoX /></button>
        </div>
        <p className={styles.modalSub}>Añade una pregunta al cuestionario de una fase.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Texto de la pregunta</label>
            <input className={styles.formInput} value={form.text} onChange={e => { setForm(f => ({...f, text: e.target.value})); setError('') }} placeholder="Ej. ¿Cuantas horas duermes de media?" autoFocus />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tipo de respuesta</label>
              <select className={styles.formInput} value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                <option value="TEXT">Texto libre</option>
                <option value="NUMBER">Numerica</option>
                <option value="SCALE">Escala (1–10)</option>
                <option value="MULTIPLE_CHOICE">Opcion multiple</option>
                <option value="BOOLEAN">Si / No</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fase</label>
              <select className={styles.formInput} value={form.phaseId} onChange={e => { setForm(f => ({...f, phaseId: e.target.value})); setError('') }}>
                <option value="">Selecciona una fase</option>
                {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>Obligatoria</div>
              <div className={styles.toggleSub}>El participante debe responder esta pregunta</div>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={form.required} onChange={e => setForm(f => ({...f, required: e.target.checked}))} />
              <span className={styles.toggleSlider} />
            </label>
          </div>
          {error && <p className={styles.formError}>{error}</p>}
          <div className={styles.modalFooter}>
            <button type="button" className={`${styles.btnModal} ${styles.btnGhost}`} onClick={onClose}>Cancelar</button>
            <button type="submit" className={`${styles.btnModal} ${styles.btnPrimary}`} disabled={loading}>{loading ? 'Guardando...' : 'Guardar pregunta'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Invite link modal ─── */
function InviteLinkModal({ open, experimentId, onClose }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/invite/${experimentId}`

  const copyLink = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!open) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Enlace de invitacion</span>
          <button className={styles.modalClose} onClick={onClose}><IcoX /></button>
        </div>
        <p className={styles.modalSub}>Comparte este enlace con los participantes que quieras incluir en el estudio.</p>
        <div className={styles.inviteRow}>
          <div className={styles.inviteBox}>{link}</div>
          <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`} onClick={copyLink}>
            <IcoCopy />
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <div className={styles.modalFooter}>
          <button className={`${styles.btnModal} ${styles.btnGhost}`} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function ExperimentDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  /* ─── State ─── */
  const [exp,          setExp]          = useState(null)
  const [phases,       setPhases]       = useState([])
  const [groups,       setGroups]       = useState([])
  const [questions,    setQuestions]    = useState({})   // { phaseId: [...] }
  const [enrollments,  setEnrollments]  = useState([])
  const [activeTab,    setActiveTab]    = useState('phases')
  const [activePhaseQ, setActivePhaseQ] = useState(null)  // for questions tab
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  /* modals */
  const [phaseModal,   setPhaseModal]   = useState({ open: false, initial: null })
  const [groupModal,   setGroupModal]   = useState({ open: false, initial: null })
  const [questionModal,setQuestionModal]= useState({ open: false, initial: null })
  const [inviteModal,  setInviteModal]  = useState(false)
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', desc: '', danger: false, onConfirm: null })
  const [statusLoading,setStatusLoading]= useState(false)

  /* ─── Load experiment + phases + groups + enrollments ─── */
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [expData, phasesData, groupsData, enrollData] = await Promise.all([
        experimentsApi.getExperiment(id),
        phasesApi.getPhases(id),
        groupsApi.getGroups(id),
        enrollmentsApi.getEnrollments(id),
      ])
      setExp(expData)
      setPhases(phasesData)
      setGroups(groupsData)
      setEnrollments(enrollData)
      if (phasesData.length > 0) setActivePhaseQ(phasesData[0].id)
    } catch (err) {
      setError(err.message || 'Error al cargar el experimento')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  /* ─── Load questions for a phase ─── */
  const loadQuestions = useCallback(async (phaseId) => {
    if (questions[phaseId]) return
    try {
      const data = await questionsApi.getQuestions(phaseId)
      setQuestions(q => ({ ...q, [phaseId]: data }))
    } catch { /* silent */ }
  }, [questions])

  useEffect(() => {
    if (activeTab === 'questions' && activePhaseQ) loadQuestions(activePhaseQ)
  }, [activeTab, activePhaseQ, loadQuestions])

  /* ─── Computed ─── */
  const totalQuestions = Object.values(questions).reduce((s, qs) => s + qs.length, 0)
  const currentQuestions = activePhaseQ ? (questions[activePhaseQ] || []) : []

  /* ─── Status change ─── */
  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true)
    try {
      const updated = await experimentsApi.patchExperimentStatus(id, newStatus)
      setExp(updated)
    } catch (err) {
      alert(err.message || 'Error al cambiar estado')
    } finally {
      setStatusLoading(false)
    }
  }

  /* ─── Phases CRUD ─── */
  const savePhase = async (data) => {
    if (phaseModal.initial?.id) {
      const updated = await phasesApi.updatePhase(id, phaseModal.initial.id, data)
      setPhases(ps => ps.map(p => p.id === updated.id ? updated : p))
    } else {
      const created = await phasesApi.createPhase(id, data)
      setPhases(ps => [...ps, created])
      setActivePhaseQ(created.id)
    }
  }

  const deletePhase = (phase) => {
    setConfirmModal({
      open: true, danger: true,
      title: 'Eliminar fase',
      desc: `¿Eliminar "${phase.name}"? Se borrarán también sus preguntas.`,
      onConfirm: async () => {
        await phasesApi.deletePhase(id, phase.id)
        setPhases(ps => ps.filter(p => p.id !== phase.id))
        setQuestions(q => { const next = {...q}; delete next[phase.id]; return next })
        if (activePhaseQ === phase.id) setActivePhaseQ(phases.find(p => p.id !== phase.id)?.id || null)
        setConfirmModal(c => ({ ...c, open: false }))
      },
    })
  }

  /* ─── Groups CRUD ─── */
  const saveGroup = async (data) => {
    if (groupModal.initial?.id) {
      const updated = await groupsApi.updateGroup(id, groupModal.initial.id, data)
      setGroups(gs => gs.map(g => g.id === updated.id ? updated : g))
    } else {
      const created = await groupsApi.createGroup(id, data)
      setGroups(gs => [...gs, created])
    }
  }

  const deleteGroup = (group) => {
    setConfirmModal({
      open: true, danger: true,
      title: 'Eliminar grupo',
      desc: `¿Eliminar "${group.name}"? Los participantes asignados quedaran sin grupo.`,
      onConfirm: async () => {
        await groupsApi.deleteGroup(id, group.id)
        setGroups(gs => gs.filter(g => g.id !== group.id))
        setConfirmModal(c => ({ ...c, open: false }))
      },
    })
  }

  /* ─── Questions CRUD ─── */
  const saveQuestion = async ({ phaseId, ...data }) => {
    if (questionModal.initial?.id) {
      const updated = await questionsApi.updateQuestion(phaseId, questionModal.initial.id, data)
      setQuestions(q => ({ ...q, [phaseId]: (q[phaseId] || []).map(x => x.id === updated.id ? updated : x) }))
    } else {
      const created = await questionsApi.createQuestion(phaseId, data)
      setQuestions(q => ({ ...q, [phaseId]: [...(q[phaseId] || []), created] }))
    }
  }

  const deleteQuestion = (phaseId, question) => {
    setConfirmModal({
      open: true, danger: true,
      title: 'Eliminar pregunta',
      desc: `¿Eliminar "${question.text}"?`,
      onConfirm: async () => {
        await questionsApi.deleteQuestion(phaseId, question.id)
        setQuestions(q => ({ ...q, [phaseId]: (q[phaseId] || []).filter(x => x.id !== question.id) }))
        setConfirmModal(c => ({ ...c, open: false }))
      },
    })
  }

  /* ─── Render helpers ─── */
  if (loading) return (
    <div className={styles.loadingState}>
      <div className={styles.loadingText}>Cargando experimento...</div>
    </div>
  )

  if (error || !exp) return (
    <div className={styles.loadingState}>
      <div className={styles.loadingText} style={{ color: 'var(--danger)' }}>{error || 'Experimento no encontrado'}</div>
      <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`} onClick={() => navigate('/experiments')} style={{ marginTop: 16 }}>
        Volver
      </button>
    </div>
  )

  const statusCss = STATUS_CSS[exp.status] || 'draft'
  const isActive  = exp.status === 'ACTIVE'
  const isDraft   = exp.status === 'DRAFT'
  const isPaused  = exp.status === 'PAUSED'

  const activeEnrollments  = enrollments.filter(e => e.status === 'ACTIVE').length
  const pendingEnrollments = enrollments.filter(e => e.status === 'PENDING').length
  const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED').length

  const tabs = [
    { id: 'phases',       label: 'Fases',         icon: <IcoList />,   count: phases.length },
    { id: 'groups',       label: 'Grupos',         icon: <IcoPeople />, count: groups.length },
    { id: 'questions',    label: 'Preguntas',      icon: <IcoDoc />,    count: totalQuestions },
    { id: 'participants', label: 'Participantes',  icon: <IcoPerson />, count: enrollments.length },
    { id: 'responses',    label: 'Respuestas',     icon: <IcoWave />,   count: null },
  ]

  return (
    <>
      {/* ─── Topbar ─── */}
      <div className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <Link to="/dashboard" className={styles.breadcrumbItem}>Experimentos</Link>
          <span className={styles.breadcrumbSep}><IcoChev /></span>
          <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
            {exp.title.length > 40 ? exp.title.slice(0, 40) + '...' : exp.title}
          </span>
        </div>
        <div className={styles.topbarActions}>
          <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
            onClick={() => navigate(`/experiments/${id}/wizard`)}>
            <IcoEdit />
            Editar
          </button>
          <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
            onClick={() => setInviteModal(true)}>
            <IcoLink />
            Enlace de invitacion
          </button>
          {isDraft && (
            <button className={`${styles.topbarBtn} ${styles.topbarBtnSuccess}`}
              onClick={() => handleStatusChange('ACTIVE')} disabled={statusLoading}>
              <IcoPlay />
              Activar experimento
            </button>
          )}
          {isActive && (
            <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
              onClick={() => handleStatusChange('PAUSED')} disabled={statusLoading}>
              <IcoPause />
              Pausar
            </button>
          )}
          {isPaused && (
            <button className={`${styles.topbarBtn} ${styles.topbarBtnSuccess}`}
              onClick={() => handleStatusChange('ACTIVE')} disabled={statusLoading}>
              <IcoPlay />
              Reanudar
            </button>
          )}
        </div>
      </div>

      {/* ─── Scrollable content ─── */}
      <div className={styles.content}>

        {/* Experiment header */}
        <div className={styles.expHeader}>
          <div className={styles.expHeaderTop}>
            <div className={styles.expHeaderLeft}>
              <div className={styles.expStatusRow}>
                <span className={`${styles.statusBadge} ${styles[statusCss]}`}>
                  <span className={`${styles.statusDot} ${isActive ? styles.statusDotPulse : ''}`} />
                  {STATUS_LABEL[exp.status] || exp.status}
                </span>
                <span className={styles.designTag}>{DESIGN_LABEL[exp.design] || exp.design}</span>
              </div>
              <h1 className={styles.expTitle}>{exp.title}</h1>
              <div className={styles.expDates}>
                <IcoCal />
                {exp.startDate ? fmtDate(exp.startDate) : 'Sin fecha de inicio'}
                {exp.endDate ? ` — ${fmtDate(exp.endDate)}` : ''}
              </div>
            </div>
          </div>

          {/* Mini stats */}
          <div className={styles.miniStats}>
            {[
              { val: phases.length,       label: 'Fases' },
              { val: groups.length,       label: 'Grupos' },
              { val: totalQuestions,      label: 'Preguntas' },
              { val: enrollments.length,  label: 'Participantes' },
              { val: completedEnrollments,label: 'Respuestas', cyan: true },
            ].map(s => (
              <div key={s.label} className={styles.miniStat}>
                <div className={`${styles.miniStatVal} ${s.cyan ? styles.miniStatCyan : ''}`}>{s.val}</div>
                <div className={styles.miniStatLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className={styles.tabBar}>
            {tabs.map(t => (
              <button
                key={t.id}
                className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.icon}
                {t.label}
                {t.count !== null && t.count > 0 && (
                  <span className={styles.tabCount}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Tab content ─── */}
        <div className={styles.tabContent}>

          {/* FASES */}
          {activeTab === 'phases' && (
            <div>
              <div className={styles.sectionHead}>
                <div>
                  <div className={styles.sectionTitle}>Fases del experimento</div>
                  <div className={styles.sectionDesc}>Define las etapas temporales del estudio. Cada fase tiene sus propias preguntas.</div>
                </div>
                <button className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
                  onClick={() => setPhaseModal({ open: true, initial: null })}>
                  <IcoPlus />
                  Añadir fase
                </button>
              </div>

              {phases.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><IcoList /></div>
                  <div className={styles.emptyTitle}>Sin fases todavia</div>
                  <div className={styles.emptyDesc}>Crea la primera fase para organizar las etapas de tu experimento.</div>
                  <button className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
                    onClick={() => setPhaseModal({ open: true, initial: null })}>
                    <IcoPlus />
                    Añadir primera fase
                  </button>
                </div>
              ) : (
                <div className={styles.phasesList}>
                  {phases.map((phase, i) => (
                    <div key={phase.id}>
                      <div className={styles.phaseCard}>
                        <div className={styles.phaseNum}>{i + 1}</div>
                        <div className={styles.phaseInfo}>
                          <div className={styles.phaseName}>{phase.name}</div>
                          <div className={styles.phaseMeta}>
                            {phase.startDate && <span>{fmtDate(phase.startDate)} — {fmtDate(phase.endDate)}</span>}
                            {phase.startDate && <span>·</span>}
                            <span>{(questions[phase.id] || []).length} preguntas</span>
                          </div>
                        </div>
                        <div className={styles.phaseRight}>
                          <button className={styles.phaseQBtn}
                            onClick={() => { setActiveTab('questions'); setActivePhaseQ(phase.id) }}>
                            <IcoDoc />
                            Ver preguntas
                          </button>
                          <button className={styles.iconBtn}
                            onClick={() => setPhaseModal({ open: true, initial: phase })}>
                            <IcoEdit />
                          </button>
                          <button className={`${styles.iconBtn} ${styles.iconBtnRed}`}
                            onClick={() => deletePhase(phase)}>
                            <IcoTrash />
                          </button>
                        </div>
                      </div>
                      {i < phases.length - 1 && (
                        <div className={styles.phaseConnector}>
                          <div className={styles.phaseConnectorLine} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GRUPOS */}
          {activeTab === 'groups' && (
            <div>
              <div className={styles.sectionHead}>
                <div>
                  <div className={styles.sectionTitle}>Grupos de participantes</div>
                  <div className={styles.sectionDesc}>Organiza los participantes en grupos para comparar resultados entre ellos.</div>
                </div>
                <button className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
                  onClick={() => setGroupModal({ open: true, initial: null })}>
                  <IcoPlus />
                  Añadir grupo
                </button>
              </div>

              <div className={styles.groupsGrid}>
                {groups.map(group => (
                  <div key={group.id} className={styles.groupCard}>
                    <div className={styles.groupCardHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className={styles.groupColorDot} style={{ background: group.color || '#6C4DE6' }} />
                        <div className={styles.groupName}>{group.name}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className={styles.iconBtn}
                          onClick={() => setGroupModal({ open: true, initial: group })}>
                          <IcoEdit />
                        </button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnRed}`}
                          onClick={() => deleteGroup(group)}>
                          <IcoTrash />
                        </button>
                      </div>
                    </div>
                    {group.description && (
                      <div className={styles.groupDesc}>{group.description}</div>
                    )}
                    <div className={styles.groupFooter}>
                      <div className={styles.groupCount}>
                        <strong>{enrollments.filter(e => e.groupId === group.id).length}</strong> participantes
                      </div>
                      <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
                        style={{ padding: '5px 12px', fontSize: 12 }}
                        onClick={() => setActiveTab('participants')}>
                        Ver participantes
                      </button>
                    </div>
                  </div>
                ))}

                <button className={styles.groupCardAdd}
                  onClick={() => setGroupModal({ open: true, initial: null })}>
                  <IcoPlus />
                  <span>Añadir otro grupo</span>
                </button>
              </div>

              {groups.length === 0 && (
                <div className={styles.emptyState} style={{ marginTop: 0 }}>
                  <div className={styles.emptyIcon}><IcoPeople /></div>
                  <div className={styles.emptyTitle}>Sin grupos todavia</div>
                  <div className={styles.emptyDesc}>Crea grupos para comparar diferentes subconjuntos de participantes.</div>
                </div>
              )}
            </div>
          )}

          {/* PREGUNTAS */}
          {activeTab === 'questions' && (
            <div>
              <div className={styles.sectionHead}>
                <div>
                  <div className={styles.sectionTitle}>Preguntas por fase</div>
                  <div className={styles.sectionDesc}>Selecciona una fase para ver y editar sus preguntas.</div>
                </div>
                <button className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
                  onClick={() => setQuestionModal({ open: true, initial: null })}
                  disabled={phases.length === 0}>
                  <IcoPlus />
                  Añadir pregunta
                </button>
              </div>

              {phases.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><IcoDoc /></div>
                  <div className={styles.emptyTitle}>Primero crea fases</div>
                  <div className={styles.emptyDesc}>Las preguntas pertenecen a fases. Crea al menos una fase primero.</div>
                  <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
                    onClick={() => setActiveTab('phases')}>
                    Ir a Fases
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.phasePills}>
                    {phases.map(phase => (
                      <button
                        key={phase.id}
                        className={`${styles.phasePill} ${activePhaseQ === phase.id ? styles.phasePillActive : ''}`}
                        onClick={() => { setActivePhaseQ(phase.id); loadQuestions(phase.id) }}
                      >
                        {phase.name}
                        <span className={styles.phasePillCount}>{(questions[phase.id] || []).length}</span>
                      </button>
                    ))}
                  </div>

                  {currentQuestions.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}><IcoDoc /></div>
                      <div className={styles.emptyTitle}>Sin preguntas en esta fase</div>
                      <div className={styles.emptyDesc}>Añade la primera pregunta a esta fase del experimento.</div>
                      <button className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
                        onClick={() => setQuestionModal({ open: true, initial: null })}>
                        <IcoPlus />
                        Añadir pregunta
                      </button>
                    </div>
                  ) : (
                    <div className={styles.questionsList}>
                      {currentQuestions.map((q, i) => (
                        <div key={q.id} className={styles.questionRow}>
                          <div className={styles.questionDrag}><IcoDrag /></div>
                          <div className={styles.questionOrder}>{i + 1}</div>
                          <div className={styles.questionBody}>
                            <div className={styles.questionText}>{q.text}</div>
                            <div className={styles.questionTags}>
                              <span className={`${styles.qTypeBadge} ${styles[Q_TYPE_CSS[q.type] || 'typeText']}`}>
                                {Q_TYPE_LABEL[q.type] || q.type}
                              </span>
                              {q.required && <span className={styles.qRequiredBadge}>Obligatoria</span>}
                            </div>
                          </div>
                          <div className={styles.questionActions}>
                            <button className={styles.iconBtn}
                              onClick={() => setQuestionModal({ open: true, initial: { ...q, phaseId: activePhaseQ } })}>
                              <IcoEdit />
                            </button>
                            <button className={`${styles.iconBtn} ${styles.iconBtnRed}`}
                              onClick={() => deleteQuestion(activePhaseQ, q)}>
                              <IcoTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* PARTICIPANTES */}
          {activeTab === 'participants' && (
            <div>
              <div className={styles.participantsStats}>
                {[
                  { val: enrollments.length,  label: 'Total inscritos' },
                  { val: pendingEnrollments,  label: 'Pendientes de confirmar', cyan: true },
                  { val: completedEnrollments,label: 'Completados' },
                ].map(s => (
                  <div key={s.label} className={styles.pStatCard}>
                    <div className={`${styles.pStatVal} ${s.cyan ? styles.pStatCyan : ''}`}>{s.val}</div>
                    <div className={styles.pStatLabel}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className={styles.inviteBanner}>
                <div className={styles.inviteBannerLeft}>
                  <div className={styles.inviteBannerTitle}>Enlace de invitacion activo</div>
                  <div className={styles.inviteBannerDesc}>Comparte este enlace con los participantes que quieras incluir en el estudio.</div>
                </div>
                <div className={styles.inviteRow}>
                  <div className={styles.inviteBox}>{window.location.origin}/invite/{id}</div>
                  <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/invite/${id}`)}>
                    <IcoCopy />
                    Copiar
                  </button>
                </div>
              </div>

              <div className={styles.sectionHead}>
                <div className={styles.sectionTitle}>Participantes inscritos</div>
              </div>

              {enrollments.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><IcoPerson /></div>
                  <div className={styles.emptyTitle}>Sin participantes todavia</div>
                  <div className={styles.emptyDesc}>Comparte el enlace de invitacion para que los participantes puedan unirse.</div>
                  <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
                    onClick={() => setInviteModal(true)}>
                    <IcoLink />
                    Ver enlace de invitacion
                  </button>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Participante</th>
                        <th>Grupo</th>
                        <th>Estado</th>
                        <th>Progreso</th>
                        <th>Ultima actividad</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map(enroll => {
                        const group = groups.find(g => g.id === enroll.groupId)
                        return (
                          <tr key={enroll.id}>
                            <td>
                              <div className={styles.participantName}>{enroll.participant?.name || '—'}</div>
                              <div className={styles.participantEmail}>{enroll.participant?.email || '—'}</div>
                            </td>
                            <td>
                              {group ? (
                                <span style={{ color: group.color || 'var(--violet)', fontSize: 12.5, fontWeight: 500 }}>
                                  {group.name}
                                </span>
                              ) : <span style={{ color: 'var(--muted)', fontSize: 12 }}>Sin grupo</span>}
                            </td>
                            <td>
                              <span className={`${styles.pStatusBadge} ${styles[ENROLL_STATUS_CSS[enroll.status] || 'ePending']}`}>
                                {ENROLL_STATUS_LABEL[enroll.status] || enroll.status}
                              </span>
                            </td>
                            <td>
                              <div className={styles.progressCell}>
                                <div className={styles.progressMini}>
                                  <div className={styles.progressMiniFill} style={{ width: `${enroll.progress || 0}%` }} />
                                </div>
                                <span className={styles.progressPct}>{enroll.progress || 0}%</span>
                              </div>
                            </td>
                            <td className={styles.tdMuted}>
                              {enroll.lastActivity ? fmtDate(enroll.lastActivity) : 'Sin actividad'}
                            </td>
                            <td>
                              <button className={styles.iconBtn}
                                onClick={() => navigate(`/experiments/${id}/participants/${enroll.id}`)}>
                                <IcoDots />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* RESPUESTAS */}
          {activeTab === 'responses' && (
            <div>
              <div className={styles.sectionHead}>
                <div>
                  <div className={styles.sectionTitle}>Respuestas recogidas</div>
                  <div className={styles.sectionDesc}>Datos acumulados de todos los participantes en todas las fases.</div>
                </div>
                <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
                  onClick={() => navigate(`/experiments/${id}/analytics`)}>
                  <IcoDownload />
                  Ver analytics completo
                </button>
              </div>

              {completedEnrollments === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><IcoWave /></div>
                  <div className={styles.emptyTitle}>Sin respuestas todavia</div>
                  <div className={styles.emptyDesc}>
                    Las respuestas apareceran aqui cuando los participantes completen las fases del estudio.
                  </div>
                </div>
              ) : (
                <div className={styles.responsesTop}>
                  {[
                    { val: completedEnrollments * totalQuestions, label: 'Respuestas totales' },
                    { val: `${Math.round((completedEnrollments / Math.max(enrollments.length,1)) * 100)}%`, label: 'Tasa de completado', cyan: true },
                    { val: `${activeEnrollments}/${enrollments.length}`, label: 'Participantes activos' },
                    { val: phases[0]?.name || '—', label: 'Fase actual' },
                  ].map(s => (
                    <div key={s.label} className={styles.rStatCard}>
                      <div className={`${styles.rStatVal} ${s.cyan ? styles.rStatCyan : ''}`}>{s.val}</div>
                      <div className={styles.rStatLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
        {/* / Tab content */}
      </div>

      {/* ─── Modals ─── */}
      <PhaseModal
        open={phaseModal.open}
        initial={phaseModal.initial}
        onClose={() => setPhaseModal({ open: false, initial: null })}
        onSave={savePhase}
      />
      <GroupModal
        open={groupModal.open}
        initial={groupModal.initial}
        onClose={() => setGroupModal({ open: false, initial: null })}
        onSave={saveGroup}
      />
      <QuestionModal
        open={questionModal.open}
        initial={questionModal.initial}
        phases={phases}
        defaultPhaseId={activePhaseQ}
        onClose={() => setQuestionModal({ open: false, initial: null })}
        onSave={saveQuestion}
      />
      <InviteLinkModal
        open={inviteModal}
        experimentId={id}
        onClose={() => setInviteModal(false)}
      />
      <ConfirmModal
        {...confirmModal}
        onCancel={() => setConfirmModal(c => ({ ...c, open: false }))}
      />
    </>
  )
}
