export function saveToLocal(key: string, data: any){
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}
export function loadFromLocal(key: string){
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}
