import "./runtimeShim";
import "./trendCanvasPC";

export function createTrendGroup(canvasId) {
  return new window.defaultTrendGroup(canvasId);
}
