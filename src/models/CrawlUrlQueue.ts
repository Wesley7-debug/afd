import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICrawlUrlQueue extends Document {
  url: string;
  sourceId: mongoose.Types.ObjectId;
  depth: number;
  priority: number;
  status: "queued" | "crawling" | "completed" | "failed";
  attempts: number;
  reason: string;
  lastAttemptAt: Date;
  nextAttemptAt: Date;
  discoveredAt: Date;
  completedAt: Date;
  errorMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

const CrawlUrlQueueSchema = new Schema<ICrawlUrlQueue>(
  {
    url: { type: String, required: true, unique: true, trim: true },
    sourceId: { type: Schema.Types.ObjectId, ref: "CrawlSource", required: true, index: true },
    depth: { type: Number, default: 0 },
    priority: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["queued", "crawling", "completed", "failed"],
      default: "queued",
      index: true,
    },
    attempts: { type: Number, default: 0 },
    reason: { type: String, default: "" },
    lastAttemptAt: { type: Date },
    nextAttemptAt: { type: Date, default: () => new Date() },
    discoveredAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

CrawlUrlQueueSchema.index({ status: 1, nextAttemptAt: 1, priority: -1, discoveredAt: 1 });
CrawlUrlQueueSchema.index({ sourceId: 1, status: 1 });
CrawlUrlQueueSchema.index({ sourceId: 1, status: 1, completedAt: 1 });

const CrawlUrlQueue: Model<ICrawlUrlQueue> =
  mongoose.models.CrawlUrlQueue ||
  mongoose.model<ICrawlUrlQueue>("CrawlUrlQueue", CrawlUrlQueueSchema);

export default CrawlUrlQueue;
