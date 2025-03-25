"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TopNav } from "@/components/top-nav"
import {
  Settings,
  Users,
  Shield,
  Puzzle,
  Paintbrush,
  Bell,
  Bot,
  Key,
  Lock,
  Globe,
  PlusCircle,
  Trash2,
  Edit,
  Check,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Define the settings categories
const settingsCategories = [
  { id: "general", name: "General", icon: Settings },
  { id: "users", name: "Users & Roles", icon: Users },
  { id: "entitlements", name: "Entitlements", icon: Shield },
  { id: "llm", name: "LLM Configuration", icon: Bot },
  { id: "integrations", name: "Integrations", icon: Puzzle },
  { id: "appearance", name: "Appearance", icon: Paintbrush },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Security", icon: Lock },
]

// Sample users data
const usersData = [
  {
    id: "user-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Admin",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
  },
  {
    id: "user-2",
    name: "Maria Garcia",
    email: "maria@example.com",
    role: "Editor",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
  },
  {
    id: "user-3",
    name: "John Smith",
    email: "john@example.com",
    role: "Viewer",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "inactive",
  },
  {
    id: "user-4",
    name: "Sarah Lee",
    email: "sarah@example.com",
    role: "Editor",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
  },
]

// Sample LLM models
const llmModels = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", status: "active" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", status: "active" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google", status: "inactive" },
  { id: "llama-3", name: "Llama 3", provider: "Meta", status: "active" },
]

// Sample integrations
const integrationsData = [
  {
    id: "integration-1",
    name: "Slack",
    description: "Connect to Slack for notifications and updates",
    status: "connected",
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "integration-2",
    name: "Google Drive",
    description: "Access and manage files from Google Drive",
    status: "disconnected",
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "integration-3",
    name: "Microsoft Teams",
    description: "Collaborate with your team through Microsoft Teams",
    status: "connected",
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "integration-4",
    name: "Jira",
    description: "Track issues and manage projects with Jira",
    status: "disconnected",
    icon: "/placeholder.svg?height=40&width=40",
  },
]

export default function SettingsPage() {
  const [selectedCategory, setSelectedCategory] = useState("general")
  const [formState, setFormState] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    company: "Acme Inc.",
    temperature: "0.7",
    maxTokens: "4096",
    customCSS: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormState((prev) => ({ ...prev, [id]: value }))
  }

  // Render content based on selected category
  const renderContent = () => {
    switch (selectedCategory) {
      case "general":
        return <GeneralSettings />
      case "users":
        return <UsersAndRolesSettings />
      case "entitlements":
        return <EntitlementsSettings />
      case "llm":
        return <LLMConfigurationSettings />
      case "integrations":
        return <div className="p-6">Integrations settings coming soon</div>
      case "appearance":
        return <div className="p-6">Appearance settings coming soon</div>
      case "notifications":
        return <div className="p-6">Notification settings coming soon</div>
      case "security":
        return <div className="p-6">Security settings coming soon</div>
      default:
        return <GeneralSettings />
    }
  }

  return (
    <>
      <TopNav title="Settings" showSearch={false} />

      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex flex-1">
          {/* Settings Navigation */}
          <div className="w-64 border-r flex-shrink-0 overflow-auto">
            <div className="py-4">
              {settingsCategories.map((category) => (
                <button
                  key={category.id}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-left",
                    selectedCategory === category.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50",
                  )}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 min-w-0 overflow-auto p-6">{renderContent()}</div>
        </div>
      </div>
    </>
  )
}

// General Settings Component
function GeneralSettings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold">General Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Account Information</h3>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="John Doe" className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" defaultValue="john.doe@example.com" className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">
              Company
            </Label>
            <Input id="company" defaultValue="Acme Inc." className="col-span-3" />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preferences</h3>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="language" className="text-right">
              Language
            </Label>
            <Select defaultValue="en">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timezone" className="text-right">
              Timezone
            </Label>
            <Select defaultValue="utc-8">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc-12">UTC-12:00</SelectItem>
                <SelectItem value="utc-8">UTC-08:00 (Pacific Time)</SelectItem>
                <SelectItem value="utc-5">UTC-05:00 (Eastern Time)</SelectItem>
                <SelectItem value="utc">UTC+00:00 (GMT)</SelectItem>
                <SelectItem value="utc+1">UTC+01:00 (Central European Time)</SelectItem>
                <SelectItem value="utc+8">UTC+08:00 (China Standard Time)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              <Label>Dark Mode</Label>
            </div>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch id="dark-mode" />
              <Label htmlFor="dark-mode">Enable dark mode</Label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}

// Users & Roles Settings Component
function UsersAndRolesSettings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Users & Roles</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage users and their roles within the system.</p>
        </div>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">User</th>
                  <th className="py-3 px-4 text-left font-medium">Role</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === "Admin" ? "default" : "outline"}>{user.role}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={user.status === "active" ? "text-green-500" : "text-gray-500"}>
                        {user.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="roles" className="mt-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Admin</CardTitle>
                <CardDescription>Full access to all features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Manage users and roles</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Configure system settings</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Access all data and reports</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Edit Role
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Editor</CardTitle>
                <CardDescription>Create and edit content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Create and edit content</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>View all data and reports</span>
                  </div>
                  <div className="flex items-center">
                    <X className="h-4 w-4 mr-2 text-red-500" />
                    <span>Manage users and roles</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Edit Role
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="teams" className="mt-4">
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            Teams management coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Entitlements Settings Component
function EntitlementsSettings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold">Entitlements</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage access controls and permissions for resources.</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Resource Access</h3>

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left font-medium">Resource</th>
                <th className="py-3 px-4 text-left font-medium">Admin</th>
                <th className="py-3 px-4 text-left font-medium">Editor</th>
                <th className="py-3 px-4 text-left font-medium">Viewer</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Dashboards</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="dashboard-admin" defaultChecked />
                    <Label htmlFor="dashboard-admin">Full Access</Label>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="dashboard-editor" defaultChecked />
                    <Label htmlFor="dashboard-editor">Create & Edit</Label>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="dashboard-viewer" defaultChecked />
                    <Label htmlFor="dashboard-viewer">View Only</Label>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">File Explorer</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="files-admin" defaultChecked />
                    <Label htmlFor="files-admin">Full Access</Label>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="files-editor" defaultChecked />
                    <Label htmlFor="files-editor">Upload & Edit</Label>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="files-viewer" defaultChecked />
                    <Label htmlFor="files-viewer">View Only</Label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}

// LLM Configuration Settings Component
function LLMConfigurationSettings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">LLM Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure Large Language Model settings and API connections.
          </p>
        </div>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Model
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Default Model</h3>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="default-model" className="text-right">
              Primary Model
            </Label>
            <Select defaultValue="gpt-4o">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus (Anthropic)</SelectItem>
                <SelectItem value="llama-3">Llama 3 (Meta)</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro (Google)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fallback-model" className="text-right">
              Fallback Model
            </Label>
            <Select defaultValue="claude-3-opus">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select fallback model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus (Anthropic)</SelectItem>
                <SelectItem value="llama-3">Llama 3 (Meta)</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro (Google)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Model Configuration</h3>

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left font-medium">Model</th>
                <th className="py-3 px-4 text-left font-medium">Provider</th>
                <th className="py-3 px-4 text-left font-medium">Status</th>
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {llmModels.map((model) => (
                <tr key={model.id} className="border-b">
                  <td className="py-3 px-4 font-medium">{model.name}</td>
                  <td className="py-3 px-4">{model.provider}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={model.status === "active" ? "text-green-500" : "text-gray-500"}>
                      {model.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm">
                      Configure
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
