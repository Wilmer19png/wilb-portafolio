// Copia de drawWater de public/worklets/agua.js para dibujar en un <canvas> (el logo).
// Si cambias una, cambia la otra.

const STOPS = [[0, '#f5c518'], [0.14, '#f4a019'], [0.3, '#f27a1a'], [0.44, '#e4512a'], [0.56, '#d62828'],
  [0.66, '#9a3270'], [0.76, 'rgba(91,58,156,.9)'], [0.86, 'rgba(31,63,191,.6)'], [0.94, 'rgba(31,63,191,.2)'], [1, 'rgba(31,63,191,0)']];

export function drawWater(ctx, pts, t, w, h) {
  const { sin, cos, max, PI } = Math;
  for (let k = pts.length - 1; k >= 0; k--) {
    const { x, y, r } = pts[k];
    if (r < 2 || x + r * 1.3 < 0 || y + r * 1.3 < 0 || x - r * 1.3 > w || y - r * 1.3 > h) continue;
    const seed = k * 1.7;
    ctx.save();
    ctx.globalAlpha = 1 - k * 0.13; // la estela se va aclarando
    // contorno orgánico: un círculo que respira con varias ondas a la vez
    ctx.beginPath();
    const N = 56;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * PI * 2;
      const rr = r * (1 + 0.16 * sin(3 * a + t * 1.1 + seed) + 0.09 * sin(5 * a - t * 1.6 + seed * 1.3) + 0.05 * sin(9 * a + t * 2.3 + seed * 0.7));
      const px = x + cos(a) * rr;
      const py = y + sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(x + r * 0.14 * sin(t * 0.7 + seed), y + r * 0.12 * cos(t * 0.9 + seed), 0, x, y, r * 1.08);
    STOPS.forEach(([o, c]) => g.addColorStop(o, c));
    ctx.fillStyle = g;
    ctx.fill();

    // reflejos de piscina: dos familias de líneas onduladas que se cruzan (solo en la cabeza y los primeros puntos)
    if (k < 3) {
      ctx.clip();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const fams = [[0.5, 1, 0], [-0.75, 1.35, 2.1]];
      for (const [ang, sp, ph] of fams) {
        const ca = cos(ang), sa = sin(ang);
        const step = r * 0.23;
        const amp = r * 0.09;
        const freq = (PI * 2) / (r * 0.75);
        for (let d = -r * 1.1; d <= r * 1.1; d += step) {
          ctx.beginPath();
          for (let s = -r * 1.2, first = true; s <= r * 1.2; s += r * 0.07, first = false) {
            const off = d + amp * sin(s * freq + t * 1.6 * sp + ph + d * 0.04) + amp * 0.45 * sin(s * freq * 2.3 - t * 1.1 + d * 0.09);
            const px = x + s * ca - off * sa;
            const py = y + s * sa + off * ca;
            if (first) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = 'rgba(255,244,214,0.2)';
          ctx.lineWidth = max(1, r * 0.017);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }
}
