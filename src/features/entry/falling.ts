/* **Un ciel qui tombe, le temps de l'entrée.** Ce n'est pas la trame d'un
   Ordre — on n'en a pas encore — donc tout est à l'encre : des poussières
   fixes qui respirent, et des étoiles filantes en diagonale. Porté tel quel
   du prototype.

   Le premier dessin attend que le canevas ait une taille, par minuterie et
   non par rAF : une fenêtre qui n'est pas encore rendue n'en produit pas. */

type Mote = { c: false; x: number; y: number; r: number; ph: number; sp: number };
type Star = { c: true; x: number; y: number; vx: number; vy: number; len: number };

export function falling(cv: HTMLCanvasElement) {
  const ctx = cv.getContext("2d");
  if (!ctx) return {};
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w = 0, h = 0, raf = 0, tid: ReturnType<typeof setTimeout> | 0 = 0, tries = 0;
  let P: (Mote | Star)[] = [];
  const R = (a = 1, b = 0) => b + Math.random() * (a - b);
  /* `offset*` et non le rectangle transformé : le rideau anime l'écran
     pendant qu'on mesure (invariant 18). */
  const size = () => {
    if (!cv.offsetWidth || !cv.offsetHeight) return false;
    w = cv.offsetWidth; h = cv.offsetHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return true;
  };
  const dust = (): Mote => ({ c: false, x: R(w), y: R(h * .86), r: R(1.8, .5), ph: R(6.28), sp: R(.045, .013) });
  const fall = (i: boolean): Star => ({ c: true, x: R(w * 1.3, -w * .3), y: i ? R(h * .7) : R(-60, -760),
                                        vx: R(6.8, 3.4), vy: R(4.4, 2.2), len: R(165, 78) });
  const seed = () => {
    P = [];
    for (let i = 0; i < 84; i++) P.push(dust());
    for (let i = 0; i < 7; i++) P.push(fall(true));
  };
  const frame = () => {
    raf = 0; ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      if (p.c) {
        p.x += p.vx; p.y += p.vy;
        if (p.y > h + 90 || p.x > w + 140) { P[i] = fall(false); continue; }
        const tx = p.x - p.vx * p.len / 6, ty = p.y - p.vy * p.len / 6;
        const g = ctx.createLinearGradient(p.x, p.y, tx, ty);
        g.addColorStop(0, "#141412"); g.addColorStop(1, "transparent");
        ctx.strokeStyle = g; ctx.globalAlpha = .40; ctx.lineWidth = 1.9; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.fillStyle = "#141412"; ctx.globalAlpha = .52;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.9, 0, 6.2832); ctx.fill();
        continue;
      }
      p.ph += p.sp;
      const tw = .10 + .26 * (.5 + .5 * Math.sin(p.ph));
      ctx.fillStyle = "#141412"; ctx.globalAlpha = tw;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.75 + .35 * tw), 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  };
  const onResize = () => { if (size()) seed(); };
  addEventListener("resize", onResize);
  const attempt = () => {
    tid = 0;
    if (size()) {
      seed();
      /* Mouvement réduit : une seule image, les poussières sans les chutes. */
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { frame(); cancelAnimationFrame(raf); raf = 0; }
      else raf = requestAnimationFrame(frame);
      return;
    }
    if (++tries < 40) tid = setTimeout(attempt, 60);
  };
  attempt();
  return {
    destroy() {
      if (tid) clearTimeout(tid);
      if (raf) cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
    },
  };
}
