import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const errors = [];
function visit(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) visit(file);
    else if (/\.(tsx|css)$/.test(file)) {
      const source = readFileSync(file, "utf8");
      // 阴影是 Agent 模板自带的投影参数（Tailwind shadow-[...] 任意值），不属于主题颜色
      const colorSource = source.replace(/shadow-\[[^\]]*\]/g, "");
      if (
        !file.endsWith("index.css") &&
        /#[\da-f]{3,8}\b|(?:rgb|hsl)a?\(/i.test(colorSource)
      )
        errors.push(`${file}: 使用语义颜色 Token`);
      if (/https:\/\/www\.figma\.com\/api\/mcp\/asset/.test(source))
        errors.push(`${file}: 禁止临时素材 URL`);
    }
  }
}
visit("src");
let assetCount=0;
for (const directory of ["public/figma-home","public/generated-banners","public/host-tabs"]) {
 const manifest=JSON.parse(readFileSync(join(directory,"manifest.json"),"utf8"));
 for(const asset of manifest.assets) {if(statSync(join(directory,asset.file)).size!==asset.bytes)errors.push(`资源损坏：${asset.file}`);assetCount++}
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`[mobile] 语义颜色与 ${assetCount} 个本地素材检查通过`);
