/* GitHub rend et attend du base64. `atob`/`btoa` ne connaissent que les
   octets : passer par eux directement casse le premier « é » venu — et les
   chroniques sont en français. On encode donc explicitement en UTF-8. */

export function toB64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

export function fromB64(b64: string): string {
  /* GitHub coupe le base64 en lignes de 60 caractères ; atob ne les tolère pas. */
  const raw = atob(b64.replace(/\s+/g, ""));
  const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
