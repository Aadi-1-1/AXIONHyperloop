import { useId, useState, type FormEvent } from 'react'
import { partnerPaths, type PartnerPathId } from '../../data/prospects'
import { validateEnquiry, type EnquiryErrors as Errors, type EnquiryFields as Fields } from '../../lib/enquiry'

/**
 * Demonstration enquiry form. It validates input but has no backend:
 * nothing is sent or stored, and the page says so before and after submission.
 */
export default function EnquiryForm({ interest, onInterestChange }: { interest: PartnerPathId; onInterestChange: (i: PartnerPathId) => void }) {
  const uid = useId()
  const [fields, setFields] = useState<Omit<Fields, 'interest'>>({ name: '', organisation: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
  const all: Fields = { ...fields, interest }

  const set = (k: keyof typeof fields, v: string) => {
    setFields((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault()
    const e = validateEnquiry(all)
    setErrors(e)
    const first = (Object.keys(e) as (keyof Fields)[])[0]
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus()
      return
    }
    setSubmitted(true)
  }

  const summary = `Enquiry type: ${partnerPaths.find((p) => p.id === interest)?.label}\nName: ${all.name}\nOrganisation: ${all.organisation || '—'}\nEmail: ${all.email}\n\n${all.message}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
  }

  if (submitted) {
    return (
      <div className="enquiry-done" role="status" aria-live="polite">
        <p className="label">Demonstration · nothing sent</p>
        <h3 className="h3">Your enquiry passed validation — and has not been sent.</h3>
        <p className="body-2">
          This concept website has no backend, so no message was transmitted or stored. In a live deployment, this form would route
          to AXION’s team for a {partnerPaths.find((p) => p.id === interest)?.label.toLowerCase()}.
        </p>
        <pre className="enquiry-summary mono small">{summary}</pre>
        <div className="cluster">
          <button type="button" className="btn btn-sm" onClick={copy}>
            Copy enquiry text
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => {
              setSubmitted(false)
              setCopied('idle')
            }}
          >
            Edit enquiry
          </button>
          <span className="small muted" aria-live="polite">
            {copied === 'ok' ? 'Copied to clipboard.' : copied === 'fail' ? 'Copy unavailable in this browser.' : ''}
          </span>
        </div>
      </div>
    )
  }

  const field = (k: keyof typeof fields, label: string, opts: { type?: string; optional?: boolean; textarea?: boolean; autoComplete?: string } = {}) => {
    const id = `${uid}-${k}`
    const err = errors[k]
    const common = {
      id,
      value: fields[k],
      'aria-invalid': err ? true : undefined,
      'aria-describedby': err ? `${id}-err` : undefined,
      onChange: (e: { target: { value: string } }) => set(k, e.target.value),
      autoComplete: opts.autoComplete,
    }
    return (
      <div className="field">
        <label htmlFor={id}>
          {label} {opts.optional ? <span className="muted">(optional)</span> : null}
        </label>
        {opts.textarea ? (
          <textarea className="textarea" {...common} rows={5} />
        ) : (
          <input className="input" type={opts.type ?? 'text'} {...common} />
        )}
        {err && (
          <span className="error" id={`${id}-err`}>
            {err}
          </span>
        )}
      </div>
    )
  }

  return (
    <form className="enquiry" noValidate onSubmit={onSubmit} aria-describedby={`${uid}-demo`}>
      <p className="notice warn small" id={`${uid}-demo`}>
        <span>
          <strong>Demonstration form.</strong> It checks your input but nothing is sent or stored — this concept website has no
          backend and no contact channel yet.
        </span>
      </p>
      <div className="field">
        <label htmlFor={`${uid}-interest`}>Enquiry type</label>
        <select
          id={`${uid}-interest`}
          className="select"
          value={interest}
          onChange={(e) => onInterestChange(e.target.value as PartnerPathId)}
        >
          {partnerPaths.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="enquiry-row">
        {field('name', 'Name', { autoComplete: 'name' })}
        {field('organisation', 'Organisation', { optional: true, autoComplete: 'organization' })}
      </div>
      {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
      {field('message', 'Message', { textarea: true })}
      <div className="cluster">
        <button type="submit" className="btn btn-primary">
          Check enquiry (demo)
        </button>
        <span className="small muted">Nothing will be sent.</span>
      </div>
    </form>
  )
}
