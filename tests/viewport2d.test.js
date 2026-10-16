import test from 'node:test';
import assert from 'node:assert/strict';
import { fitViewport, zoomViewport, MIN_ZOOM, MAX_ZOOM } from '../src/ui/viewport2d.js';

const bounds = { x: -500, y: -80, width: 1000, height: 400 };

test('fit includes the whole diagram at the viewport aspect ratio', () => {
  for (const [width, height] of [[800, 600], [360, 700], [1400, 400]]) {
    const fit = fitViewport(bounds, width, height);
    assert.ok(fit.x <= bounds.x && fit.y <= bounds.y);
    assert.ok(fit.x + fit.width >= bounds.x + bounds.width);
    assert.ok(fit.y + fit.height >= bounds.y + bounds.height);
    assert.ok(Math.abs(fit.width / fit.height - width / height) < 1e-10);
  }
});

test('zooming back out restores the same position and size', () => {
  const fit = fitViewport(bounds, 800, 600);
  const zoomed = zoomViewport(fit, fit, 1.25);
  assert.ok(zoomed.width < fit.width);
  assert.deepEqual(zoomViewport(zoomed, fit, 1 / 1.25), fit);
});

test('wheel zoom preserves the world point under the pointer', () => {
  const fit = fitViewport(bounds, 800, 600);
  const anchor = { x: .17, y: .83 };
  const next = zoomViewport(fit, fit, 2, anchor);
  assert.equal(next.x + next.width * anchor.x, fit.x + fit.width * anchor.x);
  assert.equal(next.y + next.height * anchor.y, fit.y + fit.height * anchor.y);
});

test('zoom is bounded without changing the viewport aspect ratio', () => {
  const fit = fitViewport(bounds, 800, 600);
  const max = zoomViewport(fit, fit, 1e6);
  const min = zoomViewport(max, fit, 1e-12);
  assert.equal(fit.width / max.width, MAX_ZOOM);
  assert.equal(fit.width / min.width, MIN_ZOOM);
  assert.equal(max.width / max.height, fit.width / fit.height);
});
