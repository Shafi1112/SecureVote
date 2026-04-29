import AuditLog from "../models/AuditLog.js";

export const writeAuditLog = async ({ admin, action, entity, entityId, metadata = {} }) => {
  await AuditLog.create({ admin, action, entity, entityId, metadata });
};
