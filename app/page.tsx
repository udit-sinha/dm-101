"use client"

import { AgentInbox } from "@/components/agent-inbox"
import { OperationsHub } from "@/components/operations-hub"
import { TopNav } from "@/components/top-nav"

export default function HomePage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav title="Operations Hub" showSearch={false} />

      <div className="flex flex-1 overflow-hidden">
        <AgentInbox />
        <OperationsHub />
      </div>
    </div>
  )
}
