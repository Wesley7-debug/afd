import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICrawlProgress extends Document {
  sourceId: mongoose.Types.ObjectId;
  visitedUrls: string[];
  queue: Array<{
    url: string;
    depth: number;
    priority: number;
    reason: string;
  }>;
  pagesCrawled: number;
  pagesSkipped: number;
  foundersFound: number;
  newFounders: number;
  updatedFounders: number;
  duplicatesFound: number;
  fundingPagesFound: number;
  hiringPagesFound: number;
  founderProfilesFound: number;
  companiesDiscovered: number;
  countriesDiscovered: string[];
  errors: string[];
  lastSavedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QueueEntrySchema = new Schema(
  {
    url: { type: String, required: true },
    depth: { type: Number, required: true },
    priority: { type: Number, required: true },
    reason: { type: String, default: "" },
  },
  { _id: false }
);

const CrawlProgressSchema = new Schema<ICrawlProgress>(
  {
    sourceId: {
      type: Schema.Types.ObjectId,
      ref: "CrawlSource",
      required: true,
      unique: true,
    },
    visitedUrls: [{ type: String }],
    queue: [QueueEntrySchema],
    pagesCrawled: { type: Number, default: 0 },
    pagesSkipped: { type: Number, default: 0 },
    foundersFound: { type: Number, default: 0 },
    newFounders: { type: Number, default: 0 },
    updatedFounders: { type: Number, default: 0 },
    duplicatesFound: { type: Number, default: 0 },
    fundingPagesFound: { type: Number, default: 0 },
    hiringPagesFound: { type: Number, default: 0 },
    founderProfilesFound: { type: Number, default: 0 },
    companiesDiscovered: { type: Number, default: 0 },
    countriesDiscovered: [{ type: String }],
    errors: [{ type: String }],
    lastSavedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CrawlProgressSchema.index({ sourceId: 1 });

const CrawlProgress: Model<ICrawlProgress> =
  mongoose.models.CrawlProgress ||
  mongoose.model<ICrawlProgress>("CrawlProgress", CrawlProgressSchema);

export default CrawlProgress;
