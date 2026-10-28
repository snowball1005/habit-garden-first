const CACHE='habit-pwa-first-v4';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('habit-pwa-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]))});
self.addEventListener('fetch',event=>{
const req=event.request,url=new URL(req.url);
if(req.method!=='GET')return;
const own=url.origin===self.location.origin;
const lib=url.hostname==='esm.sh'||url.hostname==='www.gstatic.com';
if(!own&&!lib)return; // Never cache Supabase API or user data in a shared service-worker cache.
if(own&&req.mode==='navigate'){
 event.respondWith(fetch(req).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return r}).catch(async()=>await caches.match(req)||await caches.match('./index.html')));return;
}
event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return r})));
});
