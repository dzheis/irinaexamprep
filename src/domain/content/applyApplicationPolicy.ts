/** Names on course application: letters, spaces, hyphen, apostrophe (same as previous API rule). */
export const APPLY_NAME_TEXT_ONLY_PATTERN = /^[a-zA-Zа-яА-ЯёЁ\s\-']*$/;

export function isApplyNameTextOnly(value: string): boolean {
  return APPLY_NAME_TEXT_ONLY_PATTERN.test(value.trim());
}
