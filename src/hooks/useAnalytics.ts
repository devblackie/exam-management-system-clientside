// src/hooks/useAnalytics.ts
import { track, trackEmailGateShown, trackEmailSubmitted, trackScreenSwitch, trackCMSDownload, trackTalkToTeam, trackGetStarted, trackSignupFormViewed, trackSignupFormSubmitted } from "@/lib/analytics";

export function useAnalytics() {
  return {
    track,
    trackEmailGateShown,
    trackEmailSubmitted,
    trackScreenSwitch,
    trackCMSDownload,
    trackTalkToTeam,
    trackGetStarted,
    trackSignupFormViewed,
    trackSignupFormSubmitted,
  };
}