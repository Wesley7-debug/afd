import mongoose, { Schema, Document, Model } from "mongoose";
import { generateSlug, normalizeFounderName } from "@/lib/utils";

export interface IFounder extends Document {
  name: string;
  normalizedName: string;
  slug: string;
  role: string;
  bio: string;
  location: string;
  country: string;
  industry: string;
  profileImageUrl: string;
  avatarUrl: string;
  xUrl: string;
  xHandle: string;
  linkedinUrl: string;
  personalWebsiteUrl: string;
  companyXUrl: string;
  companyLinkedinUrl: string;
  companyWebsiteUrl: string;
  companies: mongoose.Types.ObjectId[];
  companySlug: string;
  companyLogoUrl: string;
  teamSize: number;
  isHiring: boolean;
  foundedYear: number;
  oneLiner: string;
  batch: string;
  isVerified: boolean;
  discoveredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lastVerifiedAt: Date;
}

const FounderSchema = new Schema<IFounder>(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    role: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "", index: true },
    country: { type: String, default: "Nigeria", index: true },
    industry: { type: String, default: "", index: true },
    profileImageUrl: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    xUrl: { type: String, default: "" },
    xHandle: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    personalWebsiteUrl: { type: String, default: "" },
    companyXUrl: { type: String, default: "" },
    companyLinkedinUrl: { type: String, default: "" },
    companyWebsiteUrl: { type: String, default: "" },
    companies: [{ type: Schema.Types.ObjectId, ref: "Company" }],
    companySlug: { type: String, default: "" },
    companyLogoUrl: { type: String, default: "" },
    teamSize: { type: Number, default: 0 },
    isHiring: { type: Boolean, default: false },
    foundedYear: { type: Number, default: 0 },
    oneLiner: { type: String, default: "" },
    batch: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    discoveredAt: { type: Date, default: Date.now },
    lastVerifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

FounderSchema.index({ name: "text", industry: "text", location: "text", bio: "text" });
FounderSchema.index({ companies: 1 });
FounderSchema.index({ xHandle: 1 });

FounderSchema.pre("save", function () {
  if (this.isNew || this.isModified("name")) {
    this.normalizedName = normalizeFounderName(this.name);
  }
  if (this.isNew || this.isModified("name")) {
    this.slug = generateSlug(this.name);
  }
  if (this.xUrl && !this.xHandle) {
    const match = this.xUrl.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/);
    if (match) this.xHandle = match[1];
  }
});

const Founder: Model<IFounder> =
  mongoose.models.Founder || mongoose.model<IFounder>("Founder", FounderSchema);

export default Founder;
