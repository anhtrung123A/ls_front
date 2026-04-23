export const ROLE_ID_NAME_MAP: Record<number, string> = {
  1: "Admin",
  2: "Branch Manager",
  3: "Operator",
  4: "Teacher",
  5: "Student",
  6: "Parent",
};

export function getRoleDisplayName(roleId?: number | null) {
  if (!roleId) {
    return "Unknown role";
  }

  const rawRole = ROLE_ID_NAME_MAP[roleId];
  if (!rawRole) {
    return "Unknown role";
  }

  return rawRole
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

