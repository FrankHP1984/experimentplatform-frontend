import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import styles from './ParticipantDetail.module.css'

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const IconSettings = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32 2.12 2.12M2 12h3m14 0h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
  </svg>
)

const IconCancel = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

export default function ParticipantDetail() {
  const { id, participantId } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [openPhases, setOpenPhases] = useState({ 'phase-1': true, 'phase-2': true })
  const [reminderModal, setReminderModal] = useState(false)
  const [groupModal, setGroupModal] = useState(false)
  const [withdrawModal, setWithdrawModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState('exp')

  // Mock data - replace with API calls
  const participant = {
    id: participantId,
    name: 'Ana García López',
    initials: 'AG',
    email: 'ana.garcia@univ.es',
    status: 'ACTIVE',
    group: 'EXPERIMENTAL',
    enrolledDate: '28 de marzo de 2026',
    lastActivity: 'hace 2 días',
    phasesCompleted: 2,
    totalPhases: 3,
    totalResponses: 12,
    progress: 67,
    birthDate: '14 de mayo de 1993',
    gender: 'Femenino',
    practicesSport: true,
    activityLevel: 'Moderado (3-5 días/semana)',
    medicalConditions: null,
    rgpdConsent: true
  }

  const phases = [
    {
      id: 'phase-1',
      number: 1,
      name: 'Fase 1 — Pre-test',
      status: 'done',
      completedDate: '1 de abril',
      responseCount: 6,
      responses: [
        { id: 1, question: '¿Cuántas horas de ejercicio aeróbico realizas habitualmente por semana?', type: 'number', value: 3.5, unit: 'horas' },
        { id: 2, question: 'Valoración del estado de ánimo general (escala 1-10)', type: 'scale', value: 7, label: '7 de 10 — Bueno' },
        { id: 3, question: '¿Has tenido dificultades para conciliar el sueño en los últimos 7 días?', type: 'boolean', value: false },
        { id: 4, question: 'Nivel de motivación para continuar en el programa', type: 'multiple', value: 'Muy motivado/a, estoy disfrutando del proceso' },
        { id: 5, question: 'Efecto percibido del ejercicio en la capacidad de concentración (1-10)', type: 'scale', value: 8, label: '8 de 10 — Muy positivo' },
        { id: 6, question: 'Observaciones adicionales (opcional)', type: 'text', value: 'Llevo unos meses con una rutina bastante regular, principalmente running matutino y algo de yoga. Me encuentro bien en general y con ganas de participar en el estudio.' }
      ]
    },
    {
      id: 'phase-2',
      number: 2,
      name: 'Fase 2 — Post-test',
      status: 'done',
      completedDate: '9 de abril',
      responseCount: 6,
      responses: [
        { id: 1, question: '¿Cuántas horas de ejercicio aeróbico has realizado esta semana?', type: 'number', value: 5.0, unit: 'horas' },
        { id: 2, question: 'Valoración del estado de ánimo general (escala 1-10)', type: 'scale', value: 9, label: '9 de 10 — Excelente', highlight: true },
        { id: 3, question: '¿Has tenido dificultades para conciliar el sueño en los últimos 7 días?', type: 'boolean', value: false },
        { id: 4, question: 'Nivel de motivación para continuar en el programa', type: 'multiple', value: 'Muy motivado/a, estoy disfrutando del proceso' },
        { id: 5, question: 'Efecto percibido del ejercicio en la capacidad de concentración (1-10)', type: 'scale', value: 9, label: '9 de 10 — Muy positivo', highlight: true },
        { id: 6, question: 'Observaciones adicionales (opcional)', type: 'text', value: 'Ha sido un mes muy positivo. He notado mejoras claras en la concentración y en el sueño, y me siento más enérgica en general. El programa me ha ayudado a ser más constante.' }
      ]
    },
    {
      id: 'phase-3',
      number: 3,
      name: 'Fase 3 — Seguimiento final',
      status: 'pending',
      availableDate: '28 de abril de 2026',
      responseCount: 0
    }
  ]

  const activities = [
    { id: 1, text: 'Completó el Post-test (Fase 2)', time: 'Hace 2 días', type: 'cyan' },
    { id: 2, text: 'Inicio del cuestionario Post-test', time: 'Hace 2 días', type: 'violet' },
    { id: 3, text: 'Accedió a la plataforma', time: 'Hace 5 días', type: 'muted' },
    { id: 4, text: 'Completó el Pre-test (Fase 1)', time: 'Hace 10 días', type: 'cyan' },
    { id: 5, text: 'Inscripción confirmada en el estudio', time: 'Hace 14 días', type: 'violet' }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setLoading(false), 500)
  }, [participantId])

  const togglePhase = (phaseId) => {
    setOpenPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }))
  }

  const getInitials = (name) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  const renderResponse = (response) => {
    switch (response.type) {
      case 'number':
        return (
          <div className={`${styles.responseAnswer} ${styles.numberAnswer}`}>
            {response.value} <span className={styles.answerUnit}>{response.unit}</span>
          </div>
        )
      
      case 'scale':
        const filled = Array.from({ length: response.value }, (_, i) => i)
        const empty = Array.from({ length: 10 - response.value }, (_, i) => i)
        return (
          <div className={styles.responseAnswer}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: response.highlight ? 'var(--cyan)' : 'var(--violet)' }}>
                {response.value}
              </span>
              <div>
                <div className={styles.scaleVisual}>
                  {filled.map(i => (
                    <div key={`f${i}`} className={`${styles.scalePip} ${styles.filled}`} />
                  ))}
                  <div className={`${styles.scalePip} ${styles.selected}`} style={response.highlight ? { background: 'var(--cyan)', boxShadow: '0 0 8px rgba(0,212,170,.5)' } : {}} />
                  {empty.map(i => (
                    <div key={`e${i}`} className={styles.scalePip} />
                  ))}
                </div>
                <div className={styles.scaleValLabel}>{response.label}</div>
              </div>
            </div>
          </div>
        )
      
      case 'boolean':
        return (
          <div className={styles.responseAnswer}>
            <span className={`${styles.boolAnswer} ${response.value ? styles.boolYesAns : styles.boolNoAns}`}>
              {response.value ? <IconCheck /> : <IconX />}
              {response.value ? 'Sí' : 'No'}
            </span>
          </div>
        )
      
      case 'multiple':
        return (
          <div className={styles.responseAnswer}>
            <div className={styles.mcAnswer}>
              <IconCheck className={styles.mcCheck} />
              {response.value}
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div className={styles.responseAnswer}>
            <div className={styles.textAnswer}>"{response.value}"</div>
          </div>
        )
      
      default:
        return <div className={styles.responseAnswer}>{response.value}</div>
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text)' }}>Cargando...</div>
  }

  return (
    <div className={styles.container}>
      <Sidebar />
      
      <div className={styles.mainArea}>
        {/* TOPBAR */}
        <div className={styles.topbar}>
          <div className={styles.breadcrumb}>
            <Link to="/dashboard">Dashboard</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <Link to={`/experiments/${id}`}>Efecto del ejercicio físico</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <Link to={`/experiments/${id}`}>Participantes</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>{participant.name}</span>
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.btnGhost} onClick={() => setGroupModal(true)}>
              <IconSettings />
              Cambiar grupo
            </button>
            <button className={styles.btnGhost} onClick={() => setReminderModal(true)}>
              <IconMail />
              Enviar recordatorio
            </button>
            <button className={styles.btnDangerGhost} onClick={() => setWithdrawModal(true)}>
              <IconCancel />
              Dar de baja
            </button>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className={styles.pageContent}>
          
          {/* PARTICIPANT HEADER */}
          <div className={styles.participantHeader}>
            <div className={styles.partAvatar}>{participant.initials}</div>
            <div className={styles.partMain}>
              <div className={styles.partName}>{participant.name}</div>
              <div className={styles.partMeta}>
                <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                  <span className={`${styles.statusDot} ${styles.pulse}`} />
                  Activa
                </span>
                <span className={`${styles.groupBadge} ${styles.groupExp}`}>
                  Grupo Experimental
                </span>
                <div className={styles.partMetaItem}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>Inscrita el <strong>{participant.enrolledDate}</strong></span>
                </div>
                <div className={styles.partMetaItem}>
                  <IconClock />
                  Última actividad <strong>{participant.lastActivity}</strong>
                </div>
                <div className={styles.partMetaItem}>
                  <IconMail />
                  <strong>{participant.email}</strong>
                </div>
              </div>
            </div>
            <div className={styles.partStatsStrip}>
              <div className={styles.partStat}>
                <span className={styles.partStatVal} style={{ color: 'var(--cyan)' }}>
                  {participant.phasesCompleted}/{participant.totalPhases}
                </span>
                <div className={styles.partStatLabel}>Fases completadas</div>
              </div>
              <div className={styles.partStat}>
                <span className={styles.partStatVal}>{participant.totalResponses}</span>
                <div className={styles.partStatLabel}>Respuestas totales</div>
              </div>
              <div className={styles.partStat}>
                <span className={styles.partStatVal} style={{ color: 'var(--violet)' }}>
                  {participant.progress}%
                </span>
                <div className={styles.partStatLabel}>Progreso</div>
              </div>
            </div>
          </div>

          {/* RESPONSES COLUMN */}
          <div className={styles.responsesColumn}>
            {phases.map(phase => (
              <div
                key={phase.id}
                className={`${styles.phaseBlock} ${openPhases[phase.id] ? 'open' : ''}`}
              >
                <div className={styles.phaseBlockHeader} onClick={() => togglePhase(phase.id)}>
                  <div className={`${styles.phaseNumberCircle} ${
                    phase.status === 'done' ? styles.phaseDone :
                    phase.status === 'active' ? styles.phaseActive :
                    styles.phasePending
                  }`}>
                    {phase.status === 'done' ? <IconCheck /> : phase.number}
                  </div>
                  <div className={styles.phaseBlockInfo}>
                    <div className={styles.phaseBlockName}>{phase.name}</div>
                    <div className={styles.phaseBlockMeta}>
                      {phase.status === 'done'
                        ? `Completada el ${phase.completedDate} · ${phase.responseCount} respuestas`
                        : `Disponible a partir del ${phase.availableDate}`
                      }
                    </div>
                  </div>
                  <span className={`${styles.phaseStatusTag} ${
                    phase.status === 'done' ? styles.tagDone :
                    phase.status === 'active' ? styles.tagActive :
                    styles.tagPending
                  }`}>
                    {phase.status === 'done' ? 'Completada' :
                     phase.status === 'active' ? 'Activa' : 'Pendiente'}
                  </span>
                  <IconChevron className={styles.phaseChevron} />
                </div>
                
                <div className={styles.phaseBody}>
                  <div className={styles.phaseBodyInner}>
                    {phase.status === 'pending' ? (
                      <div className={styles.noResponse}>
                        <IconClock />
                        Esta fase aún no está disponible. Se habilitará el {phase.availableDate}.
                      </div>
                    ) : (
                      phase.responses?.map((response, idx) => (
                        <div key={response.id} className={styles.responseRow}>
                          <div className={styles.responseQ}>
                            <div className={styles.rqNum}>{idx + 1}</div>
                            {response.question}
                          </div>
                          {renderResponse(response)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* INFO COLUMN */}
          <div className={styles.infoColumn}>
            
            {/* Progress Card */}
            <div className={styles.infoCard}>
              <div className={styles.infoCardTitle}>Progreso general</div>
              <div className={styles.progressRingWrap}>
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <defs>
                    <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6C4DE6"/>
                      <stop offset="100%" stopColor="#00D4AA"/>
                    </linearGradient>
                  </defs>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="5"/>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="url(#ring-grad)" strokeWidth="5"
                    strokeLinecap="round" strokeDasharray="176" strokeDashoffset="59"
                    transform="rotate(-90 36 36)" style={{ transition: 'stroke-dashoffset .8s ease' }}/>
                  <text x="36" y="37" textAnchor="middle" dominantBaseline="middle"
                    fill="var(--text)" fontSize="16" fontWeight="700" fontFamily="Inter">
                    {participant.progress}%
                  </text>
                </svg>
                <div className={styles.ringInfo}>
                  <div className={styles.ringTitle}>{participant.phasesCompleted} de {participant.totalPhases} fases</div>
                  <div className={styles.ringSub}>{participant.totalResponses} respuestas registradas</div>
                </div>
              </div>
              
              <div className={styles.miniTimeline}>
                {phases.map(phase => (
                  <div key={phase.id} className={styles.mtItem}>
                    <div className={`${styles.mtDot} ${
                      phase.status === 'done' ? styles.mtDotDone :
                      phase.status === 'active' ? styles.mtDotActive :
                      styles.mtDotPending
                    }`}>
                      {phase.status === 'done' ? <IconCheck /> : phase.number}
                    </div>
                    <div className={styles.mtContent}>
                      <div className={styles.mtName} style={phase.status === 'pending' ? { color: 'var(--muted)' } : {}}>
                        {phase.name.replace(/^Fase \d+ — /, '')}
                      </div>
                      <div className={styles.mtDate}>
                        {phase.status === 'done' ? `Completada el ${phase.completedDate}` : `Disponible el ${phase.availableDate?.split(' de ')[0]} ${phase.availableDate?.split(' de ')[1]}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrollment Data */}
            <div className={styles.infoCard}>
              <div className={styles.infoCardTitle}>Datos de inscripción</div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Fecha de nacimiento</span>
                <span className={styles.infoVal}>{participant.birthDate}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Sexo</span>
                <span className={styles.infoVal}>{participant.gender}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Practica deporte</span>
                <span className={styles.infoVal} style={{ color: 'var(--cyan)' }}>
                  {participant.practicesSport ? 'Sí' : 'No'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Nivel de actividad</span>
                <span className={styles.infoVal}>{participant.activityLevel}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Condiciones médicas</span>
                <span className={styles.infoVal} style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                  {participant.medicalConditions || 'No indicadas'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Consentimiento RGPD</span>
                <span className={styles.infoVal} style={{ color: 'var(--cyan)' }}>
                  {participant.rgpdConsent ? 'Aceptado' : 'Pendiente'}
                </span>
              </div>
            </div>

            {/* Activity */}
            <div className={styles.infoCard}>
              <div className={styles.infoCardTitle}>Actividad reciente</div>
              <div className={styles.activityList}>
                {activities.map(activity => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={`${styles.actDot} ${styles[`act${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}`]}`} />
                    <div className={styles.actContent}>
                      <div className={styles.actText}>{activity.text}</div>
                      <div className={styles.actTime}>{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      {reminderModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setReminderModal(false)}>
          <div className={styles.modal}>
            <h2>Enviar recordatorio</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
              Se enviará un correo a {participant.name} sobre la próxima fase del estudio.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }}>Para</label>
              <input type="email" value={participant.email} readOnly style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', opacity: 0.6 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }}>Asunto</label>
              <input type="text" defaultValue="Recordatorio: Fase 3 del estudio disponible próximamente" style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }}>Mensaje personalizado (opcional)</label>
              <textarea placeholder="Escribe un mensaje adicional..." style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', minHeight: 80, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className={styles.btnGhost} onClick={() => setReminderModal(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={() => setReminderModal(false)}>Enviar recordatorio</button>
            </div>
          </div>
        </div>
      )}

      {groupModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setGroupModal(false)}>
          <div className={styles.modal}>
            <h2>Cambiar grupo</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
              Reasignar a {participant.name} a otro grupo de este experimento.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div
                onClick={() => setSelectedGroup('ctrl')}
                style={{
                  border: `2px solid ${selectedGroup === 'ctrl' ? '#A78BF9' : 'var(--border)'}`,
                  background: selectedGroup === 'ctrl' ? 'rgba(108,77,230,.1)' : 'transparent',
                  borderRadius: 10,
                  padding: 14,
                  cursor: 'pointer',
                  transition: 'all .2s'
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#A78BF9', marginBottom: 6 }} />
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>Control</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>4 participantes</div>
              </div>
              <div
                onClick={() => setSelectedGroup('exp')}
                style={{
                  border: `2px solid ${selectedGroup === 'exp' ? 'var(--cyan)' : 'var(--border)'}`,
                  background: selectedGroup === 'exp' ? 'rgba(0,212,170,.08)' : 'transparent',
                  borderRadius: 10,
                  padding: 14,
                  cursor: 'pointer',
                  transition: 'all .2s'
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--cyan)', marginBottom: 6 }} />
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>Experimental</div>
                <div style={{ fontSize: 12, color: 'var(--cyan)', marginTop: 2 }}>5 participantes · Actual</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
              Este cambio quedará registrado en el historial del participante.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className={styles.btnGhost} onClick={() => setGroupModal(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={() => setGroupModal(false)}>Confirmar cambio</button>
            </div>
          </div>
        </div>
      )}

      {withdrawModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setWithdrawModal(false)}>
          <div className={styles.modal}>
            <h2>Dar de baja al participante</h2>
            <div style={{ background: 'rgba(224,92,107,.07)', border: '1px solid rgba(224,92,107,.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--danger)', marginBottom: 5 }}>
                Esta acción no se puede deshacer
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                {participant.name} será retirada del estudio. Sus respuestas anteriores se conservarán pero no podrá completar las fases pendientes.
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }}>Motivo de baja (opcional)</label>
              <textarea placeholder="Ej: Retirada voluntaria, criterio de exclusión, pérdida de contacto..." style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', minHeight: 80, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className={styles.btnGhost} onClick={() => setWithdrawModal(false)}>Cancelar</button>
              <button
                onClick={() => setWithdrawModal(false)}
                style={{
                  background: 'var(--danger)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Confirmar baja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
