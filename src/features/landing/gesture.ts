import { WHEEL_FIRE_PX } from "./motion";

const SILENCE_MS = 140;

const REPUSH_RATIO = 1.18;
const REPUSH_FLOOR = 14;

export interface GestureReader {
  read(event: WheelEvent, now: number): -1 | 0 | 1;
  disarm(): void;
  reset(): void;
}

export function createGestureReader(): GestureReader {
  let accumulated = 0;
  let armed = true;
  let lastMagnitude = 0;
  let lastTime = 0;

  return {
    read(event, now) {
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      const magnitude = Math.abs(delta);

      const quiet = now - lastTime > SILENCE_MS;
      const repush =
        magnitude > lastMagnitude * REPUSH_RATIO && magnitude > REPUSH_FLOOR;

      if (quiet) {
        accumulated = 0;
        armed = true;
      } else if (!armed && repush) {
        accumulated = 0;
        armed = true;
      }

      lastTime = now;
      lastMagnitude = magnitude;

      if (!armed) return 0;

      accumulated += delta;
      if (Math.abs(accumulated) < WHEEL_FIRE_PX) return 0;

      const direction = accumulated > 0 ? 1 : -1;
      accumulated = 0;
      armed = false;
      return direction;
    },

    disarm() {
      accumulated = 0;
      armed = false;
    },

    reset() {
      accumulated = 0;
      armed = true;
      lastMagnitude = 0;
      lastTime = 0;
    },
  };
}
