export function isModulePurchased(purchasedModuleIds: string[], moduleId: string): boolean {
  return purchasedModuleIds.includes(moduleId);
}

export function canOpenPaymentModal(params: {
  isAuthed: boolean;
  purchasedModuleIds: string[];
  moduleId: string;
}): boolean {
  if (isModulePurchased(params.purchasedModuleIds, params.moduleId)) return false;
  return params.isAuthed;
}
