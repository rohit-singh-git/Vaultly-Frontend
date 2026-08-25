import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import AuthLayout from '../components/AuthLayout.jsx'
import FormField from '../components/FormField.jsx'
import Button from '../components/Button.jsx'
import { auth } from '../services/api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await auth.requestPasswordReset(email)
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout eyebrow="Check your inbox" title="Reset link sent">
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <MailCheck className="mx-auto mb-3 text-accent" size={32} />
          <p className="text-sm text-text-secondary">
            If an account exists for <span className="font-medium text-text-primary">{email}</span>, a reset link
            is on its way.
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Back to log in
          </Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send a reset link."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" loading={loading}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  )
}
