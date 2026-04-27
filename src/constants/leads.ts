export const LEAD_SOURCE_LABELS: Record<number, string> = {
  1: "Facebook",
  2: "Zalo",
  3: "Referral",
};

export const LEAD_STATUS_LABELS: Record<number, string> = {
  1: "New",
  2: "Consulting",
  3: "Tested",
  4: "Converted",
  5: "Failed",
};

export function getLeadSourceLabel(source?: number | null) {
  if (!source) {
    return "unknown";
  }
  return LEAD_SOURCE_LABELS[source] ?? "unknown";
}

export function getLeadStatusLabel(status?: number | null) {
  if (!status) {
    return "unknown";
  }
  return LEAD_STATUS_LABELS[status] ?? "unknown";
}
