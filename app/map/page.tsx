"use client";

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface NGO {
  id: string; name: string; city: string; district: string; category: string;
  goal_amount: number; raised_amount: number; transparency_score: number;
  cover_image: string; latitude: number; longitude: number; beneficiaries: number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const CATS = ['All', 'Education', 'Healthcare', 'Environment', 'Women', 'Food', 'Child'];
const DISTS = [5, 10, 25, 50];

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b8fa8" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d44" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1a2e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#a0a8c0" }] },
];

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersArr = useRef<any[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [filtered, setFiltered] = useState<NGO[]>([]);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [dist, setDist] = useState(25);
  const [cat, setCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Load Maps SDK
  useEffect(() => {
    if ((window as any).google?.maps) { setMapReady(true); return; }
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_KEY}`;
    s.async = true; s.defer = true;
    s.onload = () => setMapReady(true);
    document.head.appendChild(s);
  }, []);

  // User location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      p => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => { setUserPos({ lat: 13.0827, lng: 80.2707 }); setDenied(true); setShowAll(true); }
    );
  }, []);

  // Fetch NGOs
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('ngos').select('*').not('latitude', 'is', null).eq('verified', true);
      if (data) setNgos(data);
      setLoading(false);
    })();
  }, []);

  // Filter
  useEffect(() => {
    if (!userPos) return;
    let r = ngos;
    if (cat !== 'All') r = r.filter(n => n.category?.toLowerCase() === cat.toLowerCase());
    if (!showAll) r = r.filter(n => haversine(userPos.lat, userPos.lng, n.latitude, n.longitude) <= dist);
    setFiltered(r);
  }, [ngos, userPos, dist, cat, showAll]);

  // Map + markers
  useEffect(() => {
    if (!mapReady || !userPos || !mapRef.current || !(window as any).google) return;
    const g = (window as any).google;

    if (!mapInstance.current) {
      mapInstance.current = new g.maps.Map(mapRef.current, {
        center: userPos, zoom: denied ? 7 : 12, styles: darkMapStyles,
        disableDefaultUI: false, zoomControl: true, mapTypeControl: false, streetViewControl: false,
      });
      if (!denied) {
        new g.maps.Marker({ position: userPos, map: mapInstance.current, title: 'You are here', zIndex: 999,
          icon: { path: g.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 } });
      }
    }

    markersArr.current.forEach(m => m.setMap(null));
    markersArr.current = [];

    filtered.forEach(ngo => {
      const s = ngo.transparency_score || 0;
      const c = s >= 80 ? '#16a34a' : s >= 60 ? '#d97706' : '#dc2626';
      const pct = ngo.goal_amount > 0 ? Math.round((ngo.raised_amount / ngo.goal_amount) * 100) : 0;

      const marker = new g.maps.Marker({
        position: { lat: ngo.latitude, lng: ngo.longitude }, map: mapInstance.current, title: ngo.name,
        icon: { path: g.maps.SymbolPath.CIRCLE, scale: 9, fillColor: c, fillOpacity: 0.9, strokeColor: '#fff', strokeWeight: 1.5 },
      });

      const iw = new g.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;padding:4px;max-width:240px">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px">${ngo.name}</div>
          <div style="font-size:12px;color:#666;margin-bottom:6px">📍 ${ngo.city}, ${ngo.district}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="background:${c}22;color:${c};padding:2px 8px;border-radius:99px;font-size:11px">${ngo.category}</span>
            <span style="font-size:11px;color:#555">Score: ${s}/100</span>
          </div>
          <div style="background:#f3f4f6;border-radius:4px;height:6px;margin-bottom:8px">
            <div style="background:${c};height:6px;border-radius:4px;width:${pct}%"></div>
          </div>
          <div style="font-size:11px;color:#555;margin-bottom:8px">₹${(ngo.raised_amount || 0).toLocaleString()} of ₹${(ngo.goal_amount || 0).toLocaleString()}</div>
          <a href="/ngos/${ngo.id}" style="display:block;text-align:center;background:#16a34a;color:#fff;padding:6px;border-radius:6px;font-size:12px;text-decoration:none;font-weight:500">View & Donate →</a>
        </div>`
      });
      marker.addListener('click', () => iw.open(mapInstance.current, marker));
      markersArr.current.push(marker);
    });
  }, [mapReady, userPos, filtered, denied]);

  return (
    <div className="min-h-screen pt-20 bg-[#0a0f0a]">
      {/* Filter bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#00ff88]/10 p-2 rounded-xl"><MapPin className="text-[#00ff88]" size={22} /></div>
            <div>
              <h1 className="text-xl font-extrabold text-white">NGOs Near You</h1>
              <p className="text-gray-500 text-xs">{denied ? 'Showing all Tamil Nadu' : `${filtered.length} NGOs within ${dist}km`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-3 py-1.5">
            <Navigation size={13} className="text-[#00ff88]" />
            {DISTS.map(d => (
              <button key={d} onClick={() => { setDist(d); setShowAll(false); }}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${!showAll && dist === d ? 'bg-[#00ff88] text-[#0a0f0a]' : 'text-gray-500 hover:text-white'}`}>
                {d}km
              </button>
            ))}
            <button onClick={() => setShowAll(true)}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${showAll ? 'bg-[#00ff88] text-[#0a0f0a]' : 'text-gray-500 hover:text-white'}`}>
              All TN
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${cat === c ? 'bg-[#00ff88] text-[#0a0f0a] border-[#00ff88]' : 'text-gray-400 border-white/10 hover:border-[#00ff88]/30'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      {loading || !mapReady ? (
        <div className="w-full h-[65vh] md:h-[65vh] flex items-center justify-center bg-[#0d1117]">
          <Loader2 size={40} className="text-[#00ff88] animate-spin" />
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-[50vh] md:h-[65vh] border-y border-white/[0.06]" />
      )}

      {denied && (
        <div className="max-w-7xl mx-auto px-4 -mt-4 relative z-10">
          <div className="bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-md rounded-xl px-5 py-2.5 text-yellow-400 text-xs font-medium inline-block">
            📍 Location denied — showing all Tamil Nadu NGOs
          </div>
        </div>
      )}

      {/* Bottom strip */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h3 className="text-base font-bold text-white mb-3">{filtered.length} NGOs Found</h3>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {filtered.map((ngo, i) => (
            <Link key={ngo.id} href={`/ngos/${ngo.id}`}
              className="block w-[220px] flex-shrink-0 rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.03] hover:border-[#00ff88]/20 transition-all hover:-translate-y-1">
              <img src={ngo.cover_image || 'https://via.placeholder.com/400x200'} alt={ngo.name} className="w-full h-28 object-cover" />
              <div className="p-3 space-y-1.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#00ff88]">{ngo.category}</p>
                <p className="text-sm font-bold text-white truncate">{ngo.name}</p>
                <p className="text-[10px] text-gray-500">{ngo.district} · {ngo.transparency_score}/100</p>
                <div className="w-full bg-white/[0.05] h-1 rounded-full overflow-hidden">
                  <div className="bg-[#00ff88] h-full rounded-full" style={{ width: `${ngo.goal_amount > 0 ? (ngo.raised_amount / ngo.goal_amount) * 100 : 0}%` }} />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-gray-500 py-8 w-full text-center">No NGOs in this range</p>}
        </div>
      </div>
    </div>
  );
}
