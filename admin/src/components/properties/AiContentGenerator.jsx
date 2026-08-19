import { useState } from 'react'
import aiService from '../../services/aiService.js'
import { buildAiPayload } from '../../utils/aiPayload.js'
import { Button } from '../ui/Button.jsx'
import { Textarea, Input } from '../ui/Field.jsx'
import { Card } from '../ui/Card.jsx'
import { Icon } from '../ui/Icon.jsx'

// AI content generation + review workflow (FR-024, FR-025).
// Generated content is NEVER persisted automatically — the parent decides how
// to apply it via onApply (FR-027, SC-003). The exact AI wire schema is owned
// by the AI developer (Sanaullah); this component only uses the service boundary.
export function AiContentGenerator({
  values,
  onApply,
  saveLabel = 'Use title & description',
  saving = false,
}) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [draft, setDraft] = useState({ title: '', description: '' })

  async function generate() {
    setStatus('generating')
    setError(null)
    try {
      const result = await aiService.generatePropertyContent(buildAiPayload(values))
      setDraft({ title: result.title, description: result.description })
      setStatus('ready')
    } catch (err) {
      setError(err?.message ?? 'Unable to generate content. Please try again.')
      setStatus('error')
    }
  }

  return (
    <Card className="overflow-hidden ring-1 ring-violet-100">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-100 bg-violet-50/60 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <Icon name="sparkles" className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">AI Content Generator</h2>
            <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-gray-600">
              Generate a professional title and description from the current property information.
              Nothing is saved until you explicitly apply it.
            </p>
          </div>
        </div>
        <Button
          variant={status === 'ready' ? 'secondary' : 'primary'}
          onClick={generate}
          loading={status === 'generating'}
          disabled={status === 'generating' || saving}
        >
          {status === 'ready' && <Icon name="refresh" className="h-4 w-4" />}
          {status === 'ready' ? 'Regenerate' : 'Generate'}
        </Button>
      </div>

      {status === 'error' && (
        <div className="m-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p role="alert" className="flex items-center gap-2 text-sm text-red-700">
            <Icon name="alert" className="h-4 w-4 shrink-0" />
            {error}
          </p>
          <Button variant="secondary" size="sm" onClick={generate}>
            Retry
          </Button>
        </div>
      )}

      {status === 'ready' && (
        <div className="space-y-4 p-5">
          <Input
            id="aiTitle"
            label="Generated title"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <Textarea
            id="aiDescription"
            label="Generated description"
            rows={4}
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => onApply(draft)} loading={saving} disabled={saving}>
              {saveLabel}
            </Button>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Icon name="lock" className="h-3.5 w-3.5" />
              Content is applied to the form only after you press this button.
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}
