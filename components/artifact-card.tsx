'use client'

import { ArtifactSummary } from '@/lib/types/chat'
import { Card } from '@/components/ui/card'
import { ChevronRight, FileText, BarChart3, Search, Database, Folder } from 'lucide-react'

interface ArtifactCardProps {
    artifact: ArtifactSummary
    onSelect?: (artifact: ArtifactSummary) => void
}

// Get icon based on artifact kind
function getArtifactIcon(kind: string) {
    switch (kind) {
        case 'analytics':
            return BarChart3
        case 'research':
            return Search
        case 'data-quality':
            return Database
        case 'entity-resolution':
            return Folder
        default:
            return FileText
    }
}

export function ArtifactCard({ artifact, onSelect }: ArtifactCardProps) {
    const createdDate = new Date(artifact.createdAt).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    })

    const Icon = getArtifactIcon(artifact.kind)

    return (
        <Card
            className="bg-white dark:bg-card border-border hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => onSelect?.(artifact)}
        >
            <button className="w-full px-4 py-3.5 text-left">
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4.5 w-4.5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm block truncate">{artifact.title}</span>
                        <span className="text-xs text-muted-foreground">{artifact.kind} • {createdDate}</span>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
            </button>
        </Card>
    )
}
