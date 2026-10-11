<script lang="ts">
  /* Étape 1 du portage : la coque ne fait encore rien d'autre que prouver que
     la chaîne tient — une vue lit le noyau, qui lit la plateforme. Les vraies
     vues arrivent à l'étape 4, dans l'ordre du registre. */
  import { fakePlatform } from "$platform/index";
  import { SCHEMA_VERSION, shardPath, type Shard } from "$core/model/schema";

  const seed: Shard = {
    schemaVersion: SCHEMA_VERSION,
    user: { id: "ncarmichael", firstName: "Nathan", handle: "Nath", circle: "mage" },
    updatedAt: new Date().toISOString(),
    works: {}, entries: {},
  };
  const platform = fakePlatform({ [shardPath(seed.user.id)]: JSON.stringify(seed) });

  let lines = $state<string[]>([]);
  (async () => {
    const tree = await platform.storage.list();
    const blob = await platform.storage.read(tree[0].path);
    const shard: Shard = JSON.parse(blob!.text);
    const role = await platform.storage.roleOf(shard.user.id);
    lines = [
      `${tree.length} fragment lu — ${blob!.path}`,
      `${shard.user.firstName}, ${shard.user.circle}, schéma v${shard.schemaVersion}`,
      `rôle dans l'organisation : ${role}`,
    ];
  })();
</script>

<main>
  <h1>Checkpoint</h1>
  <p class="sub">Portage en cours — la coque, le noyau et la plateforme se parlent.</p>
  <ul>{#each lines as l}<li>{l}</li>{/each}</ul>
</main>

<style>
  main { display: grid; place-content: center; height: 100%; gap: 10px; padding: 0 34px; }
  h1 { font-family: var(--fs); font-weight: 400; font-size: 54px; line-height: 1; }
  .sub { color: var(--dim); font-size: 13px; }
  ul { list-style: none; border-top: 1px solid var(--rule); margin-top: 10px; }
  li { border-bottom: 1px solid var(--rule); padding: 7px 0; font-size: 12.5px; color: var(--ink2); }
</style>
