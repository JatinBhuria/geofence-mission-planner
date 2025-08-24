"use client";
import { MapContainer, TileLayer, FeatureGroup, Polyline, Marker, Popup, useMapEvents, Polygon, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import * as turf from "@turf/turf";
import { buildSafePath } from "@/lib/path";
import { saveAs } from "file-saver";
import tokml from "tokml";
import togpx from "togpx";
import { saveToLocal, loadFromLocal } from "@/lib/storage";

// Fix default marker icons in Next/Leaflet
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Create INSANE custom drone icon
const droneIcon = L.divIcon({
  className: 'custom-drone-icon',
  html: `
    <div style="
      width: 48px; 
      height: 48px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ff6b6b 100%);
      border: 4px solid #ffffff;
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      box-shadow: 
        0 0 40px rgba(102, 126, 234, 0.8), 
        0 0 80px rgba(118, 75, 162, 0.6),
        0 0 120px rgba(255, 107, 107, 0.4),
        inset 0 0 20px rgba(255, 255, 255, 0.4);
      position: relative;
      animation: droneFloat 4s ease-in-out infinite;
    ">
      <div style="
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border-radius: 50%;
        border: 3px solid #667eea;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: droneSpin 3s linear infinite;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          box-shadow: 
            0 0 20px #667eea,
            0 0 40px #764ba2;
          animation: dronePulse 1.5s ease-in-out infinite;
        "></div>
      </div>
      
      <!-- INSANE Rotating rings -->
      <div style="
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 12px solid #667eea;
        animation: droneRotate 2s linear infinite;
        filter: drop-shadow(0 0 10px #667eea);
      "></div>
      
      <div style="
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 10px solid #764ba2;
        animation: droneRotate 3s linear infinite reverse;
        filter: drop-shadow(0 0 8px #764ba2);
      "></div>
      
      <!-- INSANE Energy particles -->
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: 60px;
        height: 60px;
        transform: translate(-50%, -50%);
        border: 2px solid rgba(102, 126, 234, 0.3);
        border-radius: 50%;
        animation: droneEnergy 2s ease-in-out infinite;
      "></div>
      
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: 40px;
        height: 40px;
        transform: translate(-50%, -50%);
        border: 1px solid rgba(118, 75, 162, 0.4);
        border-radius: 50%;
        animation: droneEnergy 1.5s ease-in-out infinite reverse;
      "></div>
      
      <style>
        @keyframes droneFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-10px) rotate(1deg) scale(1.05); }
          50% { transform: translateY(-15px) rotate(-1deg) scale(1.1); }
          75% { transform: translateY(-8px) rotate(0.5deg) scale(1.02); }
        }
        @keyframes dronePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
        @keyframes droneRotate {
          0% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg); }
        }
        @keyframes droneSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes droneEnergy {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
        }
      </style>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24]
});

const INIT = { lat: 28.6139, lng: 77.2090, zoom: 11 }; // Delhi default

// Draggable Marker Component
function DraggableMarker({ position, onDragEnd, color, label }: { 
  position: { lat: number; lng: number }; 
  onDragEnd: (latlng: { lat: number; lng: number }) => void; 
  color: string; 
  label: string; 
}) {
  const markerRef = useRef<L.Marker>(null);
  const map = useMap();

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.on('dragend', () => {
        const marker = markerRef.current;
        if (marker) {
          const latlng = marker.getLatLng();
          onDragEnd({ lat: latlng.lat, lng: latlng.lng });
        }
      });
    }
  }, [onDragEnd]);

  const customIcon = L.divIcon({
    className: 'custom-draggable-marker',
    html: `
      <div style="
        width: 36px; 
        height: 36px; 
        background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); 
        border: 4px solid #ffffff;
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 15px ${color}80, inset 0 0 10px rgba(255, 255, 255, 0.4);
        font-size: 16px;
        color: white;
        font-weight: bold;
        cursor: move;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
        transition: all 0.3s ease;
        animation: markerFloat 4s ease-in-out infinite;
      ">
        ${label.charAt(0)}
        <style>
          @keyframes markerFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-5px) scale(1.05); }
          }
        </style>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });

  return (
    <Marker 
      ref={markerRef}
      position={position} 
      icon={customIcon}
      draggable={true}
    >
      <Popup>{label}</Popup>
    </Marker>
  );
}

