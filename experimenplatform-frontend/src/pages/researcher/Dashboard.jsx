import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useExperiments } from '../../hooks/useExperiments'
import styles from './Dashboard.module.css'

/* ─── SVG icons ─── */
const IconExperiments = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
  </svg>
)
const IconParticipants = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconResponses = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)
const IconDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IconUserPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
)
const IconBarChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

/* ─── Helpers ─── */
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

const STATUS_LABEL = {
  DRAFT:    'Borrador',
  ACTIVE:   'Activo',
  PAUSED:   'Pausado',
  FINISHED: 'Finalizado',
}
const STATUS_CLASS = {
  DRAFT:    'draft',
  ACTIVE:   'active',
  PAUSED:   'paused',
  FINISHED: 'finished',
}

/* ─── Onboarding steps computed from experiments data ─── */
function computeOnboardingSteps(experiments) {
  const hasExp  = experiments.length > 0
  const hasPhase = experiments.some(e => e.phaseCount > 0)
  const hasQ    = experiments.some(e => e.questionCount > 0)
  const hasPart = experiments.some(e => e.participantCount > 0)

  const steps = [
    { key: 'account', label: 'Cuenta creada',        done: true,    active: false },
    { key: 'exp',     label: 'Experimento creado',   done: hasExp,  active: !hasExp },
    { key: 'phases',  label: 'Añadir fases',         done: hasPhase, active: hasExp && !hasPhase },
    { key: 'qs',      label: 'Crear preguntas',      done: hasQ,    active: hasPhase && !hasQ },
    { key: 'parts',   label: 'Invitar participantes',done: hasPart, active: hasQ && !hasPart },
  ]
  const done = steps.filter(s => s.done).length
  const pct  = Math.round((done / steps.length) * 100)
  return { steps, pct }
}

