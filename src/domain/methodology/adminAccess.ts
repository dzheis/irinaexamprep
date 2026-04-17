/** Admin user receives full methodology catalog access (resolved in application layer with Storyblok). */
export function isMethodologyAdminEmail(userEmail: string, adminEmailNormalized: string): boolean {
  return adminEmailNormalized !== "" && userEmail.trim().toLowerCase() === adminEmailNormalized;
}
