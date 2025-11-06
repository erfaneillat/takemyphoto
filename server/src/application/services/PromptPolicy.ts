export function applyPromptPolicy(prompt: string): string {
  const policy = [
    "Do not change the person's face or identity.",
    'Preserve facial features exactly; no alteration to face shape or skin tone.',
    'Do not change body proportions, size, or height; avoid stretching, slimming, or enlarging.'
  ].join(' ');
  return `${prompt}\n\n${policy}`;
}
