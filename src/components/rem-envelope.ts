/**
 * Pre-baked RMS amplitude envelope from a Rem voice synthesis clip.
 *
 * Source: sample1_morning_furina001.wav (3.16s, 24kHz, mono)
 * Phrase: "Good morning everyone, I hope everyone slept well"
 *
 * 256 frames at ~81fps resolution.
 * Values are normalized 0–1 (1.0 = peak amplitude in the clip).
 *
 * Speech structure visible in the data:
 *   Frames   0–9:   leading silence
 *   Frames  10–95:  "good morning everyone" (first phrase)
 *   Frames  96–109: pause between phrases
 *   Frames 110–145: "I hope everyone" (peak at 119 = "hope")
 *   Frames 146–220: "slept well" + trailing words
 *   Frames 221–255: trailing silence
 */
export const REM_ENVELOPE: readonly number[] = [
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0004, 0.0024, 0.0122,
  0.2121, 0.4839, 0.743, 0.6214, 0.6046, 0.5402, 0.478, 0.4646, 0.4398, 0.3814,
  0.43, 0.5011, 0.5561, 0.599, 0.6165, 0.6278, 0.6998, 0.67, 0.7149, 0.6743,
  0.5993, 0.551, 0.4941, 0.4683, 0.5502, 0.4717, 0.4193, 0.3728, 0.2887, 0.3104,
  0.281, 0.2741, 0.2264, 0.2152, 0.2285, 0.2131, 0.2451, 0.2396, 0.2518, 0.2849,
  0.2565, 0.2568, 0.2323, 0.2056, 0.2037, 0.2033, 0.1953, 0.1133, 0.0447, 0.0223,
  0.0152, 0.0389, 0.1719, 0.1912, 0.2115, 0.1926, 0.2279, 0.2209, 0.1895, 0.1725,
  0.1172, 0.1544, 0.1886, 0.2848, 0.2985, 0.3847, 0.3093, 0.3054, 0.3079, 0.2864,
  0.2531, 0.2688, 0.2394, 0.2063, 0.2722, 0.2376, 0.2076, 0.1607, 0.1388, 0.1052,
  0.0556, 0.0233, 0.0065, 0.0041, 0.0004, 0.0, 0.0, 0.0, 0.0, 0.0,
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0004, 0.0001, 0.0, 0.0,
  0.0, 0.0003, 0.0032, 0.0177, 0.1095, 0.8331, 0.9456, 1.0, 0.8512, 0.5988,
  0.4895, 0.4716, 0.4305, 0.4017, 0.3732, 0.3353, 0.2772, 0.2998, 0.3065, 0.3092,
  0.3332, 0.3555, 0.3604, 0.4087, 0.5268, 0.5228, 0.4391, 0.4049, 0.3546, 0.1253,
  0.0207, 0.0115, 0.0057, 0.0039, 0.0065, 0.0563, 0.0583, 0.1508, 0.2102, 0.2416,
  0.2708, 0.312, 0.3052, 0.3592, 0.3358, 0.3352, 0.2759, 0.1825, 0.1868, 0.2717,
  0.3859, 0.4137, 0.3988, 0.4796, 0.5152, 0.4877, 0.5549, 0.4723, 0.3426, 0.3125,
  0.2026, 0.1649, 0.1368, 0.0974, 0.0471, 0.0362, 0.0368, 0.0397, 0.0451, 0.0376,
  0.0297, 0.0319, 0.0236, 0.0205, 0.031, 0.2888, 0.304, 0.2802, 0.2372, 0.2017,
  0.221, 0.209, 0.1967, 0.0739, 0.0176, 0.0058, 0.0074, 0.0073, 0.0036, 0.0074,
  0.0637, 0.2047, 0.2829, 0.2578, 0.2587, 0.3064, 0.3251, 0.3022, 0.326, 0.3503,
  0.2745, 0.3179, 0.3705, 0.337, 0.3285, 0.2706, 0.2753, 0.3063, 0.32, 0.2802,
  0.2568, 0.2537, 0.2519, 0.2209, 0.2136, 0.1851, 0.174, 0.1353, 0.1132, 0.067,
  0.0211, 0.0175, 0.0107, 0.0058, 0.0038, 0.0001, 0.0, 0.0, 0.0, 0.0,
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
]

/** Total number of envelope frames */
export const ENVELOPE_FRAMES = REM_ENVELOPE.length

/** Source audio duration in seconds */
export const ENVELOPE_DURATION = 3.16

/**
 * Sample the envelope at a given time offset (seconds), with linear interpolation.
 * Loops seamlessly.
 */
export function sampleEnvelope(t: number): number {
  const pos = ((t / ENVELOPE_DURATION) * ENVELOPE_FRAMES) % ENVELOPE_FRAMES
  const i0 = Math.floor(pos) % ENVELOPE_FRAMES
  const i1 = (i0 + 1) % ENVELOPE_FRAMES
  const f = pos - Math.floor(pos)
  return REM_ENVELOPE[i0] + (REM_ENVELOPE[i1] - REM_ENVELOPE[i0]) * f
}
