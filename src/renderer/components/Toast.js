import React, { useEffect, useState } from 'react'

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const colors = {
    success: { bg: '#10b981', icon: '✓' },
    error: { bg: '#ef4444', icon: '✕' },
    info: { bg: '#3b82f6', icon: 'ℹ' }
  }

  const { bg, icon } = colors[type] || colors.info

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: bg,
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: 10000,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all 0.3s ease',
        maxWidth: '400px',
        minWidth: '200px'
      }}
    >
      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{icon}</span>
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '0 4px',
          opacity: 0.8
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.8}
      >
        ×
      </button>
    </div>
  )
}

const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const showToast = (_, { message, type, duration }) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type, duration }])
    }

    window.api.on('SHOW_TOAST', showToast)

    return () => {
      window.api.removeListener('SHOW_TOAST', showToast)
    }
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            top: `${20 + index * 70}px`,
            right: '20px',
            zIndex: 10000
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration || 3000}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </>
  )
}

export default ToastContainer
