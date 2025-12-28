'use client'

import { useState } from 'react'
import { ArtifactSummary, AnalyticsArtifactData, ResearchArtifactData, DataQualityArtifactData, EntityResolutionArtifactData } from '@/lib/types/chat'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Copy, Download } from 'lucide-react'

interface ArtifactPanelProps {
  artifact: ArtifactSummary
  onClose?: () => void
}

export function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    const text = JSON.stringify(artifact.data, null, 2)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderContent = () => {
    const data = artifact.data

    switch (artifact.kind) {
      case 'analytics': {
        const analyticsData = data as AnalyticsArtifactData
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Answer</h4>
              <p className="text-sm text-gray-700">{analyticsData.answer}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Details</h4>
              <p className="text-sm text-gray-700">{analyticsData.details}</p>
            </div>
            {analyticsData.code && (
              <div>
                <h4 className="font-semibold mb-2">Code</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                  <code>{analyticsData.code}</code>
                </pre>
              </div>
            )}
            {analyticsData.datasetsUsed && (
              <div>
                <h4 className="font-semibold mb-2">Datasets Used</h4>
                <div className="flex flex-wrap gap-2">
                  {analyticsData.datasetsUsed.map((ds) => (
                    <Badge key={ds} variant="secondary">
                      {ds}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {analyticsData.executionTimeMs && (
              <div className="text-xs text-gray-500">
                Execution time: {analyticsData.executionTimeMs}ms
              </div>
            )}
          </div>
        )
      }

      case 'research': {
        const researchData = data as ResearchArtifactData
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Answer</h4>
              <p className="text-sm text-gray-700">{researchData.answer}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Sources</h4>
              <div className="space-y-2">
                {researchData.sources.map((source, idx) => (
                  <div key={idx} className="border rounded p-2 text-sm">
                    <p className="font-medium">{source.title}</p>
                    {source.url && (
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                        {source.url}
                      </a>
                    )}
                    {source.snippet && <p className="text-gray-600 text-xs mt-1">{source.snippet}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      case 'data-quality': {
        const dqData = data as DataQualityArtifactData
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Summary</h4>
              <p className="text-sm text-gray-700">{dqData.summary}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Report</h4>
              <div className="bg-gray-50 p-3 rounded text-sm prose prose-sm max-w-none">
                {dqData.markdown}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Issues Found</p>
                <p className="text-lg font-semibold">{dqData.issuesFound}</p>
              </div>
              <div>
                <p className="text-gray-600">Columns Analyzed</p>
                <p className="text-lg font-semibold">{dqData.columnsAnalyzed}</p>
              </div>
            </div>
          </div>
        )
      }

      case 'entity-resolution': {
        const erData = data as EntityResolutionArtifactData
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Query</h4>
              <p className="text-sm text-gray-700">{erData.query}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Resolved Entities</h4>
              <div className="space-y-2">
                {erData.resolvedEntities.map((entity, idx) => (
                  <div key={idx} className="border rounded p-2 text-sm">
                    <p className="font-medium">{entity.input}</p>
                    <p className="text-gray-600 text-xs">Matched: {entity.matched.join(', ')}</p>
                    <p className="text-gray-600 text-xs">Confidence: {(entity.confidence * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      default:
        return <p className="text-sm text-gray-600">No preview available</p>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{artifact.title}</CardTitle>
          <CardDescription>{artifact.kind}</CardDescription>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4">
            {renderContent()}
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-2 text-sm">
            <div>
              <p className="text-gray-600">Created</p>
              <p>{new Date(artifact.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Kind</p>
              <p>{artifact.kind}</p>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="mt-4">
            <div className="flex justify-end mb-2">
              <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-2">
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
              <code>{JSON.stringify(artifact.data, null, 2)}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

