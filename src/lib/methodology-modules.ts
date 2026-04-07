export const METHODOLOGY_MODULES: { id: string; videoId: string }[] = [
  { id: "1", videoId: "66AD0i00RXs" },
];

export function getVideoIdByModuleId(moduleId: string): string | null {
  const m = METHODOLOGY_MODULES.find((x) => x.id === moduleId);
  return m?.videoId ?? null;
}
