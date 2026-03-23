/**
 * Dithering Sphere — WebGL2 vanilla JS
 * AJG AI SOLUTIONS Landing Page
 * Bayer 8×8 ordered dithering + simplex noise + rotating light
 */
(function () {
  'use strict';

  var canvas = document.getElementById('dithering-canvas');
  if (!canvas) return;

  var gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false });
  if (!gl) { console.warn('WebGL2 not available'); return; }

  /* ── Vertex shader ──────────────────────────────────── */
  var VS = [
    '#version 300 es',
    'layout(location=0) in vec4 a_pos;',
    'void main(){ gl_Position = a_pos; }'
  ].join('\n');

  /* ── Fragment shader ────────────────────────────────── */
  var FS = [
    '#version 300 es',
    'precision mediump float;',
    'uniform float u_time;',
    'uniform vec2  u_resolution;',
    'uniform vec4  u_colorBack;',
    'uniform vec4  u_colorFront;',
    'uniform float u_pxSize;',
    'out vec4 fragColor;',

    '#define PI 3.141592653589793',

    /* ── Simplex 2D noise ── */
    'vec3 snPermute(vec3 x){ return mod(((x*34.0)+1.0)*x,289.0); }',
    'float snoise(vec2 v){',
    '  const vec4 C=vec4(0.211324865405187,0.366025403784439,',
    '                    -0.577350269189626,0.024390243902439);',
    '  vec2 i =floor(v+dot(v,C.yy));',
    '  vec2 x0=v-i+dot(i,C.xx);',
    '  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);',
    '  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;',
    '  i=mod(i,289.0);',
    '  vec3 p=snPermute(snPermute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));',
    '  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);',
    '  m=m*m; m=m*m;',
    '  vec3 x=2.*fract(p*C.www)-1.;',
    '  vec3 h=abs(x)-.5;',
    '  vec3 ox=floor(x+.5);',
    '  vec3 a0=x-ox;',
    '  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);',
    '  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;',
    '  return 130.*dot(m,g);',
    '}',

    /* ── Bayer 8×8 ── */
    'const int bayer8[64]=int[64](',
    '   0,32, 8,40, 2,34,10,42,',
    '  48,16,56,24,50,18,58,26,',
    '  12,44, 4,36,14,46, 6,38,',
    '  60,28,52,20,62,30,54,22,',
    '   3,35,11,43, 1,33, 9,41,',
    '  51,19,59,27,49,17,57,25,',
    '  15,47, 7,39,13,45, 5,37,',
    '  63,31,55,23,61,29,53,21',
    ');',
    'float getBayer(ivec2 p){',
    '  ivec2 q=ivec2(int(mod(float(p.x),8.)),int(mod(float(p.y),8.)));',
    '  return float(bayer8[q.y*8+q.x])/64.;',
    '}',

    'void main(){',
    '  float t    = u_time * 0.8;',
    '  float px   = u_pxSize;',

    /* pixelate */
    '  vec2 fpos  = gl_FragCoord.xy;',
    '  vec2 pxCtr = floor(fpos/px)*px + px*0.5;',
    '  vec2 pUV   = pxCtr / u_resolution;',

    /* aspect-correct UV centred at (0,0) */
    '  float asp  = u_resolution.x / u_resolution.y;',
    '  vec2 uv    = (pUV*2.-1.) * vec2(asp,1.);',

    /* shift sphere 60 % to the right of centre */
    '  vec2 suv   = uv - vec2(asp*0.35, 0.0);',

    /* sphere: user spec exactly */
    '  suv *= 2.;',
    '  float d    = 1. - pow(length(suv),2.);',
    '  vec3 pos   = vec3(suv, sqrt(max(d,0.)));',
    '  vec3 lp    = normalize(vec3(cos(1.5*t),.8,sin(1.25*t)));',
    '  float shape= .5 + .5*dot(lp, normalize(pos));',
    '  shape     *= step(0.,d);',

    /* subtle noise on sphere surface */
    '  float n    = snoise(suv*2.+vec2(0.,t*0.12))*0.06;',
    '  shape      = clamp(shape+n*step(0.,d), 0., 1.);',

    /* soft edge */
    '  shape     *= smoothstep(-0.04,0.12,d);',

    /* Bayer dithering */
    '  ivec2 bp   = ivec2(fpos/px);',
    '  float dith = getBayer(bp) - 0.5;',
    '  float res  = step(0.5, shape+dith);',

    /* composite — transparent where background */
    '  vec4 fg    = u_colorFront;',
    '  float alpha= res * step(0.,d);',
    '  fragColor  = vec4(fg.rgb*fg.a*alpha, fg.a*alpha);',
    '}'
  ].join('\n');

  /* ── Compile / link ─────────────────────────────────── */
  function makeShader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var vs = makeShader(gl.VERTEX_SHADER,   VS);
  var fs = makeShader(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Link error:', gl.getProgramInfoLog(prog));
    return;
  }

  /* ── Fullscreen quad ────────────────────────────────── */
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
    gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  /* ── Uniforms ───────────────────────────────────────── */
  var locs = {
    time : gl.getUniformLocation(prog, 'u_time'),
    res  : gl.getUniformLocation(prog, 'u_resolution'),
    back : gl.getUniformLocation(prog, 'u_colorBack'),
    front: gl.getUniformLocation(prog, 'u_colorFront'),
    px   : gl.getUniformLocation(prog, 'u_pxSize')
  };

  function hexRgba(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255, 1.0] : [0,0,0,1];
  }

  var colorFront = hexRgba('#35d8ff');
  var colorBack  = hexRgba('#050816');

  /* ── Resize ─────────────────────────────────────────── */
  function resize() {
    var p = canvas.parentElement;
    canvas.width  = p.offsetWidth  || window.innerWidth;
    canvas.height = p.offsetHeight || window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    canvas.style.opacity = canvas.width < 768 ? '0.25' : '0.35';
  }

  new ResizeObserver(resize).observe(canvas.parentElement);
  resize();

  /* ── Blend: src-alpha premul ────────────────────────── */
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  /* ── Render loop ────────────────────────────────────── */
  var start = performance.now();
  function render() {
    var t  = (performance.now() - start) * 0.001;
    var px = canvas.width < 768 ? 4.0 : 3.0;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniform1f(locs.time,  t);
    gl.uniform2f(locs.res,   canvas.width, canvas.height);
    gl.uniform4fv(locs.back,  colorBack);
    gl.uniform4fv(locs.front, colorFront);
    gl.uniform1f(locs.px,    px);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  render();
})();
