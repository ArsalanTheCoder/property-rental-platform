import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AiContentGenerator } from '../../src/components/properties/AiContentGenerator.jsx'
import aiService from '../../src/services/aiService.js'

vi.mock('../../src/services/aiService.js', () => ({
  default: { generatePropertyContent: vi.fn() },
}))

const baseValues = {
  propertyType: 'apartment',
  price: 1500,
  location: 'Downtown',
  bedrooms: 2,
  bathrooms: 1,
  amenities: ['wifi', 'parking'],
  furnished: true,
  availability: 'available',
}

const generated = {
  title: 'Modern apartment in Downtown',
  description: 'This apartment in Downtown is available at $1500. It offers 2 bedroom(s) and 1 bathroom(s).',
}

function renderGenerator({ onApply = vi.fn(), saving = false } = {}) {
  return render(
    <AiContentGenerator values={baseValues} onApply={onApply} saving={saving} />
  )
}
describe('AiContentGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates a title and description from the property values', async () => {
    const user = userEvent.setup()
    aiService.generatePropertyContent.mockResolvedValue(generated)
    renderGenerator()

    await user.click(screen.getByRole('button', { name: /generate/i }))

    expect(await screen.findByLabelText(/^Generated title/)).toHaveValue('Modern apartment in Downtown')
    expect(screen.getByLabelText(/^Generated description/)).toHaveValue(generated.description)
    expect(aiService.generatePropertyContent).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyType: 'apartment',
        price: 1500,
        location: 'Downtown',
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['wifi', 'parking'],
        furnished: true,
      })
    )
  })

  it('does not call onApply until the user explicitly applies the content', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    aiService.generatePropertyContent.mockResolvedValue(generated)
    renderGenerator({ onApply })

    await user.click(screen.getByRole('button', { name: /generate/i }))
    await user.click(await screen.findByRole('button', { name: /use title & description/i }))

    expect(onApply).toHaveBeenCalledTimes(1)
    expect(onApply).toHaveBeenCalledWith(generated)
  })

  it('passes the edited draft to onApply', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    aiService.generatePropertyContent.mockResolvedValue(generated)
    renderGenerator({ onApply })

    await user.click(screen.getByRole('button', { name: /generate/i }))
    const title = await screen.findByLabelText(/^Generated title/)
    await user.clear(title)
    await user.type(title, 'Edited title')
    await user.click(screen.getByRole('button', { name: /use title & description/i }))

    expect(onApply).toHaveBeenCalledWith({ title: 'Edited title', description: generated.description })
  })

  it('shows an error and allows retrying when generation fails', async () => {
    const user = userEvent.setup()
    aiService.generatePropertyContent.mockRejectedValueOnce(new Error('AI service unavailable.'))
    aiService.generatePropertyContent.mockResolvedValueOnce(generated)
    renderGenerator()

    await user.click(screen.getByRole('button', { name: /generate/i }))

    expect(await screen.findByText('AI service unavailable.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))
    await waitFor(() => {
      expect(screen.getByLabelText(/^Generated title/)).toHaveValue('Modern apartment in Downtown')
    })
    expect(aiService.generatePropertyContent).toHaveBeenCalledTimes(2)
  })

  it('regenerate replaces the previous suggestion', async () => {
    const user = userEvent.setup()
    aiService.generatePropertyContent.mockResolvedValueOnce(generated)
    aiService.generatePropertyContent.mockResolvedValueOnce({
      title: 'Refreshed title',
      description: 'A refreshed description.',
    })
    renderGenerator()

    await user.click(screen.getByRole('button', { name: /generate/i }))
    await screen.findByLabelText(/^Generated title/)
    expect(screen.getByLabelText(/^Generated title/)).toHaveValue('Modern apartment in Downtown')

    await user.click(screen.getByRole('button', { name: /regenerate/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/^Generated title/)).toHaveValue('Refreshed title')
    })
    expect(screen.getByLabelText(/^Generated description/)).toHaveValue('A refreshed description.')
    expect(aiService.generatePropertyContent).toHaveBeenCalledTimes(2)
  })

  it('disables the apply button while saving is in progress', async () => {
    const user = userEvent.setup()
    aiService.generatePropertyContent.mockResolvedValue(generated)
    const { rerender } = renderGenerator()

    await user.click(screen.getByRole('button', { name: /generate/i }))
    await screen.findByLabelText(/^Generated title/)

    rerender(
      <AiContentGenerator values={baseValues} onApply={vi.fn()} saving />
    )

    expect(screen.getByRole('button', { name: /use title & description/i })).toBeDisabled()
  })
})
