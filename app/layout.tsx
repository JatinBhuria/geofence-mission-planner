import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { ReactNode } from "react";

export const metadata = { 
  title: "DRDO Geofence Mission Planner", 
  description: "Advanced drone mission planning with real-time pathfinding" 
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="relative min-h-screen">
          {/* Clean DRDO-style header */}
          <header className="header">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="header-content rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                        {/* DRDO Logo */}
                        <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
                          {/* Outer circle */}
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                          {/* Inner circle */}
                          <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                          {/* Center dot */}
                          <circle cx="12" cy="12" r="2" fill="currentColor"/>
                          {/* Cross lines */}
                          <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5"/>
                          <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5"/>
                          <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5"/>
                          <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5"/>
                          {/* Diagonal lines */}
                          <line x1="4.5" y1="4.5" x2="7.5" y2="7.5" stroke="currentColor" strokeWidth="1"/>
                          <line x1="16.5" y1="16.5" x2="19.5" y2="19.5" stroke="currentColor" strokeWidth="1"/>
                          <line x1="19.5" y1="4.5" x2="16.5" y2="7.5" stroke="currentColor" strokeWidth="1"/>
                          <line x1="7.5" y1="16.5" x2="4.5" y2="19.5" stroke="currentColor" strokeWidth="1"/>
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 status-online rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        DRDO Geofence Mission Planner
                      </h1>
                      <p className="text-muted text-sm">Advanced Drone Operations Control System</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 status-online rounded-full"></div>
                        <span className="text-sm font-semibold text-white">SYSTEM ONLINE</span>
                      </div>
                      <div className="text-xs text-muted">Real-time monitoring active</div>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-4">
                      <div className="glass rounded-lg px-4 py-2">
                        <div className="text-xs text-muted">STATUS</div>
                        <div className="text-sm font-semibold text-accent">OPERATIONAL</div>
                      </div>
                      <div className="glass rounded-lg px-4 py-2">
                        <div className="text-xs text-muted">SECURITY</div>
                        <div className="text-sm font-semibold text-primary">LEVEL 1</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="mx-auto max-w-7xl px-6 py-6">
            <div className="fade-in">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
