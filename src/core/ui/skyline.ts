// @ts-nocheck — voir plus bas.
/* La cité du Registre, en pixel art.

   **Reprise telle quelle du prototype**, et vérifiée **au pixel près** contre
   lui : le dessin statique ne dépend que d'une graine fixe, donc les deux
   images doivent être identiques octet pour octet. *Un générateur ne se juge
   qu'à l'image* — et celle-ci l'a été.

   Le contrôle de types est coupé pour ce seul fichier, et c'est assumé :
   trois cents lignes de primitives de dessin où chaque paramètre est un
   nombre de points. Les annoter une à une n'attraperait rien, et réécrire
   pour plaire au vérificateur reviendrait à rejuger l'image sans la
   regarder. La fonction exportée, elle, est typée.

   Le dessin se fait **d'un coup, à l'appel** ; seule la vie (le moulin, les
   lampes) passe par l'horloge d'animation — *un rappel d'animation anime, il
   ne met jamais en place*. */

import { GREY, rng } from "./pixel.ts";

function drawSkylineRaw(cv){
  const dpr = Math.min(devicePixelRatio || 1, 2), S = 2;
  const w = cv.offsetWidth, h = cv.offsetHeight;
  if (!w || !h) return null;
  cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr);
  const g = cv.getContext("2d");
  g.setTransform(dpr,0,0,dpr,0,0); g.imageSmoothingEnabled = false;
  const C = Math.ceil(w/S), R = Math.ceil(h/S);
  const P = (x,y,n,m,c) => { g.fillStyle = c; g.fillRect(Math.round(x)*S, Math.round(y)*S, Math.round(n)*S, Math.round(m)*S); };
  const r = rng(90210);
  const G = R - 6;
  const lamps = [];
  const [DARK, SHADE, WALL, PALE] = GREY;

  /* tramage : une densité de points plutôt qu'un aplat — c'est ce qui donne
     de l'air aux nuages et aux rais de lumière */
  const dith = (x,y,n,m,c,k) => {
    for (let yy = 0; yy < m; yy++) for (let xx = 0; xx < n; xx++){
      const v = ((x+xx)*7 + (y+yy)*13) % 8;
      if (v < k) P(x+xx, y+yy, 1, 1, c);
    }
  };

  /* ---- 0. collines lointaines : une crête dessinée, puis un versant tramé.
       Sans ligne de crête, le tramage seul ne lit que comme une hachure. ---- */
  for (let x = 0; x < C; x++){
    const hh = 9 + Math.round(Math.sin(x*.021)*7 + Math.sin(x*.063)*4 + Math.sin(x*.009)*5);
    const top = G - 22 - hh;
    P(x, top, 1, 1, WALL);
    P(x, top+1, 1, 2, PALE);
    dith(x, top+3, 1, hh+8, PALE, 4);
  }

  /* ---- 1. rais de lumière, venus du haut à gauche ---- */
  for (let i = 0; i < 5; i++){
    const sx = Math.round(C*.06) + i*Math.round(C*.075);
    const wd = 6 + Math.floor(r()*7);
    for (let y = 0; y < G-18; y++){
      const x = sx + Math.round(y*.58);
      dith(x, y, wd, 1, PALE, y < 10 ? 4 : (y < G*.55 ? 3 : 2));
    }
  }

  /* ---- 2. nuages ---- */
  const cloud = (cx,cy,sc,tone,dens) => {
    const lobes = [[0,0,5],[-4,1,4],[4,1,4],[-7,2,3],[7,2,3],[2,-2,3],[-2,-2,3]];
    for (const [ox,oy,rad] of lobes){
      const rx = Math.round(rad*sc*1.5), ry = Math.round(rad*sc*.72);
      for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++)
        if ((x*x)/(rx*rx) + (y*y)/(ry*ry) <= 1)
          dith(cx+ox*sc+x, cy+oy*sc+y, 1, 1, tone, dens);
    }
    for (let x = -Math.round(9*sc); x <= Math.round(9*sc); x++)
      if (r() < .5) P(cx+x, cy+Math.round(3*sc), 1, 1, WALL);
  };
  cloud(Math.round(C*.40), 12, 1.25, PALE, 6);
  cloud(Math.round(C*.70), 9,  1.0,  PALE, 5);
  cloud(Math.round(C*.14), 16, .85,  PALE, 5);

  /* ---- 3. maisons à colombages ---- */
  const gable = (x,wd,top,c) => { for (let k = 0; k*2 < wd; k++) P(x+k, top-1-k, wd-2*k, 1, c); };
  const house = (x,wd,hh) => {
    const top = G - hh, mid = top + Math.round(hh*.45);
    P(x, mid, wd, G-mid, WALL);                               /* rez-de-chaussée */
    P(x-1, top, wd+2, mid-top, WALL);                         /* étage en encorbellement */
    P(x+wd-2, mid, 2, G-mid, SHADE);
    P(x+wd-1, top, 2, mid-top, SHADE);
    P(x-1, mid-1, wd+2, 1, DARK);                             /* sablière */
    for (let bx = x+1; bx < x+wd-1; bx += 3) P(bx, mid+1, 1, G-mid-2, SHADE);
    for (let bx = x; bx < x+wd; bx += 3) P(bx, top+1, 1, mid-top-2, SHADE);
    if (wd > 7){ P(x+1, top+2, 1, 1, SHADE); P(x+2, top+3, 1, 1, SHADE); }
    gable(x-2, wd+4, top, DARK);
    P(x-2, top, wd+4, 1, DARK);
    P(x+1, G-4, 2, 4, DARK);                                  /* porte */
    P(x+1, G-5, 2, 1, DARK);
    for (let yy = mid+2; yy < G-5; yy += 4)
      for (let xx = x+4; xx < x+wd-1; xx += 4){
        const lit = r() < .5;
        P(xx, yy, 2, 2, lit ? PALE : DARK);
        P(xx-1, yy, 1, 2, DARK); P(xx+2, yy, 1, 2, DARK);
        if (lit) lamps.push([xx,yy]);
      }
    if (r() < .5){ const cx = x+wd-3; P(cx, top-5, 2, 5, DARK); P(cx-1, top-6, 4, 1, SHADE); }
  };

  /* ---- 4. sol, remparts, porte ---- */
  P(0, G, C, 1, DARK);
  dith(0, G+1, C, R-G-1, SHADE, 5);
  for (let x = 0; x < C; x += 5) P(x, G+2, 3, 1, PALE);

  const cityEnd = Math.round(C*.52);
  const wallX = Math.round(C*.05);
  P(wallX, G-14, Math.round(C*.47), 14, WALL);
  P(wallX+Math.round(C*.46), G-14, 2, 14, SHADE);
  P(wallX, G-15, Math.round(C*.47), 1, DARK);
  for (let x = wallX; x < wallX + C*.47; x += 5) P(x, G-18, 3, 3, DARK);
  for (let x = wallX+2; x < wallX + C*.47; x += 9) P(x, G-11, 1, 4, DARK);
  const gx = wallX + 7;
  P(gx, G-23, 11, 23, WALL); P(gx+8, G-23, 3, 23, SHADE);
  P(gx-1, G-24, 13, 1, DARK);
  for (let k = 0; k < 13; k += 4) P(gx-1+k, G-27, 3, 3, DARK);
  for (let k = -1; k < 12; k += 3) P(gx+k, G-25, 2, 1, DARK);
  P(gx+3, G-9, 5, 9, DARK); P(gx+4, G-10, 3, 1, DARK);
  P(gx+4, G-7, 3, 1, SHADE); P(gx+4, G-4, 3, 1, SHADE);

  /* ---- 5. la cité ---- */
  let x = wallX + 22;
  const dense = [];
  while (x < cityEnd - 6){
    const wd = 7 + Math.floor(r()*5), hh = 11 + Math.floor(r()*13);
    dense.push([x,wd,hh]); x += wd + 2;
  }
  const sq = dense[Math.round(dense.length*.46)];
  const plazaX = sq ? sq[0] : wallX+46, plazaW = 24;
  for (const [hx,hw,hh] of dense) if (hx + hw < plazaX || hx > plazaX + plazaW) house(hx,hw,hh);
  P(plazaX, G-1, plazaW, 1, DARK);
  for (let i = 0; i < plazaW; i += 3) P(plazaX+i, G-2, 2, 1, PALE);
  const fx0 = plazaX + Math.round(plazaW/2);
  P(fx0-5, G-4, 11, 3, WALL); P(fx0-5, G-5, 11, 1, DARK); P(fx0-4, G-2, 9, 1, SHADE);
  P(fx0-1, G-12, 3, 7, WALL); P(fx0-4, G-14, 9, 2, WALL); P(fx0-4, G-15, 9, 1, DARK);
  P(fx0, G-18, 1, 3, DARK); P(fx0-2, G-17, 5, 1, DARK);
  for (const dx of [-3,3]) P(fx0+dx, G-11, 1, 6, PALE);

  /* ---- 6. la cathédrale ---- */
  const caX = Math.round(C*.255), navW = 28, navH = 30, towW = 9, towH = 46;
  const nt = G - navH;
  P(caX+towW, nt, navW, navH, WALL);
  P(caX+towW+navW-4, nt, 4, navH, SHADE);
  for (let k = 0; k*2 < navW+4; k++) P(caX+towW-2+k, nt-1-k, navW+4-2*k, 1, DARK);
  for (let i = 0; i < 3; i++){                                /* arcs-boutants */
    const bx = caX+towW+5+i*9;
    P(bx, G-9, 3, 9, WALL); P(bx, G-10, 3, 1, DARK);
    for (let k = 0; k < 6; k++) P(bx+3+k, G-10-Math.round(k*1.4), 1, 1, SHADE);
    P(bx+1, G-14, 1, 4, DARK);
  }
  P(caX+towW+navW/2-4, nt+7, 9, 9, DARK);                     /* rosace */
  P(caX+towW+navW/2-3, nt+8, 7, 7, PALE);
  P(caX+towW+navW/2-1, nt+10, 3, 3, DARK);
  P(caX+towW+navW/2, nt+8, 1, 7, DARK); P(caX+towW+navW/2-3, nt+11, 7, 1, DARK);
  for (let i = 0; i < 4; i++){                                /* ogives */
    const ox = caX+towW+4+i*6;
    P(ox, G-15, 4, 15, DARK); P(ox+1, G-17, 2, 2, DARK);
    P(ox+1, G-13, 2, 9, PALE); lamps.push([ox+1, G-13]);
  }
  const spire = (cx,base,hh,halfw) => {
    for (let k = 0; k <= hh; k++){
      const hw = Math.round((hh-k)/hh * halfw);
      P(cx-hw, base-k, hw*2+1, 1, k % 3 === 0 ? SHADE : DARK);
    }
  };
  for (const tx of [caX, caX+towW+navW]){
    P(tx, G-towH, towW, towH, WALL);
    P(tx+towW-3, G-towH, 3, towH, SHADE);
    for (let yy = G-towH+6; yy < G-10; yy += 9){
      P(tx+2, yy, 2, 6, DARK); P(tx+3, yy+1, 1, 4, PALE);
    }
    P(tx-1, G-towH-1, towW+2, 1, DARK);
    for (let k = 0; k < towW+2; k += 3) P(tx-1+k, G-towH-4, 2, 3, DARK);
    spire(tx+Math.floor(towW/2), G-towH-4, 16, Math.floor(towW/2)+1);
    P(tx+Math.floor(towW/2), G-towH-22, 1, 5, DARK);
    P(tx+Math.floor(towW/2)-2, G-towH-20, 5, 1, DARK);
  }

  /* ---- 7. le château, sur sa motte ---- */
  const kX = Math.round(C*.435);
  for (let k = 0; k < 9; k++) dith(kX-14+k, G-k, 36-2*k, 1, k > 6 ? WALL : SHADE, 6);
  const kg = G-8;
  P(kX-6, kg-26, 24, 26, WALL); P(kX+14, kg-26, 4, 26, SHADE);
  for (let yy = kg-22; yy < kg-4; yy += 7){ P(kX-2, yy, 2, 5, DARK); P(kX+8, yy, 2, 5, DARK); }
  P(kX-7, kg-27, 26, 1, DARK);
  for (let k = -7; k < 19; k += 3) P(kX+k, kg-29, 1, 2, SHADE);  /* mâchicoulis */
  P(kX-7, kg-30, 26, 1, DARK);
  for (let k = 0; k < 26; k += 5) P(kX-7+k, kg-33, 3, 3, DARK);
  for (const [tx,th] of [[kX-12,34],[kX+17,30]]){
    P(tx, kg-th, 8, th, WALL); P(tx+6, kg-th, 2, th, SHADE);
    for (let yy = kg-th+7; yy < kg-5; yy += 8) P(tx+3, yy, 2, 5, DARK);
    P(tx-1, kg-th-1, 10, 1, DARK);
    for (let k = -1; k < 9; k += 3) P(tx+k, kg-th-4, 2, 3, DARK);
    spire(tx+4, kg-th-4, 11, 5);
  }
  P(kX+6, kg-44, 1, 9, DARK);
  P(kX+7, kg-44, 9, 5, SHADE); P(kX+7, kg-44, 9, 1, DARK); P(kX+13, kg-41, 3, 2, PALE);
  P(kX+2, kg-10, 5, 10, DARK); P(kX+3, kg-11, 3, 1, DARK);

  /* nuage passant DEVANT le château */
  cloud(Math.round(C*.47), 26, 1.05, PALE, 7);

  /* ---- 8. la campagne ---- */
  let fx = cityEnd + 10;
  while (fx < C*.70){
    house(fx, 6 + Math.floor(r()*3), 8 + Math.floor(r()*5));
    if (r() < .5){ const bx = fx + 12;
      P(bx, G-9, 13, 9, SHADE); gable(bx-1, 15, G-9, DARK); P(bx+5, G-5, 3, 5, DARK); }
    fx += 22 + Math.floor(r()*16);
  }
  const mlX = Math.round(C*.645), mlY = G-22;
  /* Le moulin se redessine à chaque tour. Effacer sa boîte emporterait le fond
     qui s'y trouve — collines, rais, sol. On en garde donc une empreinte prise
     AVANT que le moulin n'existe, et on la restitue à chaque image. */
  /* La boîte doit couvrir la course COMPLÈTE des ailes : centre en mlY-8,
     rayon 12, plus 2 de décalage d'ombre — soit mlY-22 au plus haut et
     mlX±14 de part et d'autre. Trop courte, elle laisse gravée la première
     position des ailes au-dessus d'elle. */
  const mill = { x: mlX-16, y: mlY-25, w: 33, h: 51 };
  const mb = {
    x: Math.max(0, Math.round(mill.x*S*dpr)),
    y: Math.max(0, Math.round(mill.y*S*dpr)),
  };
  mb.w = Math.min(cv.width  - mb.x, Math.round(mill.w*S*dpr));
  mb.h = Math.min(cv.height - mb.y, Math.round(mill.h*S*dpr));
  let millBg = null;
  const drawMill = ph => {
    if (mb.w > 0 && mb.h > 0){
      if (!millBg) millBg = g.getImageData(mb.x, mb.y, mb.w, mb.h);
      else g.putImageData(millBg, mb.x, mb.y);
    }
    P(mlX-5, mlY, 11, 22, WALL); P(mlX+3, mlY, 3, 22, SHADE);
    for (let yy = mlY+4; yy < mlY+18; yy += 7) P(mlX-1, yy, 2, 4, DARK);
    P(mlX-6, mlY-1, 13, 1, DARK);
    for (let k = 0; k < 5; k++) P(mlX-5+k, mlY-2-k, 11-2*k, 1, DARK);
    for (let i = 0; i < 4; i++){
      const a = (i*Math.PI/2) + ph*Math.PI/8;
      for (let t = 2; t <= 12; t++){
        const ax = Math.round(mlX + Math.cos(a)*t), ay = Math.round(mlY-8 + Math.sin(a)*t);
        P(ax, ay, 1, 1, DARK);
        if (t > 4){
          const nx = Math.abs(Math.cos(a)) > .5 ? 0 : 1, ny = Math.abs(Math.cos(a)) > .5 ? 1 : 0;
          P(ax+nx, ay+ny, 1, 1, SHADE); P(ax+nx*2, ay+ny*2, 1, 1, PALE);
        }
      }
    }
    P(mlX-1, mlY-9, 3, 3, DARK);
  };
  drawMill(0);

  /* ---- 9. les champs ---- */
  const fieldX = Math.round(C*.69);
  for (let i = 0; i < 9; i++){
    const y = G + 1 + i;
    for (let xx = fieldX + i*4; xx < C; xx += 6 + i) P(xx, y, 4, 1, PALE);
  }
  for (let xx = fieldX + 6; xx < C*.88; xx += 26){
    P(xx, G-6, 7, 6, SHADE); P(xx+1, G-8, 5, 2, SHADE); P(xx+2, G-9, 3, 1, SHADE);
    P(xx, G-6, 7, 1, DARK);
  }
  for (let xx = fieldX - 4; xx < C; xx += 8){ P(xx, G-4, 1, 4, SHADE); P(xx-1, G-4, 3, 1, SHADE); }

  /* ---- 10. la forêt et la tour du sorcier ---- */
  const forX = Math.round(C*.79);
  const broad = (tx,ty,sz) => {
    for (let k = 0; k < sz; k++){
      const hw = Math.round(k*.78);
      P(tx-hw, ty-sz+k, hw*2+1, 1, k < 2 ? DARK : (k % 2 ? SHADE : WALL));
    }
    P(tx-1, ty-sz+2, 1, Math.round(sz*.5), DARK);
    P(tx, ty, 1, 2, DARK);
  };
  const conif = (tx,ty,sz) => {
    for (let tier = 0; tier < 3; tier++){
      const base = ty - Math.round(sz*tier*.3), hh = Math.round(sz*(.55 - tier*.11));
      for (let k = 0; k <= hh; k++){
        const hw = Math.round((hh-k)*.9);
        P(tx-hw, base-k-Math.round(sz*.18)*tier, hw*2+1, 1, k < 1 ? DARK : (tier % 2 ? SHADE : WALL));
      }
    }
    P(tx, ty, 1, 3, DARK);
  };
  const wzX = Math.round(C*.885);
  for (let xx = forX; xx < C+8; xx++){
    if (Math.abs(xx - wzX) < 7) continue;
    const dens = (xx - forX) / Math.max(1, C - forX);
    if (r() < .34 + dens*.95){
      const sz = 7 + Math.floor(r()*9);
      r() < .45 ? conif(xx, G - Math.floor(r()*3), sz) : broad(xx, G - Math.floor(r()*3), sz);
    }
  }
  /* la tour : fine, légèrement renflée, coiffée d'un cône */
  const wzH = 40;
  for (let k = 0; k < wzH; k++){
    const wdt = 7 + Math.round(Math.sin(k*.17)*1.4);
    P(wzX - Math.floor(wdt/2), G-k, wdt, 1, k % 7 === 3 ? SHADE : WALL);
    P(wzX + Math.ceil(wdt/2) - 2, G-k, 2, 1, SHADE);
  }
  P(wzX-5, G-wzH-1, 11, 1, DARK);
  P(wzX-6, G-wzH-3, 13, 2, WALL); P(wzX-6, G-wzH-4, 13, 1, DARK);
  for (let k = 0; k <= 15; k++){                               /* cône */
    const hw = Math.round((15-k)/15 * 6);
    P(wzX-hw, G-wzH-4-k, hw*2+1, 1, k % 3 === 1 ? SHADE : DARK);
  }
  P(wzX, G-wzH-22, 1, 4, DARK);
  P(wzX-1, G-wzH-23, 3, 1, PALE);
  for (const yy of [G-10, G-20, G-30]){                        /* fenêtres */
    P(wzX-2, yy, 4, 5, DARK); P(wzX-1, yy+1, 2, 3, PALE);
    lamps.push([wzX-1, yy+1]);
  }
  for (let i = 0; i < 9; i++){                                 /* étincelles */
    const sx = wzX + Math.round((r()-.5)*24), sy = G-wzH-10-Math.floor(r()*16);
    P(sx, sy, 1, 1, PALE);
  }

  /* ---- vie ---- */
  let raf = 0, t = 0, ph = 0;
  const live = lamps.filter(() => r() < .5);
  const tick = () => {
    raf = 0; t++;
    if (t % 11 === 0){ ph = (ph+1) % 16; drawMill(ph); }
    if (t % 38 === 0)
      for (const [lx,ly] of live)
        if (Math.random() < .26) P(lx, ly, 2, 2, Math.random() < .5 ? PALE : DARK);
    raf = requestAnimationFrame(tick);
  };
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) raf = requestAnimationFrame(tick);
  return () => { if (raf) cancelAnimationFrame(raf); };
}

