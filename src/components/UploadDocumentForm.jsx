import { useState } from 'react'
import aiClient from '../api/aiClient'
import Button from './Button'

export default function UploadDocumentForm({ patientId, onSuccess }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [documentType, setDocumentType] = useState('other')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please choose a PDF file to upload.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const form = new FormData()
      form.append('file', file, file.name)
      form.append('patient_id', patientId)
      form.append('title', title || file.name)
      form.append('document_type', documentType)

      const { data } = await aiClient.post('/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (onSuccess) onSuccess(data)
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title (optional)"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <option value="other">Other</option>
            <option value="referral">Referral</option>
            <option value="lab_result">Lab result</option>
            <option value="discharge_summary">Discharge summary</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">PDF file</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Uploading…' : 'Upload PDF'}
        </Button>
        <p className="text-xs text-slate-400">Max 50 MB. PDF only.</p>
      </div>
    </form>
  )
}
