import { createContext, useContext, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import StudentPanel from './StudentPanel'
import WardenPanel from './WardenPanel'
import SecurityPanel from './SecurityPanel'
import { authAPI, requestsAPI } from './api'

function useLocalStorage(key, initialValue) {
	const [state, setState] = useState(() => {
		try {
			const raw = localStorage.getItem(key)
			return raw ? JSON.parse(raw) : initialValue
		} catch {
			return initialValue
		}
	})
	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(state))
	}, [key, state])
	return [state, setState]
}

function useAuth() {
	const [session, setSession] = useLocalStorage('session', null)
	const [loading, setLoading] = useState(true)

	// Check if user is already logged in on mount
	useEffect(() => {
		const token = localStorage.getItem('token')
		if (token && !session) {
			authAPI.getCurrentUser()
				.then(user => {
					setSession({ email: user.email, role: user.role, name: user.name, id: user.id })
				})
				.catch(() => {
					localStorage.removeItem('token')
				})
				.finally(() => setLoading(false))
		} else {
			setLoading(false)
		}
	}, [])

	const login = async (email, password) => {
		try {
			const response = await authAPI.login(email, password)
			const user = {
				email: response.user.email,
				role: response.user.role,
				name: response.user.name,
				id: response.user.id
			}
			setSession(user)
			return user
		} catch (error) {
			throw new Error(error.message || 'Invalid credentials')
		}
	}

	const logout = () => {
		authAPI.logout()
		setSession(null)
	}

	return { session, login, logout, loading }
}

export { useAuth }

export default function App() {
	const auth = useAuth()
	return (
		<RequestsProvider>
			<div className="container">
				<Header auth={auth} />
				<div className="card">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login auth={auth} />} />
						<Route path="/student" element={<RequireRole auth={auth} role="student"><StudentPanel /></RequireRole>} />
						<Route path="/warden" element={<RequireRole auth={auth} role="warden"><WardenPanel /></RequireRole>} />
						<Route path="/security" element={<RequireRole auth={auth} role="security"><SecurityPanel /></RequireRole>} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</div>
			</div>
		</RequestsProvider>
	)
}

function Header({ auth }) {
	const { session, logout } = auth
	const navigate = useNavigate()
	return (
		<div className="header">
			<div>
				<strong>Hostel Smart Entry</strong>
				<span className="muted" style={{ marginLeft: 8 }}>
					Smart Leave & QR Verification
				</span>
			</div>
			<nav className="nav">
				<Link to="/">Home</Link>
				{session ? (
					<>
						<Link to={`/${session.role}`}>{session.role.charAt(0).toUpperCase() + session.role.slice(1)} Panel</Link>
						<button onClick={() => { logout(); navigate('/'); }} className="primary">Logout</button>
					</>
				) : (
					<Link to="/login"><button className="primary">Login</button></Link>
				)}
			</nav>
		</div>
	)
}

function Home() {
	const navigate = useNavigate()
	return (
		<div>
			<h2>Welcome to Hostel Smart Entry</h2>
			<p className="muted" style={{ marginBottom: '24px' }}>Select your role to continue:</p>
			<div className="role-boxes">
				<div className="role-box" onClick={() => navigate('/login')} style={{ borderColor: 'rgba(34,197,94,0.3)' }}>
					<div className="role-icon" style={{ background: 'rgba(34,197,94,0.15)' }}>👨‍🎓</div>
					<h3>Student</h3>
					<p className="muted">Submit leave requests and view QR passes</p>
					<div className="role-credentials">
						<small>student@example.com / student123</small>
					</div>
				</div>
				<div className="role-box" onClick={() => navigate('/login')} style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
					<div className="role-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>👔</div>
					<h3>Warden</h3>
					<p className="muted">Review and approve student leave requests</p>
					<div className="role-credentials">
						<small>warden@example.com / warden123</small>
					</div>
				</div>
				<div className="role-box" onClick={() => navigate('/login')} style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
					<div className="role-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>🛡️</div>
					<h3>Security</h3>
					<p className="muted">Scan QR codes to mark entry/exit</p>
					<div className="role-credentials">
						<small>security@example.com / security123</small>
					</div>
				</div>
			</div>
		</div>
	)
}

function Login({ auth }) {
	const { session, login } = auth
	const navigate = useNavigate()
	const location = useLocation()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	useEffect(() => {
		if (session) navigate(`/${session.role}`)
	}, [session, navigate])
	return (
		<form onSubmit={async (e) => {
			e.preventDefault()
			setError('')
			setLoading(true)
			try {
				const user = await login(email, password)
				const target = (location.state && location.state.from) || `/${user.role}`
				navigate(target)
			} catch (err) {
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}}>
			<h2>Login</h2>
			{error && <p style={{ color: '#ef4444' }}>{error}</p>}
			<label>Email</label>
			<input value={email} onChange={e => setEmail(e.target.value)} required />
			<label>Password</label>
			<input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
			<div style={{ marginTop: 12 }}>
				<button className="primary" type="submit" disabled={loading}>
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</div>
		</form>
	)
}

function RequireRole({ auth, role, children }) {
	const { session } = auth
	const location = useLocation()
	if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
	if (session.role !== role) return <Navigate to="/" replace />
	return children
}

// Shared context for requests
const RequestsContext = createContext(null)

export function RequestsProvider({ children }) {
	const [requests, setRequests] = useState([])
	const [loading, setLoading] = useState(true)

	// Fetch requests from API
	const fetchRequests = async (filters = {}) => {
		try {
			setLoading(true)
			const data = await requestsAPI.getAll(filters)
			setRequests(data)
		} catch (error) {
			console.error('Error fetching requests:', error)
		} finally {
			setLoading(false)
		}
	}

	// Fetch requests on mount and when needed
	useEffect(() => {
		fetchRequests()
	}, [])

	const addRequest = async (request) => {
		try {
			const newRequest = await requestsAPI.create(request.fromDate, request.toDate)
			setRequests(prev => [newRequest, ...prev])
			return newRequest
		} catch (error) {
			throw error
		}
	}

	const updateRequest = async (id, updates) => {
		try {
			const updatedRequest = await requestsAPI.update(id, updates)
			setRequests(prev => prev.map(r => r._id === id || r.id === id ? updatedRequest : r))
			return updatedRequest
		} catch (error) {
			throw error
		}
	}

	const deleteRequest = async (id) => {
		try {
			await requestsAPI.delete(id)
			setRequests(prev => prev.filter(r => (r._id !== id && r.id !== id)))
		} catch (error) {
			throw error
		}
	}

	const refreshRequests = () => {
		fetchRequests()
	}
	
	return (
		<RequestsContext.Provider value={{ requests, addRequest, updateRequest, deleteRequest, loading, refreshRequests }}>
			{children}
		</RequestsContext.Provider>
	)
}

export function useRequests() {
	const context = useContext(RequestsContext)
	if (!context) {
		throw new Error('useRequests must be used within RequestsProvider')
	}
	return context
}

// Legacy function for backward compatibility
export function storageApi() {
	return useRequests()
}

export function generateQrPayload(leave) {
	const base = {
		id: leave._id || leave.id,
		email: leave.studentEmail,
		from: leave.fromDate,
		to: leave.toDate,
		approvedAt: leave.approvedAt || null,
	}
	return JSON.stringify(base)
}
