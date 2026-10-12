/* Le dé du Sort, en pixel art. **Repris tel quel du prototype**, aux
   signatures près : il a été jugé à l'image, et *un générateur ne se juge
   qu'à l'image* — le réécrire reviendrait à le rejuger sans le regarder.

   Il obéit aux règles du pixel art de l'application : deux pixels par point,
   la rampe claire et jamais de noir, et **on anime le contenu, jamais la
   géométrie** — le dé « roule » en changeant le chiffre de sa face, aucune
   rotation ne tombe sur la grille. */

import { GREY } from "./pixel.ts";

export const DIE_FACES = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
export function drawDie(cv: HTMLCanvasElement, face: string): void {
  const dpr = Math.min(devicePixelRatio || 1, 2), S = 2;
  const w = cv.offsetWidth, h = cv.offsetHeight;
  if (!w || !h) return;
  if (cv.width !== Math.round(w*dpr)){ cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr); }
  const g = cv.getContext("2d")!;
  g.setTransform(dpr,0,0,dpr,0,0); g.imageSmoothingEnabled = false;
  g.clearRect(0,0,w,h);
  const P = (x: number, y: number, n: number, m: number, c: string) => { g.fillStyle = c; g.fillRect(Math.round(x)*S, Math.round(y)*S, Math.round(n)*S, Math.round(m)*S); };
  const [DARK, SHADE, WALL, PALE] = GREY;

  const line = (x0: number, y0: number, x1: number, y1: number, c: string) => {
    let dx = Math.abs(x1-x0), dy = Math.abs(y1-y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy, x = x0, y = y0;
    for (let i = 0; i < 300; i++){
      P(x,y,1,1,c);
      if (x === x1 && y === y1) break;
      const e2 = 2*err;
      if (e2 > -dy){ err -= dy; x += sx; }
      if (e2 <  dx){ err += dx; y += sy; }
    }
  };
  const poly = (pts: number[][], c: string) => {
    const ys = pts.map(p => p[1]);
    for (let y = Math.round(Math.min(...ys)); y <= Math.round(Math.max(...ys)); y++){
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++){
        const [ax,ay] = pts[i], [bx,by] = pts[(i+1)%pts.length];
        if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + (y-ay)/(by-ay)*(bx-ax));
      }
      xs.sort((a,b) => a-b);
      for (let i = 0; i+1 < xs.length; i += 2)
        P(Math.round(xs[i]), y, Math.max(1, Math.round(xs[i+1]-xs[i])), 1, c);
    }
  };

  const cx = 20, cy = 21, R = 19, ri = 10.6, rad = (a: number) => a*Math.PI/180;
  const pt = (a: number, r: number): number[] => [cx + Math.cos(rad(a))*r, cy - Math.sin(rad(a))*r];
  const inner = [0,1,2,3,4].map(k => pt(126 + 72*k, ri));

  /* les cinq faces latérales, du plus clair en haut au plus sombre en bas */
  const sides: { f: number[][]; my: number }[] = [];
  for (let k = 0; k < 5; k++){
    const f = [ inner[k], pt(126+72*k, R), pt(162+72*k, R), pt(198+72*k, R), inner[(k+1)%5] ];
    const my = f.reduce((s0,p0) => s0 + p0[1], 0) / 5;
    sides.push({ f, my });
  }
  const order = [...sides].sort((a,b) => a.my - b.my);
  const tones = [PALE, WALL, WALL, SHADE, SHADE];
  order.forEach((sd,i) => poly(sd.f, tones[i]));
  poly(inner, PALE);                              /* la face de devant */

  for (const sd of sides){                        /* arêtes */
    for (let i = 0; i < 5; i++){
      const [x0,y0] = sd.f[i], [x1,y1] = sd.f[(i+1)%5];
      line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), SHADE);
    }
  }
  for (let i = 0; i < 5; i++){                    /* le décagone, plus marqué */
    const a0 = 126 + 72*i;
    for (const [s0,s1] of [[0,36],[36,72]]){
      const [x0,y0] = pt(a0+s0, R), [x1,y1] = pt(a0+s1, R);
      line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), DARK);
    }
  }
  for (let i = 0; i < 5; i++){                    /* le pentagone de devant */
    const [x0,y0] = inner[i], [x1,y1] = inner[(i+1)%5];
    line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), DARK);
  }

  const glyph = (ch: string, x: number, y: number, c: string) => {
    if (ch === "I"){ P(x+1,y,1,5,c); P(x,y,3,1,c); P(x,y+4,3,1,c); }
    else if (ch === "V"){ line(x,y,x+1,y+4,c); line(x+2,y,x+1,y+4,c); }
    else { line(x,y,x+2,y+4,c); line(x+2,y,x,y+4,c); }
  };
  const chars = (face || "XII").split("");
  let gx = cx - Math.floor((chars.length*4 - 1)/2);
  for (const ch of chars){ glyph(ch, gx, cy-2, SHADE); gx += 4; }

  /* un chiffre discret sur les deux faces hautes, comme sur un vrai dé */
  glyph("V", Math.round(pt(162, (R+ri)/2)[0])-1, Math.round(pt(162, (R+ri)/2)[1])-2, WALL);
  glyph("X", Math.round(pt(90,  (R+ri)/2)[0])-1, Math.round(pt(90,  (R+ri)/2)[1])-2, WALL);
}
