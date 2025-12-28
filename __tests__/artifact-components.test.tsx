import React from 'react'
import { render, screen } from '@testing-library/react'
import { ArtifactCard } from '@/components/artifact-card'
import { ArtifactPanel } from '@/components/artifact-panel'
import { ArtifactSummary, DataQualityArtifactData } from '@/lib/types/chat'

const mockArtifact: ArtifactSummary = {
  kind: 'data-quality',
  title: 'Data Quality Report',
  preview: 'Found 5 issues in dataset',
  data: {
    summary: 'Data quality analysis complete',
    markdown: '# Report\n## Issues\n- Missing values\n- Duplicates',
    issuesFound: 5,
    columnsAnalyzed: 12,
  } as DataQualityArtifactData,
  createdAt: Date.now(),
}

describe('ArtifactCard', () => {
  it('should render artifact title', () => {
    render(<ArtifactCard artifact={mockArtifact} />)
    expect(screen.getByText('Data Quality Report')).toBeInTheDocument()
  })

  it('should render artifact kind badge', () => {
    render(<ArtifactCard artifact={mockArtifact} />)
    expect(screen.getByText('data-quality')).toBeInTheDocument()
  })

  it('should render artifact preview', () => {
    render(<ArtifactCard artifact={mockArtifact} />)
    expect(screen.getByText('Found 5 issues in dataset')).toBeInTheDocument()
  })

  it('should render View Details button', () => {
    render(<ArtifactCard artifact={mockArtifact} />)
    expect(screen.getByText('View Details')).toBeInTheDocument()
  })

  it('should call onSelect when clicked', () => {
    const onSelect = jest.fn()
    render(<ArtifactCard artifact={mockArtifact} onSelect={onSelect} />)

    const button = screen.getByText('View Details')
    button.click()

    expect(onSelect).toHaveBeenCalledWith(mockArtifact)
  })
})

describe('ArtifactPanel', () => {
  it('should render artifact title', () => {
    render(<ArtifactPanel artifact={mockArtifact} />)
    expect(screen.getByText('Data Quality Report')).toBeInTheDocument()
  })

  it('should render artifact kind', () => {
    render(<ArtifactPanel artifact={mockArtifact} />)
    expect(screen.getByText('data-quality')).toBeInTheDocument()
  })

  it('should render tabs', () => {
    render(<ArtifactPanel artifact={mockArtifact} />)
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(screen.getByText('Raw')).toBeInTheDocument()
  })

  it('should render close button when onClose provided', () => {
    const onClose = jest.fn()
    render(<ArtifactPanel artifact={mockArtifact} onClose={onClose} />)

    const closeButton = screen.getByRole('button', { name: '' })
    expect(closeButton).toBeInTheDocument()
  })

  it('should display data quality specific content', () => {
    render(<ArtifactPanel artifact={mockArtifact} />)
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('Report')).toBeInTheDocument()
  })
})

