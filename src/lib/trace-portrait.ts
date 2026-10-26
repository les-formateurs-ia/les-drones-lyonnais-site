// Turns a team photo into a vector portrait in the brand palette, at build time.
// The photo is reduced to a few flat tones (cream → gold → ink), each traced as its own
// layer, so the page can build the portrait up layer by layer like a screen print.
// Swap a photo in src/assets/team and the portrait is regenerated on the next build.
import path from 'node:path';
import sharp from 'sharp';
import ImageTracer from 'imagetracerjs';

/** Light to dark — also the order in which the layers are printed. */
const PALETTE = ['#ffffff', '#f1e8d8', '#d8bd8e', '#af854a', '#6e5332', '#161616'];
/** Resolution of the traced bitmap: enough detail for a portrait shown under 160px. */
const TRACE_WIDTH = 200;

export interface PortraitLayer {
  color: string;
  paths: string[];
}

export interface Portrait {
  viewBox: string;
  layers: PortraitLayer[];
}

const toRgb = (hex: string) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
  a: 255,
});
const rgbKey = (hex: string) => {
  const { r, g, b } = toRgb(hex);
  return `rgb(${r},${g},${b})`;
};

const cache = new Map<string, Promise<Portrait>>();

/** @param file a file name in src/assets/team */
export function tracePortrait(file: string): Promise<Portrait> {
  if (!cache.has(file)) cache.set(file, trace(file));
  return cache.get(file)!;
}

async function trace(file: string): Promise<Portrait> {
  // Builds run from the project root.
  const source = path.join(process.cwd(), 'src/assets/team', file);
  const { data, info } = await sharp(source)
    .flatten({ background: '#ffffff' })
    .resize(TRACE_WIDTH)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const svg: string = ImageTracer.imagedataToSVG(
    { width: info.width, height: info.height, data: new Uint8ClampedArray(data) },
    {
      pal: PALETTE.map(toRgb),
      colorsampling: 0,
      numberofcolors: PALETTE.length,
      colorquantcycles: 1,
      blurradius: 1,
      blurdelta: 30,
      pathomit: 12,
      roundcoords: 1,
      ltres: 1,
      qtres: 1,
      linefilter: true,
      strokewidth: 0,
      viewbox: true,
      desc: false,
    },
  );

  const layers: PortraitLayer[] = PALETTE.map((color) => ({ color, paths: [] }));
  for (const [, fill, d] of svg.matchAll(/<path fill="([^"]+)"[^>]*? d="([^"]+)"/g)) {
    const layer = layers.find((l) => rgbKey(l.color) === fill);
    layer?.paths.push(d.trim());
  }

  return {
    viewBox: `0 0 ${info.width} ${info.height}`,
    // White is the page itself: dropping it leaves the portrait's background transparent.
    layers: layers.slice(1).filter((l) => l.paths.length > 0),
  };
}
