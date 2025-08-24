import * as turf from "@turf/turf";
import { dijkstra } from "@/lib/dijkstra";

export function buildSafePath(start: any, end: any, obstacles: any[]) {
  // Nodes: start (0), end (1), then polygon vertices
  const nodes: any[] = [start.geometry.coordinates, end.geometry.coordinates];
  const polyRings: any[][] = [];
  obstacles.forEach(poly => {
    const coords = poly.geometry.coordinates[0];
    // ensure closed ring
    const ring = coords.slice(0, coords.length - 1);
    ring.forEach((c: any) => nodes.push(c));
    polyRings.push(coords);
  });

  // Build edges where segment is visible (does not cross any polygon interior or edge)
  const edges: { i:number; j:number; w:number }[] = [];
  for (let i=0;i<nodes.length;i++){
    for (let j=i+1;j<nodes.length;j++){
      if (visible(nodes[i], nodes[j], obstacles)){
        const seg = turf.lineString([nodes[i], nodes[j]]);
        const w = turf.length(seg, { units: "kilometers" });
        edges.push({ i, j, w });
      }
    }
  }

  const pathIdx = dijkstra(nodes.length, edges, 0, 1);
  if (!pathIdx) return null;
  const coords = pathIdx.map(k => nodes[k]);
  return { route: turf.lineString(coords) };
}

function visible(a: any, b: any, obstacles: any[]) {
  const seg = turf.lineString([a,b]);
  // Midpoint must not be inside any polygon (cheap interior test)
  const mid = turf.along(seg, turf.length(seg, { units: "kilometers" })/2, { units: "kilometers" });
  for (const poly of obstacles){
    if (turf.booleanPointInPolygon(mid, poly)) return false;
    // Check intersection with polygon boundary
    const outline = turf.polygonToLine(poly);
    const ints = turf.lineIntersect(seg, outline as any);
    if (ints.features.length > 0){
      // allow touching at endpoints if the intersection is exactly at a or b
      const ok = ints.features.every(f=> {
        const p = f.geometry.coordinates as turf.Coord;
        return approxCoord(p,a) || approxCoord(p,b);
      });
      if (!ok) return false;
    }
  }
  return true;
}

function approxCoord(p: any, q: any){
  return Math.abs(p[0]-q[0]) < 1e-9 && Math.abs(p[1]-q[1]) < 1e-9;
}
