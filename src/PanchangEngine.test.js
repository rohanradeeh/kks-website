import { describe, it, expect } from 'vitest';
import { PanchangEngine } from './App.jsx';

const engine = new PanchangEngine();

describe('PanchangEngine', () => {
  it('is deterministic for the same calendar date', () => {
    const date = new Date(2026, 3, 14);
    const a = engine.getPanchang(date);
    const b = engine.getPanchang(date);
    expect(a).toEqual(b);
  });

  it('returns tithi and nakshatra indices within valid ranges', () => {
    for (let m = 0; m < 12; m++) {
      const date = new Date(2026, m, 10);
      const { tithiIndex, nakshatraIndex } = engine.getPanchang(date);
      expect(tithiIndex).toBeGreaterThanOrEqual(0);
      expect(tithiIndex).toBeLessThan(30);
      expect(nakshatraIndex).toBeGreaterThanOrEqual(0);
      expect(nakshatraIndex).toBeLessThan(27);
    }
  });

  it('returns a Malayalam solar day within 1-31 and a valid month index', () => {
    for (let m = 0; m < 12; m++) {
      const date = new Date(2026, m, 10);
      const { solar } = engine.getPanchang(date);
      expect(solar.day).toBeGreaterThanOrEqual(1);
      expect(solar.day).toBeLessThanOrEqual(31);
      expect(solar.signIndex).toBeGreaterThanOrEqual(0);
      expect(solar.signIndex).toBeLessThanOrEqual(11);
    }
  });

  it('places the Medam transition (Vishu, Malayalam new year) within the April 13-16 window', () => {
    // Vishu / the Malayalam solar new year is a well-established astronomical
    // fact that falls in mid-April every year (it drifts by about a day per
    // ~70 years due to precession, so it can land on the 14th or 15th
    // depending on the year - hence checking a window, not a fixed date).
    // This guards against regressions in the sun-longitude/ayanamsa math,
    // independent of the engine's overall precision (see the in-app
    // disclaimer on the calendar widget: exact festival dates should be
    // verified against an authoritative Panchangam, not this approximation).
    for (const year of [2024, 2025, 2026, 2027]) {
      const monthsInWindow = [13, 14, 15, 16].map((d) => engine.getPanchang(new Date(year, 3, d)).solar.month.en);
      expect(monthsInWindow).toContain('Medam');
    }
  });

  it('getTithiName and getNakshatraName never fall out of bounds', () => {
    for (let i = -5; i < 35; i++) {
      expect(() => engine.getTithiName(i)).not.toThrow();
      expect(() => engine.getNakshatraName(i)).not.toThrow();
    }
  });
});
