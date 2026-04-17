/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account from "../account.js";
import type * as admin from "../admin.js";
import type * as analytics from "../analytics.js";
import type * as certificates from "../certificates.js";
import type * as clickEvents from "../clickEvents.js";
import type * as contactMessages from "../contactMessages.js";
import type * as crons from "../crons.js";
import type * as demoCacheHelpers from "../demoCacheHelpers.js";
import type * as demoGenerator from "../demoGenerator.js";
import type * as demos from "../demos.js";
import type * as educationEntries from "../educationEntries.js";
import type * as emails from "../emails.js";
import type * as github from "../github.js";
import type * as http from "../http.js";
import type * as notifications from "../notifications.js";
import type * as onboarding from "../onboarding.js";
import type * as planLimits from "../planLimits.js";
import type * as portfolioSections from "../portfolioSections.js";
import type * as portfolios from "../portfolios.js";
import type * as profiles from "../profiles.js";
import type * as referrals from "../referrals.js";
import type * as resumeParser from "../resumeParser.js";
import type * as resumes from "../resumes.js";
import type * as scheduler from "../scheduler.js";
import type * as seedDemoTemplates from "../seedDemoTemplates.js";
import type * as skills from "../skills.js";
import type * as stripeActions from "../stripeActions.js";
import type * as stripeHelpers from "../stripeHelpers.js";
import type * as subscriptions from "../subscriptions.js";
import type * as teams from "../teams.js";
import type * as users from "../users.js";
import type * as volunteering from "../volunteering.js";
import type * as webhookHelpers from "../webhookHelpers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  account: typeof account;
  admin: typeof admin;
  analytics: typeof analytics;
  certificates: typeof certificates;
  clickEvents: typeof clickEvents;
  contactMessages: typeof contactMessages;
  crons: typeof crons;
  demoCacheHelpers: typeof demoCacheHelpers;
  demoGenerator: typeof demoGenerator;
  demos: typeof demos;
  educationEntries: typeof educationEntries;
  emails: typeof emails;
  github: typeof github;
  http: typeof http;
  notifications: typeof notifications;
  onboarding: typeof onboarding;
  planLimits: typeof planLimits;
  portfolioSections: typeof portfolioSections;
  portfolios: typeof portfolios;
  profiles: typeof profiles;
  referrals: typeof referrals;
  resumeParser: typeof resumeParser;
  resumes: typeof resumes;
  scheduler: typeof scheduler;
  seedDemoTemplates: typeof seedDemoTemplates;
  skills: typeof skills;
  stripeActions: typeof stripeActions;
  stripeHelpers: typeof stripeHelpers;
  subscriptions: typeof subscriptions;
  teams: typeof teams;
  users: typeof users;
  volunteering: typeof volunteering;
  webhookHelpers: typeof webhookHelpers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