/* ─── New Experiment Modal ─── */
function NewExperimentModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '',
    design: 'PRETEST_POSTEST',
    startDate: '',
    endDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title.trim()) { setError('El titulo es obligatorio'); return }
    setLoading(true)
    try {
      await onCreate({
        title: form.title.trim(),
        design: form.design,
        startDate: form.startDate || undefined,
        endDate:   form.endDate   || undefined,
      })
      setForm({ title: '', design: 'PRETEST_POSTEST', startDate: '', endDate: '' })
      onClose()
    } catch (err) {
      setError(err.message || 'Error al crear el experimento')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Nuevo experimento</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">
            <IconX />
          </button>
        </div>
        <p className={styles.modalSub}>
          Crea un nuevo experimento y empieza a configurarlo paso a paso.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Titulo del experimento</label>
            <input
              className={styles.formInput}
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ej. Efecto del ejercicio en la atencion sostenida"
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tipo de diseno</label>
            <select
              className={styles.formInput}
              name="design"
              value={form.design}
              onChange={handleChange}
            >
              <option value="PRETEST_POSTEST">Pretest-Postest</option>
              <option value="BETWEEN_SUBJECTS">Entre grupos</option>
              <option value="WITHIN_SUBJECTS">Intra sujeto</option>
              <option value="LONGITUDINAL">Longitudinal</option>
              <option value="CROSS_SECTIONAL">Transversal</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha de inicio</label>
              <input
                className={styles.formInput}
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha de fin</label>
              <input
                className={styles.formInput}
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <p className={styles.formError}>{error}</p>}

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={`${styles.btnModal} ${styles.btnGhost}`}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.btnModal} ${styles.btnPrimary}`}
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear experimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Main Dashboard component ─── */
export default function Dashboard() {
  const { user }                        = useAuthStore()
  const { experiments, loading, create } = useExperiments()
  const navigate                        = useNavigate()
  const [showModal, setShowModal]       = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const firstName   = user?.name?.split(' ')[0] || 'Investigador'
  const greeting    = getGreeting()

  const totalExp    = experiments.length
  const totalParts  = experiments.reduce((sum, e) => sum + (e.participantCount || 0), 0)
  const totalResp   = experiments.reduce((sum, e) => sum + (e.responseCount   || 0), 0)
  const capacity    = Math.max(0, (user?.experimentLimit || 3) - totalExp)

  const draftExps   = experiments.filter(e => e.status === 'DRAFT')
  const activeDraft = draftExps[0]

  const { steps: onboardingSteps, pct: onboardingPct } = computeOnboardingSteps(experiments)
  const onboardingDone = onboardingPct === 100

  const handleCreate = async (data) => {
    await create(data)
  }

  return (
    <>
      {/* Topbar */}
      <div className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>Dashboard</span>
        </div>
        <div className={styles.topbarActions}>
          <button
            className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
            onClick={() => setShowModal(true)}
          >
            <IconPlus />
            Nuevo experimento
          </button>
          {activeDraft && (
            <button
              className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
              onClick={() => navigate(`/experiments/${activeDraft.id}`)}
            >
              <IconChevronRight />
              Continuar borrador
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className={styles.content}>

        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>{greeting}, {firstName}</h1>
            <p className={styles.pageSubtitle}>Esto es lo que tienes pendiente hoy</p>
          </div>
        </div>

        {/* Onboarding banner */}
        {!onboardingDone && !bannerDismissed && (
          <div className={styles.banner}>
            <div className={styles.bannerLeft}>
              <div className={styles.bannerTitle}>
                <div className={styles.bannerDot} />
                Completa la configuracion de tu primer experimento
              </div>
              <div className={styles.bannerSteps}>
                {onboardingSteps.map((step, i) => (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      className={`${styles.bannerStep} ${
                        step.done   ? styles.bannerStepDone   :
                        step.active ? styles.bannerStepActive :
                        styles.bannerStepPending
                      }`}
                    >
                      {step.done && <IconCheck />}
                      {step.label}
                    </div>
                    {i < onboardingSteps.length - 1 && (
                      <span className={styles.bannerArr}><IconChevronRight /></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.bannerProgress}>
              <div className={styles.bannerPct}>{onboardingPct}%</div>
              <div className={styles.bannerPctLabel}>completado</div>
              <div className={styles.bannerBar}>
                <div className={styles.bannerBarFill} style={{ width: `${onboardingPct}%` }} />
              </div>
            </div>

            <button
              className={styles.bannerDismiss}
              onClick={() => setBannerDismissed(true)}
              aria-label="Cerrar"
            >
              <IconX />
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statCardTop}>
              <span className={styles.statLabel}>Experimentos</span>
              <div className={`${styles.statIcon} ${styles.statIconViolet}`}>
                <IconExperiments />
              </div>
            </div>
            <div className={styles.statValue}>{totalExp}</div>
            <div className={styles.statDelta}>
              {draftExps.length > 0 ? `${draftExps.length} en borrador` : 'Sin borradores activos'}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCardTop}>
              <span className={styles.statLabel}>Participantes</span>
              <div className={`${styles.statIcon} ${styles.statIconCyan}`}>
                <IconParticipants />
              </div>
            </div>
            <div className={styles.statValue}>{totalParts}</div>
            <div className={styles.statDelta}>
              {totalParts === 0 ? 'Completa el borrador para añadir participantes' : 'participantes activos'}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCardTop}>
              <span className={styles.statLabel}>Respuestas recogidas</span>
              <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                <IconResponses />
              </div>
            </div>
            <div className={styles.statValue}>{totalResp}</div>
            <div className={styles.statDelta}>
              {totalResp === 0 ? 'Disponibles al activar el estudio' : 'respuestas totales'}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCardTop}>
              <span className={styles.statLabel}>Capacidad restante</span>
              <div className={`${styles.statIcon} ${styles.statIconGray}`}>
                <IconShield />
              </div>
            </div>
            <div className={`${styles.statValue} ${styles.statValueCyan}`}>{capacity}</div>
            <div className={styles.statDelta}>
              Experimentos disponibles en {user?.plan || 'Starter'}
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className={styles.twoCol}>

          {/* Experiments card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Mis experimentos</span>
              <button
                className={styles.cardAction}
                onClick={() => navigate('/experiments')}
              >
                Ver todos
              </button>
            </div>

            {loading ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyDesc}>Cargando...</p>
              </div>
            ) : experiments.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><IconPlus /></div>
                <div className={styles.emptyTitle}>Crea tu primer experimento</div>
                <div className={styles.emptyDesc}>
                  Todavia no tienes ningun experimento. Empieza creando uno ahora.
                </div>
                <button
                  className={`${styles.btnSm} ${styles.btnSmPrimary}`}
                  onClick={() => setShowModal(true)}
                >
                  <IconPlus />
                  Nuevo experimento
                </button>
              </div>
            ) : (
              <>
                {experiments.slice(0, 5).map(exp => (
                  <div
                    key={exp.id}
                    className={styles.expItem}
                    onClick={() => navigate(`/experiments/${exp.id}`)}
                  >
                    <div
                      className={styles.expColor}
                      style={{
                        background: exp.status === 'ACTIVE' ? 'var(--cyan)' : 'var(--violet)',
                      }}
                    />
                    <div className={styles.expInfo}>
                      <div className={styles.expTitle}>{exp.title}</div>
                      <div className={styles.expMeta}>
                        <span>{exp.design || 'Sin diseno'}</span>
                        <span className={styles.expMetaSep}>·</span>
                        <span>{exp.phaseCount || 0} fases</span>
                        <span className={styles.expMetaSep}>·</span>
                        <span>{exp.participantCount || 0} participantes</span>
                      </div>
                    </div>
                    <div className={styles.expRight}>
                      <span className={`${styles.statusBadge} ${styles[STATUS_CLASS[exp.status] || 'draft']}`}>
                        {STATUS_LABEL[exp.status] || exp.status}
                      </span>
                      <div className={styles.expProgressBar}>
                        <div
                          className={styles.expProgressFill}
                          style={{ width: `${exp.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {experiments.length < (user?.experimentLimit || 3) && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><IconPlus /></div>
                    <div className={styles.emptyTitle}>Crea otro experimento</div>
                    <div className={styles.emptyDesc}>
                      Tienes {capacity} experimento{capacity !== 1 ? 's' : ''} disponible{capacity !== 1 ? 's' : ''} en tu plan actual.
                    </div>
                    <button
                      className={`${styles.btnSm} ${styles.btnSmPrimary}`}
                      onClick={() => setShowModal(true)}
                    >
                      <IconPlus />
                      Nuevo experimento
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right column */}
          <div className={styles.rightCol}>

            {/* Quick actions */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Acciones rapidas</span>
              </div>
              <div className={styles.quickActions}>
                <button
                  className={styles.quickAction}
                  onClick={() => activeDraft
                    ? navigate(`/experiments/${activeDraft.id}/phases`)
                    : setShowModal(true)
                  }
                >
                  <div className={`${styles.qaIcon} ${styles.qaIconViolet}`}>
                    <IconList />
                  </div>
                  <div className={styles.qaLabel}>Añadir fases</div>
                  <div className={styles.qaDesc}>Define las etapas del experimento</div>
                </button>

                <button
                  className={styles.quickAction}
                  onClick={() => activeDraft
                    ? navigate(`/experiments/${activeDraft.id}/questionnaire`)
                    : setShowModal(true)
                  }
                >
                  <div className={`${styles.qaIcon} ${styles.qaIconViolet}`}>
                    <IconDoc />
                  </div>
                  <div className={styles.qaLabel}>Crear preguntas</div>
                  <div className={styles.qaDesc}>Disena el cuestionario</div>
                </button>

                <button
                  className={styles.quickAction}
                  onClick={() => activeDraft
                    ? navigate(`/experiments/${activeDraft.id}/invite`)
                    : setShowModal(true)
                  }
                >
                  <div className={`${styles.qaIcon} ${styles.qaIconCyan}`}>
                    <IconUserPlus />
                  </div>
                  <div className={styles.qaLabel}>Invitar participantes</div>
                  <div className={styles.qaDesc}>Comparte el enlace de acceso</div>
                </button>

                <button
                  className={styles.quickAction}
                  onClick={() => navigate('/responses')}
                >
                  <div className={`${styles.qaIcon} ${styles.qaIconCyan}`}>
                    <IconBarChart />
                  </div>
                  <div className={styles.qaLabel}>Ver respuestas</div>
                  <div className={styles.qaDesc}>Analiza los datos recogidos</div>
                </button>
              </div>
            </div>

            {/* Recent activity */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Actividad reciente</span>
              </div>
              {experiments.length === 0 ? (
                <div className={styles.activityEmpty}>
                  No hay actividad reciente aun.
                </div>
              ) : (
                <div>
                  {experiments.slice(0, 3).map(exp => (
                    <div key={exp.id} className={styles.activityItem}>
                      <div
                        className={styles.activityDot}
                        style={{
                          background: exp.status === 'ACTIVE' ? 'var(--cyan)' : 'var(--violet)',
                        }}
                      />
                      <div className={styles.activityText}>
                        Experimento <strong>{exp.title}</strong> en estado{' '}
                        <strong>{STATUS_LABEL[exp.status] || exp.status}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* New experiment modal */}
      <NewExperimentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
      />
    </>
  )
}
