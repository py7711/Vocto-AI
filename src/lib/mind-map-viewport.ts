type MindMapFitInput = {
  contentWidth: number;
  contentHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  padding: number;
};

export function calculateMindMapFitZoom({
  contentWidth,
  contentHeight,
  viewportWidth,
  viewportHeight,
  padding
}: MindMapFitInput) {
  const availableWidth = Math.max(1, viewportWidth - padding * 2);
  const availableHeight = Math.max(1, viewportHeight - padding * 2);
  const fit = Math.min(availableWidth / Math.max(1, contentWidth), availableHeight / Math.max(1, contentHeight));
  return Math.max(0.2, Math.min(1.15, Number(fit.toFixed(2))));
}
