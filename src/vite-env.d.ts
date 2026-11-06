/// <reference types="vite/client" />

interface FbqEventOptions {
  eventID?: string;
}

interface Fbq {
  (command: 'init', pixelId: string): void;
  (
    command: 'track',
    event: string,
    params?: Record<string, unknown>,
    options?: FbqEventOptions
  ): void;
  (
    command: 'trackCustom',
    event: string,
    params?: Record<string, unknown>,
    options?: FbqEventOptions
  ): void;
}

interface Window {
  fbq?: Fbq;
  _fbq?: Fbq;
}

declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.JPG' {
  const src: string;
  export default src;
}
declare module '*.webp' {
  const src: string;
  export default src;
}
declare module '*.mp4' {
  const src: string;
  export default src;
}
