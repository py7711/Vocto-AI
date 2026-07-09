import {readFileSync, writeFileSync, existsSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {Resvg} from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const fontPath = join(__dirname, ".fonts/Inter-Black.ttf");

const exports = [
  {svg: "public/votxt-logo-dark.svg", png: "public/votxt-logo-dark.png", width: 2820},
  {svg: "public/votxt-logo.svg", png: "public/votxt-logo.png", width: 2820},
  // Google OAuth「应用徽标」要求正方形，建议 1200×1200。
  {svg: "public/favicon.svg", png: "public/votxt-app-icon.png", width: 1200}
];

function prepareSvg(svgPath) {
  let svg = readFileSync(join(root, svgPath), "utf8");
  svg = svg.replace(
    "<svg ",
    '<svg shape-rendering="geometricPrecision" text-rendering="geometricPrecision" '
  );
  return svg;
}

function renderPng(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: {mode: "width", value: width},
    background: "rgba(0,0,0,0)",
    font: {
      fontFiles: [fontPath],
      loadSystemFonts: false,
      defaultFontFamily: "Inter",
      serifFamily: "Inter",
      sansSerifFamily: "Inter",
      monospaceFamily: "Inter",
      cursiveFamily: "Inter",
      fantasyFamily: "Inter"
    }
  });
  const rendered = resvg.render();
  return {png: rendered.asPng(), width: rendered.width, height: rendered.height};
}

if (!existsSync(fontPath)) {
  console.error(`缺少字体：${fontPath}`);
  console.error('请运行：curl -fsSL "https://cdn.jsdelivr.net/fontsource/fonts/inter@5.2.5/latin-900-normal.ttf" -o scripts/.fonts/Inter-Black.ttf');
  process.exit(1);
}

for (const item of exports) {
  const svg = prepareSvg(item.svg);
  const {png, width, height} = renderPng(svg, item.width);
  writeFileSync(join(root, item.png), png);
  console.log(`已导出 ${item.png} (${width}x${height}, ${(png.length / 1024).toFixed(1)} KB)`);
}
