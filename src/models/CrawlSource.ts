import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICrawlSource extends Document {
  name: string;
  baseUrl: string;
  country: string;
  category: string;
  enabled: boolean;
  maxPages: number;
  maxDepth: number;
  lastCrawledAt: Date;
  nextCrawlAt: Date;
  crawlStatus: string;
  pagesCrawled: number;
  foundersDiscovered: number;
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
    lastCrawledAt: { type: Date },
    nextCrawlAt: { type: Date },
    crawlStatus: { type: String, enum: ["idle", "crawling", "error"], default: "idle" },
    pagesCrawled: { type: Number, default: 0 },
    foundersDiscovered: { type: Number, default: 0 },
    crawlErrors: [{ type: String }],
  },
  { timestamps: true }
);

CrawlSourceSchema.index({ enabled: 1 });

const CrawlSource: Model<ICrawlSource> =
  mongoose.models.CrawlSource ||
  mongoose.model<ICrawlSource>("CrawlSource", CrawlSourceSchema);

export default CrawlSource;
