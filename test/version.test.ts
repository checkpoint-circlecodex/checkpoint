/* Le bandeau ne doit jamais proposer de « mettre à jour » vers une version
   plus ancienne, ni se taire devant une plus récente. */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { newer } from "../src/shell/version.ts";

test("une version plus récente se voit, une égale ou plus ancienne non", () => {
  assert.ok(newer("0.2.0", "0.1.0"));
  assert.ok(newer("v0.1.1", "0.1.0"));
  assert.ok(newer("1.0.0", "0.9.9"));
  assert.ok(newer("0.10.0", "0.9.0"), "10 après 9, pas avant comme en ordre alphabétique");
  assert.ok(!newer("0.1.0", "0.1.0"));
  assert.ok(!newer("0.1.0", "0.2.0"));
});

test("une préversion passe avant la version qu'elle annonce", () => {
  assert.ok(newer("0.2.0", "0.2.0-rc.1"));
  assert.ok(!newer("0.2.0-rc.1", "0.2.0"));
  assert.ok(newer("0.2.0-rc.2", "0.2.0-rc.1"));
  assert.ok(newer("0.2.0-rc.10", "0.2.0-rc.9"));
});
