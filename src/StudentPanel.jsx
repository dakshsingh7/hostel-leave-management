import { useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { generateQrPayload, storageApi, useAuth } from './App'

export default function StudentPanel() {
	const { requests, addRequest, deleteRequest, loading } = storageApi()
	const auth = useAuth()
	const [fromDate, setFromDate] = useState('')
	const [toDate, setToDate] = useState('')
	const [error, setError] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [deleting, setDeleting] = useState(null)
	const email = auth.session?.email || ''

	const handleDelete = async (id, status) => {
		// Completed requests can be deleted without extra warning
		if (status === 'completed') {
			if (!window.confirm('Are you sure you want to delete this completed request?')) {
				return
			}
		} else if (status === 'approved') {
			if (!window.confirm('This request is approved and may be in use. Are you sure you want to delete it?')) {
				return
			}
		} else {
			if (!window.confirm('Are you sure you want to delete this request?')) {
				return
			}
		}
		
		setDeleting(id)
		try {
			await deleteRequest(id)
		} catch (err) {
			setError(err.message || 'Failed to delete request')
			setDeleting(null)
		}
	}

	const myRequests = useMemo(() => requests.filter(r => r.studentEmail === email), [requests, email])
	// Only show QR code for approved requests (not completed ones)
	const latestApproved = useMemo(() => myRequests.find(r => r.status === 'approved'), [myRequests])
	const qrPayload = latestApproved ? generateQrPayload(latestApproved) : null

	return (
		<div className="row">
			<div className="col">
				<h2>Student Panel</h2>
				<p className="muted">Submit leave request</p>
				{error && <p style={{ color: '#ef4444' }}>{error}</p>}
				<form onSubmit={async (e) => {
					e.preventDefault()
					setError('')
					setSubmitting(true)
					try {
						await addRequest({
							fromDate,
							toDate,
						})
						setFromDate('')
						setToDate('')
					} catch (err) {
						setError(err.message || 'Failed to submit request')
					} finally {
						setSubmitting(false)
					}
				}}>
					<label>From date</label>
					<input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} required />
					<label>To date</label>
					<input type="date" value={toDate} onChange={e => setToDate(e.target.value)} required />
					<div style={{ marginTop: 12 }}>
						<button className="primary" type="submit" disabled={submitting}>
							{submitting ? 'Submitting...' : 'Submit Request'}
						</button>
					</div>
				</form>
			</div>
			<div className="col">
				<h3>Your Requests</h3>
				{loading ? (
					<p className="muted">Loading...</p>
				) : myRequests.length === 0 ? (
					<p className="muted">No requests yet</p>
				) : (
					<table className="table">
						<thead><tr><th>Dates</th><th>Status</th><th>Move</th><th>Action</th></tr></thead>
						<tbody>
							{myRequests.map(r => (
								<tr key={r._id || r.id}>
									<td>{r.fromDate} → {r.toDate}</td>
									<td>
										<span className={`badge ${
											r.status === 'approved' ? 'success' : 
											r.status === 'completed' ? 'success' : 
											r.status === 'pending' ? 'neutral' : 
											'danger'
										}`}>
											{r.status}
										</span>
									</td>
									<td>
										<span className={`badge ${(r.movement || 'in') === 'in' ? 'success' : 'warn'}`}>
											{(r.movement || 'in').toUpperCase()}
										</span>
									</td>
									<td>
										<button
											className="danger"
											onClick={() => handleDelete(r._id || r.id, r.status)}
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
				{qrPayload && latestApproved && (
					<div style={{ marginTop: '20px' }}>
						<h3>Approved Pass (QR)</h3>
						<div 
							className="qr" 
							style={{ 
								display: 'flex', 
								justifyContent: 'center', 
								padding: '16px',
								backgroundColor: 'white',
								borderRadius: '8px',
								border: '2px solid rgba(99,102,241,0.2)'
							}}
						>
							<QRCodeCanvas 
								value={qrPayload} 
								size={300} 
								includeMargin={true}
								level="H" // High error correction for better readability even with damage
								marginSize={2}
							/>
						</div>
						<p className="muted" style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center' }}>
							Show this QR to Security for entry/exit marking.
						</p>
						<div style={{ marginTop: '12px', padding: '12px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.3)' }}>
							<div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Current Status:</div>
							<div style={{ fontSize: '16px' }}>
								<span className={`badge ${(latestApproved.movement || 'in') === 'in' ? 'success' : 'warn'}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
									{(latestApproved.movement || 'in').toUpperCase()}
								</span>
								<span className="muted" style={{ marginLeft: '8px', fontSize: '12px' }}>
									{(latestApproved.movement || 'in') === 'in' ? 'In Hostel' : 'Out of Hostel'}
								</span>
							</div>
							<p className="muted" style={{ marginTop: '8px', fontSize: '11px' }}>
								Status updates automatically when Security scans your QR code.
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