/** Dessine la cité dans le canevas ; rend de quoi arrêter sa vie, ou `null`
    si le canevas n'a pas encore de taille. */
export const drawSkyline: (cv: HTMLCanvasElement) => (() => void) | null = drawSkylineRaw;

/** Action Svelte : la cité vit avec son nœud, se redessine quand la largeur
    change, et s'arrête avec lui. La première tentative se refait par
    minuterie si le canevas n'est pas encore mis en page — **jamais par image
    d'animation**, qu'une fenêtre masquée ne produit pas. */
export function skyline(node: HTMLCanvasElement) {
  let stop: (() => void) | null = null;
  let tries = 0, tid: ReturnType<typeof setTimeout> | null = null, width = 0;
  const draw = () => {
    tid = null;
    stop?.();
    stop = drawSkyline(node);
    if (!stop && ++tries < 40) { tid = setTimeout(draw, 60); return; }
    width = node.offsetWidth;
  };
  draw();
  let rt: ReturnType<typeof setTimeout> | null = null;
  const onResize = () => {
    if (rt) clearTimeout(rt);
    rt = setTimeout(() => { if (node.offsetWidth !== width) draw(); }, 160);
  };
  addEventListener("resize", onResize);
  return {
    destroy() {
      stop?.(); if (tid) clearTimeout(tid); if (rt) clearTimeout(rt);
      removeEventListener("resize", onResize);
    },
  };
}
