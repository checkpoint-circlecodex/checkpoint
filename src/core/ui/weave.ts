/* ==========================================================================
   LA TRAME — une texture animée par Ordre, dans sa couleur, derrière tout.

   Reprise **telle quelle** du prototype, à la typographie des signatures
   près. Ce n'est pas de la paresse : *un générateur ne se juge qu'à l'image*,
   et celle-ci a été jugée. La réécrire « plus proprement » reviendrait à la
   rejuger sans la regarder.

   Un seul moteur, cinq comportements, **séparés par le geste et jamais par la
   teinte**. Le mage est continu et immobile, le ranger tombe en tournoyant,
   le soigneur s'ouvre en cercles, le barde ondule à l'horizontale, le
   guerrier est le seul discontinu et le seul balistique. Avant d'ajouter un
   comportement, vérifier qu'il n'est le voisin d'aucun autre.

   Très faible opacité : **une trame est un fond — si elle se remarque, elle a
   déjà échoué.** ~1 % d'encre, une minute pour traverser l'écran.
   ========================================================================== */

export function startWeave(canvas: HTMLCanvasElement, kind: string, hex: string): () => void {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w = 0, h = 0, raf = 0, t = 0;
  let P: any[] = [];
  const R = (a = 1, b = 0) => b + Math.random() * (a - b);

  function size(){
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    w = r.width; h = r.height;
    canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return true;
  }

  /* MAGE      un ciel fixe qui scintille, travers\u00e9 de com\u00e8tes en diagonale
     GUERRIER  une forêt de lances qui défile. Des hampes longues, inclinées,
               qui dérivent LENTEMENT d'un bord à l'autre en ondulant comme un
               pas — une troupe en marche, vue au-dessus des rangs.
     Les cinq trames se séparent par le GESTE, jamais par la teinte, et aucune
     ne peut en imiter une autre : le mage est continu et immobile, le ranger
     tombe lentement en tournoyant, le soigneur s'ouvre en cercles, le barde
     ondule à l'horizontale. Le guerrier est le seul à DÉRIVER de côté en
     masse rigide, et le seul fait de verticales.
     ⚠️ Deux versions écartées, et les deux pour l'image, jamais pour le
     mécanisme. Les braises qui montaient ne disaient que « feu ». Les gerbes
     d'étincelles, rouges et projetées, se lisaient comme du SANG, et leur
     vitesse rendait la page illisible. Une trame est un fond : si elle se
     remarque, elle a déjà échoué. Celle-ci met une minute à traverser. */
  function star(){ return { c:false, x:R(w), y:R(h), r:R(3.2,.9), ph:R(6.28), sp:R(.05,.014),
                            big:Math.random() < .34 }; }
  function comet(init?: boolean){ return { c:true, x:R(w*1.15,-w*.15), y:init ? R(h) : R(-60,-420),
                                 vx:R(7.5,4), vy:R(4.6,2.4), len:R(150,80) }; }
  /* Une lance. `d` est sa distance : au premier rang elle est longue, nette et
     avance vite ; au fond elle est courte, pâle et traîne. Cette seule variable
     donne son épaisseur à la troupe. */
  function lance(init?: boolean){
    const d = R(1, .34);
    return { k:"lance", d,
      x: init ? R(w + 80, -80) : -60 - R(90),
      base: R(h*1.12, h*.98),     /* le pied toujours hors champ : on ne voit que ce qui dépasse */
      len:  h*.13 + h*.26*d,
      tilt: R(.19,-.10),
      sway: R(.030,.010),
      bob:  R(3.4,1.1),
      sp:   .09 + d*.17,
      flag: Math.random() < .13 };
  }
  function seed(){
    P = [];
    if (kind === "mage"){
      for (let i = 0; i < 118; i++) P.push(star());
      for (let i = 0; i < 4; i++)   P.push(comet(true));
    } else if (kind === "guerrier"){
      for (let i = 0; i < 30; i++) P.push(lance(true));
      P.sort((a,b) => a.d - b.d);
    } else if (kind === "ranger"){
      for (let i = 0; i < 64; i++)  P.push({ x:R(w), y:R(h), a:R(6.28), va:R(.024,-.024),
        vy:R(.8,.3), sw:R(42,16), ph:R(6.28), s:R(13,6) });
    } else if (kind === "soigneur"){
      for (let i = 0; i < 11; i++)  P.push({ x:R(w*.84,w*.16), y:R(h*.8,h*.2),
        r:R(Math.min(w,h)*.55), max:R(Math.min(w,h)*.8, Math.min(w,h)*.38), sp:R(.8,.34) });
    } else if (kind === "barde"){
      for (let i = 0; i < 11; i++)  P.push({ y:R(h), ph:R(6.28), amp:R(40,14),
        len:R(.015,.005), sp:R(.011,.004), dy:R(.18,-.18) });
    }
  }

  function frame(){
    raf = 0; ctx.clearRect(0,0,w,h); t += 1;
    ctx.fillStyle = hex; ctx.strokeStyle = hex; ctx.lineCap = "round";

    for (let i = 0; i < P.length; i++){
      const p = P[i];

      if (kind === "mage"){
        if (p.c){                                   /* la com\u00e8te */
          p.x += p.vx; p.y += p.vy;
          if (p.y > h + 80 || p.x > w + 120){ P[i] = comet(false); continue; }
          const g = ctx.createLinearGradient(p.x, p.y, p.x - p.vx*p.len/6, p.y - p.vy*p.len/6);
          g.addColorStop(0, hex); g.addColorStop(1, "transparent");
          ctx.strokeStyle = g; ctx.globalAlpha = .55; ctx.lineWidth = 2.1;
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x - p.vx*p.len/6, p.y - p.vy*p.len/6); ctx.stroke();
          ctx.strokeStyle = hex; ctx.globalAlpha = .66;
          ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, 6.2832); ctx.fill();
          continue;
        }
        p.ph += p.sp;                               /* l'\u00e9toile ne bouge pas, elle respire */
        const tw = .18 + .42*(0.5 + 0.5*Math.sin(p.ph));
        ctx.globalAlpha = tw;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r*(.75 + .35*tw), 0, 6.2832); ctx.fill();
        if (p.big){
          ctx.globalAlpha = tw*.55; ctx.lineWidth = 1;
          const L = p.r*3.4*tw;
          ctx.beginPath(); ctx.moveTo(p.x-L,p.y); ctx.lineTo(p.x+L,p.y);
          ctx.moveTo(p.x,p.y-L); ctx.lineTo(p.x,p.y+L); ctx.stroke();
        }
      }

      else if (kind === "guerrier"){
        p.x += p.sp;
        if (p.x > w + 70){ P[i] = lance(false); continue; }
        /* La phase se lit sur la POSITION, pas sur la particule : une houle
           traverse alors la troupe, au lieu que chacun oscille pour soi. */
        const ph = t*.0075 - p.x*.0065;
        const a  = p.tilt + Math.sin(ph)*p.sway;
        const y0 = p.base + Math.sin(ph*1.9)*p.bob;
        const sa = Math.sin(a), ca = Math.cos(a);
        const x1 = p.x + sa*p.len, y1 = y0 - ca*p.len;
        ctx.globalAlpha = .12 + p.d*.16;
        ctx.lineWidth = .7 + p.d*.6;
        ctx.beginPath(); ctx.moveTo(p.x, y0); ctx.lineTo(x1, y1); ctx.stroke();
        const fl = 7 + p.d*7;
        ctx.globalAlpha = .18 + p.d*.22; ctx.lineWidth = 1.1 + p.d*.9;
        ctx.beginPath(); ctx.moveTo(x1 - sa*fl, y1 + ca*fl); ctx.lineTo(x1, y1); ctx.stroke();
        if (p.flag){
          const bw = 10 + p.d*8, bh = 7 + p.d*5, dr = Math.sin(ph*1.5 + 1.1)*.30;
          const bx = x1 - sa*(fl + 3), by = y1 + ca*(fl + 3);
          ctx.globalAlpha = .12 + p.d*.15;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx - bw, by + bw*dr);
          ctx.lineTo(bx - bw*.72, by + bh + bw*dr*.6);
          ctx.lineTo(bx, by + bh);
          ctx.closePath(); ctx.fill();
        }
      }

      else if (kind === "ranger"){
        p.y += p.vy; p.a += p.va; p.ph += .02;
        const x = p.x + Math.sin(p.ph)*p.sw;
        if (p.y > h + 34){ p.y = -34; p.x = R(w); continue; }
        ctx.globalAlpha = .34;
        ctx.save(); ctx.translate(x, p.y); ctx.rotate(p.a + Math.sin(p.ph)*.55);
        ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s*.38, 0, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = .5; ctx.lineWidth = Math.max(.7, p.s*.1);
        ctx.beginPath(); ctx.moveTo(-p.s*1.25, 0); ctx.lineTo(p.s*1.25, 0); ctx.stroke();
        ctx.restore();
      }

      else if (kind === "soigneur"){
        p.r += p.sp;
        if (p.r > p.max){ p.r = 0; p.x = R(w*.84,w*.16); p.y = R(h*.8,h*.2); continue; }
        const k = 1 - p.r/p.max;
        ctx.globalAlpha = .46*k*k; ctx.lineWidth = 1.8*k + .5;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.stroke();
      }

      else if (kind === "barde"){
        p.ph += p.sp; p.y += p.dy;
        if (p.y < -60) p.y = h + 60; if (p.y > h + 60) p.y = -60;
        ctx.globalAlpha = .32; ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6){
          const y = p.y + Math.sin(x*p.len + p.ph)*p.amp;
          x ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
        }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  const onResize = () => { if (size()) seed(); };
  addEventListener("resize", onResize);

  /* La couche peut n'être pas encore mise en page quand on arrive : le canevas
     mesure alors zéro, et l'ancienne version abandonnait là — une chambre sans
     trame, sans rien pour le signaler. On réessaie, par minuterie et jamais par
     image d'animation : un onglet qui n'est pas rendu n'en produit aucune. */
  let tid = 0, tries = 0;
  const begin = () => {
    seed();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches){ frame(); if (raf) cancelAnimationFrame(raf); raf = 0; }
    else raf = requestAnimationFrame(frame);
  };
  const attempt = () => {
    tid = 0;
    if (size()) return begin();
    if (++tries < 40) tid = setTimeout(attempt, 60);
  };
  attempt();
  return () => { if (tid) clearTimeout(tid);
                 if (raf) cancelAnimationFrame(raf); removeEventListener("resize", onResize); };
}


/** Action Svelte : la trame vit le temps du nœud, et s'arrête avec lui.
    **Le nettoyage ne dépend d'aucune image d'animation** — c'est la
    destruction du nœud qui l'appelle, et elle, elle arrive toujours. */
export function weave(node: HTMLCanvasElement, p: { kind: string; hex: string }) {
  let stop = startWeave(node, p.kind, p.hex);
  return {
    update(next: { kind: string; hex: string }) {
      stop();
      stop = startWeave(node, next.kind, next.hex);
    },
    destroy() { stop(); },
  };
}
