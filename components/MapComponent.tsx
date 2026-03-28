"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ShieldCheck, Info, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom markers for different categories
const getCategoryIcon = (category: string) => {
  let color = '#16a34a'; // Default green
  if (category === 'Health') color = '#ef4444';
  if (category === 'Education') color = '#3b82f6';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

export default function MapComponent({ ngos, filter }: { ngos: any[], filter: string }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const filteredNgos = filter === 'All' ? ngos : ngos.filter(ngo => ngo.properties.category === filter);

  return (
    <div className="h-full w-full rounded-[2.5rem] overflow-hidden border-2 border-gray-800 shadow-2xl relative">
      <MapContainer 
        center={[13.0827, 80.2707]} 
        zoom={12} 
        style={{ height: '100%', width: '100%', background: '#0d1117' }}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {filteredNgos.map((ngo) => (
          <Marker 
            key={ngo.id} 
            position={[ngo.geometry.coordinates[1], ngo.geometry.coordinates[0]]}
            icon={getCategoryIcon(ngo.properties.category)}
          >
            <Popup className="custom-popup">
              <div className="p-4 bg-[#161b22] text-white border-2 border-[#16a34a]/30 rounded-2xl min-w-[200px]">
                 <span className="text-[8px] font-black text-[#16a34a] uppercase tracking-widest">{ngo.properties.category}</span>
                 <h3 className="text-sm font-black mt-1">{ngo.properties.name}</h3>
                 <div className="mt-3 flex items-center justify-between">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      ngo.properties.status === 'blacklisted' ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/10'
                    }`}>
                       {ngo.properties.status}
                    </span>
                    <a href={`/ngos/${ngo.id}`} className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                       View Profile <Info size={10} />
                    </a>
                 </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend (Overlay) */}
      <div className="absolute bottom-10 left-10 z-[100] bg-black/60 backdrop-blur-xl p-6 rounded-3xl border border-gray-800 shadow-2xl space-y-4 max-w-[180px]">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={12} className="text-[#16a34a]" /> Network Map
         </p>
         <div className="space-y-2">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-[#16a34a] border border-white" />
               <span className="text-[10px] text-gray-300 font-bold uppercase">Community</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-[#3b82f6] border border-white" />
               <span className="text-[10px] text-gray-300 font-bold uppercase">Education</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-[#ef4444] border border-white" />
               <span className="text-[10px] text-gray-300 font-bold uppercase">Health</span>
            </div>
         </div>
      </div>

      <style jsx global>{`
        .leaflet-container {
          background-color: #0d1117 !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: #161b22 !important;
          border: 1px solid rgba(22, 163, 94, 0.3) !important;
        }
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
