import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Map,
  CloudUpload,
  BarChart3,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const quickLinks = [
  {
    icon: Map,
    title: "Map View",
    description: "Access subsurface maps",
  },
  {
    icon: CloudUpload,
    title: "Data Load",
    description: "Import new datasets",
  },
  {
    icon: BarChart3,
    title: "Graph & Plot",
    description: "Visualize well data",
  },
  {
    icon: Search,
    title: "Advanced Search",
    description: "Query subsurface database",
  },
]

const activityFeed = [
  { icon: Activity, text: "User X updated well markers", time: "2 min ago" },
  { icon: Activity, text: "User Y updated well", time: "5 min ago" },
  { icon: Activity, text: "System Y completed data migration", time: "8 min ago" },
  { icon: Activity, text: "User Z updated well", time: "7 min ago" },
  { icon: Activity, text: "New report generated", time: "7 min ago" },
]

export function OperationsHub() {
  return (
    <ScrollArea className="flex-1 bg-background">
      <div className="p-6 space-y-6">
        {/* Quick Links */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-medium text-foreground">Quick Links</h2>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <Card key={index} className="hover:bg-accent/50 transition-colors cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-center min-h-[100px]">
                    <div className="flex items-start gap-3 w-full">
                      <Icon className="h-6 w-6 text-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-foreground">{link.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Operational Reports */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-medium text-foreground">Operational Reports</h2>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Drilling Performance - Well 142-A */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Drilling Performance - Well 142-A
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="aspect-[4/3] flex flex-col">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Current Depth</p>
                      <p className="text-xl font-bold text-foreground">3,247m</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Target Depth</p>
                      <p className="text-xl font-bold text-foreground">4,500m</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Rate of Penetration</p>
                      <p className="text-xl font-bold text-foreground">12.3 m/hr</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Days on Site</p>
                      <p className="text-xl font-bold text-foreground">18</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">72%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                        style={{ width: "72%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-border flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-xs text-muted-foreground">Status: Active Drilling</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Production Analytics - North Sea Block 14 */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Production Analytics - North Sea Block 14
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="aspect-[4/3]">
                  <div className="h-32 mb-3 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg relative overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                      <path
                        d="M 0 60 Q 20 40, 40 45 T 80 50 Q 100 48, 120 52 T 160 55 Q 180 53, 200 50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-emerald-500"
                      />
                      <path
                        d="M 0 60 Q 20 40, 40 45 T 80 50 Q 100 48, 120 52 T 160 55 Q 180 53, 200 50 L 200 80 L 0 80 Z"
                        fill="currentColor"
                        className="text-emerald-500/10"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Daily Oil</p>
                      <p className="text-lg font-bold text-foreground">8,432</p>
                      <p className="text-xs text-emerald-600">+2.3%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Daily Gas</p>
                      <p className="text-lg font-bold text-foreground">12.4 MMscf</p>
                      <p className="text-xs text-emerald-600">+1.8%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Water Cut</p>
                      <p className="text-lg font-bold text-foreground">23%</p>
                      <p className="text-xs text-amber-600">+0.5%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety & Compliance Report */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Safety & Compliance Report
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="aspect-[4/3] flex flex-col">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">156</div>
                      <p className="text-xs text-gray-500 mt-1">Days Without Incident</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">3</div>
                      <p className="text-xs text-gray-500 mt-1">Pending Actions</p>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-700">Equipment Inspections</span>
                      <span className="text-xs font-medium text-emerald-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-700">Environmental Monitoring</span>
                      <span className="text-xs font-medium text-emerald-600">On Track</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-700">Safety Training</span>
                      <span className="text-xs font-medium text-amber-600">Due Soon</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Next audit: Dec 28, 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
