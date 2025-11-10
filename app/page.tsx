"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { OnboardingScreen } from "@/components/onboarding-screen"
import { useLocalStorage } from "@/hooks/use-local-storage"

export default function Home() {
  const router = useRouter()
  const [hasCompletedOnboarding] = useLocalStorage("onecell_onboarding_complete", false)

  useEffect(() => {
    if (hasCompletedOnboarding) {
      router.push("/inbox")
    }
  }, [hasCompletedOnboarding, router])

  return <OnboardingScreen />
}
