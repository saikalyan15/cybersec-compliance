// This file extends Next.js types
// No imports needed here
declare module 'next/server' {
  interface RouteHandlerContext {
    params: {
      [key: string]: string | string[];
    };
  }
}
