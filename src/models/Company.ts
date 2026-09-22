import mongoose, { Schema, Document, Model } from "mongoose";
import { generateSlug, normalizeCompanyName } from "@/lib/utils";

export interface ICompany extends Document {
  name: string;
  normalizedName: string;
  slug: string;
  description: string;
  oneLiner: string;
  websiteUrl: string;
  logoUrl: string;
  industry: string;
  location: string;
  country: string;
  foundedYear: number;
  teamSize: number;
  isHiring: boolean | null;
  hiringEvidence: string;
  batch: string;
  tags: string[];
  workMode: string;
  productForm: string;
  isAiNative: boolean;
  hiresBeyondFounders: boolean;
  founders: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    oneLiner: { type: String, default: "" },
    websiteUrl: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    industry: { type: String, default: "", index: true },
    location: { type: String, default: "", index: true },
    country: { type: String, default: "Nigeria", index: true },
    foundedYear: { type: Number, default: 0 },
    teamSize: { type: Number, default: 0 },
    isHiring: { type: Boolean, default: null },
    hiringEvidence: { type: String, default: "" },
    batch: { type: String, default: "" },
    tags: [{ type: String }],
    workMode: { type: String, default: "" },
    productForm: { type: String, default: "" },
    isAiNative: { type: Boolean, default: false },
    hiresBeyondFounders: { type: Boolean, default: false },
    founders: [{ type: Schema.Types.ObjectId, ref: "Founder" }],
  },
  { timestamps: true }
);

CompanySchema.index({ name: "text", description: "text", industry: "text" });
CompanySchema.index({ founders: 1 });
CompanySchema.index({ tags: 1 });

CompanySchema.pre("save", function () {
  if (this.isNew || this.isModified("name")) {
    this.normalizedName = normalizeCompanyName(this.name);
  }
  if (this.isNew || this.isModified("name")) {
    this.slug = generateSlug(this.name);
  }
});

const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);

export default Company;
