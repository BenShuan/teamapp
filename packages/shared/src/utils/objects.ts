export const fullName = (object: { firstName?: string; lastName?: string }) => {
  return `${object.firstName || ""} ${object.lastName || ""}`.trim();
};
export const isEmptyObject = (obj: Record<string, unknown>) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}