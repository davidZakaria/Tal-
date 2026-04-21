/* eslint-disable no-console */
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd(), "public/images");
const TARGETS = [
  path.join(ROOT, "Stock"),
  path.join(ROOT, "Hook Background image"),
];

// Cap at 2400px on the longest side (hero is the only asset that truly needs >1920).
const MAX_WIDTH = 2400;
const QUALITY = 82;

const EXTS = new Set([".png", ".jpg", ".jpeg"]);

async function listFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const out = [];
    for (const e of entries) {
      if (e.isDirectory()) {
        out.push(...(await listFiles(path.join(dir, e.name))));
      } else {
        out.push(path.join(dir, e.name));
      }
    }
    return out;
  } catch {
    return [];
  }
}

function humanKB(bytes) {
  return (bytes / 1024).toFixed(0) + " KB";
}

async function convert(file) {
  const ext = path.extname(file).toLowerCase();
  if (!EXTS.has(ext)) return null;

  const outFile = file.slice(0, -ext.length) + ".webp";
  const srcStat = await stat(file);

  const img = sharp(file, { failOn: "truncated" });
  const meta = await img.metadata();

  const pipeline = img.clone();
  if ((meta.width || 0) > MAX_WIDTH) {
    pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }
  await pipeline.webp({ quality: QUALITY, effort: 5 }).toFile(outFile);

  const outStat = await stat(outFile);
  await unlink(file);

  return {
    file: path.relative(ROOT, file),
    before: srcStat.size,
    after: outStat.size,
    saved: srcStat.size - outStat.size,
  };
}

(async () => {
  let totalBefore = 0;
  let totalAfter = 0;
  const rows = [];

  for (const dir of TARGETS) {
    const files = await listFiles(dir);
    for (const f of files) {
      try {
        const r = await convert(f);
        if (!r) continue;
        totalBefore += r.before;
        totalAfter += r.after;
        rows.push(r);
        console.log(
          `${r.file}  ${humanKB(r.before)} -> ${humanKB(r.after)}  (saved ${humanKB(r.saved)})`,
        );
      } catch (err) {
        console.error(`FAILED ${f}:`, err.message);
      }
    }
  }

  console.log("------------------------------------------------------------");
  console.log(
    `Converted ${rows.length} files: ${(totalBefore / 1024 / 1024).toFixed(1)} MB -> ${(totalAfter / 1024 / 1024).toFixed(1)} MB (saved ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)} MB)`,
  );
})();
