"use client"
import { motion } from "framer-motion"
import { PlatformIcon } from "@/components/platform-icon"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Bell, Lock, Database, Search, Trash2, HelpCircle, ChevronRight, Shield, Smartphone, Key } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { APISetupModal } from "@/components/api-setup-modal"
import { useState } from "react"

interface ConnectedAccount {
  platform: "whatsapp" | "instagram" | "telegram" | "messenger"
  username: string
  connected: boolean
}

export function SettingsScreen() {
  const [accounts, setAccounts] = useLocalStorage<ConnectedAccount[]>("onecell_accounts", [
    { platform: "whatsapp", username: "+1 (555) 123-4567", connected: true },
    { platform: "instagram", username: "@photoexplorer", connected: true },
    { platform: "telegram", username: "@techuser", connected: true },
    { platform: "messenger", username: "user@example.com", connected: false },
  ])

  const [notifications, setNotifications] = useLocalStorage("onecell_notifications", {
    newMessages: true,
    mentions: true,
    updates: false,
    sounds: true,
  })

  const [privacy, setPrivacy] = useLocalStorage("onecell_privacy", {
    encryption: true,
    readReceipts: true,
    onlineStatus: true,
  })

  const [showAPISetup, setShowAPISetup] = useState(false)

  const toggleAccount = (platform: "whatsapp" | "instagram" | "telegram" | "messenger") => {
    setAccounts(
      accounts.map((account) =>
        account.platform === platform ? { ...account, connected: !account.connected } : account,
      ),
    )
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all messages and data? This action cannot be undone.")) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your OneCell experience</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="h-5 w-5 text-blue-500 mr-2" />
              Connected Accounts
            </CardTitle>
            <CardDescription>Manage your connected messaging platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts.map((account) => (
              <motion.div
                key={account.platform}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center">
                  <PlatformIcon platform={account.platform} />
                  <div className="ml-4">
                    <p className="font-medium capitalize">{account.platform}</p>
                    <p className="text-sm text-gray-500">{account.username}</p>
                  </div>
                </div>
                <Switch checked={account.connected} onCheckedChange={() => toggleAccount(account.platform)} />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 text-purple-500 mr-2" />
              API Configuration
            </CardTitle>
            <CardDescription>Set up API connections for real messaging platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowAPISetup(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl h-12"
            >
              <Shield className="h-5 w-5 mr-2" />
              Configure APIs
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 text-amber-500 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>Control how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "newMessages", label: "New messages", icon: Bell },
              { key: "mentions", label: "Mentions", icon: Bell },
              { key: "updates", label: "App updates", icon: Bell },
              { key: "sounds", label: "Notification sounds", icon: Bell },
            ].map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 text-amber-500 mr-3" />
                  <span className="font-medium">{label}</span>
                </div>
                <Switch
                  checked={notifications[key as keyof typeof notifications]}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, [key]: checked })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 text-green-500 mr-2" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage your privacy and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "encryption", label: "End-to-end encryption", icon: Lock, color: "text-green-500" },
              { key: "readReceipts", label: "Read receipts", icon: Database, color: "text-blue-500" },
              { key: "onlineStatus", label: "Show online status", icon: Search, color: "text-purple-500" },
            ].map(({ key, label, icon: Icon, color }) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center">
                  <Icon className={`h-5 w-5 ${color} mr-3`} />
                  <span className="font-medium">{label}</span>
                </div>
                <Switch
                  checked={privacy[key as keyof typeof privacy]}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, [key]: checked })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-3"
      >
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-lg">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-between h-14 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center">
                <HelpCircle className="h-5 w-5 text-blue-500 mr-3" />
                <span className="font-medium">Help & Support</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-red-50/90 dark:bg-red-900/20 border border-red-200/30 dark:border-red-700/30 rounded-2xl shadow-lg">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-between h-14 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
              onClick={clearAllData}
            >
              <div className="flex items-center">
                <Trash2 className="h-5 w-5 mr-3" />
                <span className="font-medium">Clear All Data</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-6"
      >
        <p className="text-sm text-gray-500">OneCell v1.0.0</p>
        <p className="text-xs text-gray-400 mt-1">Made with ❤️ for unified messaging</p>
      </motion.div>
      <APISetupModal
        isOpen={showAPISetup}
        onClose={() => setShowAPISetup(false)}
        onSuccess={() => {
          setShowAPISetup(false)
          // Refresh the page or update state to reflect new connections
        }}
      />
    </div>
  )
}
