import {
  BarChart3,
  Database,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Search,
  Settings,
  ArrowLeft,
  ArrowRight,
  X,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Users,
  Target,
  Layers,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'
const PAGE_SIZE = 20
/* =========================================================
   APP
========================================================= */
function App() {
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem('cmih-active-page') || 'overview'
  })
  useEffect(() => {
    localStorage.setItem('cmih-active-page', activePage)
  }, [activePage])
  return (
    <>
      <style>{`
        html,
        body,
        #root,
        .app,
        .main,
        .content {
          background: #000000 !important;
        }
      `}</style>
      <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon" aria-label="ELEMENTAL logo">
            <svg
              width="22"
              height="22"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M16 3L27.5 9.5V22.5L16 29L4.5 22.5V9.5L16 3Z"
                stroke="currentColor"
                strokeWidth="2.4"
              />
              <path
                d="M10 11.5H22M10 16H19.5M10 20.5H22"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="brand-title">ELEMENTAL</div>
            <div className="brand-subtitle">INTELLIGENCE</div>
          </div>
        </div>
        <nav className="nav">
          <button
            className={`nav-item ${
              activePage === 'overview' ? 'active' : ''
            }`}
            onClick={() => setActivePage('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          <button
            className={`nav-item ${
              activePage === 'patents' ? 'active' : ''
            }`}
            onClick={() => setActivePage('patents')}
          >
            <FileText size={18} />
            <span>Patent Intelligence</span>
          </button>
          <button
            className={`nav-item ${
              activePage === 'projects' ? 'active' : ''
            }`}
            onClick={() => setActivePage('projects')}
          >
            <FlaskConical size={18} />
            <span>R&D Intelligence</span>
          </button>
          <button
            className={`nav-item ${
              activePage === 'analytics' ? 'active' : ''
            }`}
            onClick={() => setActivePage('analytics')}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">ELEMENTAL</div>
            <div className="topbar-subtitle">
              Critical Minerals Intelligence Platform
            </div>
          </div>
        </header>
        <div className="content">
          {activePage === 'overview' && <Overview />}
          {activePage === 'patents' && <PatentIntelligence />}
          {activePage === 'projects' && <RDIntelligence />}
          {activePage === 'analytics' && <Analytics />}
        </div>
      </main>
      </div>
    </>
  )
}
/* =========================================================
   OVERVIEW
========================================================= */
function Overview() {
  const [stats, setStats] = useState({
    patents: 0,
    projects: 0,
    minerals: 0,
    processes: 0,
    technologies: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOverview()
  }, [])

  async function loadOverview() {
    setLoading(true)

    const [
      patents,
      projects,
      minerals,
      processes,
      technologies,
      recentPatents,
      recentProjects,
    ] = await Promise.all([
      supabase
        .from('patents')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('minerals')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('processes')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('technologies')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('patents')
        .select('title, publication_date')
        .order('publication_date', {
          ascending: false,
          nullsFirst: false,
        })
        .limit(3),
      supabase
        .from('projects')
        .select('title, submission_date')
        .order('submission_date', {
          ascending: false,
          nullsFirst: false,
        })
        .limit(3),
    ])

    const nextStats = {
      patents: patents.count || 0,
      projects: projects.count || 0,
      minerals: minerals.count || 0,
      processes: processes.count || 0,
      technologies: technologies.count || 0,
    }

    setStats(nextStats)

    const patentActivity = (recentPatents.data || []).map((item) => ({
      type: 'Patent',
      title: item.title || 'Untitled patent',
      date: item.publication_date,
    }))

    const projectActivity = (recentProjects.data || []).map((item) => ({
      type: 'R&D',
      title: item.title || 'Untitled project',
      date: item.submission_date,
    }))

    setRecentActivity(
      [...patentActivity, ...projectActivity]
        .filter((item) => item.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    )

    setLoading(false)
  }

  const patentToProjectRatio =
    stats.projects > 0
      ? (stats.patents / stats.projects).toFixed(1)
      : '—'

  const researchCoverage =
    stats.patents > 0
      ? Math.round((stats.projects / stats.patents) * 100)
      : 0

  const intelligenceSignals = [
    {
      icon: <TrendingUp size={18} />,
      title: 'Patent activity',
      text: `${stats.patents.toLocaleString()} patents are currently tracked across the intelligence dataset.`,
    },
    {
      icon: <FlaskConical size={18} />,
      title: 'R&D activity',
      text: `${stats.projects.toLocaleString()} registered R&D projects provide the research activity layer.`,
    },
    {
      icon: <Layers size={18} />,
      title: 'Technology landscape',
      text: `${stats.technologies.toLocaleString()} technologies and ${stats.processes.toLocaleString()} processes are represented in the platform.`,
    },
  ]

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Overview</h1>
          <p>
            A concise view of what ELEMENTAL is, what it solves, and the
            intelligence available across critical minerals.
          </p>
        </div>
      </div>

      <section className="hero-panel">
        <div>
          <div className="eyebrow">ELEMENTAL</div>
          <h2>Critical Minerals Intelligence, in one place</h2>
          <p>
            <strong>What it is:</strong> ELEMENTAL is an intelligence platform
            that brings together patent activity, R&D projects, minerals,
            processes and technologies into one searchable analytical view.
          </p>
          <p>
            <strong>What it solves:</strong> It reduces fragmented research
            and makes it easier to identify activity, connections, emerging
            technologies and gaps across the critical-minerals landscape.
          </p>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard
          label="Patents"
          value={loading ? '—' : stats.patents}
          icon={<FileText size={20} />}
        />
        <StatCard
          label="R&D Projects"
          value={loading ? '—' : stats.projects}
          icon={<FlaskConical size={20} />}
        />
        <StatCard
          label="Minerals"
          value={loading ? '—' : stats.minerals}
          icon={<Database size={20} />}
        />
        <StatCard
          label="Processes"
          value={loading ? '—' : stats.processes}
          icon={<Settings size={20} />}
        />
        <StatCard
          label="Technologies"
          value={loading ? '—' : stats.technologies}
          icon={<BarChart3 size={20} />}
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Key Intelligence Signals</h3>
              <p>Current signals derived from the intelligence base</p>
            </div>
          </div>
          <div className="source-row">
            <div className="source-icon">
              <TrendingUp size={18} />
            </div>
            <div>
              <strong>{intelligenceSignals[0].title}</strong>
              <span>{intelligenceSignals[0].text}</span>
            </div>
          </div>
          <div className="source-row">
            <div className="source-icon">
              <FlaskConical size={18} />
            </div>
            <div>
              <strong>{intelligenceSignals[1].title}</strong>
              <span>{intelligenceSignals[1].text}</span>
            </div>
          </div>
          <div className="source-row">
            <div className="source-icon">
              <Layers size={18} />
            </div>
            <div>
              <strong>{intelligenceSignals[2].title}</strong>
              <span>{intelligenceSignals[2].text}</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Landscape Snapshot</h3>
              <p>Relationship between the core intelligence layers</p>
            </div>
          </div>
          <div className="status-row">
            <span className="status-dot"></span>
            <span>
              {patentToProjectRatio} patents tracked per R&D project
            </span>
          </div>
          <div className="status-row">
            <span className="status-dot"></span>
            <span>
              R&D activity represents {researchCoverage}% of patent volume
            </span>
          </div>
          <div className="status-row">
            <span className="status-dot"></span>
            <span>
              {stats.minerals} minerals span {stats.technologies}{' '}
              technologies and {stats.processes} processes
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Activity</h3>
              <p>Latest patent and R&D records entering the intelligence view</p>
            </div>
          </div>
          {recentActivity.length === 0 ? (
            <div className="empty-cell">No recent activity available.</div>
          ) : (
            recentActivity.map((item, index) => (
              <div className="source-row" key={`${item.type}-${item.date}-${index}`}>
                <div className="source-icon">
                  {item.type === 'Patent' ? (
                    <FileText size={18} />
                  ) : (
                    <FlaskConical size={18} />
                  )}
                </div>
                <div>
                  <strong>{item.type}</strong>
                  <span>{item.title}</span>
                </div>
                <div className="source-count">
                  {formatDate(item.date)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>What to Watch</h3>
              <p>Areas to examine in the detailed intelligence views</p>
            </div>
          </div>
          <div className="source-row">
            <div className="source-icon">
              <Target size={18} />
            </div>
            <div>
              <strong>Emerging technologies</strong>
              <span>
                Use Analytics to identify technologies showing sustained activity over time.
              </span>
            </div>
          </div>
          <div className="source-row">
            <div className="source-icon">
              <AlertTriangle size={18} />
            </div>
            <div>
              <strong>Patent–R&D gaps</strong>
              <span>
                Compare patent counts with R&D activity to identify areas where the two layers diverge.
              </span>
            </div>
          </div>
          <div className="source-row">
            <div className="source-icon">
              <Lightbulb size={18} />
            </div>
            <div>
              <strong>Process and technology links</strong>
              <span>
                Explore Analytics to see which processes connect with the technology landscape.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}
/* =========================================================
   PATENT INTELLIGENCE
========================================================= */
function PatentIntelligence() {
  const [patents, setPatents] = useState([])
  const [search, setSearch] = useState('')
  const [input, setInput] = useState('')
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPatent, setSelectedPatent] = useState(null)
  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE)
  )
  useEffect(() => {
    loadPatents(search, page)
  }, [search, page])
  async function loadPatents(searchTerm, pageNumber) {
    setLoading(true)
    setError('')
    const from = pageNumber * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    let query = supabase
      .from('patents')
      .select(
        `
        id,
        application_number,
        title,
        publication_number,
        publication_date,
        filing_date,
        field_of_invention,
        ipc,
        abstract,
        complete_specification,
        source
        `,
        { count: 'exact' }
      )
      .order('publication_date', {
        ascending: false,
        nullsFirst: false,
      })
      .range(from, to)
    if (searchTerm.trim()) {
      const term = searchTerm.trim()
      query = query.or(
        `title.ilike.%${term}%,application_number.ilike.%${term}%,publication_number.ilike.%${term}%`
      )
    }
    const {
      data,
      error: queryError,
      count,
    } = await query
    if (queryError) {
      setError(queryError.message)
      setPatents([])
      setTotalCount(0)
    } else {
      setPatents(data || [])
      setTotalCount(count || 0)
    }
    setLoading(false)
  }
  function handleSearch(event) {
    event.preventDefault()
    setPage(0)
    setSearch(input)
  }
  function clearSearch() {
    setInput('')
    setPage(0)
    setSearch('')
  }
  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="heading-row">
            <h1>Patent Intelligence</h1>
            <span className="count-badge">
              {totalCount.toLocaleString()} PATENTS
            </span>
          </div>
          <p>
            Explore patent activity across critical minerals,
            processes and technologies.
          </p>
        </div>
      </div>
      <form className="search-bar" onSubmit={handleSearch}>
        <Search size={19} />
        <input
          type="text"
          placeholder="Search title, application number or publication number..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        {input && (
          <button
            type="button"
            className="clear-search"
            onClick={clearSearch}
          >
            <X size={16} />
          </button>
        )}
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
      {error && <div className="error-box">{error}</div>}
      <div className="table-panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Title</th>
                <th>Publication</th>
                <th>Publication Date</th>
                <th>Filing Date</th>
                <th>IPC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    Loading...
                  </td>
                </tr>
              ) : patents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No patents found.
                  </td>
                </tr>
              ) : (
                patents.map((patent) => (
                  <tr
                    key={patent.id}
                    onClick={() => setSelectedPatent(patent)}
                    className="clickable-row"
                  >
                    <td>{patent.application_number || '—'}</td>
                    <td className="title-cell">
                      {patent.title || 'Untitled'}
                    </td>
                    <td>
                      {patent.publication_number || '—'}
                    </td>
                    <td>
                      {formatDate(patent.publication_date)}
                    </td>
                    <td>
                      {formatDate(patent.filing_date)}
                    </td>
                    <td>{patent.ipc || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
      {selectedPatent && (
        <PatentDetails
          patent={selectedPatent}
          onClose={() => setSelectedPatent(null)}
        />
      )}
    </div>
  )
}
/* =========================================================
   R&D INTELLIGENCE
========================================================= */
function RDIntelligence() {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [input, setInput] = useState('')
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE)
  )
  useEffect(() => {
    loadProjects(search, page)
  }, [search, page])
  async function loadProjects(searchTerm, pageNumber) {
    setLoading(true)
    setError('')
    const from = pageNumber * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .order('submission_date', {
        ascending: false,
        nullsFirst: false,
      })
      .range(from, to)
    if (searchTerm.trim()) {
      const term = searchTerm.trim()
      query = query.or(
        `project_number.ilike.%${term}%,title.ilike.%${term}%,pi_name.ilike.%${term}%,pi_institute.ilike.%${term}%`
      )
    }
    const {
      data,
      error: queryError,
      count,
    } = await query
    if (queryError) {
      setError(queryError.message)
      setProjects([])
      setTotalCount(0)
    } else {
      setProjects(data || [])
      setTotalCount(count || 0)
    }

    setLoading(false)
  }

  function handleSearch(event) {
    event.preventDefault()
    setPage(0)
    setSearch(input)
  }

  function clearSearch() {
    setInput('')
    setPage(0)
    setSearch('')
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="heading-row">
            <h1>R&D Intelligence</h1>

            <span className="count-badge">
              {totalCount.toLocaleString()} PROJECTS
            </span>
          </div>

          <p>
            Explore government-registered research projects across
            critical minerals and related technologies.
          </p>
        </div>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <Search size={19} />

        <input
          type="text"
          placeholder="Search project number, title, PI or institute..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />

        {input && (
          <button
            type="button"
            className="clear-search"
            onClick={clearSearch}
          >
            <X size={16} />
          </button>
        )}

        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error && <div className="error-box">{error}</div>}

      <div className="table-panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Number</th>
                <th>Title</th>
                <th>PI</th>
                <th>Institute</th>
                <th>Submission Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    Loading...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No projects found.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    key={project.project_number}
                    onClick={() => setSelectedProject(project)}
                    className="clickable-row"
                  >
                    <td>
                      {project.project_number || '—'}
                    </td>

                    <td className="title-cell">
                      {project.title || 'Untitled'}
                    </td>

                    <td>{project.pi_name || '—'}</td>

                    <td>
                      {project.pi_institute || '—'}
                    </td>

                    <td>
                      {formatDate(project.submission_date)}
                    </td>

                    <td>{project.status || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}

/* =========================================================
   SUPABASE BATCH FETCH
========================================================= */

async function fetchAllRows(
  queryFactory,
  batchSize = 1000
) {
  const allRows = []
  let start = 0

  while (true) {
    const query = queryFactory()

    const {
      data,
      error,
    } = await query.range(
      start,
      start + batchSize - 1
    )

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      break
    }

    allRows.push(...data)

    if (data.length < batchSize) {
      break
    }

    start += batchSize
  }

  return allRows
}

/* =========================================================
   ANALYTICS
========================================================= */

function Analytics() {
  const [selectedEmergingTechnology, setSelectedEmergingTechnology] =
    useState(null)
  const [selectedProcessPoint, setSelectedProcessPoint] =
    useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [patents, setPatents] = useState([])
  const [projects, setProjects] = useState([])

  const [patentMinerals, setPatentMinerals] = useState([])
  const [projectMinerals, setProjectMinerals] = useState([])

  const [patentTechnologies, setPatentTechnologies] =
    useState([])

  const [projectTechnologies, setProjectTechnologies] =
    useState([])

  const [patentProcesses, setPatentProcesses] =
    useState([])

  const [projectProcesses, setProjectProcesses] =
    useState([])

  const [projectApplications, setProjectApplications] =
    useState([])

  const [institutions, setInstitutions] = useState([])

  const mineralDonutRef = useRef(null)
  const [mineralDonutProgress, setMineralDonutProgress] =
    useState(1)

  useEffect(() => {
    loadAnalytics()
  }, [])

  useEffect(() => {
    const section = mineralDonutRef.current

    if (!section) return

    let frame = null

    const updateProgress = () => {
      if (frame !== null) return

      frame = window.requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect()
        const viewportHeight = window.innerHeight

        const start = viewportHeight * 0.9
        const end = viewportHeight * 0.25

        const progress = Math.max(
          0,
          Math.min(
            1,
            (start - rect.top) / (start - end)
          )
        )

        setMineralDonutProgress(progress)
        frame = null
      })
    }

    updateProgress()

    window.addEventListener('scroll', updateProgress, {
      passive: true,
    })
    window.addEventListener('resize', updateProgress)

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)

      if (frame !== null) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [])

  async function loadAnalytics() {
    setLoading(true)
    setError('')

    try {
      const [
        patentRows,
        projectRows,
        patentMineralRows,
        projectMineralRows,
        patentTechnologyRows,
        projectTechnologyRows,
        patentProcessRows,
        projectProcessRows,
        projectApplicationRows,
        institutionRows,
      ] = await Promise.all([
        fetchAllRows(() =>
          supabase
            .from('patents')
            .select(
              'id, publication_date, filing_date'
            )
            .order('id', {
              ascending: true,
            })
        ),

        fetchAllRows(() =>
          supabase
            .from('projects')
            .select(
              'project_number, title, submission_date, pi_institute'
            )
            .order('project_number', {
              ascending: true,
            })
        ),

        fetchAllRows(() =>
          supabase
            .from('patent_minerals')
            .select('patent_id, minerals(name)')
            .order('patent_id', {
              ascending: true,
            })
        ),

        fetchAllRows(() =>
          supabase
            .from('project_minerals')
            .select(
              'project_number, minerals(name)'
            )
            .order('project_number', {
              ascending: true,
            })
        ),

        fetchAllRows(() =>
          supabase
            .from('patent_technologies')
            .select(
              'patent_id, technologies(name)'
            )
            .order('patent_id', {
              ascending: true,
            })
        ),

        fetchAllRows(() =>
          supabase
            .from('project_technologies')
            .select(
              'project_number, technologies(name)'
            )
            .order('project_number', {
              ascending: true,
            })
        ),

        fetchAllRows(() =>
          supabase
            .from('patent_processes')
            .select(
              'patent_id, processes(name)'
            )
            .order('patent_id', {
              ascending: true,
            })
        ),

        fetchAllRows(() =>
          supabase
            .from('project_processes')
            .select(
              'project_number, processes(name)'
            )
            .order('project_number', {
              ascending: true,
            })
        ),

        fetchAllRows(() =>
          supabase
            .from('project_applications')
            .select(
              'project_number, applications(application)'
            )
            .order('project_number', {
              ascending: true,
            })
        ),

        fetchAllRows(() =>
          supabase
            .from('projects')
            .select('project_number, pi_institute')
            .not('pi_institute', 'is', null)
            .order('project_number', {
              ascending: true,
            })
        ),
      ])

      setPatents(patentRows)
      setProjects(projectRows)

      setPatentMinerals(patentMineralRows)
      setProjectMinerals(projectMineralRows)

      setPatentTechnologies(
        patentTechnologyRows
      )

      setProjectTechnologies(
        projectTechnologyRows
      )

      setPatentProcesses(
        patentProcessRows
      )

      setProjectProcesses(
        projectProcessRows
      )

      setProjectApplications(
        projectApplicationRows
      )

      setInstitutions(institutionRows)
    } catch (analyticsError) {
      setError(
        analyticsError?.message ||
          'Failed to load analytics.'
      )
    } finally {
      setLoading(false)
    }
  }

  function countByName(rows, relationName) {
    const counts = {}

    rows.forEach((row) => {
      const relation = row?.[relationName]
      const name = relation?.name

      if (!name) {
        return
      }

      counts[name] = (counts[name] || 0) + 1
    })

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }

  function countApplications(rows) {
    const counts = {}

    rows.forEach((row) => {
      const name =
        row?.applications?.application

      if (!name) {
        return
      }

      counts[name] = (counts[name] || 0) + 1
    })

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }

  function countInstitutes(rows) {
    const counts = {}

    rows.forEach((row) => {
      const name = row?.pi_institute?.trim()

      if (!name) {
        return
      }

      counts[name] = (counts[name] || 0) + 1
    })

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }

  const patentCount = patents.length
  const projectCount = projects.length

  const patentMineralCounts = countByName(
    patentMinerals,
    'minerals'
  )

  const patentMineralTotal = patentMineralCounts.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0
  )

  const patentMineralMajor = patentMineralCounts.filter(
    (item) =>
      patentMineralTotal > 0 &&
      Number(item.count || 0) / patentMineralTotal >= 0.015
  )

  const patentMineralOthersCount = patentMineralCounts
    .filter(
      (item) =>
        patentMineralTotal > 0 &&
        Number(item.count || 0) / patentMineralTotal < 0.015
    )
    .reduce((sum, item) => sum + Number(item.count || 0), 0)

  const patentMineralData =
    patentMineralOthersCount > 0
      ? [
          ...patentMineralMajor,
          {
            name: 'Others',
            count: patentMineralOthersCount,
          },
        ]
      : patentMineralMajor

  const projectMineralData = countByName(
    projectMinerals,
    'minerals'
  )

  const patentTechnologyData = countByName(
    patentTechnologies,
    'technologies'
  )

  const projectTechnologyData = countByName(
    projectTechnologies,
    'technologies'
  )

  const patentProcessData = countByName(
    patentProcesses,
    'processes'
  )

  const projectProcessData = countByName(
    projectProcesses,
    'processes'
  )

  const processComparisonData = useMemo(() => {
    const map = {}

    patentProcessData.forEach((item) => {
      map[item.name] = {
        name: item.name,
        patents: item.count,
        projects: 0,
      }
    })

    projectProcessData.forEach((item) => {
      if (!map[item.name]) {
        map[item.name] = {
          name: item.name,
          patents: 0,
          projects: 0,
        }
      }

      map[item.name].projects = item.count
    })

    return Object.values(map)
      .filter((item) => item.patents > 0 || item.projects > 0)
      .sort(
        (a, b) =>
          b.patents + b.projects - (a.patents + a.projects)
      )
  }, [patentProcessData, projectProcessData])

  const processTechnologyData = useMemo(() => {
    const processTechnologyCounts = {}

    function addCooccurrences(processRows, technologyRows, entityKey) {
      const processesByEntity = {}
      const technologiesByEntity = {}

      processRows.forEach((row) => {
        const entityId = row?.[entityKey]
        const name = row?.processes?.name
        if (!entityId || !name) return
        if (!processesByEntity[entityId]) processesByEntity[entityId] = new Set()
        processesByEntity[entityId].add(name)
      })

      technologyRows.forEach((row) => {
        const entityId = row?.[entityKey]
        const name = row?.technologies?.name
        if (!entityId || !name) return
        if (!technologiesByEntity[entityId]) technologiesByEntity[entityId] = new Set()
        technologiesByEntity[entityId].add(name)
      })

      Object.keys(processesByEntity).forEach((entityId) => {
        const processNames = processesByEntity[entityId]
        const technologyNames = technologiesByEntity[entityId]
        if (!technologyNames) return

        processNames.forEach((processName) => {
          if (!processTechnologyCounts[processName]) {
            processTechnologyCounts[processName] = {}
          }
          technologyNames.forEach((technologyName) => {
            processTechnologyCounts[processName][technologyName] =
              (processTechnologyCounts[processName][technologyName] || 0) + 1
          })
        })
      })
    }

    addCooccurrences(patentProcesses, patentTechnologies, 'patent_id')
    addCooccurrences(projectProcesses, projectTechnologies, 'project_number')

    return processComparisonData.map((item) => {
      const technologyCounts = processTechnologyCounts[item.name] || {}
      const primaryTechnology = Object.entries(technologyCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unclassified'

      return { ...item, technology: primaryTechnology }
    })
  }, [
    patentProcesses,
    projectProcesses,
    patentTechnologies,
    projectTechnologies,
    processComparisonData,
  ])

  const processTechnologyLegend = useMemo(() => {
    const counts = {}
    processTechnologyData.forEach((item) => {
      counts[item.technology] = (counts[item.technology] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
  }, [processTechnologyData])

  const processTechnologyColors = useMemo(() => {
    const palette = [
      '#38bdf8', '#a78bfa', '#34d399', '#fbbf24',
      '#fb7185', '#22d3ee', '#818cf8', '#4ade80',
      '#f59e0b', '#f472b6', '#60a5fa', '#c084fc',
    ]
    return Object.fromEntries(
      processTechnologyLegend.map((name, index) => [
        name, palette[index % palette.length],
      ])
    )
  }, [processTechnologyLegend])

  const applicationData = countApplications(
    projectApplications
  )

  const institutionData = countInstitutes(
    institutions
  )

  const patentMineralEntities = new Set(
    patentMinerals
      .map((row) => row?.patent_id)
      .filter(Boolean)
  )

  const projectMineralEntities = new Set(
    projectMinerals
      .map((row) => row?.project_number)
      .filter(Boolean)
  )

  const patentTechnologyEntities = new Set(
    patentTechnologies
      .map((row) => row?.patent_id)
      .filter(Boolean)
  )

  const projectTechnologyEntities = new Set(
    projectTechnologies
      .map((row) => row?.project_number)
      .filter(Boolean)
  )

  const patentProcessEntities = new Set(
    patentProcesses
      .map((row) => row?.patent_id)
      .filter(Boolean)
  )

  const projectProcessEntities = new Set(
    projectProcesses
      .map((row) => row?.project_number)
      .filter(Boolean)
  )

  const patentMineralCoverage =
    patentCount > 0
      ? (
          (patentMineralEntities.size /
            patentCount) *
          100
        ).toFixed(1)
      : '0.0'

  const projectMineralCoverage =
    projectCount > 0
      ? (
          (projectMineralEntities.size /
            projectCount) *
          100
        ).toFixed(1)
      : '0.0'

  const patentTechnologyCoverage =
    patentCount > 0
      ? (
          (patentTechnologyEntities.size /
            patentCount) *
          100
        ).toFixed(1)
      : '0.0'

  const projectTechnologyCoverage =
    projectCount > 0
      ? (
          (projectTechnologyEntities.size /
            projectCount) *
          100
        ).toFixed(1)
      : '0.0'

  /* =====================================================
     PATENT TREND
  ===================================================== */

  const patentTrendData = useMemo(() => {
    const today = new Date()

    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )

    const startDate = new Date(
      today.getFullYear(),
      today.getMonth() - 24,
      1
    )

    const monthMap = {}

    for (let i = 0; i < 24; i += 1) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1
      )

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`

      monthMap[key] = {
        key,
        month: date.toLocaleDateString('en-IN', {
          month: 'short',
          year: 'numeric',
        }),
        count: 0,
      }
    }

    patents.forEach((patent) => {
      const date = parseDate(
        patent.publication_date
      )

      if (!date) {
        return
      }

      if (date < startDate || date >= endDate) {
        return
      }

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`

      if (monthMap[key]) {
        monthMap[key].count += 1
      }
    })

    return Object.values(monthMap)
  }, [patents])

  const recentPatentCount = useMemo(() => {
    const validDates = patents
      .map((patent) =>
        parseDate(patent.publication_date)
      )
      .filter(Boolean)
      .sort((a, b) => b - a)

    if (validDates.length === 0) {
      return 0
    }

    const latestDate = validDates[0]

    const cutoff = new Date(latestDate)
    cutoff.setFullYear(
      cutoff.getFullYear() - 2
    )

    return validDates.filter(
      (date) => date >= cutoff
    ).length
  }, [patents])

  const mineralComparison = useMemo(() => {
    const map = {}

    patentMineralData.forEach((item) => {
      map[item.name] = {
        name: item.name,
        patents: item.count,
        projects: 0,
      }
    })

    projectMineralData.forEach((item) => {
      if (!map[item.name]) {
        map[item.name] = {
          name: item.name,
          patents: 0,
          projects: 0,
        }
      }

      map[item.name].projects = item.count
    })

    return Object.values(map)
      .sort((a, b) => {
        return (
          b.patents +
          b.projects -
          (a.patents + a.projects)
        )
      })
      .slice(0, 12)
  }, [
    patentMineralData,
    projectMineralData,
  ])

  const technologyIntelligence = useMemo(() => {
    const map = {}

    patentTechnologyData.forEach((item) => {
      map[item.name] = {
        name: item.name,
        patents: item.count,
        projects: 0,
      }
    })

    projectTechnologyData.forEach((item) => {
      if (!map[item.name]) {
        map[item.name] = {
          name: item.name,
          patents: 0,
          projects: 0,
        }
      }

      map[item.name].projects = item.count
    })

    const maxPatents = Math.max(
      1,
      ...Object.values(map).map(
        (item) => item.patents
      )
    )

    const maxProjects = Math.max(
      1,
      ...Object.values(map).map(
        (item) => item.projects
      )
    )

    return Object.values(map)
      .map((item) => {
        const patentIntensity =
          item.patents / maxPatents

        const projectIntensity =
          item.projects / maxProjects

        const overlapScore =
          Math.min(
            patentIntensity,
            projectIntensity
          ) * 100

        const gapScore =
          (patentIntensity -
            projectIntensity) *
          100

        let category = 'Balanced'

        if (
          item.patents > 0 &&
          item.projects === 0
        ) {
          category = 'R&D Gap'
        } else if (
          item.projects > 0 &&
          item.patents === 0
        ) {
          category = 'Patent Opportunity'
        } else if (
          gapScore >= 15
        ) {
          category = 'R&D Gap'
        } else if (
          gapScore <= -15
        ) {
          category = 'Patent Opportunity'
        } else if (
          overlapScore >= 20
        ) {
          category = 'Overlap'
        }

        return {
          ...item,
          patentIntensity,
          projectIntensity,
          overlapScore,
          gapScore,
          category,
        }
      })
      .sort(
        (a, b) =>
          b.patents +
          b.projects -
          (a.patents + a.projects)
      )
  }, [
    patentTechnologyData,
    projectTechnologyData,
  ])

  const technologyGaps =
    technologyIntelligence
      .filter(
        (item) =>
          item.category === 'R&D Gap'
      )
      .sort(
        (a, b) =>
          b.gapScore - a.gapScore
      )
      .slice(0, 10)

  const patentOpportunities =
    technologyIntelligence
      .filter(
        (item) =>
          item.category ===
          'Patent Opportunity'
      )
      .sort(
        (a, b) =>
          b.projects - a.projects
      )
      .slice(0, 10)

  const technologyOverlaps =
    technologyIntelligence
      .filter(
        (item) =>
          item.category === 'Overlap'
      )
      .sort(
        (a, b) =>
          b.overlapScore -
          a.overlapScore
      )
      .slice(0, 10)

  const emergingTechnologies = useMemo(() => {
    const dates = patents
      .map((patent) =>
        parseDate(patent.publication_date)
      )
      .filter(Boolean)

    if (dates.length === 0) {
      return []
    }

    const latestDate = new Date(
      Math.max(...dates.map((date) => date.getTime()))
    )

    const cutoff = new Date(latestDate)
    cutoff.setFullYear(
      cutoff.getFullYear() - 2
    )

    const recentPatentIds = new Set(
      patents
        .filter((patent) => {
          const date = parseDate(
            patent.publication_date
          )

          return date && date >= cutoff
        })
        .map((patent) => patent.id)
    )

    const counts = {}

    patentTechnologies.forEach((row) => {
      if (
        !recentPatentIds.has(
          row?.patent_id
        )
      ) {
        return
      }

      const name =
        row?.technologies?.name

      if (!name) {
        return
      }

      counts[name] =
        (counts[name] || 0) + 1
    })

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [
    patents,
    patentTechnologies,
  ])

  const emergingTechnologyTrendData = useMemo(() => {
    const dates = patents
      .map((patent) =>
        parseDate(patent.publication_date)
      )
      .filter(Boolean)

    if (dates.length === 0 || emergingTechnologies.length === 0) {
      return []
    }

    const latestDate = new Date(
      Math.max(...dates.map((date) => date.getTime()))
    )

    const cutoff = new Date(latestDate)
    cutoff.setFullYear(
      cutoff.getFullYear() - 2
    )

    const startDate = new Date(
      cutoff.getFullYear(),
      cutoff.getMonth(),
      1
    )

    const endDate = new Date(
      latestDate.getFullYear(),
      latestDate.getMonth(),
      1
    )

    const monthMap = {}
    const current = new Date(startDate)

    while (current <= endDate) {
      const key = `${current.getFullYear()}-${String(
        current.getMonth() + 1
      ).padStart(2, '0')}`

      const row = {
        key,
        month: current.toLocaleDateString('en-IN', {
          month: 'short',
          year: 'numeric',
        }),
      }

      emergingTechnologies.forEach((technology) => {
        row[technology.name] = 0
      })

      monthMap[key] = row

      current.setMonth(current.getMonth() + 1)
    }

    const emergingTechnologyNames = new Set(
      emergingTechnologies.map((technology) => technology.name)
    )

    patentTechnologies.forEach((row) => {
      const name = row?.technologies?.name

      if (!name || !emergingTechnologyNames.has(name)) {
        return
      }

      const patent = patents.find(
        (item) => item.id === row?.patent_id
      )

      if (!patent) {
        return
      }

      const date = parseDate(patent.publication_date)

      if (!date || date < cutoff || date > latestDate) {
        return
      }

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`

      if (monthMap[key]) {
        monthMap[key][name] += 1
      }
    })

    return Object.values(monthMap)
  }, [
    patents,
    patentTechnologies,
    emergingTechnologies,
  ])

  const collaborationOpportunities =
    useMemo(() => {
      const rows = institutionData
        .slice(0, 10)
        .map((item) => ({
          name: item.name,
          projects: item.count,
        }))

      return rows
    }, [institutionData])

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="page-heading">
          <div>
            <h1>Analytics</h1>

            <p>
              Technology and research intelligence across the
              critical-minerals ecosystem.
            </p>
          </div>
        </div>

        <div className="analytics-loading">
          Loading intelligence analytics...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="page-heading">
          <div>
            <h1>Analytics</h1>

            <p>
              Technology and research intelligence across the
              critical-minerals ecosystem.
            </p>
          </div>
        </div>

        <div className="error-box">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">

      <div className="page-heading">
        <div>
          <h1>Analytics</h1>

          <p>
            Strategic intelligence on patenting activity,
            technology trends, research areas, institutions,
            technology gaps and R&D opportunities.
          </p>
        </div>
      </div>

      <section className="analytics-section">
        <div className="analytics-section-header">
          <div>
            <div className="eyebrow">
              EXECUTIVE INTELLIGENCE
            </div>

            <h2>At a glance</h2>

            <p>
              High-level indicators from the current patent
              and government R&D datasets.
            </p>
          </div>
        </div>

        <div className="analytics-grid analytics-stats">

          <AnalyticsMetric
            icon={<FileText size={19} />}
            label="Patent activity"
            value={patentCount.toLocaleString()}
            description="Indian patents in the current dataset"
          />

          <AnalyticsMetric
            icon={<FlaskConical size={19} />}
            label="R&D activity"
            value={projectCount.toLocaleString()}
            description="Registered government R&D projects"
          />

          <AnalyticsMetric
            icon={<Layers size={19} />}
            label="Technology domains"
            value={technologyIntelligence.length}
            description="Classified technology sub-domains"
          />

          <AnalyticsMetric
            icon={<TrendingUp size={19} />}
            label="Recent patent activity"
            value={recentPatentCount.toLocaleString()}
            description="Patents within the latest two-year window"
          />

        </div>
      </section>

      <section className="analytics-section">

        <div className="analytics-section-header">
          <div>
            <div className="eyebrow">
              PATENTING ACTIVITY
            </div>

            <h2>Patent activity trend</h2>

            <p>
              Monthly patent publication activity over the previous
              24 complete calendar months, excluding the current month.
            </p>
          </div>
        </div>

        <div className="analytics-panel">
          <div className="analytics-large-chart">
            {patentTrendData.length === 0 ? (
              <AnalyticsEmpty text="No usable patent publication dates available." />
            ) : (
              <ResponsiveContainer
                width="100%"
                height={380}
              >
                <LineChart
                  data={patentTrendData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.08}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10 }}
                    interval={1}
                    angle={-35}
                    textAnchor="end"
                    height={55}
                  />

                  <YAxis
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Patents"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="analytics-section">

        <div className="analytics-section-header">
          <div>
            <div className="eyebrow">
              RESEARCH AREAS
            </div>

            <h2>Critical-mineral activity</h2>

            <p>
              Comparison of patenting and government R&D activity
              across the critical-mineral landscape.
            </p>
          </div>
        </div>

        <div
          ref={mineralDonutRef}
          className="analytics-panel"
        >
          <div className="analytics-large-chart mineral-donut-wrap">
            <ResponsiveContainer
              width="100%"
              height={500}
            >
              <PieChart>
                <Pie
                  data={[{ name: 'track', count: 1 }]}
                  dataKey="count"
                  cx="50%"
                  cy="50%"
                  outerRadius={145}
                  innerRadius={78}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  fill="rgba(255, 255, 255, 0.045)"
                  isAnimationActive={false}
                />

                <Pie
                  data={patentMineralData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={145}
                  innerRadius={78}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={0}
                  stroke="none"
                  isAnimationActive={false}
                  label={
                    mineralDonutProgress > 0.7
                      ? ({ name, percent, cx, cy, midAngle, outerRadius, index }) => {
                          const angle = -midAngle * (Math.PI / 180)
                          const direction = Math.cos(angle) >= 0 ? 1 : -1

                          const anchorX =
                            cx + outerRadius * Math.cos(angle)
                          const anchorY =
                            cy + outerRadius * Math.sin(angle)

                          const totalValue = patentMineralData.reduce(
                            (sum, item) => sum + Number(item.count || 0),
                            0
                          )

                          let cumulative = 0
                          const sideIndices = []

                          patentMineralData.forEach((item, itemIndex) => {
                            const value = Number(item.count || 0)
                            const sliceAngle =
                              totalValue > 0
                                ? (value / totalValue) * 360
                                : 0
                            const itemMidAngle =
                              90 - cumulative - sliceAngle / 2
                            const itemAngle =
                              -itemMidAngle * (Math.PI / 180)
                            const itemDirection =
                              Math.cos(itemAngle) >= 0 ? 1 : -1

                            if (itemDirection === direction) {
                              sideIndices.push(itemIndex)
                            }

                            cumulative += sliceAngle
                          })

                          const rankedSideIndices = sideIndices.sort((a, b) => {
                            const getAnchorY = (itemIndex) => {
                              let running = 0

                              for (let i = 0; i < itemIndex; i += 1) {
                                const value = Number(
                                  patentMineralData[i]?.count || 0
                                )

                                running +=
                                  totalValue > 0
                                    ? (value / totalValue) * 360
                                    : 0
                              }

                              const value = Number(
                                patentMineralData[itemIndex]?.count || 0
                              )

                              const sliceAngle =
                                totalValue > 0
                                  ? (value / totalValue) * 360
                                  : 0

                              const itemMidAngle =
                                90 - running - sliceAngle / 2

                              const itemAngle =
                                -itemMidAngle * (Math.PI / 180)

                              return (
                                cy +
                                outerRadius *
                                  Math.sin(itemAngle)
                              )
                            }

                            return (
                              getAnchorY(a) -
                              getAnchorY(b)
                            )
                          })

                          const sideRank = Math.max(
                            0,
                            rankedSideIndices.indexOf(index)
                          )

                          const sideCount = Math.max(
                            1,
                            rankedSideIndices.length
                          )

                          const top = cy - 220
                          const bottom = cy + 220

                          const targetY =
                            sideCount === 1
                              ? cy
                              : top +
                                (sideRank /
                                  (sideCount - 1)) *
                                  (bottom - top)

                          const labelDirection = direction

                          const bendX =
                            cx +
                            labelDirection * 178

                          const lineEndX =
                            cx +
                            labelDirection * 275

                          const textX =
                            lineEndX +
                            labelDirection * 10

                          const points =
                            `${anchorX},${anchorY} ${bendX},${targetY} ${lineEndX},${targetY}`

                          return (
                            <g>
                              <polyline
                                points={points}
                                fill="none"
                                stroke="rgba(232, 237, 245, 0.45)"
                                strokeWidth={1}
                              />

                              <text
                                x={textX}
                                y={targetY}
                                textAnchor={
                                  labelDirection === 1
                                    ? 'start'
                                    : 'end'
                                }
                                dominantBaseline="middle"
                                fill="#e8edf5"
                                fontSize={11}
                                fontWeight={500}
                              >
                                {`${name} ${(percent * 100).toFixed(1)}%`}
                              </text>
                            </g>
                          )
                        }
                      : false
                  }
                  labelLine={false}
                >
                  {patentMineralData.map((entry, index) => (
                    <Cell
                      key={`mineral-pie-${entry.name}`}
                      fill={[
                        '#38bdf8',
                        '#a78bfa',
                        '#34d399',
                        '#fbbf24',
                        '#fb7185',
                        '#22d3ee',
                        '#818cf8',
                        '#4ade80',
                        '#f59e0b',
                        '#f472b6',
                        '#60a5fa',
                        '#c084fc',
                      ][index % 12]}
                      stroke="none"
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => [
                    value.toLocaleString(),
                    'Patents',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="analytics-section">

        <div className="analytics-section-header">
          <div>
            <div className="eyebrow">
              TECHNOLOGY LANDSCAPE
            </div>

            <h2>Technology trends and sub-domains</h2>

            <p>
              The most frequently classified technology areas in
              patents and R&D projects.
            </p>
          </div>
        </div>

        <div className="analytics-chart-grid">

          <AnalyticsChart
            title="Patent technology sub-domains"
            description="Technology areas with the highest patent activity."
            data={patentTechnologyData.slice(0, 10)}
            valueBasedColors={true}
          />

          <AnalyticsChart
            title="R&D technology sub-domains"
            description="Technology areas receiving the highest number of registered R&D projects."
            data={projectTechnologyData.slice(0, 10)}
            valueBasedColors={true}
          />

        </div>
      </section>

      <section className="analytics-section">

        <div className="analytics-section-header">
          <div>
            <div className="eyebrow">
              RESEARCH AREAS
            </div>

            <h2>R&D research/application areas</h2>

            <p>
              Areas represented by the applications assigned to
              registered R&D projects.
            </p>
          </div>
        </div>

        <div className="analytics-panel">

          <div className="analytics-chart">
            <ResponsiveContainer
              width="100%"
              height={400}
            >
              <BarChart
                data={applicationData.slice(0, 12)}
                margin={{
                  top: 10,
                  right: 30,
                  left: 30,
                  bottom: 45,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.08}
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  textAnchor="middle"
                  height={35}
                  interval={0}
                />

                <YAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="R&D Projects"
                  fill="#34d399"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </section>

      <section className="analytics-section">

        <div className="analytics-section-header">
          <div>
            <div className="eyebrow">
              GAP ANALYSIS
            </div>

            <h2>Potential technology gaps</h2>

            <p>
              Technology areas showing substantially more patent
              activity than registered R&D activity may indicate
              areas where additional R&D capability could be useful.
            </p>
          </div>
        </div>

        <div className="analytics-opportunity-grid">

          {technologyGaps.length === 0 ? (
            <AnalyticsEmpty
              text="No strong patent-heavy technology gaps were identified."
            />
          ) : (
            technologyGaps.map((item) => (
              <div
                className="analytics-opportunity-card"
                key={item.name}
              >
                <div className="opportunity-icon warning">
                  <AlertTriangle size={18} />
                </div>

                <div className="opportunity-content">

                  <div className="opportunity-title">
                    {item.name}
                  </div>

                  <div className="opportunity-description">
                    Stronger patent activity than R&D activity.
                  </div>

                  <div className="opportunity-metrics">
                    <span>
                      Patents: {item.patents}
                    </span>

                    <span>
                      R&D: {item.projects}
                    </span>
                  </div>

                  <span className="analytics-badge warning">
                    Potential R&D gap
                  </span>

                </div>
              </div>
            ))
          )}

        </div>
      </section>

      <section className="analytics-section">

        <div className="analytics-section-header">
          <div>
            <div className="eyebrow">
              EMERGING AREAS
            </div>

            <h2>Recent technology activity</h2>

            <p>
              Technology sub-domains with strong representation
              among patents in the latest two-year window represented
              in the dataset.
            </p>
          </div>
        </div>

        <div className="analytics-chart-grid">

          <div className="analytics-panel">

            <div className="analytics-panel-header">
              <div>
                <h2>Emerging patent technologies</h2>
                <p>Technology activity over the latest two-year window represented in the dataset.</p>
              </div>
            </div>

            <div className="analytics-chart">

              {emergingTechnologyTrendData.length === 0 ? (
                <AnalyticsEmpty
                  text="No classified data available."
                />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={360}
                >
                  <LineChart
                    data={emergingTechnologyTrendData}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.08}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />

                    <YAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 10 }}
                      label={{
                        value: 'Count',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fontSize: 11 },
                      }}
                    />

                    <Tooltip />

                    {emergingTechnologies.map((technology, index) => {
                      const isSelected =
                        selectedEmergingTechnology === technology.name

                      const hasSelection =
                        selectedEmergingTechnology !== null

                      return (
                        <Line
                          key={technology.name}
                          type="linear"
                          dataKey={technology.name}
                          name={technology.name}
                          stroke={EMERGING_TECHNOLOGY_COLORS[index % EMERGING_TECHNOLOGY_COLORS.length]}
                          strokeWidth={isSelected ? 3 : 1.5}
                          strokeOpacity={
                            hasSelection
                              ? isSelected
                                ? 1
                                : 0.12
                              : 0.28
                          }
                          dot={false}
                          activeDot={{ r: isSelected ? 5 : 3 }}
                          onClick={() =>
                            setSelectedEmergingTechnology(
                              technology.name
                            )
                          }
                          style={{ cursor: 'pointer' }}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}

            </div>
          </div>

          <div className="analytics-insight-card large">

            <div className="insight-card-header">
              <div className="insight-icon">
                <TrendingUp size={20} />
              </div>

              <div>
                <h3>Emerging-area interpretation</h3>

                <p>
                  Recent activity is used as a signal, not as a
                  definitive prediction of future technology growth.
                </p>
              </div>
            </div>

            <div className="insight-list">

              {emergingTechnologies.map((item, index) => (
                <div
                  className="insight-list-item"
                  key={item.name}
                  onClick={() =>
                    setSelectedEmergingTechnology(item.name)
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      minWidth: 10,
                      borderRadius: '50%',
                      background: EMERGING_TECHNOLOGY_COLORS[index % EMERGING_TECHNOLOGY_COLORS.length],
                      display: 'inline-block',
                    }}
                  />

                  <span className="insight-name">
                    {item.name}
                  </span>
                </div>
              ))}

            </div>
          </div>

        </div>
      </section>

      <section className="analytics-section">

        <div className="analytics-section-header">
          <div>
            <div className="eyebrow">
              OVERLAP ANALYSIS
            </div>

            <h2>Patent ↔ R&D technology overlap</h2>

            <p>
              Technology areas that appear in both patent and R&D
              activity indicate areas of convergence between
              technology development and research activity.
            </p>
          </div>
        </div>

        <div className="analytics-overlap-table">

          <div className="overlap-header">
            <span>Technology</span>
            <span>Patents</span>
            <span>R&D Projects</span>
            <span>Signal</span>
          </div>

          {technologyOverlaps.length === 0 ? (
            <AnalyticsEmpty
              text="No significant overlap areas identified."
            />
          ) : (
            technologyOverlaps.map((item) => (
              <div
                className="overlap-row"
                key={item.name}
              >
                <strong>{item.name}</strong>

                <span>{item.patents}</span>

                <span>{item.projects}</span>

                <span className="analytics-badge success">
                  Convergence
                </span>
              </div>
            ))
          )}

        </div>
      </section>

      <section className="analytics-section">

        <div className="analytics-section-header">
          <div>
            <div className="eyebrow">
              TECHNOLOGY DEVELOPMENT
            </div>

            <h2>Potential technology-development opportunities</h2>

            <p>
              Technology areas with stronger R&D activity than patent
              activity may represent opportunities for technology
              protection, translation or further development.
            </p>
          </div>
        </div>

        <div className="analytics-opportunity-grid">

          {patentOpportunities.length === 0 ? (
            <AnalyticsEmpty
              text="No strong R&D-heavy technology opportunities were identified."
            />
          ) : (
            patentOpportunities.map((item) => (
              <div
                className="analytics-opportunity-card"
                key={item.name}
              >
                <div className="opportunity-icon info">
                  <Lightbulb size={18} />
                </div>

                <div className="opportunity-content">

                  <div className="opportunity-title">
                    {item.name}
                  </div>

                  <div className="opportunity-description">
                    R&D activity is stronger than patent activity.
                  </div>

                  <div className="opportunity-metrics">
                    <span>
                      Patents: {item.patents}
                    </span>

                    <span>
                      R&D: {item.projects}
                    </span>
                  </div>

                  <span className="analytics-badge info">
                    Development opportunity
                  </span>

                </div>
              </div>
            ))
          )}

        </div>
      </section>

      <section className="analytics-section">

        <div className="analytics-section-header">
          <div>
            <div className="eyebrow">
              PROCESS LANDSCAPE
            </div>

            <h2>Processing technology trends</h2>

            <p>
              Major mineral-processing and technology processes
              represented across the patent and R&D datasets.
            </p>
          </div>
        </div>

        <div className="analytics-panel">
          <div className="analytics-large-chart">
            <ResponsiveContainer
              width="100%"
              height={500}
            >
              <ScatterChart
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 35,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.08}
                />

                <XAxis
                  type="number"
                  dataKey="patents"
                  name="Patent processes"
                  scale="sqrt"
                  domain={[0, 'auto']}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: 'Patent processes',
                    position: 'insideBottom',
                    offset: -20,
                    fontSize: 12,
                  }}
                />

                <YAxis
                  type="number"
                  dataKey="projects"
                  name="R&D processes"
                  scale="sqrt"
                  domain={[0, 'auto']}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: 'R&D processes',
                    angle: -90,
                    position: 'insideLeft',
                    fontSize: 12,
                  }}
                />

                <ZAxis
                  type="number"
                  range={[70, 70]}
                />

                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => [
                    value,
                    name === 'Patent processes'
                      ? 'Patent processes'
                      : 'R&D processes',
                  ]}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.name || label
                  }
                />

                {processTechnologyLegend.map((technology) => (
                  <Scatter
                    key={`process-technology-${technology}`}
                    name={technology}
                    data={processTechnologyData.filter(
                      (item) => item.technology === technology
                    )}
                    fill={processTechnologyColors[technology]}
                    onClick={(point) => {
                      const selected = point?.payload || point
                      if (selected?.name) {
                        setSelectedProcessPoint(selected)
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>

            {selectedProcessPoint && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px 12px',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.35)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {selectedProcessPoint.name}
                </div>
                <div>
                  Technology: {selectedProcessPoint.technology || 'Unclassified'}
                </div>
                <div>
                  Patents: {selectedProcessPoint.patents}
                </div>
                <div>
                  R&D: {selectedProcessPoint.projects}
                </div>
              </div>
            )}

            <div
              className="process-technology-legend"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px 18px',
                marginTop: '14px',
                padding: '0 8px',
              }}
            >
              {processTechnologyLegend.map((technology) => (
                <div
                  key={`process-legend-${technology}`}
                  className="process-technology-legend-item"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    fontSize: '11px',
                  }}
                >
                  <span
                    className="process-technology-legend-dot"
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: processTechnologyColors[technology],
                      flexShrink: 0,
                    }}
                  />
                  <span>{technology}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="analytics-section">

        <div className="analytics-section-header">
          <div>
            <div className="eyebrow">
              ORGANISATIONS & INSTITUTIONS
            </div>

            <h2>Leading R&D institutions</h2>

            <p>
              Institutions with the highest number of registered
              projects in the current Satyabhama dataset.
            </p>
          </div>
        </div>

        <div className="analytics-panel">

          <div className="analytics-large-chart">

            <ResponsiveContainer
              width="100%"
              height={500}
            >
              <BarChart
                data={institutionData.slice(0, 15)}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  opacity={0.08}
                />

                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={220}
                  tick={{ fontSize: 11 }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Projects"
                  radius={[0, 4, 4, 0]}
                >
                  {institutionData.slice(0, 15).map((entry, index) => (
                    <Cell
                      key={`institution-bar-${entry.name}-${index}`}
                      fill={getTechnologyValueColor(
                        entry.count,
                        Math.min(
                          ...institutionData.slice(0, 15).map((item) => Number(item.count || 0))
                        ),
                        Math.max(
                          ...institutionData.slice(0, 15).map((item) => Number(item.count || 0))
                        )
                      )}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>
      </section>

      <section className="analytics-section">

        <div className="analytics-section-header">
          <div>
            <div className="eyebrow">
              COLLABORATION SIGNALS
            </div>

            <h2>Potential R&D collaboration opportunities</h2>

            <p>
              Institutions with substantial activity are potential
              partners for technology development, validation,
              knowledge exchange and collaborative research.
            </p>
          </div>
        </div>

        <div className="analytics-opportunity-grid">

          {collaborationOpportunities
            .slice(0, 8)
            .map((item) => (
              <div
                className="analytics-opportunity-card"
                key={item.name}
              >
                <div className="opportunity-icon success">
                  <Users size={18} />
                </div>

                <div className="opportunity-content">

                  <div className="opportunity-title">
                    {item.name}
                  </div>

                  <div className="opportunity-description">
                    Active R&D institution with{' '}
                    {item.projects}{' '}
                    registered projects.
                  </div>

                  <span className="analytics-badge success">
                    Potential partner
                  </span>

                </div>
              </div>
            ))}

        </div>
      </section>

    </div>
  )
}

/* =========================================================
   ANALYTICS COMPONENTS
========================================================= */

function AnalyticsMetric({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="analytics-stat">
      <div className="analytics-stat-icon">
        {icon}
      </div>

      <span>{label}</span>

      <strong>{value}</strong>

      <small>{description}</small>
    </div>
  )
}

function CoverageCard({
  title,
  covered,
  total,
}) {
  const percentage =
    total > 0
      ? ((covered / total) * 100).toFixed(1)
      : '0.0'

  return (
    <div className="analytics-insight-card">
      <div className="coverage-header">
        <span>{title}</span>

        <strong>{percentage}%</strong>
      </div>

      <div className="coverage-bar">
        <div
          className="coverage-bar-fill"
          style={{
            width: `${Math.min(
              100,
              Number(percentage)
            )}%`,
          }}
        />
      </div>

      <p>
        {covered.toLocaleString()} of{' '}
        {total.toLocaleString()} entities classified
      </p>
    </div>
  )
}

function AnalyticsEmpty({ text }) {
  return (
    <div className="analytics-empty">
      <Target size={22} />
      <span>{text}</span>
    </div>
  )
}

/* =========================================================
   EMERGING TECHNOLOGY LINE COLOURS
========================================================= */

const EMERGING_TECHNOLOGY_COLORS = [
  '#38bdf8',
  '#a78bfa',
  '#34d399',
  '#fbbf24',
  '#fb7185',
  '#22d3ee',
  '#c084fc',
  '#4ade80',
  '#f97316',
  '#60a5fa',
]

/* =========================================================
   TECHNOLOGY BAR COLOUR SCALE
========================================================= */

const TECHNOLOGY_VALUE_COLORS = [
  '#ef4444',
  '#f97316',
  '#facc15',
  '#22c55e',
  '#3b82f6',
]

function hexToRgb(hex) {
  const value = hex.replace('#', '')

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((value) =>
      Math.round(value)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`
}

function interpolateTechnologyColor(
  startColor,
  endColor,
  amount
) {
  const start = hexToRgb(startColor)
  const end = hexToRgb(endColor)

  const r =
    start.r +
    (end.r - start.r) * amount

  const g =
    start.g +
    (end.g - start.g) * amount

  const b =
    start.b +
    (end.b - start.b) * amount

  return rgbToHex(r, g, b)
}

function getTechnologyValueColor(
  value,
  minValue,
  maxValue
) {
  if (maxValue === minValue) {
    return TECHNOLOGY_VALUE_COLORS[0]
  }

  const normalized = Math.max(
    0,
    Math.min(
      1,
      (Number(value) - minValue) /
        (maxValue - minValue)
    )
  )

  const segmentCount =
    TECHNOLOGY_VALUE_COLORS.length - 1

  const scaled =
    normalized * segmentCount

  const segment = Math.min(
    segmentCount - 1,
    Math.floor(scaled)
  )

  const localAmount =
    scaled - segment

  return interpolateTechnologyColor(
    TECHNOLOGY_VALUE_COLORS[segment],
    TECHNOLOGY_VALUE_COLORS[segment + 1],
    localAmount
  )
}

function AnalyticsChart({
  title,
  description,
  data,
  valueBasedColors = false,
}) {
  const values = valueBasedColors
    ? data.map((item) =>
        Number(item.count || 0)
      )
    : []

  const minValue =
    values.length > 0
      ? Math.min(...values)
      : 0

  const maxValue =
    values.length > 0
      ? Math.max(...values)
      : 0

  return (
    <div className="analytics-panel">

      <div className="analytics-panel-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="analytics-chart">

        {data.length === 0 ? (
          <AnalyticsEmpty
            text="No classified data available."
          />
        ) : (
          <ResponsiveContainer
            width="100%"
            height={360}
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 5,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                opacity={0.08}
              />

              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
              />

              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 10 }}
              />

              <Tooltip />

              <Bar
                dataKey="count"
                name="Count"
                fill="#38bdf8"
                radius={[0, 4, 4, 0]}
                activeBar={false}
              >
                {valueBasedColors &&
                  data.map((entry, index) => (
                    <Cell
                      key={`technology-bar-${entry.name}-${index}`}
                      fill={getTechnologyValueColor(
                        entry.count,
                        minValue,
                        maxValue
                      )}
                    />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

      </div>
    </div>
  )
}

/* =========================================================
   PROJECT DETAILS
========================================================= */

function ProjectDetails({
  project,
  onClose,
}) {
  const [investigator, setInvestigator] =
    useState(null)

  const [minerals, setMinerals] = useState([])
  const [processes, setProcesses] = useState([])
  const [technologies, setTechnologies] =
    useState([])
  const [applications, setApplications] =
    useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjectDetails()
  }, [project.project_number])

  async function loadProjectDetails() {
    setLoading(true)

    const [
      investigatorResult,
      mineralResult,
      processResult,
      technologyResult,
      applicationResult,
    ] = await Promise.all([
      supabase
        .from('project_investigators')
        .select('*')
        .eq(
          'project_number',
          project.project_number
        ),

      supabase
        .from('project_minerals')
        .select(
          'mineral_id, minerals(id, name)'
        )
        .eq(
          'project_number',
          project.project_number
        ),

      supabase
        .from('project_processes')
        .select(
          'process_id, processes(id, name)'
        )
        .eq(
          'project_number',
          project.project_number
        ),

      supabase
        .from('project_technologies')
        .select(
          'technology_id, technologies(id, name)'
        )
        .eq(
          'project_number',
          project.project_number
        ),

      supabase
        .from('project_applications')
        .select(
          'application_id, applications(id, application)'
        )
        .eq(
          'project_number',
          project.project_number
        ),
    ])

    if (
      investigatorResult.data &&
      investigatorResult.data.length > 0
    ) {
      setInvestigator(
        investigatorResult.data[0]
      )
    }

    setMinerals(
      (mineralResult.data || [])
        .map((row) => row.minerals?.name)
        .filter(Boolean)
    )

    setProcesses(
      (processResult.data || [])
        .map((row) => row.processes?.name)
        .filter(Boolean)
    )

    setTechnologies(
      (technologyResult.data || [])
        .map((row) => row.technologies?.name)
        .filter(Boolean)
    )

    setApplications(
      (applicationResult.data || [])
        .map(
          (row) =>
            row.applications?.application
        )
        .filter(Boolean)
    )

    setLoading(false)
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal project-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <div className="eyebrow">
              R&D PROJECT
            </div>

            <h2>{project.project_number}</h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <Detail
            label="Project Title"
            value={project.title}
            full
          />

          <div className="detail-grid">
            <Detail
              label="Project Number"
              value={project.project_number}
            />

            <Detail
              label="Submission Date"
              value={formatDate(
                project.submission_date
              )}
            />
            <Detail
              label="PI Name"
              value={project.pi_name}
            />
            <Detail
              label="Designation"
              value={project.designation}
            />
            <Detail
              label="PI Institute"
              value={project.pi_institute}
            />
            <Detail
              label="Organisation Type"
              value={project.organisation_type}
            />
            <Detail
              label="Department"
              value={project.department}
            />
            <Detail
              label="Status"
              value={project.status}
            />
            <Detail
              label="Total Budget"
              value={project.total_budget}
            />
            <Detail
              label="Approved Budget"
              value={project.approved_budget}
            />
          </div>
          {investigator && (
            <div className="detail-section">
              <h3>Investigator</h3>
              <div className="detail-grid">
                <Detail
                  label="PI Name"
                  value={investigator.pi_name}
                />
                <Detail
                  label="Designation"
                  value={investigator.designation}
                />
                <Detail
                  label="Institute"
                  value={investigator.pi_institute}
                />
                <Detail
                  label="Organisation Type"
                  value={investigator.organisation_type}
                />
              </div>
            </div>
          )}
          <div className="detail-section">
            <h3>Classification</h3>
            {loading ? (
              <div className="classification-loading">
                Loading classifications...
              </div>
            ) : (
              <div className="classification-grid">
                <ClassificationGroup
                  title="Minerals"
                  items={minerals}
                />
                <ClassificationGroup
                  title="Processes"
                  items={processes}
                />
                <ClassificationGroup
                  title="Technologies"
                  items={technologies}
                />
                <ClassificationGroup
                  title="Applications"
                  items={applications}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
function ClassificationGroup({
  title,
  items,
}) {
  return (
    <div className="classification-group">
      <div className="classification-title">
        {title}
      </div>
      {items.length === 0 ? (
        <span className="classification-empty">
          Classification unavailable
        </span>
      ) : (
        <div className="tag-list">
          {items.map((item) => (
            <span
              className="tag"
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
/* =========================================================
   PATENT DETAILS
========================================================= */
function PatentDetails({
  patent,
  onClose,
}) {
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <div className="eyebrow">
              PATENT
            </div>
            <h2>
              {patent.application_number ||
                'Patent Details'}
            </h2>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <Detail
            label="Title"
            value={patent.title}
            full
          />
          <div className="detail-grid">
            <Detail
              label="Application Number"
              value={patent.application_number}
            />
            <Detail
              label="Publication Number"
              value={patent.publication_number}
            />
            <Detail
              label="Publication Date"
              value={formatDate(
                patent.publication_date
              )}
            />
            <Detail
              label="Filing Date"
              value={formatDate(
                patent.filing_date
              )}
            />
            <Detail
              label="IPC"
              value={patent.ipc}
            />
            <Detail
              label="Field of Invention"
              value={patent.field_of_invention}
            />
            <Detail
              label="Source"
              value={patent.source}
            />
          </div>
          <Detail
            label="Abstract"
            value={patent.abstract}
            full
          />
          {patent.complete_specification && (
            <Detail
              label="Complete Specification"
              value={
                patent.complete_specification
              }
              full
            />
          )}
        </div>
      </div>
    </div>
  )
}
/* =========================================================
   PAGINATION
========================================================= */
function Pagination({
  page,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null
  }
  const pageNumbers = getPageNumbers(
    page,
    totalPages
  )
  return (
    <div className="pagination">
      <button
        className="pagination-arrow"
        disabled={page === 0}
        onClick={() =>
          onPageChange(page - 1)
        }
      >
        <ArrowLeft size={16} />
        <span>Previous</span>
      </button>
      <div className="page-numbers">
        {pageNumbers.map(
          (number, index) =>
            number === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="pagination-ellipsis"
              >
                ...
              </span>
            ) : (
              <button
                key={number}
                className={
                  number === page + 1
                    ? 'page-number active'
                    : 'page-number'
                }
                onClick={() =>
                  onPageChange(number - 1)
                }
              >
                {number}
              </button>
            )
        )}
      </div>
      <button
        className="pagination-arrow"
        disabled={
          page >= totalPages - 1
        }
        onClick={() =>
          onPageChange(page + 1)
        }
      >
        <span>Next</span>
        <ArrowRight size={16} />
      </button>

    </div>
  )
}
function getPageNumbers(
  currentPage,
  totalPages
) {
  const current = currentPage + 1
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    )
  }
  if (current <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      '...',
      totalPages,
    ]
  }
  if (current >= totalPages - 3) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }
  return [
    1,
    '...',
    current - 1,
    current,
    current + 1,
    '...',
    totalPages,
  ]
}
/* =========================================================
   HELPERS
========================================================= */
function parseDate(value) {
  if (!value) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}
function Detail({
  label,
  value,
  full = false,
}) {
  return (
    <div
      className={`detail ${
        full ? 'detail-full' : ''
      }`}
    >
      <div className="detail-label">
        {label}
      </div>
      <div className="detail-value">
        {value || '—'}
      </div>
    </div>
  )
}
function formatDate(value) {
  if (!value) {
    return '—'
  }
  const date = parseDate(value)
  if (!date) {
    return value
  }
  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  )
}
function Placeholder({
  title,
  description,
}) {
  return (
    <div className="placeholder">
      <div className="placeholder-icon">
        <BarChart3 size={28} />
      </div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}
export default App
