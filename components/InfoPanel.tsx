"use client";
export default function InfoPanel(){
  return (
    <div className="card p-6 slide-in-right">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">
          System Status
        </h2>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 status-online rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-semibold text-white">Real-time Mapping</p>
              <p className="text-xs text-muted">High-resolution satellite integration</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-semibold text-white">Advanced Pathfinding</p>
              <p className="text-xs text-muted">Visibility graph + Dijkstra algorithm</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-semibold text-white">Safety Visualization</p>
              <p className="text-xs text-muted">Dynamic buffer zone rendering</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-semibold text-white">Export Capability</p>
              <p className="text-xs text-muted">Multi-format data export</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 border-primary">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Core Capabilities</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-muted">Real-time Planning</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-muted">Safety Buffers</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-muted">Route Simulation</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-muted">Export Protocols</span>
            </div>
          </div>
        </div>

        <div className="card p-4 border-accent">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Performance</span>
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">System Load</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-accent rounded-full"></div>
                </div>
                <span className="text-xs text-white">75%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Response Time</span>
              <span className="text-xs text-accent">~120ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Uptime</span>
              <span className="text-xs text-primary">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
