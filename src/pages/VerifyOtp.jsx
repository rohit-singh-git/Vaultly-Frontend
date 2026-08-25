import { useRef, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import Button from '../components/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function VerifyOtp() {
  const { verifyOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  const [digits, setDigits] = useState(Array(6).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputsRef = useRef([])

  if (!email) {
    return (
      <AuthLayout eyebrow="Verify email" title="Nothing to verify">
        <p className="text-sm text-text-secondary">
          Start from{' '}
          <Link to="/signup" className="font-medium text-accent hover:text-accent-hover">
            sign up
          </Link>{' '}
          to receive a verification code.
        </p>
      </AuthLayout>
    )
  }

  function updateDigit(index, value) {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    if (value && index < 5) inputsRef.current[index + 1]?.focus()
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp(email, digits.join(''))
      navigate('/drive', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Verify email"
      title="Enter verification code"
      subtitle={`We sent a 6-digit code to ${email}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => updateDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-12 w-12 rounded-lg border border-border bg-surface text-center font-display text-lg
                font-semibold text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          ))}
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={loading} disabled={digits.some((d) => !d)}>
          Verify & continue
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Didn't get a code?{' '}
        <button type="button" className="font-medium text-accent hover:text-accent-hover">
          Resend
        </button>
      </p>
    </AuthLayout>
  )
}
