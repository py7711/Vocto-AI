export type TranscriptSegment = {start: number; end: number; text: string; speaker?: string};

export type Task = {
  id: string;
  status: string;
  statusMessage?: string | null;
  progress: number;
  provider?: string | null;
  language?: string | null;
  detectedLanguage?: string | null;
  originalName?: string | null;
  sourceType?: string | null;
  sourceUrl?: string | null;
  normalizedUrl?: string | null;
  objectKey?: string | null;
  folderId?: string | null;
  folder?: FolderItem | null;
  durationSeconds?: number | null;
  speakerCount?: number | null;
  createdAt?: string | null;
  transcript?: {
    editedText: string;
    summary?: any | null;
    mindMap?: any | null;
    translations?: Record<string, any> | null;
    summaryGenerationCount?: number;
    segments: TranscriptSegment[];
  } | null;
  shareLinks?: Array<{id: string; url?: string | null; title?: string | null; enabled?: boolean; expiresAt?: string | null; accessCount?: number; lastAccessAt?: string | null; createdAt: string}>;
  currentUserRating?: {rating: number; updatedAt?: string; userId?: string} | null;
  ratingSummary?: {average: number | null; count: number};
  mediaAssets?: MediaAsset[];
  viewer?: {isMember: boolean};
};

export function mergeTaskSnapshot(current: Task | null, updated: Task): Task {
  if (!current || current.id !== updated.id) return updated;
  return {
    ...current,
    ...updated,
    transcript: updated.transcript !== undefined ? updated.transcript : current.transcript,
    shareLinks: updated.shareLinks !== undefined ? updated.shareLinks : current.shareLinks,
    currentUserRating: updated.currentUserRating !== undefined ? updated.currentUserRating : current.currentUserRating,
    ratingSummary: updated.ratingSummary !== undefined ? updated.ratingSummary : current.ratingSummary,
    mediaAssets: updated.mediaAssets !== undefined ? updated.mediaAssets : current.mediaAssets,
    folder: updated.folder !== undefined ? updated.folder : current.folder,
    viewer: updated.viewer !== undefined ? updated.viewer : current.viewer
  };
}

export type TaskListItem = {
  id: string;
  sourceType?: string | null;
  folderId?: string | null;
  folder?: FolderItem | null;
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
  shareLinks?: Array<{id: string; url?: string | null; title?: string | null; enabled?: boolean; expiresAt?: string | null; accessCount?: number; lastAccessAt?: string | null; createdAt: string}>;
  mediaAssets?: MediaAsset[];
};

type MediaAsset = {
  id: string;
  kind: "SOURCE_MEDIA" | "NORMALIZED_AUDIO" | "AUDIO_CHUNK";
  url: string;
  objectKey?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  sizeBytes?: number | string | null;
  durationSeconds?: number | null;
  startSeconds?: number | null;
  endSeconds?: number | null;
  chunkIndex?: number | null;
  createdAt?: string;
};

export type InputMode = "upload" | "youtube" | "record" | "drive";
export type AssetView = "transcripts" | "translations";

export type FolderItem = {
  id: string;
  name: string;
  position: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: {mediaTasks: number};
};

export type CurrentUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string;
  passwordSet?: boolean;
  oauthAccounts?: Array<{provider: string; email?: string | null; avatarUrl?: string | null}>;
  dailyFreeCount?: number;
  dailyResetAt?: string | null;
  subscriptions?: Array<{
    plan: string;
    status?: string;
    remainingMinutes: number;
    monthlyMinuteQuota: number;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    stripeSubscriptionId?: string | null;
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
  billing?: {
    hasPurchasedMembership: boolean;
  };
};
