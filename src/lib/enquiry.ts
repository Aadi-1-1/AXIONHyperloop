import type { PartnerPathId } from '../data/prospects'

export type EnquiryFields = { name: string; organisation: string; email: string; interest: PartnerPathId; message: string }
export type EnquiryErrors = Partial<Record<keyof EnquiryFields, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEnquiry(f: EnquiryFields): EnquiryErrors {
  const e: EnquiryErrors = {}
  if (f.name.trim().length < 2) e.name = 'Enter your name.'
  if (!EMAIL.test(f.email.trim())) e.email = 'Enter a valid email address, for example name@company.com.'
  if (f.message.trim().length < 20) e.message = 'Tell us a little more — at least 20 characters.'
  if (f.message.length > 2000) e.message = 'Keep the message under 2,000 characters.'
  return e
}

