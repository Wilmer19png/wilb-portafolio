// Efecto de televisor de tubo (brief §2.0), en WebGL puro: un plano a pantalla completa
// que toma una imagen (un <canvas>) y le aplica separación de color, resplandor, líneas de barrido,
// curvatura, viñeta, ruido, parpadeo y temblor horizontal ocasional. También hace el encendido
// y el apagado del tubo (la imagen se abre desde una línea y se cierra hasta un punto).
// Todo se ajusta con PARAMS (intensidad por escena) y se reutiliza en otras escenas.

export const PARAMS = {
  rgbShift: 2.2,     // px de separación de color
  bloom: 0.55,       // resplandor sobre los blancos
  scanlines: 0.22,   // fuerza de las líneas de barrido
  curvature: 0.11,   // curvatura de la pantalla
  vignette: 0.55,
  noise: 0.075,
  flicker: 0.035,    // parpadeo de luminancia
  tracking: 1,       // temblor horizontal ocasional (0 = nunca)
};

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uTime, uSx, uSy, uGlow, uFade;
uniform float uShift, uBloom, uScan, uCurve, uVig, uNoise, uFlick, uTrack;

float rand(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec3 tex(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec3(0.0);
  return texture2D(uTex, vec2(uv.x, 1.0 - uv.y)).rgb;
}

void main() {
  // curvatura de la pantalla
  vec2 cc = vUv - 0.5;
  vec2 uv = 0.5 + cc * (1.0 + uCurve * dot(cc, cc));

  // encendido / apagado del tubo: la imagen se escala desde el centro
  vec2 p = uv - 0.5;
  vec2 q = vec2(p.x / max(uSx, 0.0005), p.y / max(uSy, 0.0005)) + 0.5;

  // temblor horizontal ocasional en una franja
  float band = step(0.985, rand(vec2(floor(uTime * 7.0), 3.1))) * uTrack;
  float inBand = step(abs(q.y - rand(vec2(floor(uTime * 7.0), 9.7))), 0.06);
  q.x += band * inBand * 0.025 * (rand(vec2(uTime, q.y)) - 0.5) * 4.0;

  float px = uShift / uRes.x;
  vec3 col;
  col.r = tex(q + vec2(px, 0.0)).r;
  col.g = tex(q).g;
  col.b = tex(q - vec2(px, 0.0)).b;

  // resplandor: promedio de muestras alrededor, solo lo brillante
  vec3 glow = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785398;
    vec2 o = vec2(cos(a), sin(a)) * (6.0 / uRes);
    glow += tex(q + o) + tex(q + o * 2.2);
  }
  glow /= 16.0;
  col += max(glow - 0.35, 0.0) * uBloom * 1.6;

  // líneas de barrido
  col *= 1.0 - uScan * (0.5 + 0.5 * sin(uv.y * uRes.y * 1.5708));
  // ruido y parpadeo
  col += (rand(uv * uRes + uTime) - 0.5) * uNoise;
  col *= 1.0 - uFlick * (0.5 + 0.5 * sin(uTime * 54.0));
  // viñeta
  col *= 1.0 - uVig * dot(cc, cc) * 1.6;

  // la línea / el punto blanco del encendido y el apagado
  float inside = step(abs(p.x), uSx * 0.5) * step(abs(p.y), uSy * 0.5 + 0.0015);
  col = col * inside + vec3(1.0, 0.98, 0.94) * uGlow * inside;
  // fuera de la pantalla curva: negro
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) col = vec3(0.0);
  gl_FragColor = vec4(col * uFade, 1.0);
}`;

/** Crea el efecto sobre un <canvas>. Devuelve null si no hay WebGL (se usa el respaldo CSS). */
export function createCRT(canvas, params = PARAMS) {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  if (!gl) return null;

  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) {
    console.warn('CRT: sin WebGL, se usa el respaldo', e);
    return null;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const U = {};
  ['uTex', 'uRes', 'uTime', 'uSx', 'uSy', 'uGlow', 'uFade', 'uShift', 'uBloom', 'uScan', 'uCurve', 'uVig', 'uNoise', 'uFlick', 'uTrack']
    .forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });

  return {
    /** Dibuja un cuadro. src = canvas con la imagen; tube = { sx, sy, glow, fade } (encendido / apagado). */
    render(src, time, tube) {
      const w = canvas.width, h = canvas.height;
      gl.viewport(0, 0, w, h);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
      gl.uniform1i(U.uTex, 0);
      gl.uniform2f(U.uRes, w, h);
      gl.uniform1f(U.uTime, time);
      gl.uniform1f(U.uSx, tube.sx);
      gl.uniform1f(U.uSy, tube.sy);
      gl.uniform1f(U.uGlow, tube.glow);
      gl.uniform1f(U.uFade, tube.fade);
      gl.uniform1f(U.uShift, params.rgbShift * (w / canvas.clientWidth || 1));
      gl.uniform1f(U.uBloom, params.bloom);
      gl.uniform1f(U.uScan, params.scanlines);
      gl.uniform1f(U.uCurve, params.curvature);
      gl.uniform1f(U.uVig, params.vignette);
      gl.uniform1f(U.uNoise, params.noise);
      gl.uniform1f(U.uFlick, params.flicker);
      gl.uniform1f(U.uTrack, params.tracking);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    /** Libera la GPU al terminar (brief §2.0). */
    destroy() {
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
