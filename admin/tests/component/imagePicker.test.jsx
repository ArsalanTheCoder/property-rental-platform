import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImagePicker from '../../src/components/properties/ImagePicker.jsx'

function makeImage(name, type = 'image/jpeg') {
  return new File(['fake-image-bytes'], name, { type })
}

describe('ImagePicker', () => {
  let createObjectURL
  let revokeObjectURL

  beforeEach(() => {
    createObjectURL = vi.fn((file) => `blob:mock-${file.name}`)
    revokeObjectURL = vi.fn()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
  })

  it('renders a Choose Images control that opens the native file input', async () => {
    const user = userEvent.setup()
    render(<ImagePicker images={[]} onChange={vi.fn()} />)

    const button = screen.getByRole('button', { name: /choose images/i })
    expect(button).toBeInTheDocument()

    const input = screen.getByTestId('image-file-input')
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveAttribute('accept', 'image/*')
    expect(input).toHaveAttribute('multiple')

    const clickSpy = vi.spyOn(input, 'click')
    await user.click(button)
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('creates preview thumbnails with filenames when image files are selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ImagePicker images={[]} onChange={onChange} />)

    await user.upload(screen.getByTestId('image-file-input'), [
      makeImage('house1.jpg'),
      makeImage('living.png', 'image/png'),
    ])

    expect(await screen.findByText('house1.jpg')).toBeInTheDocument()
    expect(screen.getByText('living.png')).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(createObjectURL).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenCalledWith(['blob:mock-house1.jpg', 'blob:mock-living.png'])
  })

  it('reports the selected images back so the form can persist them', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(<ImagePicker images={[]} onChange={onChange} />)

    await user.upload(screen.getByTestId('image-file-input'), [makeImage('kitchen.jpg')])
    expect(onChange).toHaveBeenLastCalledWith(['blob:mock-kitchen.jpg'])

    // Simulate the parent persisting the blob URL: the preview survives rerenders.
    rerender(<ImagePicker images={['blob:mock-kitchen.jpg']} onChange={onChange} />)
    expect(await screen.findByText('kitchen.jpg')).toBeInTheDocument()
  })

  it('removes a single image, its preview, and revokes its object URL', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ImagePicker images={[]} onChange={onChange} />)

    await user.upload(screen.getByTestId('image-file-input'), [
      makeImage('house1.jpg'),
      makeImage('living.png', 'image/png'),
    ])

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await user.click(removeButtons[0])

    expect(screen.queryByText('house1.jpg')).not.toBeInTheDocument()
    expect(screen.getByText('living.png')).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-house1.jpg')
    expect(onChange).toHaveBeenLastCalledWith(['blob:mock-living.png'])
  })

  it('ignores non-image files and only previews accepted images', async () => {
    const user = userEvent.setup()
    render(<ImagePicker images={[]} onChange={vi.fn()} />)

    const notes = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    await user.upload(screen.getByTestId('image-file-input'), [notes, makeImage('photo.jpg')], {
      // Bypass userEvent's own accept filtering so the component's filter is tested.
      applyAccept: false,
    })

    expect(await screen.findByText('photo.jpg')).toBeInTheDocument()
    expect(screen.queryByText('notes.txt')).not.toBeInTheDocument()
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(createObjectURL).toHaveBeenCalledWith(expect.objectContaining({ name: 'photo.jpg' }))
  })

  it('does not accept a selection of only non-image files', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ImagePicker images={[]} onChange={onChange} />)

    const notes = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    await user.upload(screen.getByTestId('image-file-input'), [notes], { applyAccept: false })

    expect(screen.queryByText('notes.txt')).not.toBeInTheDocument()
    expect(screen.queryAllByRole('img')).toHaveLength(0)
    expect(createObjectURL).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('revokes abandoned previews on unmount but keeps persisted ones alive', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    // Abandoned preview: picked but never persisted to the parent.
    const abandoned = render(<ImagePicker images={[]} onChange={onChange} />)
    await user.upload(screen.getByTestId('image-file-input'), [makeImage('draft.jpg')])
    abandoned.unmount()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-draft.jpg')

    // Persisted preview: the parent keeps the blob URL, so unmount must not revoke it.
    revokeObjectURL.mockClear()
    const persisted = render(
      <ImagePicker images={['blob:mock-kept.jpg']} onChange={vi.fn()} />
    )
    persisted.unmount()
    expect(revokeObjectURL).not.toHaveBeenCalled()
  })
})
