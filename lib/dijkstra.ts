export function dijkstra(n: number, edges: {i:number;j:number;w:number}[], src: number, dst: number){
  const adj: [number, number][][] = Array.from({ length: n }, () => []);
  for (const e of edges){ adj[e.i].push([e.j, e.w]); adj[e.j].push([e.i, e.w]); }
  const dist = Array(n).fill(Infinity); dist[src] = 0;
  const prev = Array(n).fill(-1);
  const vis = Array(n).fill(false);
  for (let it=0; it<n; it++){
    let u=-1, best=Infinity;
    for (let i=0;i<n;i++) if (!vis[i] && dist[i]<best){ best=dist[i]; u=i; }
    if (u===-1) break; vis[u]=true; if (u===dst) break;
    for (const [v,w] of adj[u]){
      const nd = dist[u] + w;
      if (nd < dist[v]){ dist[v]=nd; prev[v]=u; }
    }
  }
  if (dist[dst]===Infinity) return null;
  const path: number[] = [];
  for (let v=dst; v!==-1; v=prev[v]) path.push(v);
  path.reverse();
  return path;
}
