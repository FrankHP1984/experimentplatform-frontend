import { useState, useEffect, useRef } from 'react'
import ParticleCanvas from '../../components/layout/ParticleCanvas'
import { useAuth } from '../../hooks/useAuth'
import styles from './Landing.module.css'

// ─── Scroll fade-in hook ──────────────────────────────────────
function useFadeIn() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add(styles.visible) },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

// ─── Auth Modal ───────────────────────────────────────────────
function AuthModal({ isOpen, initialTab, onClose }) {
  const [tab, setTab]                 = useState(initialTab)
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [institution, setInstitution] = useState('')
  const { login, register, loading, error, clearError } = useAuth()

  useEffect(() => { setTab(initialTab) }, [initialTab])
  useEffect(() => { if (!isOpen) { clearError(); setEmail(''); setPassword(''); setName(''); setInstitution('') } }, [isOpen])

  if (!isOpen) return null

  const handleOverlay = (e) => { if (e.target === e.currentTarget) onClose() }

  const handleSignup = async (e) => {
    e.preventDefault()
    await register({ email, password, name })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    await login({ email, password })
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>
              {tab === 'signup' ? 'Unete a Empiria' : 'Bienvenido de nuevo'}
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>&#x00D7;</button>
        </div>
        <p className={styles.modalSubtitle}>
          {tab === 'signup'
            ? 'Crea tu cuenta de investigador de forma gratuita.'
            : 'Accede a tu panel de investigacion.'}
        </p>

        <div className={styles.modalTabs}>
          <button
            className={`${styles.modalTab} ${tab === 'signup' ? styles.modalTabActive : ''}`}
            onClick={() => setTab('signup')}
          >Registrarse</button>
          <button
            className={`${styles.modalTab} ${tab === 'login' ? styles.modalTabActive : ''}`}
            onClick={() => setTab('login')}
          >Iniciar sesion</button>
        </div>

        {error && <div className={styles.formError}>{error}</div>}

        {tab === 'signup' ? (
          <form onSubmit={handleSignup}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre completo</label>
              <input className={styles.formInput} type="text" placeholder="Dr. Nombre Apellido" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email institucional</label>
              <input className={styles.formInput} type="email" placeholder="nombre@universidad.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Contrasena</label>
              <input className={styles.formInput} type="password" placeholder="Minimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Institucion / Universidad</label>
              <input className={styles.formInput} type="text" placeholder="Universidad de..." value={institution} onChange={(e) => setInstitution(e.target.value)} />
            </div>
            <button className={styles.btnFilled} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratuita →'}
            </button>
            <p className={styles.formLegal}>
              Al registrarte aceptas nuestros <span className={styles.linkViolet}>Terminos de uso</span> y <span className={styles.linkViolet}>Politica de privacidad</span>.
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input className={styles.formInput} type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Contrasena</label>
              <input className={styles.formInput} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className={styles.forgotRow}>
              <span className={styles.linkViolet}>¿Olvidaste tu contrasena?</span>
            </div>
            <button className={styles.btnFilled} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Landing Page ─────────────────────────────────────────────
export default function Landing() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab]   = useState('signup')

  const openModal = (tab) => { setModalTab(tab); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const heroLeftRef  = useFadeIn()
  const heroRightRef = useFadeIn()
  const statsRef     = useFadeIn()
  const featuresRef  = useFadeIn()
  const howRef       = useFadeIn()
  const whyRef       = useFadeIn()
  const plansRef     = useFadeIn()
  const aboutRef     = useFadeIn()
  const contactRef   = useFadeIn()

  return (
    <div className={styles.page}>
      <ParticleCanvas count={70} />

      {/* ─── NAV ─── */}
      <nav className={styles.nav}>
        <a href="#" className={styles.navLogo}>
          <div className={styles.navLogoIcon}>⬡</div>
          <span className={styles.navLogoText}>Empiri<span>a</span></span>
        </a>
        <ul className={styles.navLinks}>
          <li><button onClick={() => scrollTo('que-hacemos')}>Que hacemos</button></li>
          <li><button onClick={() => scrollTo('como-funciona')}>Como funciona</button></li>
          <li><button onClick={() => scrollTo('planes')}>Planes</button></li>
          <li><button onClick={() => scrollTo('sobre-nosotros')}>Nosotros</button></li>
          <li><button onClick={() => scrollTo('contacto')}>Contacto</button></li>
        </ul>
        <div className={styles.navActions}>
          <button className={styles.btnGhost} onClick={() => openModal('login')}>Acceder</button>
          <button className={styles.btnPrimary} onClick={() => openModal('signup')}>Registrarse gratis</button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroInner}>
          <div className={`${styles.fadeIn}`} ref={heroLeftRef}>
            <div className={styles.heroTag}>
              <span className={styles.heroTagDot} />
              Plataforma de investigacion
            </div>
            <h1 className={styles.heroTitle}>
              Disena estudios.<br />
              Recoge datos.<br />
              <span className={styles.heroHighlight}>Haz ciencia.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Empiria es la plataforma que permite a investigadores disenar experimentos estructurados,
              gestionar participantes y recoger datos de forma rigurosa — sin friccion tecnica.
            </p>
            <div className={styles.heroCtas}>
              <button className={`${styles.btnLg} ${styles.btnViolet}`} onClick={() => openModal('signup')}>
                Empieza gratis →
              </button>
              <button className={`${styles.btnLg} ${styles.btnOutline}`} onClick={() => scrollTo('como-funciona')}>
                Ver como funciona
              </button>
            </div>
            <p className={styles.heroNote}>
              <span>Sin tarjeta de credito.</span> Gratis para el plan investigador individual.
            </p>
          </div>

          <div className={`${styles.fadeIn} ${styles.heroVisual}`} ref={heroRightRef} style={{ transitionDelay: '0.15s' }}>
            <div className={styles.heroCard}>
              <div className={styles.heroCardHeader}>
                <span className={styles.heroCardTitle}>Panel del investigador</span>
                <span className={styles.heroCardBadge}>En directo</span>
              </div>
              <div className={styles.heroMetricRow}>
                <div className={styles.heroMetric}>
                  <div className={styles.heroMetricValue}>24</div>
                  <div className={styles.heroMetricLabel}>Participantes activos</div>
                </div>
                <div className={styles.heroMetric}>
                  <div className={`${styles.heroMetricValue} ${styles.valueCyan}`}>73%</div>
                  <div className={styles.heroMetricLabel}>Tasa de completado</div>
                </div>
              </div>
              <div className={styles.heroChart}>
                <div className={styles.heroChartLabel}>Respuestas por fase</div>
                <div className={styles.heroBars}>
                  {[55, 72, 45, 90].map((h, i) => (
                    <div key={`v${i}`} className={`${styles.heroBar} ${styles.heroBarViolet}`} style={{ height: `${h}%` }} />
                  ))}
                  {[65, 80].map((h, i) => (
                    <div key={`c${i}`} className={`${styles.heroBar} ${styles.heroBarCyan}`} style={{ height: `${h}%` }} />
                  ))}
                  {[30, 20].map((h, i) => (
                    <div key={`d${i}`} className={styles.heroBar} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className={styles.heroParticipants}>
                <div className={styles.heroAvatars}>
                  {[['AG', '#6C4DE6'], ['CM', '#00D4AA'], ['LS', '#4A8BF5'], ['+', '#8B6FF0']].map(([initials, bg]) => (
                    <div key={initials} className={styles.heroAvatar} style={{ background: bg }}>{initials}</div>
                  ))}
                </div>
                <span className={styles.heroAvatarText}>21 participantes respondieron hoy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className={styles.statsSection} id="stats">
        <div className={styles.container}>
          <div className={`${styles.fadeIn} ${styles.statsGrid}`} ref={statsRef}>
            {[
              { pre: '+', num: '340', post: '',  label: 'Experimentos creados' },
              { pre: '',  num: '12k', post: '+', label: 'Respuestas recogidas' },
              { pre: '+', num: '180', post: '',  label: 'Investigadores registrados' },
              { pre: '',  num: '99',  post: '%', label: 'Disponibilidad del servicio' },
            ].map(({ pre, num, post, label }) => (
              <div key={label} className={styles.statItem}>
                <div className={styles.statValue}>{pre}<span>{num}</span>{post}</div>
                <div className={styles.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUE HACEMOS ─── */}
      <section className={styles.section} id="que-hacemos">
        <div className={styles.container}>
          <div className={`${styles.fadeIn}`} ref={featuresRef}>
            <div className={styles.sectionTag}>⬡ Que hacemos</div>
            <h2 className={styles.sectionTitle}>Una plataforma completa<br />para la investigacion moderna</h2>
            <p className={styles.sectionSubtitle}>Desde el diseno del protocolo hasta la exportacion de datos, Empiria gestiona cada etapa de tu estudio.</p>
          </div>
          <div className={styles.featuresGrid}>
            {[
              { color: 'violet', label: 'I',   title: 'Diseno experimental estructurado', desc: 'Define el tipo de diseno — pretest-postest, entre sujetos o longitudinal — y estructura las fases y grupos de tu estudio con precision metodologica.' },
              { color: 'cyan',   label: 'II',  title: 'Cuestionarios dinamicos',           desc: 'Crea formularios con preguntas de texto, escala, opcion multiple, numericas o booleanas. Cada fase puede tener su propio conjunto de preguntas.' },
              { color: 'mixed',  label: 'III', title: 'Gestion de participantes',          desc: 'Invita participantes mediante enlace unico. Asignalos a grupos de forma manual o automatica y monitoriza su progreso en tiempo real.' },
              { color: 'violet', label: 'IV',  title: 'Recogida de datos rigurosa',        desc: 'Valida el tipo de cada respuesta automaticamente. Los datos se almacenan con trazabilidad completa: participante, fase, fecha y grupo.' },
              { color: 'cyan',   label: 'V',   title: 'Exportacion a CSV',                 desc: 'Descarga todos los datos de tu experimento en formato CSV, listo para importar en SPSS, R, Python o cualquier herramienta de analisis.' },
              { color: 'mixed',  label: 'VI',  title: 'Seguridad y control de acceso',     desc: 'Autenticacion robusta con control de roles. Solo el investigador propietario puede acceder a los datos de su experimento.' },
            ].map(({ color, label, title, desc }) => (
              <div key={title} className={styles.featureCard}>
                <div className={`${styles.featureIcon} ${styles[`fi_${color}`]}`}>{label}</div>
                <div className={styles.featureTitle}>{title}</div>
                <div className={styles.featureDesc}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section className={styles.sectionGradient} id="como-funciona">
        <div className={styles.container}>
          <div className={`${styles.fadeIn}`} ref={howRef}>
            <div className={styles.sectionTag}>⬡ Como funciona</div>
            <h2 className={styles.sectionTitle}>De la hipotesis<br />a los datos en minutos</h2>
          </div>
          <div className={styles.howInner}>
            <div className={styles.steps}>
              {[
                { n: '1', title: 'Crea tu experimento',                  desc: 'Define el titulo, tipo de diseno y fechas. El experimento empieza en borrador — puedes configurarlo antes de activarlo.' },
                { n: '2', title: 'Configura fases, grupos y preguntas',  desc: 'Estructura tu protocolo: crea fases temporales, define grupos de participantes y disena los cuestionarios de cada fase.' },
                { n: '3', title: 'Invita a los participantes',            desc: 'Genera un enlace unico de invitacion. Los participantes rellenan sus datos y quedan inscritos al estudio directamente.' },
                { n: '4', title: 'Recoge y exporta los datos',            desc: 'Monitoriza las respuestas en tiempo real. Cuando el estudio termina, exporta todo a CSV y analiza con tus herramientas habituales.' },
              ].map(({ n, title, desc }, i, arr) => (
                <div key={n}>
                  <div className={styles.step}>
                    <div className={styles.stepNum}>{n}</div>
                    <div>
                      <div className={styles.stepTitle}>{title}</div>
                      <div className={styles.stepDesc}>{desc}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div className={styles.stepConnector} />}
                </div>
              ))}
            </div>
            <div className={styles.flowVisual}>
              <div className={styles.flowScreen}>
                <div className={styles.flowScreenLabel}>Experimento activo</div>
                <div className={styles.flowRow}>
                  <div className={`${styles.flowPill} ${styles.flowPillV}`} style={{ width: '60%' }} />
                  <span className={styles.flowTagActive}>ACTIVO</span>
                </div>
              </div>
              <div className={styles.flowArrow}>↕</div>
              <div className={styles.flowScreen}>
                <div className={styles.flowScreenLabel}>Fases del estudio</div>
                <div className={styles.flowTags}>
                  <span className={styles.flowTagActive}>Pretest</span>
                  <span className={styles.flowTagActive}>Intervencion</span>
                  <span className={styles.flowTagDraft}>Postest</span>
                </div>
              </div>
              <div className={styles.flowArrow}>↕</div>
              <div className={styles.flowScreen}>
                <div className={styles.flowScreenLabel}>Participantes</div>
                <div className={styles.flowParticipantsRow}>
                  <div className={styles.heroAvatars}>
                    {[['AG', '#6C4DE6'], ['CM', '#00D4AA'], ['LS', '#4A8BF5']].map(([init, bg]) => (
                      <div key={init} className={`${styles.heroAvatar} ${styles.heroAvatarSm}`} style={{ background: bg }}>{init}</div>
                    ))}
                  </div>
                  <span className={styles.flowParticipantsText}>24 participantes · 73% completado</span>
                </div>
                <div className={styles.flowProgressTrack}>
                  <div className={styles.flowProgressFill} style={{ width: '73%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── POR QUE ─── */}
      <section className={styles.section} id="por-que">
        <div className={styles.container}>
          <div className={`${styles.fadeIn}`} ref={whyRef}>
            <div className={styles.sectionTag}>⬡ Por que Empiria</div>
            <h2 className={styles.sectionTitle}>Construida por y para<br />investigadores</h2>
            <p className={styles.sectionSubtitle}>No es una herramienta de encuestas generica. Empiria esta disenada entendiendo la logica del metodo cientifico.</p>
          </div>
          <div className={styles.reasonsGrid}>
            {[
              { sym: '◎', title: 'Diseno metodologico real',                desc: 'Soporta los principales disenos experimentales usados en ciencias del comportamiento, educacion y salud.' },
              { sym: '◈', title: 'Sin friccion para los participantes',      desc: 'Los participantes acceden mediante un enlace, sin necesidad de crear una cuenta previa. La experiencia es fluida y clara.' },
              { sym: '◇', title: 'Formularios configurables por experimento', desc: 'El investigador define que datos recoger en cada fase. Los cuestionarios se adaptan al diseno del estudio, no al reves.' },
              { sym: '▷', title: 'Datos listos para analizar',               desc: 'Exportacion a CSV estructurado compatible con SPSS, R, Python y Excel desde el primer clic.' },
            ].map(({ sym, title, desc }) => (
              <div key={title} className={styles.reasonCard}>
                <div className={styles.reasonIcon}>{sym}</div>
                <div>
                  <div className={styles.reasonTitle}>{title}</div>
                  <div className={styles.reasonDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLANES ─── */}
      <section className={styles.sectionVioletTint} id="planes">
        <div className={styles.container}>
          <div className={`${styles.fadeIn} ${styles.textCenter}`} ref={plansRef}>
            <div className={`${styles.sectionTag} ${styles.tagCenter}`}>⬡ Planes</div>
            <h2 className={styles.sectionTitle}>Empieza gratis.<br />Crece cuando lo necesites.</h2>
            <p className={`${styles.sectionSubtitle} ${styles.subtitleCenter}`}>Sin compromisos. El plan gratuito incluye todo lo esencial para comenzar tu investigacion hoy.</p>
          </div>
          <div className={styles.plansGrid}>
            <div className={styles.planCard}>
              <div className={styles.planName}>Starter</div>
              <div className={styles.planPrice}>0€ <span>/ mes</span></div>
              <div className={styles.planDesc}>Todo lo que necesitas para comenzar a investigar sin coste.</div>
              <div className={styles.planDivider} />
              <ul className={styles.planFeatures}>
                {['Hasta 3 experimentos activos', 'Hasta 50 participantes por experimento', 'Todos los tipos de pregunta', 'Exportacion a CSV', 'Invitaciones por enlace'].map(f => <li key={f}>{f}</li>)}
                {['Analisis estadistico basico', 'Colaboracion en equipo', 'Soporte prioritario'].map(f => <li key={f} className={styles.planFeatDisabled}>{f}</li>)}
              </ul>
              <button className={`${styles.btnPlan} ${styles.btnPlanOutline}`} onClick={() => openModal('signup')}>Empezar gratis</button>
            </div>

            <div className={`${styles.planCard} ${styles.planCardFeatured}`}>
              <div className={styles.planBadge}>Proximamente</div>
              <div className={styles.planName}>Researcher</div>
              <div className={styles.planPrice}>19€ <span>/ mes</span></div>
              <div className={styles.planDesc}>Para investigadores activos con estudios mas grandes y complejos.</div>
              <div className={styles.planDivider} />
              <ul className={styles.planFeatures}>
                {['Experimentos ilimitados', 'Participantes ilimitados', 'Todos los tipos de pregunta', 'Exportacion a CSV', 'Invitaciones por enlace y email', 'Analisis estadistico basico'].map(f => <li key={f}>{f}</li>)}
                {['Colaboracion en equipo', 'Soporte prioritario'].map(f => <li key={f} className={styles.planFeatDisabled}>{f}</li>)}
              </ul>
              <button className={`${styles.btnPlan} ${styles.btnPlanGhost}`} disabled>Disponible pronto</button>
            </div>

            <div className={styles.planCard}>
              <div className={styles.planName}>Institution</div>
              <div className={styles.planPrice}>A medida</div>
              <div className={styles.planDesc}>Para universidades, centros de investigacion y equipos multidisciplinares.</div>
              <div className={styles.planDivider} />
              <ul className={styles.planFeatures}>
                {['Todo del plan Researcher', 'Multiples investigadores', 'Roles y permisos por equipo', 'Exportacion avanzada', 'Analisis estadistico completo', 'Integracion con sistemas externos', 'Soporte dedicado', 'SLA garantizado'].map(f => <li key={f}>{f}</li>)}
              </ul>
              <button className={`${styles.btnPlan} ${styles.btnPlanOutline}`} onClick={() => scrollTo('contacto')}>Contactar</button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOBRE NOSOTROS ─── */}
      <section className={styles.section} id="sobre-nosotros">
        <div className={styles.container}>
          <div className={styles.aboutInner}>
            <div className={`${styles.fadeIn} ${styles.aboutText}`} ref={aboutRef}>
              <div className={styles.sectionTag}>⬡ Sobre nosotros</div>
              <h2 className={styles.sectionTitle}>Nacidos de la<br />frustracion investigadora</h2>
              <p className={styles.aboutPara}>Empiria nacio de la experiencia directa con las limitaciones de las herramientas existentes: formularios genericos que no entienden de fases, grupos o disenos experimentales; hojas de calculo que no escalan; y sistemas corporativos pensados para empresas, no para ciencia.</p>
              <p className={styles.aboutPara}>Creemos que la investigacion merece herramientas a su altura — precisas, elegantes y accesibles para cualquier investigador, independientemente de su institucion o recursos.</p>
              <div className={styles.aboutValues}>
                {['Rigor metodologico ante todo', 'Simplicidad sin sacrificar profundidad', 'Datos del investigador, siempre del investigador', 'Construida en abierto, pensada para escalar'].map(v => (
                  <div key={v} className={styles.aboutValue}>{v}</div>
                ))}
              </div>
            </div>
            <div className={`${styles.fadeIn} ${styles.aboutStats}`} style={{ transitionDelay: '0.2s' }}>
              {[
                { val: '2',   sup: '+', label: 'Anos de desarrollo' },
                { val: '180', sup: '+', label: 'Investigadores beta' },
                { val: '5',   sup: '+', label: 'Universidades piloto' },
                { val: '0',   sup: '',  label: 'Datos vendidos a terceros' },
              ].map(({ val, sup, label }) => (
                <div key={label} className={styles.aboutStatCard}>
                  <div className={styles.aboutStatValue}>{val}<span>{sup}</span></div>
                  <div className={styles.aboutStatLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACTO ─── */}
      <section className={styles.sectionContactTint} id="contacto">
        <div className={styles.container}>
          <div className={styles.contactInner}>
            <div className={`${styles.fadeIn} ${styles.contactInfo}`} ref={contactRef}>
              <div className={styles.sectionTag}>⬡ Contacto</div>
              <h2 className={styles.sectionTitle}>¿Hablamos?</h2>
              <p className={styles.contactInfoPara}>Si tienes preguntas sobre la plataforma, quieres un plan institucional o simplemente quieres compartir tu caso de uso, estamos aqui.</p>
              {[
                { icon: '@', text: 'hola@empiria.io' },
                { icon: '#', text: 'Disponible para instituciones academicas en toda Espana y Latinoamerica' },
                { icon: '~', text: 'Respondemos en menos de 24h en dias laborables' },
              ].map(({ icon, text }) => (
                <div key={text} className={styles.contactDetail}>
                  <div className={styles.contactDetailIcon}>{icon}</div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className={`${styles.fadeIn}`} style={{ transitionDelay: '0.2s' }}>
              <div className={styles.contactForm}>
                <div className={styles.formGroup}><label className={styles.formLabel}>Nombre</label><input className={styles.formInput} type="text" placeholder="Tu nombre completo" /></div>
                <div className={styles.formGroup}><label className={styles.formLabel}>Email institucional</label><input className={styles.formInput} type="email" placeholder="nombre@universidad.edu" /></div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sobre que nos escribes</label>
                  <select className={styles.formInput}>
                    <option value="">Selecciona un tema...</option>
                    <option>Plan institucional</option>
                    <option>Soporte tecnico</option>
                    <option>Propuesta de colaboracion</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className={styles.formGroup}><label className={styles.formLabel}>Mensaje</label><textarea className={`${styles.formInput} ${styles.textarea}`} placeholder="Cuentanos tu caso de uso o pregunta..." /></div>
                <button className={styles.btnFilled}>Enviar mensaje</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.navLogo}>
                <div className={styles.navLogoIcon}>⬡</div>
                <span className={styles.navLogoText}>Empiri<span>a</span></span>
              </div>
              <p>La plataforma de diseno y gestion de experimentos con participantes. Hecha para investigadores que se toman en serio su metodologia.</p>
            </div>
            {[
              { h: 'Plataforma', links: ['Que hacemos', 'Como funciona', 'Planes', 'Changelog'] },
              { h: 'Empresa',    links: ['Sobre nosotros', 'Blog', 'Prensa', 'Contacto'] },
              { h: 'Legal',      links: ['Privacidad', 'Terminos de uso', 'Cookies', 'RGPD'] },
            ].map(({ h, links }) => (
              <div key={h} className={styles.footerCol}>
                <h4>{h}</h4>
                <ul>{links.map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className={styles.footerBottom}>
            <p>© 2026 Empiria. Todos los derechos reservados.</p>
            <p>Hecho con precision por <a href="#">el equipo de Empiria</a></p>
          </div>
        </div>
      </footer>

      {/* ─── AUTH MODAL ─── */}
      <AuthModal isOpen={modalOpen} initialTab={modalTab} onClose={closeModal} />
    </div>
  )
}
