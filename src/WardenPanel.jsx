import { useState } from 'react'
import { storageApi } from './App'

export default function WardenPanel() {
	const { requests, updateRequest, deleteRequest, loading, refreshRequests } = storageApi()
	const [processing, setProcessing] = useState(null)
	const [deleting, setDeleting] = useState(null)
	
	const approve = async (id) => {
		setProcessing(id)
		try {
			await updateRequest(id, { status: 'approved' })
			refreshRequests()
		} catch (error) {
			console.error('Error approving request:', error)
		} finally {
			setProcessing(null)
		}
	}
	
	const reject = async (id) => {
		setProcessing(id)
		try {
			await updateRequest(id, { status: 'rejected' })
			refreshRequests()
		} catch (error) {
			console.error('Error rejecting request:', error)
		} finally {
			setProcessing(null)
		}
	}

	const handleDelete = async (id, studentEmail, status) => {
		if (!window.confirm(`Are you sure you want to delete the request from ${studentEmail}? This action cannot be undone.`)) {
			return
		}
		
		setDeleting(id)
		try {
			await deleteRequest(id)
			refreshRequests()
		} catch (error) {
			console.error('Error deleting request:', error)
			alert('Failed to delete request. Please try again.')
		} finally {
			setDeleting(null)
		}
	}

	const pending = requests.filter(r => r.status === 'pending')
	const decided = requests.filter(r => r.status !== 'pending' && r.status !== 'completed')
	const completed = requests.filter(r => r.status === 'completed')

	const approved = requests.filter(r => r.status === 'approved')
	const inHostel = approved.filter(r => (r.movement || 'in') === 'in')
	const outHostel = approved.filter(r => r.movement === 'out')

	return (
		<div>
			<h2>Warden Panel</h2>
			<p className="muted">Review and approve student leave requests</p>
			
			{/* Movement Status Section */}
			<div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
				<div className="card" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
					<div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>In Hostel</div>
					<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{inHostel.length}</div>
				</div>
				<div className="card" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
					<div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>Out of Hostel</div>
					<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{outHostel.length}</div>
				</div>
				<div className="card" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
					<div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>Total Approved</div>
					<div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6366f1' }}>{approved.length}</div>
				</div>
			</div>

			{loading ? (
				<p className="muted">Loading...</p>
			) : (
				<div className="row">
					<div className="col">
						<h3>Pending Requests</h3>
						{pending.length === 0 ? (
							<p className="muted">No pending requests</p>
						) : (
							<table className="table">
								<thead><tr><th>Student</th><th>Dates</th><th>Actions</th></tr></thead>
								<tbody>
									{pending.map(r => (
										<tr key={r._id || r.id}>
											<td>{r.studentEmail}</td>
											<td>{r.fromDate} → {r.toDate}</td>
											<td style={{ display:'flex', gap:8, flexWrap: 'wrap' }}>
												<button 
													className="success" 
													onClick={() => approve(r._id || r.id)}
													disabled={processing === (r._id || r.id) || deleting === (r._id || r.id)}
												>
													{processing === (r._id || r.id) ? 'Processing...' : 'Approve'}
												</button>
												<button 
													className="danger" 
													onClick={() => reject(r._id || r.id)}
													disabled={processing === (r._id || r.id) || deleting === (r._id || r.id)}
												>
													{processing === (r._id || r.id) ? 'Processing...' : 'Reject'}
												</button>
												<button 
													className="danger" 
													onClick={() => handleDelete(r._id || r.id, r.studentEmail, r.status)}
													disabled={processing === (r._id || r.id) || deleting === (r._id || r.id)}
													style={{ fontSize: '12px', padding: '6px 10px' }}
													title="Delete this request"
												>
													{deleting === (r._id || r.id) ? 'Deleting...' : '🗑️'}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
					<div className="col">
						<h3>Approved / Rejected</h3>
						{decided.length === 0 ? (
							<p className="muted">No processed requests yet</p>
						) : (
							<table className="table">
								<thead><tr><th>Student</th><th>Dates</th><th>Status</th><th>Movement</th><th>Action</th></tr></thead>
								<tbody>
									{decided.map(r => (
										<tr key={r._id || r.id}>
											<td>{r.studentEmail}</td>
											<td>{r.fromDate} → {r.toDate}</td>
											<td><span className={`badge ${r.status === 'approved' ? 'success' : 'danger'}`}>{r.status}</span></td>
											<td>
												<span className={`badge ${(r.movement || 'in') === 'in' ? 'success' : 'warn'}`}>
													{(r.movement || 'in').toUpperCase()}
												</span>
											</td>
											<td>
												<button
													className="danger"
													onClick={() => handleDelete(r._id || r.id, r.studentEmail, r.status)}
													disabled={deleting === (r._id || r.id)}
													style={{ fontSize: '12px', padding: '4px 8px' }}
													title="Delete this request"
												>
													{deleting === (r._id || r.id) ? 'Deleting...' : '🗑️ Delete'}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
						{completed.length > 0 && (
							<div style={{ marginTop: '24px' }}>
								<h3>Completed Requests</h3>
								<p className="muted" style={{ fontSize: '12px', marginBottom: '8px' }}>
									Requests where students have returned (OUT → IN)
								</p>
								<table className="table">
									<thead><tr><th>Student</th><th>Dates</th><th>Status</th><th>Action</th></tr></thead>
									<tbody>
										{completed.map(r => (
											<tr key={r._id || r.id}>
												<td>{r.studentEmail}</td>
												<td>{r.fromDate} → {r.toDate}</td>
												<td><span className="badge success">{r.status}</span></td>
												<td>
													<button
														className="danger"
														onClick={() => handleDelete(r._id || r.id, r.studentEmail, r.status)}
														disabled={deleting === (r._id || r.id)}
														style={{ fontSize: '12px', padding: '4px 8px' }}
														title="Delete this request"
													>
														{deleting === (r._id || r.id) ? 'Deleting...' : '🗑️ Delete'}
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
						<p className="muted" style={{ marginTop: '16px', fontSize: '12px' }}>
							Note: Movement status (In/Out) is automatically updated when Security scans the student's QR code. Requests are marked as "completed" when students return.
						</p>
					</div>
				</div>
			)}
		</div>
	)
}

