export const USER_ROLE = {
  contributor: "contributor",
  admin: "admin",
  maintainer: "maintainer",
  user: "user",
} as const;

export type ROLES = "contributor" | "admin" | "maintainer" | "user";
