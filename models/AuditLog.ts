import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ip: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId },
    actorName: { type: String, default: "system" },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    details: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
  },
  { collection: "audit_logs", timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, createdAt: -1 });

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
