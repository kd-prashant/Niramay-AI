"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { X, Activity, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface ScanPoint {
  id: number;
  latitude: number;
  longitude: number;
  disease_status: string;
  plant_name: string;
  created_at: string;
}

export default function DiseaseMap({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user } = useAuth();
  const [points, setPoints] = useState<ScanPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Load Leaflet specifically for Icon creation
    if (typeof window !== 'undefined') {
      import('leaflet').then(leaf => {
        setL(leaf.default);
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      fetchScanningPoints();
    }
  }, [isOpen, user]);

  async function fetchScanningPoints() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('id, latitude, longitude, disease_status, plant_name, created_at')
        .not('latitude', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPoints(data || []);
    } catch (err) {
      console.error('Map Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }

  const getMarkerIcon = (status: string) => {
    if (!L) return null;
    const isCritical = status.toLowerCase().includes('blight');
    
    return new L.DivIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative">
          <div class="absolute -inset-2 ${isCritical ? 'bg-red-500/30' : 'bg-veridian-500/30'} blur-md rounded-full animate-ping"></div>
          <div class="relative w-4 h-4 rounded-full border-2 border-white cursor-pointer ${isCritical ? 'bg-red-500' : 'bg-veridian-500'}"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-12 lg:p-20 pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/98 backdrop-blur-3xl pointer-events-auto"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-[1500px] h-[82vh] mt-24 bg-zinc-900 border border-white/10 rounded-[50px] shadow-[0_80px_150px_-30px_rgba(0,0,0,1)] overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="p-8 md:p-12 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[24px] bg-veridian-500/10 flex items-center justify-center text-veridian-500 border border-veridian-500/20">
                  <Activity size={32} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic">GEOSPATIAL <span className="text-veridian-500">BIOSPHERE</span></h2>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Real-time Infection Map v1.0</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-red-500 transition-all active:scale-90"
              >
                <X size={28} />
              </button>
            </div>

            {/* Map Body */}
            <div className="flex-grow relative bg-black/20">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10 bg-zinc-900">
                    <div className="w-12 h-12 border-4 border-veridian-500/20 border-t-veridian-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-veridian-500">Initializing Satellite Data</p>
                </div>
              ) : (
                <div className="h-full w-full grayscale contrast-[1.2] invert brightness-[0.8] opacity-80 opacity-transition hover:grayscale-0 hover:invert-0 hover:brightness-100 transition-all duration-1000">
                  {L && (
                    <MapContainer
                        center={[20.5937, 78.9629]} // Center of India
                        zoom={5}
                        style={{ height: '100%', width: '100%', background: '#09090b' }}
                        className="disease-map"
                    >
                        <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {points.map(point => (
                        <Marker 
                            key={point.id} 
                            position={[point.latitude, point.longitude]}
                            icon={getMarkerIcon(point.disease_status) as any}
                        >
                            <Popup className="custom-popup">
                                <div className="p-4 bg-zinc-900 text-white rounded-2xl min-w-[200px]">
                                    <h4 className="text-lg font-black mb-1 italic">{point.plant_name}</h4>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${point.disease_status.toLowerCase().includes('blight') ? 'text-red-500' : 'text-veridian-500'}`}>
                                        {point.disease_status}
                                    </p>
                                    <div className="flex items-center gap-2 text-white/40 text-[9px] font-bold">
                                        <MapPin size={10} />
                                        {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                        ))}
                    </MapContainer>
                  )}
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-10 left-10 z-20 space-y-3 p-6 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[30px] shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-veridian-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Healthy / Recovering</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Active Threat / Blight</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
