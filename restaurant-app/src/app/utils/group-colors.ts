const COLORS = [
  '#2196F3', // A – Blau
  '#FF9800', // B – Orange
  '#CE93D8', // C – Hellviolett
  '#4CAF50', // D – Grün
  '#FF6B6B', // E – Korallrot
  '#00BCD4', // F – Cyan
  '#FFCA28', // G – Gelb-Amber
  '#90CAF9', // H – Hellblau
];

export function groupColor(letter: string): string {
  const idx = letter.charCodeAt(0) - 'A'.charCodeAt(0);
  return COLORS[Math.max(0, idx) % COLORS.length];
}
