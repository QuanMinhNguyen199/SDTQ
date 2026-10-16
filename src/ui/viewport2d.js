export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 8;

export function fitViewport(bounds, width, height) {
  const aspect = Math.max(1, width) / Math.max(1, height);
  const w = Math.max(bounds.width, bounds.height * aspect);
  const h = w / aspect;
  return { x: bounds.x + (bounds.width - w) / 2, y: bounds.y + (bounds.height - h) / 2, width: w, height: h };
}

// Keep the world coordinate under the pointer fixed while changing scale.
export function zoomViewport(view, fit, factor, anchor = { x: 0.5, y: 0.5 }) {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, fit.width / view.width * factor));
  const width = fit.width / zoom;
  const height = fit.height / zoom;
  return { x: view.x + (view.width - width) * anchor.x, y: view.y + (view.height - height) * anchor.y, width, height };
}
