"use client";
export default function ControlsPanel({ bufferMeters, setBufferMeters, speedMps, setSpeedMps }:{ bufferMeters:number; setBufferMeters:(n:number)=>void; speedMps:number; setSpeedMps:(n:number)=>void; }){
  return (
    <div className="card p-6 slide-in-right">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">
          Mission Parameters
        </h2>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white">Safety Buffer</label>
              <span className="text-lg font-bold text-primary">{bufferMeters}m</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={1000} 
              step={10} 
              value={bufferMeters} 
              onChange={e=>setBufferMeters(parseInt(e.target.value))} 
              className="slider w-full"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>0m</span>
              <span>500m</span>
              <span>1000m</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white">Mission Speed</label>
              <span className="text-lg font-bold text-accent">{speedMps} m/s</span>
            </div>
            <input 
              type="range" 
              min={1} 
              max={50} 
              step={1} 
              value={speedMps} 
              onChange={e=>setSpeedMps(parseInt(e.target.value))} 
              className="slider w-full"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>1 m/s</span>
              <span>25 m/s</span>
              <span>50 m/s</span>
            </div>
          </div>
        </div>
        
        <div className="card p-4 border-accent">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Quick Guide</span>
          </h3>
          <ul className="text-xs text-muted space-y-2">
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Define restricted zones on the map</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Set start and end coordinates</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Execute route planning algorithm</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Adjust safety parameters as needed</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
