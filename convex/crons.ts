import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for expiring trials once a day at 9 AM UTC
crons.daily(
  "send-trial-expiring-reminders",
  { hourUTC: 9, minuteUTC: 0 },
  internal.scheduler.sendTrialExpiringEmails,
  {}
);

// Process drip campaign emails daily at 10 AM UTC
crons.daily(
  "process-drip-campaign",
  { hourUTC: 10, minuteUTC: 0 },
  internal.scheduler.processDripCampaign,
  {}
);

// Clean up old profile views (>90 days) daily at 3 AM UTC
crons.daily(
  "cleanup-old-profile-views",
  { hourUTC: 3, minuteUTC: 0 },
  internal.scheduler.cleanupOldProfileViews,
  {}
);

// Clean up processed webhook events (>30 days) daily at 3:30 AM UTC
crons.daily(
  "cleanup-old-webhook-events",
  { hourUTC: 3, minuteUTC: 30 },
  internal.scheduler.cleanupOldWebhookEvents,
  {}
);

// Clean up old read notifications (>30 days) daily at 4 AM UTC
crons.daily(
  "cleanup-old-notifications",
  { hourUTC: 4, minuteUTC: 0 },
  internal.notifications.cleanupOld,
  {}
);

export default crons;
