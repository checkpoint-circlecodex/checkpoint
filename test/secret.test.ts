import { strict as assert } from "node:assert";
import { test } from "node:test";
import { makeSecret } from "../src/shell/secret.ts";

const play = (sides: string, times?: number[]) => {
  const press = makeSecret();
  let opened = false;
  [...sides].forEach((s, i) => { if (press(s as "g" | "d", times?.[i] ?? i * 200)) opened = true; });
  return opened;
};

test("gauche, droite, gauche, droite, gauche ouvre l'établi", () => {
  assert.equal(play("gdgdg"), true);
});

test("quatre clics ne suffisent pas", () => {
  assert.equal(play("gdgd"), false);
});

test("une pause trop longue remet la séquence à zéro", () => {
  assert.equal(play("gdgdg", [0, 200, 400, 2400, 2600]), false);
});

test("une erreur remet à zéro, mais un bon départ compte comme départ", () => {
  assert.equal(play("ggdgdg"), true, "le second « gauche » reprend la séquence");
  assert.equal(play("dgdgdg"), true, "un « droite » perdu au début ne gâche rien");
});

test("cliquer toujours le même bouton n'ouvre rien", () => {
  assert.equal(play("ggggggggg"), false);
});
