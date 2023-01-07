import fs from 'fs-extra';
import path from 'path';

async function main() {
  const dest = path.resolve(__dirname, '../dist/vot.mjs');
  const mjsCode = fs.readFileSync(dest, 'utf-8');
  const replaced = mjsCode.replace(
    ` from 'vue-router';`,
    ` from 'vue-router/dist/vue-router.mjs';`,
  );
  fs.writeFileSync(dest, replaced);
}

export default main();
