"use client"

import { Search, Inbox, GripVertical, Filter, ChevronDown, ChevronRight, Settings, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

const inboxItems = [
    {
        id: 1,
        title: "New Well Log Data - North Sea Block 14",
        summary:
            "New well log data has been received for Block 14 in the North Sea region. Review gamma ray, resistivity, and porosity logs.",
        time: "Received: 10:30 AM",
        status: "New",
        statusDot: "bg-slate-300",
        analysis: {
            title: "Autonomous Agent Analysis",
            insights: [
                "Validated data structure (LAS v3.0)",
                "Performed automated curve QC (98% pass)",
                "Georeferenced & linked to Block 14 model",
                "Flagged minor depth offset (7ft) in Gamma Ray log",
            ],
            actions: [
                { label: "Approve & Integrate", variant: "default" as const },
                { label: "Review & Edit", variant: "outline" as const },
            ],
        },
    },
    {
        id: 2,
        title: "Geological Model Update - Permian Basin",
        summary:
            "Sarah Chen has assigned a geological model update task for the Permian Basin. Update formation tops and fault interpretations.",
        assignee: "Assigned by: Sarah Chen, 9:45 AM",
        status: "In Progress",
        statusDot: "bg-amber-400/70",
        analysis: {
            title: "Autonomous Agent Analysis",
            insights: [
                "Detected 12 new formation markers from recent well data",
                "Identified potential fault zone in eastern section",
                "Cross-referenced with regional structural model",
                "Ready for geological review and approval",
            ],
            actions: [
                { label: "Approve Changes", variant: "default" as const },
                { label: "View Details", variant: "outline" as const },
            ],
        },
    },
    {
        id: 3,
        title: "Seismic Data Ingestion Complete - Gulf Coast",
        summary:
            "The seismic data ingestion process has been completed successfully for the Gulf Coast region. Data is ready for interpretation.",
        time: "Completed: Yesterday, 4:15 PM",
        status: "Completed",
        statusDot: "bg-emerald-400/70",
        analysis: {
            title: "Autonomous Agent Analysis",
            insights: [
                "Successfully ingested 450 GB of 3D seismic data",
                "Applied noise reduction and signal enhancement",
                "Generated initial horizon picks for 5 key formations",
                "Data quality score: 94/100",
            ],
            actions: [
                { label: "Start Interpretation", variant: "default" as const },
                { label: "View Report", variant: "outline" as const },
            ],
        },
    },
    {
        id: 4,
        title: "System Alert: Storage Quota Near Limit",
        summary:
            "Storage quota is approaching the limit. Current usage is at 92%. Consider archiving old data or expanding storage capacity.",
        time: "Attention Required, 2:00 PM",
        status: "Critical",
        statusDot: "bg-red-400/70",
        analysis: {
            title: "Autonomous Agent Analysis",
            insights: [
                "Current usage: 4.6 TB / 5.0 TB (92%)",
                "Identified 800 GB of archivable legacy data",
                "Projection: Storage full in 12 days at current rate",
                "Recommended action: Archive or expand capacity",
            ],
            actions: [
                { label: "Archive Data", variant: "default" as const },
                { label: "Request Expansion", variant: "outline" as const },
            ],
        },
    },
    {
        id: 5,
        title: "Access Request: Dr. Lee for Project X",
        summary:
            "Dr. Lee has requested access to Project X datasets and interpretation workspaces. Approval pending from project manager.",
        time: "Pending Approval, 11:00 AM",
        status: "Pending",
        statusDot: "bg-amber-400/70",
        analysis: {
            title: "Autonomous Agent Analysis",
            insights: [
                "User profile verified: Dr. Sarah Lee, Senior Geophysicist",
                "Requested access level: Read & Interpret",
                "Project X classification: Internal - Team Access",
                "No security flags or conflicts detected",
            ],
            actions: [
                { label: "Grant Access", variant: "default" as const },
                { label: "More Info", variant: "outline" as const },
            ],
        },
    },

    {
        id: 7,
        title: "Workflow Automation Triggered",
        summary:
            "Automated workflow for well log processing has been executed successfully. All logs have been normalized and quality checked.",
        time: "Executed successfully, 8:30 AM",
        status: "Success",
        statusDot: "bg-emerald-400/70",
        analysis: {
            title: "Autonomous Agent Analysis",
            insights: [
                "Processed 24 well logs across 6 wells",
                "Applied depth matching and normalization",
                "All logs passed quality control checks",
                "Results exported to database successfully",
            ],
            actions: [
                { label: "View Results", variant: "default" as const },
                { label: "Download Report", variant: "outline" as const },
            ],
        },
    },
    {
        id: 8,
        title: "Team Chat: Reservoir Simulation Discussion",
        summary:
            "Active discussion in the reservoir simulation channel. Team members are discussing pressure decline scenarios and recovery factors.",
        time: "New messages, 5 mins ago",
        status: "Active",
        statusDot: "bg-slate-300",
        analysis: {
            title: "Autonomous Agent Analysis",
            insights: [
                "15 new messages from 4 team members",
                "Key topics: pressure decline, EUR calculations",
                "2 files shared: simulation results and decline curves",
                "Decision point reached - requires your input",
            ],
            actions: [
                { label: "Join Discussion", variant: "default" as const },
                { label: "View Summary", variant: "outline" as const },
            ],
        },
    },
]

export function AgentInbox() {
    const [width, setWidth] = useState<string>('30%')
    const [isResizing, setIsResizing] = useState(false)
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const sidebarRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return

            const newWidth = e.clientX
            if (newWidth >= 300 && newWidth <= 800) {
                setWidth(`${newWidth}px`)
            }
        }

        const handleMouseUp = () => {
            setIsResizing(false)
        }

        if (isResizing) {
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isResizing])

    return (
        <div
            ref={sidebarRef}
            className="border-r border-border bg-muted/50 flex flex-col relative"
            style={{ width: width, height: "100%" }}
        >
            <div className="p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Inbox className="h-5 w-5 text-muted-foreground" />
                        <h2 className="font-semibold text-lg text-foreground">Agent Inbox</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-sm"
                        onClick={() => router.push("/search")}
                    >
                        <Plus className="h-4 w-4" />
                        New Conversation
                    </Button>
                </div>
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search inbox..." className="pl-9 bg-transparent border-muted-foreground/20" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {inboxItems.map((item, index) => {
                        const isExpanded = expandedId === item.id

                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    "rounded-lg transition-colors relative bg-card border border-border",
                                    isExpanded && "shadow-sm",
                                )}
                            >
                                <button
                                    className={cn("w-full text-left p-3 rounded-lg hover:bg-accent/50 transition-colors relative")}
                                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                >
                                    <div className="absolute top-1/2 -translate-y-1/2 left-3">
                                        <div className={cn("w-2 h-2 rounded-full", item.statusDot)} />
                                    </div>

                                    <div className="absolute top-3 right-3">
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>

                                    <div className="pl-4 pr-8">
                                        <p className="text-sm font-medium text-foreground mb-1 leading-tight">{item.title}</p>
                                        {!isExpanded && (
                                            <p className="text-xs text-muted-foreground/70 mt-1">{item.assignee || item.time}</p>
                                        )}
                                        {isExpanded && (
                                            <p className="text-xs text-muted-foreground/70 mt-1">{item.assignee || item.time}</p>
                                        )}
                                    </div>
                                </button>

                                {isExpanded && item.analysis && (
                                    <div className="px-3 pb-3 border-t border-gray-200 mt-2 pt-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-gray-900 animate-pulse" />
                                                </div>
                                                <h3 className="text-sm font-semibold text-gray-900">{item.analysis.title}</h3>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100">
                                                <Settings className="h-3.5 w-3.5 text-gray-600" />
                                            </Button>
                                        </div>

                                        <ul className="space-y-2 mb-4">
                                            {item.analysis.insights.map((insight, idx) => (
                                                <li key={idx} className="text-xs text-gray-700 flex gap-2">
                                                    <span className="text-gray-400 mt-0.5">•</span>
                                                    <span>{insight}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="border-t border-gray-200 pt-3">
                                            <p className="text-xs font-medium text-gray-900 mb-2">Suggested Actions</p>
                                            <div className="flex gap-2">
                                                {item.analysis.actions.map((action, idx) => (
                                                    <Button
                                                        key={idx}
                                                        variant={action.variant}
                                                        size="sm"
                                                        className={cn(
                                                            "flex-1 h-8 text-xs",
                                                            action.variant === "default" && "bg-black hover:bg-black/90 text-white",
                                                            action.variant === "outline" && "border-gray-300 text-gray-700 hover:bg-gray-50",
                                                        )}
                                                    >
                                                        {action.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>

            <div
                className="absolute top-0 right-0 bottom-0 w-1 hover:w-1.5 bg-gray-200 hover:bg-gray-400 cursor-col-resize transition-all group"
                onMouseDown={() => setIsResizing(true)}
            >
                <div className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
            </div>
        </div>
    )
}
