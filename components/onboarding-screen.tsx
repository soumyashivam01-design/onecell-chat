"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { PlatformIcon } from "@/components/platform-icon"
import { ArrowRight, Shield, Bell, Search, Sparkles } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const [, setOnboardingComplete] = useLocalStorage("onecell_onboarding_complete", false)

  const steps = [
    {
      title: "Welcome to OneCell",
      description:
        "Your unified hub for all social media conversations. Experience seamless messaging like never before.",
      icon: (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse" />
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
      ),
    },
    {
      title: "Connect Your World",
      description: "Link all your messaging platforms to see every conversation in one beautiful interface.",
      icon: (
        <div className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
          <PlatformIcon platform="whatsapp" size="lg" />
          <PlatformIcon platform="instagram" size="lg" />
          <PlatformIcon platform="telegram" size="lg" />
          <PlatformIcon platform="messenger" size="lg" />
        </div>
      ),
    },
    {
      title: "Military-Grade Security",
      description: "Your conversations are protected with end-to-end encryption. Privacy is our priority.",
      icon: (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full blur-lg opacity-30" />
          <div className="relative bg-gradient-to-r from-green-400 to-emerald-600 p-4 rounded-full">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
      ),
    },
    {
      title: "Never Miss a Beat",
      description: "Smart notifications keep you connected across all platforms without overwhelming you.",
      icon: (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-lg opacity-30" />
          <div className="relative bg-gradient-to-r from-amber-400 to-orange-500 p-4 rounded-full">
            <Bell className="h-8 w-8 text-white" />
          </div>
        </div>
      ),
    },
    {
      title: "Find Everything Instantly",
      description: "Advanced search with AI-powered indexing helps you find any message across all platforms.",
      icon: (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-30" />
          <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
            <Search className="h-8 w-8 text-white" />
          </div>
        </div>
      ),
    },
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setOnboardingComplete(true)
      router.push("/inbox")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-8 flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <div className="mb-8">{steps[step].icon}</div>
                <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {steps[step].title}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">{steps[step].description}</p>
              </motion.div>
            </AnimatePresence>

            <div className="w-full">
              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl h-14 text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
                {step < steps.length - 1 ? "Continue" : "Enter OneCell"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex mt-10 gap-2">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-2 rounded-full ${
                    i === step ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                  animate={{
                    width: i === step ? 32 : 8,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
