import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICrawlJob extends Document {
  sourceId: mongoose.Types.ObjectId;
  status: string;
  startedAt: Date;
  completedAt: Date;
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
  crawlErrors: string[];
  errorMessage: string;
  createdAt: Date;
}

const CrawlJobSchema = new Schema<ICrawlJob>(
  {
    sourceId: { type: Schema.Types.ObjectId, ref: "CrawlSource", required: true },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued",
      index: true,
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
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
    crawlErrors: [{ type: String }],
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

CrawlJobSchema.index({ sourceId: 1, status: 1 });
CrawlJobSchema.index({ createdAt: -1 });

const CrawlJob: Model<ICrawlJob> =
  mongoose.models.CrawlJob || mongoose.model<ICrawlJob>("CrawlJob", CrawlJobSchema);

export default CrawlJob;