// Auto-align component that uses useMap hook
function AutoAlignButton({ 
  startLatLng, 
  endLatLng, 
  polys, 
  routePositions, 
  trigger 
}: { 
  startLatLng: any; 
  endLatLng: any; 
  polys: any[]; 
  routePositions: any[]; 
  trigger: number; 
}) {
  const map = useMap();

  useEffect(() => {
    if (trigger > 0) {
      const bounds = L.latLngBounds([]);
      
      // Add start point
      if (startLatLng) {
        bounds.extend(startLatLng);
      }
      
      // Add end point
      if (endLatLng) {
        bounds.extend(endLatLng);
      }
      
      // Add all polygon points
      polys.forEach(poly => {
        const coords = poly.geometry.coordinates[0];
        coords.forEach((coord: any) => {
          bounds.extend([coord[1], coord[0]]);
        });
      });
      
      // Add route points if available
      if (routePositions.length > 0) {
        routePositions.forEach((pos: any) => {
          bounds.extend(pos);
        });
      }
      
      // If we have bounds, fit the map to them with padding
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 16,
          animate: true
        });
      }
    }
  }, [trigger, map, startLatLng, endLatLng, polys, routePositions]);

  return null; // This component doesn't render anything
}

export default function MapCanvas({ bufferMeters, speedMps, storeKey}:{ bufferMeters:number; speedMps:number; storeKey:string; }){
  const [polys, setPolys] = useState<any[]>([]);
  const [start, setStart] = useState<any|null>(null);
  const [end, setEnd] = useState<any|null>(null);
  const [route, setRoute] = useState<any|null>(null);
  const [playing, setPlaying] = useState(false);
  const [progressM, setProgressM] = useState(0);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<any[]>([]);
  const [autoAlignTrigger, setAutoAlignTrigger] = useState(0);

  // Add test polygon function
  const addTestPolygon = () => {
    const testPoly = turf.polygon([[
      [77.2090, 28.6139], // Delhi center
      [77.2190, 28.6139],
      [77.2190, 28.6239],
      [77.2090, 28.6239],
      [77.2090, 28.6139]
    ]]);
    setPolys(prev => [...prev, testPoly]);
    console.log('Test polygon added:', testPoly);
  };

  // Manual drawing functions
  const startManualDrawing = () => {
    setDrawingMode(true);
    setDrawingPoints([]);
    console.log('Manual drawing mode started');
  };

  const completeManualDrawing = () => {
    if (drawingPoints.length >= 3) {
      const coords = [...drawingPoints, drawingPoints[0]]; // Close the polygon
      const newPoly = turf.polygon([coords]);
      setPolys(prev => [...prev, newPoly]);
      console.log('Manual polygon completed:', newPoly);
    }
    setDrawingMode(false);
    setDrawingPoints([]);
  };

  const cancelManualDrawing = () => {
    setDrawingMode(false);
    setDrawingPoints([]);
    console.log('Manual drawing cancelled');
  };

  // load/save
  useEffect(()=>{
    const saved = loadFromLocal(storeKey);
    if (saved) { setPolys(saved.polys||[]); setStart(saved.start||null); setEnd(saved.end||null); }
  },[storeKey]);
  useEffect(()=>{ saveToLocal(storeKey, { polys, start, end }); },[polys, start, end, storeKey]);
  
  // Debug polygons state
  useEffect(() => {
    console.log('Polygons state updated:', polys);
  }, [polys]);

  // Auto-sync polygons after a short delay when feature group changes
  useEffect(() => {
    const timer = setTimeout(() => {
      syncPolygons();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Derived buffered polygons
  const bufferedPolys = useMemo(()=>{
    if (!bufferMeters) return polys;
    return polys.map(p=> turf.buffer(p, bufferMeters, { units: "meters" }));
  },[polys, bufferMeters]);

  // Playback timer
  const timer = useRef<any>(null);
  useEffect(()=>{
    if (!route || !playing) return;
    const lenKm = turf.length(route, { units: "kilometers" });
    const speedKps = speedMps / 1000; // km per second
    const startTs = Date.now();
    timer.current = setInterval(()=>{
      const elapsed = (Date.now()-startTs)/1000; // s
      const distKm = Math.min(lenKm, elapsed * speedKps);
      setProgressM(distKm*1000);
      if (distKm >= lenKm) { clearInterval(timer.current); setPlaying(false); }
    }, 60);
    return ()=> clearInterval(timer.current);
  },[route, playing, speedMps]);

  const playbackPoint = useMemo(()=>{
    if (!route) return null;
    const lenKm = turf.length(route, { units: "kilometers" });
    const distKm = Math.min(lenKm, progressM/1000);
    return turf.along(route, distKm, { units: "kilometers" });
  },[route, progressM]);

  // Map click to set start/end or draw polygons
  function Clicker(){
    useMapEvents({
      click(e){
        if (drawingMode) {
          // Add point to drawing
          const newPoint = [e.latlng.lng, e.latlng.lat];
          setDrawingPoints(prev => [...prev, newPoint]);
          console.log('Added drawing point:', newPoint);
        } else {
          // Set start/end points
          const pt = turf.point([e.latlng.lng, e.latlng.lat]);
          if (!start) setStart(pt); else if (!end) setEnd(pt); else setEnd(pt);
        }
      }
    });
    return null;
  }

  // Plan route
  async function plan(){
    if (!start || !end) return;
    const res = buildSafePath(start, end, bufferedPolys);
    setRoute(res?.route || null);
  }

  // Sync polygons from feature group
  const syncPolygons = () => {
    if (!featureGroupRef.current) return;
    
    const layers = featureGroupRef.current.getLayers();
    const currentPolys: any[] = [];
    
    layers.forEach((layer: any) => {
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0] as L.LatLng[];
        const coords = latlngs.map((ll: any) => [ll.lng, ll.lat]);
        const poly = turf.polygon([coords]);
        currentPolys.push(poly);
      }
    });
    
    setPolys(currentPolys);
    console.log('Synced polygons:', currentPolys);
  };

  // Export helpers
  function exportGeoJSON(){
    const fc = turf.featureCollection([
      ...polys, ...bufferedPolys.map(p=>({ ...p, properties:{ ...(p.properties||{}), buffered:true }})),
      ...(start?[start]:[]), ...(end?[end]:[]), ...(route?[route]:[])
    ]);
    const blob = new Blob([JSON.stringify(fc,null,2)], { type: "application/json" });
    saveAs(blob, "mission.geojson");
  }
  function exportKML(){
    const fc = turf.featureCollection([ ...(start?[start]:[]), ...(end?[end]:[]), ...(route?[route]:[]), ...bufferedPolys ]);
    const kml = tokml(fc as any);
    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
    saveAs(blob, "mission.kml");
  }
  function exportGPX(){
    const fc = turf.featureCollection([ ...(route?[route]:[]) ]);
    const gpx = togpx(fc as any);
    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    saveAs(blob, "mission.gpx");
  }

  // Drawing handlers
  const onCreated = (e: any) => {
    try {
      console.log('Drawing event received:', e);
      const layer = e.layer as L.Polygon;
      console.log('Layer:', layer);
      
      // Set the style immediately
      layer.setStyle({
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.3,
        weight: 3,
        opacity: 1
      });
      
      const latlngs = layer.getLatLngs()[0] as L.LatLng[];
      console.log('LatLngs:', latlngs);
      const coords = latlngs.map(ll => [ll.lng, ll.lat]);
      coords.push(coords[0]); // Close the polygon
      console.log('Coords:', coords);
      const newPoly = turf.polygon([coords]);
      console.log('New polygon:', newPoly);
      setPolys(prev => {
        const newPolys = [...prev, newPoly];
        console.log('Updated polygons:', newPolys);
        return newPolys;
      });
    } catch (error) {
      console.error('Error creating polygon:', error);
    }
  };
  
  const onDeleted = (e: any) => {
    try {
      console.log('Delete event received:', e);
      // Clear all polygons when deletion occurs
      setPolys([]);
      console.log('All polygons cleared');
    } catch (error) {
      console.error('Error deleting polygons:', error);
    }
  };

  const onEdited = (e: any) => {
    try {
      console.log('Edit event received:', e);
      // Sync polygons after editing
      setTimeout(() => {
        syncPolygons();
      }, 100);
    } catch (error) {
      console.error('Error editing polygons:', error);
    }
  };

  // Render route & points
  const routePositions = useMemo(()=> route ? route.geometry.coordinates.map((coord: any)=>({lat: coord[1], lng: coord[0]})) : [], [route]);
  const startLatLng = start ? { lat: start.geometry.coordinates[1], lng: start.geometry.coordinates[0] } : null;
  const endLatLng = end ? { lat: end.geometry.coordinates[1], lng: end.geometry.coordinates[0] } : null;
  const pbLatLng = playbackPoint ? { lat: playbackPoint.geometry.coordinates[1], lng: playbackPoint.geometry.coordinates[0] } : null;

  const distTotalM = route ? turf.length(route, { units: "kilometers" })*1000 : 0;
  const etaSec = route && speedMps>0 ? Math.max(0, (distTotalM - progressM)/speedMps) : 0;

  // Auto-align map to fit all markers and polygons
  const autoAlignMap = () => {
    // This will be called from the AutoAlignButton component
    setAutoAlignTrigger(prev => prev + 1);
  };

  return (
    <div className="card overflow-hidden">
      <div className="bg-primary border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none">
                {/* DRDO Logo */}
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <line x1="12" y1="4" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="12" y1="18" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="4" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="18" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Operations Control</h3>
              <p className="text-muted text-sm">Advanced drone mission management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-white text-sm">
            {route && (
              <div className="glass px-4 py-2 rounded-lg">
                <div className="text-xs text-muted">Distance</div>
                <div className="font-bold text-accent">{(distTotalM/1000).toFixed(2)}km</div>
                <div className="text-xs text-muted">ETA</div>
                <div className="font-bold text-accent">{Math.ceil(etaSec)}s</div>
              </div>
            )}
            <div className="glass px-4 py-2 rounded-lg">
              <div className="text-xs text-muted">Zones</div>
              <div className="font-bold text-primary">{polys.length}</div>
              <div className="text-xs text-muted">Buffer</div>
              <div className="font-bold text-accent">{bufferMeters}m</div>
            </div>
            {(!start || !end) && (
              <div className="glass px-4 py-2 rounded-lg border-secondary bg-secondary/10">
                <div className="text-secondary font-semibold text-sm">⚠️ Insufficient Data</div>
                <div className="text-muted text-xs">Set start/end points</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <button 
            className={`btn-primary ${
              !start || !end ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={plan}
            disabled={!start || !end}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Execute Route
          </button>
          <button 
            className="btn-secondary"
            onClick={autoAlignMap}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Auto Align
          </button>
          <button 
            className={`${
              !route ? 'opacity-50 cursor-not-allowed' : 
              playing ? 'btn-danger' : 'btn-success'
            }`}
            onClick={()=>setPlaying(p=>!p)} 
            disabled={!route}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {playing ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            {playing ? 'Pause Mission' : 'Start Mission'}
          </button>
          <button 
            className={`btn-secondary ${
              !route ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={()=>{setRoute(null); setProgressM(0);}}
            disabled={!route}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Route
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {!drawingMode ? (
            <button 
              className="btn-success" 
              onClick={startManualDrawing}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Define Zone
            </button>
          ) : (
            <>
              <button 
                className="btn-success" 
                onClick={completeManualDrawing}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Zone
              </button>
              <button 
                className="btn-danger" 
                onClick={cancelManualDrawing}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Abort Zone
              </button>
            </>
          )}
          <button 
            className="btn-secondary" 
            onClick={()=>setPolys([])}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Zones
          </button>
          <button 
            className="btn-secondary" 
            onClick={()=>{setStart(null); setEnd(null);}}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Points
          </button>
          <button 
            className="btn-danger" 
            onClick={()=>{
              setPolys([]);
              setStart(null);
              setEnd(null);
              setRoute(null);
              setProgressM(0);
              setPlaying(false);
              setDrawingMode(false);
              setDrawingPoints([]);
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Reset All
          </button>
        </div>
        
        {drawingMode && (
          <div className="card p-4 border-primary bg-primary/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <div className="text-primary font-semibold text-sm">
                  Zone Definition: {drawingPoints.length} Points Acquired
                </div>
                <div className="text-muted text-xs mt-1">
                  Click map to add points • Minimum 3 points required • Click "Confirm Zone" when complete
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
          <button 
            className="btn-modern text-sm" 
            onClick={exportGeoJSON}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export GeoJSON
          </button>
          <button 
            className="btn-modern text-sm" 
            onClick={exportGPX}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export GPX
          </button>
          <button 
            className="btn-modern text-sm" 
            onClick={exportKML}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export KML
          </button>
        </div>
      </div>

      <MapContainer center={[INIT.lat, INIT.lng]} zoom={INIT.zoom} style={{ height: 560 }} scrollWheelZoom className="map-container">
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; Esri"/>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" attribution="&copy; Esri"/>
        <AutoAlignButton 
          startLatLng={startLatLng}
          endLatLng={endLatLng}
          polys={polys}
          routePositions={routePositions}
          trigger={autoAlignTrigger}
        />
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topleft"
            draw={{
              rectangle: false,
              circle: false,
              marker: false,
              circlemarker: false,
              polyline: false,
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: '#e1e100',
                  message: '<strong>Oh snap!<strong> you can\'t draw that!'
                },
                shapeOptions: {
                  color: 'red',
                  fillColor: 'red',
                  fillOpacity: 0.3,
                  weight: 3
                }
              }
            }}
            edit={{
              remove: true
            }}
            onCreated={onCreated}
            onDeleted={onDeleted}
            onEdited={onEdited}
          />
        </FeatureGroup>
        <Clicker />
        
        {/* Render drawing points and lines */}
        {drawingMode && drawingPoints.length > 0 && (
          <>
            {drawingPoints.map((point, index) => (
              <Marker
                key={`draw-point-${index}`}
                position={{ lat: point[1], lng: point[0] }}
              >
                <Popup>Point {index + 1}</Popup>
              </Marker>
            ))}
            {drawingPoints.length > 1 && (
              <Polyline
                positions={drawingPoints.map(point => ({ lat: point[1], lng: point[0] }))}
                color="#0066ff"
                weight={4}
                opacity={0.9}
                dashArray="10,5"
              />
            )}
          </>
        )}
        
        {/* Render manual polygons as backup */}
        {polys.map((poly, index) => {
          console.log(`Rendering polygon ${index}:`, poly);
          const positions = poly.geometry.coordinates[0].slice(0, -1).map((coord: any) => ({ lat: coord[1], lng: coord[0] }));
          console.log(`Polygon ${index} positions:`, positions);
          return (
            <Polygon
              key={`manual-poly-${index}`}
              positions={positions}
              color="#ff0000"
              fillColor="#ff0000"
              fillOpacity={0.4}
              weight={4}
              opacity={1}
            />
          );
        })}
        
        {/* Render buffered polygons */}
        {bufferedPolys.map((poly, index) => (
          <Polygon
            key={`buffered-${index}`}
            positions={poly.geometry.coordinates[0].slice(0, -1).map((coord: any) => ({ lat: coord[1], lng: coord[0] }))}
            color="#ff6600"
            fillColor="#ff6600"
            fillOpacity={0.2}
            weight={2}
            dashArray="8,4"
          />
        ))}
        
        {startLatLng && (
          <DraggableMarker 
            position={startLatLng} 
            onDragEnd={(latlng) => {
              const newStart = turf.point([latlng.lng, latlng.lat]);
              setStart(newStart);
            }}
            color="green"
            label="START"
          />
        )}
        {endLatLng && (
          <DraggableMarker 
            position={endLatLng} 
            onDragEnd={(latlng) => {
              const newEnd = turf.point([latlng.lng, latlng.lat]);
              setEnd(newEnd);
            }}
            color="blue"
            label="END"
          />
        )}
        {route && <Polyline positions={routePositions} color="#00ff00" weight={5} opacity={0.9}/>}
        {pbLatLng && <Marker position={pbLatLng} icon={droneIcon}><Popup>Drone Position</Popup></Marker>}
      </MapContainer>
    </div>
  );
}
