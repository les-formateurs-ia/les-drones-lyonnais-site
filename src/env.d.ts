// imagetracerjs ships no types; only the call used by lib/trace-portrait.ts is declared.
declare module 'imagetracerjs' {
  interface ImageDataLike {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }
  const ImageTracer: {
    imagedataToSVG(image: ImageDataLike, options: Record<string, unknown>): string;
  };
  export default ImageTracer;
}
