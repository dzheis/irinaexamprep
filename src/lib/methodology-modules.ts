/** Список модулей методики: id и video_id для проверки доступа и embed. */
export const METHODOLOGY_MODULES: { id: string; videoId: string }[] = [
  { id: '1', videoId: 'dQw4w9WgXcQ' },
  { id: '2', videoId: 'dQw4w9WgXcQ' },
  { id: '3', videoId: 'dQw4w9WgXcQ' },
];

export function getVideoIdByModuleId(moduleId: string): string | null {
  const m = METHODOLOGY_MODULES.find((x) => x.id === moduleId);
  return m?.videoId ?? null;
}
