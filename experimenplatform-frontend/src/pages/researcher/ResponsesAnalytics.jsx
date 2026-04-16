import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as experimentsApi from '../../api/experiments'
import * as phasesApi      from '../../api/phases'
import * as groupsApi      from '../../api/groups'
import * as enrollmentsApi from '../../api/enrollments'
import * as questionsApi   from '../../api/questions'
import * as responsesApi   from '../../api/responses'
import styles from './ResponsesAnalytics.module.css'

/* ─── SVG helpers ─── */
const Ico = ({ children, size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: size, height: size, flexShrink: 0 }}>
    {children}
  </svg>
)
const IcoDown     = () => <Ico><polyline points="6 9 12 15 18 9"/></Ico>
const IcoDownload = () => <Ico><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Ico>
const IcoUp       = () => <Ico size={12}><polyline points="18 15 12 9 6 15"/></Ico>

/* ─── Helpers ─── */
function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?'
}
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}
function mean(arr) {
  const nums = arr.map(v => parseFloat(v)).filter(n => !isNaN(n))
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

/* ─── ComparisonChart ─── */
function ComparisonChart({ question, responses, enrollmentMap, groupMap, phases }) {
  const COLORS = ['#6C4DE6', '#00D4AA', '#60A5FA', '#F472B6']
  const groupList = Object.values(groupMap)
  const phaseForQ = phases.find(p => p.id === question.phase_id)
  if (!phaseForQ) return null

  const byGroup = {}
  groupList.forEach(g => {
    const gResps = responses.filter(r =>
      r.question_id === question.id &&
      enrollmentMap[r.enrollment_id]?.group_id === g.id
    )
    byGroup[g.id] = mean(gResps.map(r => r.value))
  })

  const allMeans = Object.values(byGroup).filter(v => v !== null)
  const maxMean  = allMeans.length ? Math.max(...allMeans, 1) : 10

  return (
    <div>
      <div className={styles.compHeader}>
        <span />
        {groupList.map((g, i) => (
          <span key={g.id} className={styles.compGroupLabel} style={{ color: g.color || COLORS[i] }}>
            {g.name}
          </span>
        ))}
      </div>
      <div className={styles.compRow}>
        <span className={styles.compLabel}>{phaseForQ.name}</span>
        {groupList.map((g, i) => {
          const val  = byGroup[g.id]
          const color = g.color || COLORS[i] || '#6C4DE6'
          const pct  = val !== null ? Math.min((val / maxMean) * 100, 100) : 0
          return (
            <div key={g.id} className={styles.compBarWrap}>
              <div className={styles.compBarTrack}>
                <div className={styles.compBarFill} style={{ width: `${pct}%`, background: `${color}bb` }} />
              </div>
              <span className={styles.compBarVal} style={{ color }}>
                {val !== null ? val.toFixed(1) : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── HistogramChart ─── */
function HistogramChart({ question, responses, enrollmentMap, groupMap }) {
  const COLORS = ['rgba(108,77,230,.6)', 'rgba(0,212,170,.6)']
  const groupList = Object.values(groupMap).slice(0, 2)
  const BUCKETS = 10

  const distributions = groupList.map(g =>
    Array.from({ length: BUCKETS }, (_, i) =>
      responses.filter(r =>
        r.question_id === question.id &&
        enrollmentMap[r.enrollment_id]?.group_id === g.id &&
        Math.round(parseFloat(r.value)) === i + 1
      ).length
    )
  )
  const maxCount = Math.max(...distributions.flat(), 1)

  return (
    <div>
      <div className={styles.histogram}>
        {Array.from({ length: BUCKETS }, (_, i) => (
          <div key={i} className={styles.histCol}>
            <div className={styles.histBarWrap}>
              {distributions.map((dist, gi) => {
                const h = dist[i] === 0 ? 2 : (dist[i] / maxCount) * 85
                return <div key={gi} className={styles.histBar} style={{ height: h, background: COLORS[gi] }} />
              })}
            </div>
            <span className={styles.histX}>{i + 1}</span>
          </div>
        ))}
      </div>
      <div className={styles.histXLabels}>
        <span>1 — Empeoró</span>
        <span>10 — Mejoró</span>
      </div>
    </div>
  )
}

/* ─── MultipleChoiceChart ─── */
function MultipleChoiceChart({ question, responses }) {
  const qResps = responses.filter(r => r.question_id === question.id)
  const counts = {}
  qResps.forEach(r => { counts[String(r.value)] = (counts[String(r.value)] || 0) + 1 })
  const total  = qResps.length || 1
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (!sorted.length) return <p className={styles.empty}>Sin respuestas aún</p>

  return (
    <div className={styles.barChart}>
      {sorted.map(([label, count]) => {
        const pct = Math.round((count / total) * 100)
        return (
          <div key={label} className={styles.barRow}>
            <span className={styles.barLabel} title={label}>{label}</span>
            <div className={styles.barTrack}>
              <div className={styles.barFillCyan} style={{ width: `${pct}%` }}>
                {pct > 8 && <span className={styles.barVal}>{count}</span>}
              </div>
            </div>
            <span className={styles.barValOut}>{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── BooleanChart ─── */
function BooleanDonut({ label, pct, count, total, color }) {
  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 36 36" width={96} height={96}>
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="3.2"/>
        <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3.2"
          strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"
          transform="rotate(-90 18 18)"/>
        <text x="18" y="19.5" textAnchor="middle" dominantBaseline="middle"
          fill="#E8EEF8" fontSize="7" fontWeight="700" fontFamily="Inter">
          {pct}%
        </text>
      </svg>
      <div className={styles.donutLabel} style={{ color }}>{label}</div>
      <div className={styles.donutSub}>{count} de {total}</div>
    </div>
  )
}

function BooleanChart({ question, responses, enrollmentMap, groupMap }) {
  const COLORS = ['#A78BF9', '#00D4AA', '#60A5FA', '#F472B6']
  const groupList = Object.values(groupMap)
  const qResps = responses.filter(r => r.question_id === question.id)
  if (!qResps.length) return <p className={styles.empty}>Sin respuestas aún</p>

  return (
    <div className={styles.donutRow}>
      {groupList.map((g, i) => {
        const gResps   = qResps.filter(r => enrollmentMap[r.enrollment_id]?.group_id === g.id)
        const yesCount = gResps.filter(r => ['true','1',1,true].includes(r.value)).length
        const pct      = gResps.length ? Math.round((yesCount / gResps.length) * 100) : 0
        return (
          <BooleanDonut key={g.id} label={g.name}
            pct={pct} count={yesCount} total={gResps.length}
            color={g.color || COLORS[i] || '#A78BF9'} />
        )
      })}
    </div>
  )
}

/* ─── TimelineChart ─── */
function TimelineChart({ responses, enrollmentMap, groupMap, phases }) {
  const COLORS = ['rgba(108,77,230,.8)', 'rgba(0,212,170,.8)']
  const FILLS  = ['url(#grad-v)', 'url(#grad-c)']
  const groupList = Object.values(groupMap).slice(0, 2)

  const sorted = [...responses]
    .filter(r => r.answered_at)
    .sort((a, b) => a.answered_at.localeCompare(b.answered_at))

  if (!sorted.length) return <p className={styles.empty}>Sin datos de tiempo aún</p>

  const minDate = new Date(sorted[0].answered_at)
  const maxDate = new Date(sorted[sorted.length - 1].answered_at)
  const span    = Math.max((maxDate - minDate) / 1000 / 86400, 1)
  const W = 700, H = 110

  const cumulative = groupList.map(g => {
    let count = 0
    return sorted
      .filter(r => enrollmentMap[r.enrollment_id]?.group_id === g.id)
      .map(r => {
        count++
        const x = ((new Date(r.answered_at) - minDate) / 1000 / 86400 / span) * (W - 10) + 5
        return { x, count }
      })
  })
  const maxCount = Math.max(...cumulative.flat().map(p => p.count), 1)
  const toY = c => H - (c / maxCount) * (H - 10) - 5

  function buildPath(pts) {
    if (!pts.length) return ''
    return pts.reduce((p, pt, i) =>
      p + (i === 0 ? `M ${pt.x},${toY(pt.count)}` : ` L ${pt.x},${toY(pt.count)}`), '')
  }
  function buildArea(pts) {
    if (!pts.length) return ''
    const line = buildPath(pts)
    return `${line} L ${pts[pts.length - 1].x},${H} L ${pts[0].x},${H} Z`
  }

  const phaseSeps = phases.map(ph => {
    if (!ph.start_date) return null
    const d = new Date(ph.start_date)
    if (d <= minDate || d >= maxDate) return null
    const x = ((d - minDate) / 1000 / 86400 / span) * (W - 10) + 5
    return { x, name: ph.name }
  }).filter(Boolean)

  return (
    <div>
      <div className={styles.timelineChart}>
        <svg className={styles.timelineSvg} viewBox={`0 0 ${W} ${H + 10}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad-v" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(108,77,230,.3)"/>
              <stop offset="100%" stopColor="rgba(108,77,230,.02)"/>
            </linearGradient>
            <linearGradient id="grad-c" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,212,170,.25)"/>
              <stop offset="100%" stopColor="rgba(0,212,170,.02)"/>
            </linearGradient>
          </defs>
          {[H, H * 0.75, H * 0.5, H * 0.25].map((y, i) => (
            <line key={i} x1="0" y1={y} x2={W} y2={y}
              stroke={i === 0 ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.04)'} strokeWidth="1"/>
          ))}
          {phaseSeps.map((sep, i) => (
            <g key={i}>
              <line x1={sep.x} y1="0" x2={sep.x} y2={H}
                stroke="rgba(108,77,230,.2)" strokeWidth="1" strokeDasharray="4,3"/>
              <text x={sep.x} y="10" fill="rgba(255,255,255,.25)" fontSize="8" fontFamily="Inter" textAnchor="middle">
                {sep.name}
              </text>
            </g>
          ))}
          {cumulative.map((pts, gi) => (
            <path key={`a${gi}`} d={buildArea(pts)} fill={FILLS[gi] || 'url(#grad-v)'} />
          ))}
          {cumulative.map((pts, gi) => (
            <path key={`l${gi}`} d={buildPath(pts)} fill="none"
              stroke={COLORS[gi] || COLORS[0]} strokeWidth="2" strokeLinecap="round"/>
          ))}
        </svg>
      </div>
      <div className={styles.timelineXAxis}>
        <span>{fmtDate(sorted[0].answered_at)}</span>
        <span>{fmtDate(sorted[sorted.length - 1].answered_at)}</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function ResponsesAnalytics() {
  const { id } = useParams()

  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [experiment, setExperiment]   = useState(null)
  const [phases, setPhases]           = useState([])
  const [groups, setGroups]           = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [responses, setResponses]     = useState([])
  const [questionMap, setQuestionMap] = useState({})
  const [filterPhase, setFilterPhase]   = useState('all')
  const [filterGroup, setFilterGroup]   = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [exportMsg, setExportMsg]       = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [exp, phasesData, groupsData, enrollData, respData] = await Promise.all([
          experimentsApi.getExperiment(id),
          phasesApi.getPhases(id),
          groupsApi.getGroups(id),
          enrollmentsApi.getEnrollments(id),
          responsesApi.getExperimentResponses(id),
        ])
        setExperiment(exp)
        setPhases(phasesData)
        setGroups(groupsData)
        setEnrollments(enrollData)
        setResponses(respData)

        const allQ = {}
        await Promise.all(phasesData.map(async phase => {
          const qs = await questionsApi.getQuestions(phase.id)
          qs.forEach(q => { allQ[q.id] = { ...q, phase_id: phase.id, phase_name: phase.name } })
        }))
        setQuestionMap(allQ)
      } catch {
        setError('No se pudo cargar el análisis')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const enrollmentMap = useMemo(() => {
    const m = {}; enrollments.forEach(e => { m[e.id] = e }); return m
  }, [enrollments])

  const groupMap = useMemo(() => {
    const m = {}; groups.forEach(g => { m[g.id] = g }); return m
  }, [groups])

  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      const enroll = enrollmentMap[r.enrollment_id]
      if (!enroll) return false
      if (filterGroup  !== 'all' && enroll.group_id !== filterGroup) return false
      if (filterStatus !== 'all' && enroll.status   !== filterStatus) return false
      if (filterPhase  !== 'all') {
        const q = questionMap[r.question_id]
        if (!q || q.phase_id !== filterPhase) return false
      }
      return true
    })
  }, [responses, enrollmentMap, questionMap, filterPhase, filterGroup, filterStatus])

  const stats = useMemo(() => {
    const active   = enrollments.filter(e => ['ACTIVE','COMPLETED'].includes(e.status)).length
    const total    = responses.length
    const totalQ   = Object.values(questionMap).length
    const expected = enrollments.length * totalQ
    const rate     = expected > 0 ? Math.round((total / expected) * 100) : 0
    const pending  = Math.max(0, expected - total)
    return { active, total, rate, pending }
  }, [enrollments, responses, questionMap])

  const scaleQs    = useMemo(() => Object.values(questionMap).filter(q => ['SCALE','NUMBER'].includes(q.type)), [questionMap])
  const booleanQs  = useMemo(() => Object.values(questionMap).filter(q => q.type === 'BOOLEAN'), [questionMap])
  const multipleQs = useMemo(() => Object.values(questionMap).filter(q => q.type === 'MULTIPLE_CHOICE'), [questionMap])
  const textQs     = useMemo(() => Object.values(questionMap).filter(q => q.type === 'TEXT'), [questionMap])

  const textResponses = useMemo(() => {
    const textQIds = new Set(textQs.map(q => q.id))
    return filteredResponses
      .filter(r => textQIds.has(r.question_id) && r.value)
      .map(r => {
        const enroll = enrollmentMap[r.enrollment_id] || {}
        const group  = groupMap[enroll.group_id] || {}
        const name   = enroll.participant_name || enroll.user?.name || enroll.user?.email || '—'
        return { ...r, participantName: name, groupName: group.name || '—', groupColor: group.color }
      })
  }, [filteredResponses, textQs, enrollmentMap, groupMap])

  const participantProgress = useMemo(() => {
    const allQs = Object.values(questionMap)
    return enrollments.map(e => {
      const group  = groupMap[e.group_id] || {}
      const name   = e.participant_name || e.user?.name || e.user?.email || `#${String(e.id).slice(-4)}`
      const doneQ  = responses.filter(r => r.enrollment_id === e.id).length
      const totalQ = allQs.length
      const pct    = totalQ > 0 ? Math.round((doneQ / totalQ) * 100) : 0

      const phaseStatus = {}
      phases.forEach(ph => {
        const phQ    = allQs.filter(q => q.phase_id === ph.id)
        const phDone = responses.filter(r =>
          r.enrollment_id === e.id && phQ.some(q => q.id === r.question_id)
        ).length
        phaseStatus[ph.id] = phQ.length === 0 ? 'pending'
          : phDone === 0 ? 'pending'
          : phDone >= phQ.length ? 'done'
          : 'partial'
      })
      return { enrollment: e, name, group, phaseStatus, pct }
    })
  }, [enrollments, responses, questionMap, phases, groupMap])

  function exportCSV() {
    const rows = [
      ['Participante', 'Grupo', 'Pregunta', 'Fase', 'Tipo', 'Respuesta', 'Fecha'],
      ...responses.map(r => {
        const enroll = enrollmentMap[r.enrollment_id] || {}
        const group  = groupMap[enroll.group_id] || {}
        const q      = questionMap[r.question_id] || {}
        const name   = enroll.participant_name || enroll.user?.email || r.enrollment_id
        return [name, group.name || '', q.text || r.question_id, q.phase_name || '', q.type || '', r.value, r.answered_at || '']
      })
    ]
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `respuestas-${id}.csv`; a.click()
    URL.revokeObjectURL(url)
    setExportMsg('CSV exportado correctamente')
    setTimeout(() => setExportMsg(''), 2500)
  }

  if (loading) return <div className={styles.loading}>Cargando análisis…</div>
  if (error)   return <div className={styles.loading}>{error}</div>

  const totalQuestions = Object.values(questionMap).length

  return (
    <div className={styles.page}>

      {/* TOPBAR */}
      <div className={styles.topbar}>
        <nav className={styles.breadcrumb}>
          <Link to="/dashboard" className={styles.breadcrumbLink}>Dashboard</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link to={`/experiments/${id}`} className={styles.breadcrumbLink}>
            {experiment?.title || 'Experimento'}
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Análisis de respuestas</span>
        </nav>
        <div className={styles.topbarActions}>
          <button className={styles.btnGhost}><IcoDown /> Exportar JSON</button>
          <button className={styles.btnCyan} onClick={exportCSV}><IcoDownload /> Exportar CSV</button>
        </div>
      </div>

      {exportMsg && (
        <div className={styles.toast}>
          <span className={styles.toastDot} />{exportMsg}
        </div>
      )}

      <div className={styles.content}>

        {/* FILTER BAR */}
        <div className={styles.filterBar}>
          <span className={styles.filterLabel}>Filtrar por:</span>
          <select className={styles.filterSelect} value={filterPhase} onChange={e => setFilterPhase(e.target.value)}>
            <option value="all">Todas las fases</option>
            {phases.map(ph => <option key={ph.id} value={ph.id}>{ph.name}</option>)}
          </select>
          <select className={styles.filterSelect} value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
            <option value="all">Todos los grupos</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Todos los participantes</option>
            <option value="ACTIVE">Solo activos</option>
            <option value="COMPLETED">Completados</option>
          </select>
          <div className={styles.filterSep} />
          <div className={styles.filterTag}>
            Comparativa entre grupos
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <div className={styles.statVal}>{stats.active}</div>
            <div className={styles.statLabel}>Participantes activos</div>
            <div className={`${styles.statDelta} ${styles.deltaUp}`}><IcoUp /> {enrollments.length} inscritos en total</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.valCyan}`}>{stats.total}</div>
            <div className={styles.statLabel}>Respuestas totales</div>
            <div className={`${styles.statDelta} ${styles.deltaUp}`}><IcoUp /> {filteredResponses.length} en el filtro actual</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.valViolet}`}>{stats.rate}%</div>
            <div className={styles.statLabel}>Tasa de completación</div>
            <div className={`${styles.statDelta} ${styles.deltaSame}`}>{totalQuestions} preguntas · {enrollments.length} participantes</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.valWarn}`}>{stats.pending}</div>
            <div className={styles.statLabel}>Respuestas pendientes</div>
            <div className={`${styles.statDelta} ${styles.deltaSame}`}>Estimado según fases activas</div>
          </div>
        </div>

        {/* CHARTS */}
        {totalQuestions === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={36} height={36}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div className={styles.emptyTitle}>Sin preguntas configuradas</div>
            <div className={styles.emptyDesc}>Define preguntas en las fases del experimento para ver el análisis aquí.</div>
            <Link to={`/experiments/${id}`} className={styles.emptyLink}>Ir al experimento →</Link>
          </div>
        ) : (
          <div className={styles.analysisGrid}>

            {/* SCALE / NUMBER — comparison */}
            {scaleQs.map(q => (
              <div key={q.id} className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <div className={styles.chartTitle}>{q.text}</div>
                    <div className={styles.chartSub}>{q.type === 'SCALE' ? 'Escala 1-10' : 'Numérica'} · Media por grupo · {q.phase_name}</div>
                  </div>
                  <div className={styles.chartLegend}>
                    {groups.slice(0, 3).map((g, i) => (
                      <div key={g.id} className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ background: g.color || ['#6C4DE6','#00D4AA','#60A5FA'][i] }} />
                        {g.name}
                      </div>
                    ))}
                  </div>
                </div>
                <ComparisonChart question={q} responses={filteredResponses}
                  enrollmentMap={enrollmentMap} groupMap={groupMap} phases={phases} />
              </div>
            ))}

            {/* SCALE — histogram (first 2 only) */}
            {scaleQs.filter(q => q.type === 'SCALE').slice(0, 2).map(q => (
              <div key={`hist-${q.id}`} className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <div className={styles.chartTitle}>{q.text} — Distribución</div>
                    <div className={styles.chartSub}>Escala 1-10 · Todas las respuestas · {q.phase_name}</div>
                  </div>
                  <div className={styles.chartLegend}>
                    {groups.slice(0, 2).map((g, i) => (
                      <div key={g.id} className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ background: g.color || ['rgba(108,77,230,.6)','rgba(0,212,170,.6)'][i] }} />
                        {g.name}
                      </div>
                    ))}
                  </div>
                </div>
                <HistogramChart question={q} responses={filteredResponses}
                  enrollmentMap={enrollmentMap} groupMap={groupMap} />
              </div>
            ))}

            {/* BOOLEAN */}
            {booleanQs.map(q => (
              <div key={q.id} className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <div className={styles.chartTitle}>{q.text}</div>
                    <div className={styles.chartSub}>Booleano · % que responde "Sí" por grupo</div>
                  </div>
                </div>
                <BooleanChart question={q} responses={filteredResponses}
                  enrollmentMap={enrollmentMap} groupMap={groupMap} />
              </div>
            ))}

            {/* MULTIPLE CHOICE */}
            {multipleQs.map(q => (
              <div key={q.id} className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <div className={styles.chartTitle}>{q.text}</div>
                    <div className={styles.chartSub}>Opción múltiple · {q.phase_name} · n={filteredResponses.filter(r => r.question_id === q.id).length}</div>
                  </div>
                </div>
                <MultipleChoiceChart question={q} responses={filteredResponses}
                  enrollmentMap={enrollmentMap} groupMap={groupMap} />
              </div>
            ))}

            {/* TIMELINE — full width */}
            {responses.length > 0 && (
              <div className={`${styles.chartCard} ${styles.full}`}>
                <div className={styles.chartHeader}>
                  <div>
                    <div className={styles.chartTitle}>Progresión de respuestas en el tiempo</div>
                    <div className={styles.chartSub}>Acumulado de respuestas registradas por día</div>
                  </div>
                  <div className={styles.chartLegend}>
                    {groups.slice(0, 2).map((g, i) => (
                      <div key={g.id} className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ background: g.color || ['#6C4DE6','#00D4AA'][i] }} />
                        {g.name}
                      </div>
                    ))}
                  </div>
                </div>
                <TimelineChart responses={filteredResponses}
                  enrollmentMap={enrollmentMap} groupMap={groupMap} phases={phases} />
              </div>
            )}

            {/* TEXT RESPONSES */}
            {textQs.length > 0 && (
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <div className={styles.chartTitle}>Comentarios cualitativos</div>
                    <div className={styles.chartSub}>Texto libre · {textResponses.length} respuestas</div>
                  </div>
                  <span className={styles.chartSubRight}>{textResponses.length} / {enrollments.length} respondieron</span>
                </div>
                {textResponses.length === 0 ? (
                  <p className={styles.empty}>Sin respuestas de texto aún</p>
                ) : (
                  <div className={styles.textResponseList}>
                    {textResponses.slice(0, 10).map((r, i) => (
                      <div key={r.id || i} className={styles.textResponseItem}>
                        <div className={styles.textRespMeta}>
                          <div className={styles.textRespAvatar}
                            style={{ background: `${r.groupColor || '#6C4DE6'}33`, color: r.groupColor || '#A78BF9' }}>
                            {initials(r.participantName)}
                          </div>
                          <span className={styles.textRespName}>{r.participantName}</span>
                          <span className={styles.textRespGroup}
                            style={{ background: `${r.groupColor || '#6C4DE6'}1a`, color: r.groupColor || '#A78BF9' }}>
                            {r.groupName}
                          </span>
                        </div>
                        <div className={styles.textRespBody}>"{r.value}"</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PARTICIPANT TABLE — full width */}
            <div className={`${styles.chartCard} ${styles.full}`}>
              <div className={styles.chartHeader}>
                <div>
                  <div className={styles.chartTitle}>Estado individual de participantes</div>
                  <div className={styles.chartSub}>Progreso por fases completadas</div>
                </div>
              </div>
              {participantProgress.length === 0 ? (
                <p className={styles.empty}>Sin participantes inscritos aún</p>
              ) : (
                <table className={styles.partTable}>
                  <thead>
                    <tr>
                      <th>Participante</th>
                      <th>Grupo</th>
                      {phases.map(ph => <th key={ph.id}>{ph.name}</th>)}
                      <th>Progreso</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantProgress.map(({ enrollment: e, name, group, phaseStatus, pct }) => (
                      <tr key={e.id}>
                        <td>{name}</td>
                        <td>
                          <span className={styles.groupDot} style={{ background: group.color || '#A78BF9' }} />
                          {group.name || '—'}
                        </td>
                        {phases.map(ph => {
                          const s = phaseStatus[ph.id] || 'pending'
                          return (
                            <td key={ph.id} className={
                              s === 'done'    ? styles.phaseDone :
                              s === 'partial' ? styles.phasePartial :
                              styles.phasePending}>
                              {s === 'done' ? 'Completada' : s === 'partial' ? 'En progreso' : 'Pendiente'}
                            </td>
                          )
                        })}
                        <td>
                          <div className={styles.progressBarSm}>
                            <div className={styles.pbFill} style={{
                              width: `${pct}%`,
                              background: pct === 100 ? 'var(--cyan)' : pct > 0 ? 'var(--violet)' : 'var(--muted)',
                              opacity: pct > 0 ? 1 : 0.4
                            }} />
                          </div>
                        </td>
                        <td>
                          <span className={
                            e.status === 'COMPLETED' ? styles.spComplete :
                            e.status === 'ACTIVE'    ? styles.spActive :
                            styles.spPending}>
                            {e.status === 'COMPLETED' ? 'Completo' :
                             e.status === 'ACTIVE'    ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
