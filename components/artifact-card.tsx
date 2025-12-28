'use client'

import { ArtifactSummary } from '@/lib/types/chat'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight, BarChart3, BookOpen, Database, Link2, Map } from 'lucide-react'

interface ArtifactCardProps {
  artifact: ArtifactSummary
  onSelect?: (artifact: ArtifactSummary) => void
}

const artifactIcons: Record<string, React.ReactNode> = {
  analytics: <BarChart3 className="w-4 h-4" />,
  research: <BookOpen className="w-4 h-4" />,
  'data-quality': <Database className="w-4 h-4" />,
  'entity-resolution': <Link2 className="w-4 h-4" />,
  'goal-plan': <Map className="w-4 h-4" />,
}

const artifactColors: Record<string, string> = {
  analytics: 'bg-blue-50 border-blue-200',
  research: 'bg-purple-50 border-purple-200',
  'data-quality': 'bg-orange-50 border-orange-200',
  'entity-resolution': 'bg-green-50 border-green-200',
  'goal-plan': 'bg-pink-50 border-pink-200',
}

const badgeVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  analytics: 'default',
  research: 'secondary',
  'data-quality': 'outline',
  'entity-resolution': 'default',
  'goal-plan': 'secondary',
}

export function ArtifactCard({ artifact, onSelect }: ArtifactCardProps) {
  const createdDate = new Date(artifact.createdAt).toLocaleDateString()

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${artifactColors[artifact.kind]}`}
      onClick={() => onSelect?.(artifact)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">{artifactIcons[artifact.kind]}</div>
            <div className="flex-1">
              <CardTitle className="text-base">{artifact.title}</CardTitle>
              <CardDescription className="text-xs mt-1">{createdDate}</CardDescription>
            </div>
          </div>
          <Badge variant={badgeVariants[artifact.kind]} className="ml-2">
            {artifact.kind}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-gray-600 line-clamp-2">{artifact.preview}</p>
      </CardContent>

      <div className="px-6 py-3 border-t flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(artifact)
          }}
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}

