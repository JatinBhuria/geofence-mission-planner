"use client";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import ControlsPanel from "@/components/ControlsPanel";
import InfoPanel from "@/components/InfoPanel";

const MapCanvas = dynamic(() => import("@/components/MapCanvas"), { ssr: false });

export default function Page(){
  const [bufferMeters, setBufferMeters] = useState(150);
  const [speedMps, setSpeedMps] = useState(10); // playback speed
  const [storeKey] = useState("gmp_v1");

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      <div className="xl:col-span-3 slide-in-left">
        <MapCanvas bufferMeters={bufferMeters} speedMps={speedMps} storeKey={storeKey} />
      </div>
      <div className="xl:col-span-1 space-y-6 slide-in-right">
        <ControlsPanel 
          bufferMeters={bufferMeters} 
          setBufferMeters={setBufferMeters} 
          speedMps={speedMps} 
          setSpeedMps={setSpeedMps} 
        />
        <InfoPanel />
      </div>
    </div>
  );
}
