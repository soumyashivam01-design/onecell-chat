"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlatformIcon } from "@/components/platform-icon"
import { X, Key, Shield, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import { apiManager } from "@/lib/api/manager"
import type { AuthConfig } from "@/lib/api/types"

interface APISetupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function APISetupModal({ isOpen, onClose, onSuccess }: APISetupModalProps) {
  const [activeTab, setActiveTab] = useState("whatsapp")
  const [loading, setLoading] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<Record<string, boolean>>({})

  const [configs, setConfigs] = useState<Record<string, AuthConfig>>({
    whatsapp: {
      accessToken: "",
      phoneNumberId: "",
    },
    instagram: {
      accessToken: "",
      pageId: "",
    },
    telegram: {
      botToken: "",
    },
    messenger: {
      accessToken: "",
      pageId: "",
    },
  })

  const handleConfigChange = (platform: string, field: string, value: string) => {
    setConfigs((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }))
  }

  const handleAuthenticate = async (platform: string) => {
    setLoading(platform)
    try {
      const success = await apiManager.authenticatePlatform(platform, configs[platform])
      setAuthStatus((prev) => ({ ...prev, [platform]: success }))

      if (success) {
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }
    } catch (error) {
      console.error(`Authentication failed for ${platform}:`, error)
      setAuthStatus((prev) => ({ ...prev, [platform]: false }))
    } finally {
      setLoading(null)
    }
  }

  const platformConfigs = {
    whatsapp: {
      name: "WhatsApp Business",
      description: "Connect your WhatsApp Business account using the Graph API",
      fields: [
        {
          key: "accessToken",
          label: "Access Token",
          type: "password",
          placeholder: "Your WhatsApp Business API access token",
        },
        {
          key: "phoneNumberId",
          label: "Phone Number ID",
          type: "text",
          placeholder: "Your WhatsApp Business phone number ID",
        },
      ],
      docs: "https://developers.facebook.com/docs/whatsapp/business-management-api/get-started",
    },
    instagram: {
      name: "Instagram",
      description: "Connect your Instagram Business account via Facebook Graph API",
      fields: [
        {
          key: "accessToken",
          label: "Access Token",
          type: "password",
          placeholder: "Your Instagram Graph API access token",
        },
        { key: "pageId", label: "Page ID", type: "text", placeholder: "Your Instagram Business page ID" },
      ],
      docs: "https://developers.facebook.com/docs/instagram-api",
    },
    telegram: {
      name: "Telegram",
      description: "Connect using a Telegram Bot Token",
      fields: [
        {
          key: "botToken",
          label: "Bot Token",
          type: "password",
          placeholder: "Your Telegram bot token from @BotFather",
        },
      ],
      docs: "https://core.telegram.org/bots#creating-a-new-bot",
    },
    messenger: {
      name: "Messenger",
      description: "Connect your Facebook Page for Messenger integration",
      fields: [
        {
          key: "accessToken",
          label: "Page Access Token",
          type: "password",
          placeholder: "Your Facebook Page access token",
        },
        { key: "pageId", label: "Page ID", type: "text", placeholder: "Your Facebook Page ID" },
      ],
      docs: "https://developers.facebook.com/docs/messenger-platform",
    },
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] overflow-auto"
        >
          <Card className="backdrop-blur-2xl bg-white/95 dark:bg-gray-900/95 border border-white/20 dark:border-gray-700/30 shadow-2xl rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Key className="h-6 w-6 text-blue-500 mr-2" />
                  API Configuration
                </CardTitle>
                <CardDescription>Connect your messaging platforms to start using OneCell</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6 bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-1">
                  {Object.entries(platformConfigs).map(([platform, config]) => (
                    <TabsTrigger key={platform} value={platform} className="rounded-xl flex items-center gap-2">
                      <PlatformIcon platform={platform as any} size="sm" />
                      <span className="hidden sm:inline">{config.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(platformConfigs).map(([platform, config]) => (
                  <TabsContent key={platform} value={platform} className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <PlatformIcon platform={platform as any} />
                          {config.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{config.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {authStatus[platform] === true && (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle className="h-5 w-5 mr-1" />
                            <span className="text-sm font-medium">Connected</span>
                          </div>
                        )}
                        {authStatus[platform] === false && (
                          <div className="flex items-center text-red-600 dark:text-red-400">
                            <AlertCircle className="h-5 w-5 mr-1" />
                            <span className="text-sm font-medium">Failed</span>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => window.open(config.docs, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Docs
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {config.fields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={`${platform}-${field.key}`} className="text-sm font-medium">
                            {field.label}
                          </Label>
                          <Input
                            id={`${platform}-${field.key}`}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={configs[platform][field.key as keyof AuthConfig] || ""}
                            onChange={(e) => handleConfigChange(platform, field.key, e.target.value)}
                            className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleAuthenticate(platform)}
                        disabled={loading === platform || authStatus[platform] === true}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl px-8"
                      >
                        {loading === platform ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : authStatus[platform] === true ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Connected
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>

                    {platform === "whatsapp" && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-4">
                        <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                          WhatsApp Business API Setup
                        </h4>
                        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                          <li>• You need a verified WhatsApp Business account</li>
                          <li>• Access token from Facebook Developer Console</li>
                          <li>• Phone number must be registered with WhatsApp Business API</li>
                          <li>• Webhook URL required for real-time messages</li>
                        </ul>
                      </div>
                    )}

                    {platform === "telegram" && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl p-4">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Telegram Bot Setup</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• Message @BotFather on Telegram to create a new bot</li>
                          <li>• Use /newbot command and follow the instructions</li>
                          <li>• Copy the bot token provided by BotFather</li>
                          <li>• Users must start a conversation with your bot first</li>
                        </ul>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
