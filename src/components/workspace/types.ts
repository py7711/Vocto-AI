export type TranscriptSegment = {start: number; end: number; text: string; speaker?: string};

export type Task = {
  id: string;
  status: string;
  statusMessage?: string | null;
  progress: number;
  provider?: string | null;
  detectedLanguage?: string | null;
  originalName?: string | null;
  sourceType?: string | null;
  createdAt?: string | null;
  transcript?: {
    plainText: string;
    editedText?: string | null;
    segments: TranscriptSegment[];
  } | null;
  insights?: Array<{type: string; content: any; createdAt?: string; updatedAt?: string}>;
};

export type TaskListItem = {
  id: string;
  sourceType?: string | null;
  originalName?: string | null;
  status: string;
  statusMessage?: string | null;
  progress: number;
  provider?: string | null;
  durationSeconds?: number | null;
  speakerCount?: number | null;
  createdAt?: string | null;
  completedAt?: string | null;
  transcript?: {id: string} | null;
  insights?: Array<{type: string; content?: any; createdAt?: string; updatedAt?: string}>;
  shareLinks?: Array<{id: string; createdAt: string}>;
};

export type InputMode = "upload" | "youtube" | "record";
export type AssetView = "transcripts" | "translations";

export type CurrentUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  dailyFreeCount?: number;
  dailyResetAt?: string | null;
  subscriptions?: Array<{plan: string; status?: string; remainingMinutes: number; monthlyMinuteQuota: number}>;
};

export type TeamSnapshot = {
  team: {id: string; name: string; defaultLocale: string; retentionDays?: number | null};
  membership: {role: string; status: string};
  members: Array<{
    id: string;
    role: string;
    status: string;
    invitedEmail?: string | null;
    title?: string | null;
    user?: {email: string; name?: string | null; image?: string | null} | null;
  }>;
  apiKeys: Array<{
    id: string;
    name: string;
    keyPrefix: string;
    status: string;
    lastUsedAt?: string | null;
    expiresAt?: string | null;
    createdAt: string;
  }>;
  webhookEndpoints: Array<{
    id: string;
    name: string;
    url: string;
    secretPrefix: string;
    events: string[] | unknown;
    status: string;
    failureCount: number;
    lastDeliveryAt?: string | null;
    createdAt: string;
    deliveries?: Array<{id: string; event: string; status: string; responseStatus?: number | null; durationMs?: number | null; createdAt: string}>;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    targetType: string;
    targetId?: string | null;
    createdAt: string;
    user?: {email: string; name?: string | null} | null;
  }>;
};

export type UsageSnapshot = {
  subscription: {
    id: string;
    plan: string;
    status: string;
    monthlyMinuteQuota: number;
    remainingMinutes: number;
    usedMinutes: number;
    maxSingleFileMinutes: number;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
  };
  dailyFree: {
    used: number;
    limit: number;
    remaining: number;
    resetAt?: string | null;
  };
  tasks: {
    todayCount: number;
    periodCount: number;
    periodDurationSeconds: number;
    periodQuotaMinutes: number;
  };
  ledger: {
    periodMinutesDelta: number;
    entries: Array<{
      id: string;
      type: string;
      minutesDelta: number;
      reason?: string | null;
      createdAt: string;
      mediaTask?: {
        id: string;
        originalName?: string | null;
        sourceType?: string | null;
        status?: string | null;
      } | null;
    }>;
  };
};
