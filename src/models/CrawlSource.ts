import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRejectionCount {
  reason: string;
  count: number;
}

export interface ICrawlSource extends Document {
  name: string;
  baseUrl: string;
  country: string;
  category: string;
  enabled: boolean;
  maxPages: number;
  maxDepth: number;
  crawlInterval: number;
  lastCrawledAt: Date;
  nextCrawlAt: Date;
  crawlStatus: string;
  crawlCycleStartedAt: Date;
  lastActivityAt: Date;
  pagesCrawled: number;
  foundersDiscovered: number;
  founderCandidates: number;
  companiesDiscovered: number;
  relationshipsCreated: number;
  relationshipsRejected: number;
  rejectionCounts: IRejectionCount[];
  errorCount: number;
  crawlErrors: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CrawlSourceSchema = new Schema<ICrawlSource>(
  {
    name: { type: String, required: true, trim: true },
    baseUrl: { type: String, required: true, unique: true, trim: true },
    country: { type: String, default: "Africa", index: true },
    category: { type: String, default: "Startup News", index: true },
    enabled: { type: Boolean, default: true },
    maxPages: { type: Number, default: 1000 },
    maxDepth: { type: Number, default: 8 },
    crawlInterval: { type: Number, default: 24 * 60 * 60 * 1000 },
    lastCrawledAt: { type: Date },
    nextCrawlAt: { type: Date },
    crawlStatus: { type: String, enum: ["idle", "crawling", "error"], default: "idle" },
    crawlCycleStartedAt: { type: Date },
    lastActivityAt: { type: Date },
    pagesCrawled: { type: Number, default: 0 },
    foundersDiscovered: { type: Number, default: 0 },
    founderCandidates: { type: Number, default: 0 },
    companiesDiscovered: { type: Number, default: 0 },
    relationshipsCreated: { type: Number, default: 0 },
    relationshipsRejected: { type: Number, default: 0 },
    rejectionCounts: [
      {
        _id: false,
        reason: { type: String },
        count: { type: Number, default: 0 },
      },
    ],
    errorCount: { type: Number, default: 0 },
    crawlErrors: [{ type: String }],
  },
  { timestamps: true }
);

CrawlSourceSchema.index({ enabled: 1 });
CrawlSourceSchema.index({ enabled: 1, nextCrawlAt: 1 });
CrawlSourceSchema.index({ crawlStatus: 1 });

const CrawlSource: Model<ICrawlSource> =
  mongoose.models.CrawlSource ||
  mongoose.model<ICrawlSource>("CrawlSource", CrawlSourceSchema);

export default CrawlSource;
