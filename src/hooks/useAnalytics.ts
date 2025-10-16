import { useCallback } from 'react';

// Custom hook for tracking analytics events across the website
export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'engagement',
        event_label: window.location.pathname,
        value: 1,
        ...parameters
      });
    }
  }, []);

  const trackPageView = useCallback((pageName: string, additionalData?: Record<string, any>) => {
    trackEvent(`${pageName}_page_view`, additionalData);
  }, [trackEvent]);

  const trackUserAction = useCallback((action: string, category: string, label?: string, value?: number) => {
    trackEvent(action, {
      event_category: category,
      event_label: label,
      value: value || 1
    });
  }, [trackEvent]);

  const trackProblemSolved = useCallback((problemId: string, difficulty: string, timeSpent: number) => {
    trackEvent('problem_solved', {
      problem_id: problemId,
      difficulty: difficulty,
      time_spent: timeSpent,
      event_category: 'problems'
    });
  }, [trackEvent]);

  const trackQuizCompleted = useCallback((quizId: string, score: number, totalQuestions: number) => {
    trackEvent('quiz_completed', {
      quiz_id: quizId,
      score: score,
      total_questions: totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      event_category: 'quiz'
    });
  }, [trackEvent]);

  const trackResumeDownloaded = useCallback((template: string, format: string) => {
    trackEvent('resume_downloaded', {
      template: template,
      format: format,
      event_category: 'resume'
    });
  }, [trackEvent]);

  const trackResumeAnalyzed = useCallback((analysisType: string, score: number) => {
    trackEvent('resume_analyzed', {
      analysis_type: analysisType,
      score: score,
      event_category: 'resume'
    });
  }, [trackEvent]);

  const trackUserSignup = useCallback((method: string, profile: string) => {
    trackEvent('user_signup', {
      signup_method: method,
      user_profile: profile,
      event_category: 'user'
    });
  }, [trackEvent]);

  const trackUserSignin = useCallback((method: string) => {
    trackEvent('user_signin', {
      signin_method: method,
      event_category: 'user'
    });
  }, [trackEvent]);

  const trackCommunityPost = useCallback((postType: string, tags: string[]) => {
    trackEvent('community_post_created', {
      post_type: postType,
      tags: tags.join(','),
      event_category: 'community'
    });
  }, [trackEvent]);

  const trackPrepPlanStarted = useCallback((planId: string, planType: string) => {
    trackEvent('prep_plan_started', {
      plan_id: planId,
      plan_type: planType,
      event_category: 'prep_plans'
    });
  }, [trackEvent]);

  const trackSystemDesignCompleted = useCallback((scenarioId: string, timeSpent: number) => {
    trackEvent('system_design_completed', {
      scenario_id: scenarioId,
      time_spent: timeSpent,
      event_category: 'system_design'
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackProblemSolved,
    trackQuizCompleted,
    trackResumeDownloaded,
    trackResumeAnalyzed,
    trackUserSignup,
    trackUserSignin,
    trackCommunityPost,
    trackPrepPlanStarted,
    trackSystemDesignCompleted
  };
};
