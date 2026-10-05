/** Hash routing is used for static hosts without SPA rewrites (set VITE_ROUTER=hash at build time). */
export const HASH_ROUTING = import.meta.env.VITE_ROUTER === 'hash'
