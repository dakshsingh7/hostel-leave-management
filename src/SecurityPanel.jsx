import { Html5Qrcode } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'
import { storageApi } from './App'
import { requestsAPI } from './api'

export default function SecurityPanel() {
	const { requests, updateRequest, refreshRequests } = storageApi()
	const [lastScan, setLastScan] = useState(null)
	const [scanStatus, setScanStatus] = useState('Initializing camera...')
	const [permissionGranted, setPermissionGranted] = useState(false)
	const html5QrCodeRef = useRef(null)
	const isScanningRef = useRef(false)

	// Request camera permission explicitly
	const requestCameraPermission = async () => {
		try {
			setScanStatus('Requesting camera permission...')
			const stream = await navigator.mediaDevices.getUserMedia({ 
				video: { 
					facingMode: 'environment' 
				} 
			})
			// Permission granted, stop the test stream
			stream.getTracks().forEach(track => track.stop())
			setPermissionGranted(true)
			setScanStatus('✅ Camera permission granted! Starting scanner...')
			return true
		} catch (err) {
			console.error('Permission request failed:', err)
			setPermissionGranted(false)
			
			if (err.name === 'NotAllowedError') {
				setScanStatus('❌ Camera permission denied. Please click the button below to allow camera access in your browser settings.')
			} else if (err.name === 'NotFoundError') {
				setScanStatus('❌ No camera found. Please connect a camera device.')
			} else {
				setScanStatus(`❌ Camera access error: ${err.message || err.name}`)
			}
			return false
		}
	}

	// Simplified camera start function with better error handling
	const startScanning = async () => {
		if (isScanningRef.current) {
			return
		}
		
		isScanningRef.current = true
		
		try {
			// First, request permission if not already granted
			if (!permissionGranted) {
				const hasPermission = await requestCameraPermission()
				if (!hasPermission) {
					isScanningRef.current = false
					return
				}
				// Wait a bit after permission grant
				await new Promise(resolve => setTimeout(resolve, 500))
			}
			
			// Clear existing scanner
			if (html5QrCodeRef.current) {
				try {
					await html5QrCodeRef.current.stop()
					html5QrCodeRef.current.clear()
				} catch (e) {
					console.log('Cleanup error (ignored):', e)
				}
			}
			
			// Wait for DOM to be ready
			await new Promise(resolve => setTimeout(resolve, 200))
			
			// Create new scanner instance
			const elementId = 'qr-reader'
			const element = document.getElementById(elementId)
			
			if (!element) {
				throw new Error('QR reader element not found in DOM')
			}
			
			// Clear any existing content
			element.innerHTML = ''
			
			html5QrCodeRef.current = new Html5Qrcode(elementId)
			
			setScanStatus('Detecting cameras...')
			
			// Try to get cameras
			let cameraIdOrConfig = null
			try {
				const devices = await Html5Qrcode.getCameras()
				console.log('Available cameras:', devices)
				
				if (devices && devices.length > 0) {
					// Try to find back camera first
					const backCamera = devices.find(device => {
						const label = device.label.toLowerCase()
						return label.includes('back') || 
							   label.includes('rear') ||
							   label.includes('environment')
					})
					
					if (backCamera) {
						cameraIdOrConfig = backCamera.id
						console.log('Using back camera:', backCamera.label)
					} else {
						cameraIdOrConfig = devices[0].id
						console.log('Using first camera:', devices[0].label)
					}
				} else {
					console.log('No cameras found via getCameras, using facingMode')
					cameraIdOrConfig = { facingMode: 'environment' }
				}
			} catch (err) {
				console.warn('getCameras failed, using facingMode:', err)
				cameraIdOrConfig = { facingMode: 'environment' }
			}
			
			setScanStatus('Starting camera stream...')
			
			// Start scanning with the determined camera
			await html5QrCodeRef.current.start(
				cameraIdOrConfig,
				{
					fps: 10,
					qrbox: function(viewfinderWidth, viewfinderHeight) {
						const minEdgePercentage = 0.7
						const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
						const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage)
						return {
							width: Math.min(qrboxSize, 300),
							height: Math.min(qrboxSize, 300)
						}
					},
					aspectRatio: 1.0
				},
				async (decodedText) => {
					// QR code scanned successfully
					try {
						isScanningRef.current = false
						if (html5QrCodeRef.current) {
							try {
								await html5QrCodeRef.current.stop()
							} catch (e) {
								// Ignore stop errors
							}
						}
						
						const payload = JSON.parse(decodedText)
						setLastScan(payload)
						
						const found = await requestsAPI.getById(payload.id)
						
						if (!found || found.studentEmail !== payload.email) {
							setScanStatus('❌ Invalid QR code - Request not found')
							setTimeout(() => startScanning(), 2000)
							return
						}
						
						const updates = {}
						
						if (found.status !== 'approved' && found.status !== 'completed') {
							// If request is not approved/completed, approve it and mark as IN
							updates.status = 'approved'
							updates.movement = 'in'
							await updateRequest(found._id || found.id, updates)
							refreshRequests()
							setScanStatus(`✅ Request approved and marked IN`)
						} else if (found.status === 'approved') {
							// If approved, toggle movement
							const currentMovement = found.movement || 'in'
							const newMovement = currentMovement === 'in' ? 'out' : 'in'
							
							// If student is returning (OUT → IN), mark as completed
							if (currentMovement === 'out' && newMovement === 'in') {
								updates.status = 'completed'
								updates.movement = 'in'
								await updateRequest(found._id || found.id, updates)
								refreshRequests()
								setScanStatus(`✅ Request completed - Student returned`)
							} else {
								// Going out (IN → OUT), just update movement
								updates.movement = newMovement
								await updateRequest(found._id || found.id, updates)
								refreshRequests()
								setScanStatus(`✅ Movement changed: ${currentMovement.toUpperCase()} → ${newMovement.toUpperCase()}`)
							}
						} else if (found.status === 'completed') {
							// Completed requests shouldn't be scanned, but handle gracefully
							setScanStatus(`ℹ️ This request is already completed`)
							setTimeout(() => startScanning(), 2000)
							return
						}
						
						setTimeout(() => {
							startScanning()
						}, 2000)
						
					} catch (parseError) {
						console.error('QR parsing error:', parseError)
						setScanStatus('❌ Invalid QR format - Please scan a valid QR code')
						setTimeout(() => startScanning(), 2000)
					}
				},
				(errorMessage) => {
					// Ignore scanning errors
				}
			)
			
			setScanStatus('📷 Camera active - Ready to scan QR codes')
			console.log('Camera started successfully')
			
		} catch (err) {
			console.error('Camera initialization error:', err)
			isScanningRef.current = false
			
			let errorMsg = 'Camera error'
			
			if (err.name === 'NotAllowedError' || err.message?.includes('permission') || err.message?.includes('Permission')) {
				errorMsg = '❌ Camera permission denied. Click the button below to request permission again.'
				setPermissionGranted(false)
			} else if (err.name === 'NotFoundError' || err.message?.includes('not found') || err.message?.includes('No camera')) {
				errorMsg = '❌ No camera found. Please connect a camera device.'
			} else if (err.message?.includes('HTTPS') || err.message?.includes('secure context')) {
				const hostname = window.location.hostname
				if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
					errorMsg = '⚠️ Camera access issue. Please refresh the page and grant camera permissions when prompted.'
				} else {
					errorMsg = '❌ Camera requires HTTPS. Please access via https:// or use localhost/network IP.'
				}
			} else if (err.message) {
				errorMsg = `⚠️ ${err.message}`
			}
			
			setScanStatus(errorMsg)
		}
	}

	// Handle click to retry
	const handleRetry = async () => {
		if (!isScanningRef.current) {
			setScanStatus('Retrying camera initialization...')
			setPermissionGranted(false)
			await startScanning()
		}
	}

	useEffect(() => {
		startScanning()
		
		return () => {
			isScanningRef.current = false
			if (html5QrCodeRef.current) {
				html5QrCodeRef.current.stop().catch(err => {
					console.error('Error stopping scanner:', err)
				})
			}
		}
	}, [])

	return (
		<div>
			<h2>Security Panel</h2>
			<p 
				className="muted" 
				style={{ 
					padding: '8px',
					borderRadius: '4px',
					backgroundColor: scanStatus.includes('❌') ? 'rgba(239,68,68,0.1)' : 
									  scanStatus.includes('✅') ? 'rgba(34,197,94,0.1)' : 
									  scanStatus.includes('⚠️') ? 'rgba(245,158,11,0.1)' : 'transparent',
					marginBottom: '16px'
				}}
			>
				{scanStatus}
			</p>
			
			{scanStatus.includes('❌') && scanStatus.includes('permission') && (
				<button 
					className="primary" 
					onClick={handleRetry}
					style={{ 
						marginBottom: '16px',
						width: '100%',
						maxWidth: '500px',
						padding: '12px'
					}}
				>
					🔒 Request Camera Permission
				</button>
			)}
			
			<div 
				id="qr-reader" 
				style={{ 
					minHeight: '400px',
					width: '100%',
					maxWidth: '500px',
					margin: '0 auto',
					borderRadius: '8px',
					position: 'relative',
					backgroundColor: '#0b1220',
					border: '2px solid rgba(255,255,255,0.1)'
				}} 
			/>
			{lastScan && (() => {
				const found = requests.find(r => (r._id === lastScan.id || r.id === lastScan.id) && r.studentEmail === lastScan.email)
				const movement = found ? (found.movement || 'in') : 'in'
				const status = found ? found.status : 'unknown'
				return (
					<div style={{ marginTop: 16, padding: '12px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)' }}>
						<h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Last Scanned:</h3>
						<div style={{ fontSize: '12px' }}>
							<div><strong>Student:</strong> {lastScan.email}</div>
							<div><strong>Leave Period:</strong> {lastScan.from} to {lastScan.to}</div>
							<div style={{ marginTop: '4px' }}>
								<strong>Status:</strong> <span className={`badge ${status === 'approved' ? 'success' : 'neutral'}`}>{status.toUpperCase()}</span>
							</div>
							<div style={{ marginTop: '4px' }}>
								<strong>Movement:</strong> <span className={`badge ${movement === 'in' ? 'success' : 'warn'}`}>{movement.toUpperCase()}</span>
							</div>
						</div>
					</div>
				)
			})()}
		</div>
	)
}
