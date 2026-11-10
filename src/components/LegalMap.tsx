import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Language, LegalConsultationResult, LegalLocation, LiveBus } from '../types';
import { BUS_ROUTES, INITIAL_LEGAL_LOCATIONS, UZBEKISTAN_REGIONS } from '../data/mockData';
import { translations } from '../translations';
import { Bus, Navigation, Phone, Clock, MapPin, Volume2, Globe, ChevronDown } from 'lucide-react';
import { voiceService } from '../services/voiceService';

interface LegalMapProps {
  language: Language;
  highlightedResult: LegalConsultationResult | null;
  onSelectLocation?: (location: LegalLocation) => void;
  selectedRegionId?: string;
  onRegionChange?: (regionId: string) => void;
}

export const LegalMap: React.FC<LegalMapProps> = ({
  language,
  highlightedResult,
  onSelectLocation,
  selectedRegionId = 'tashkent',
  onRegionChange,
}) => {
  const t = translations[language];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const busMarkersRef = useRef<{ [id: string]: L.Marker }>({});
  const routePolylinesRef = useRef<{ [id: string]: L.Polyline }>({});

  const [currentRegion, setCurrentRegion] = useState<string>(selectedRegionId);
  const [activeFilter, setActiveFilter] = useState<'all' | 'notary' | 'cadastre' | 'traffic_police' | 'dxm'>('all');
  const [selectedLocation, setSelectedLocation] = useState<LegalLocation | null>(null);
  const [liveBuses, setLiveBuses] = useState<LiveBus[]>([]);
  const [activeBusRoute, setActiveBusRoute] = useState<string | null>(null);
  const [trackingBus, setTrackingBus] = useState<LiveBus | null>(null);

  // Sync external region change
  useEffect(() => {
    if (selectedRegionId && selectedRegionId !== currentRegion) {
      setCurrentRegion(selectedRegionId);
    }
  }, [selectedRegionId]);

  // When currentRegion changes, update live buses
  useEffect(() => {
    const regionRoutes = BUS_ROUTES.filter(r => r.region === currentRegion);
    const initialBuses: LiveBus[] = regionRoutes.map((route, idx) => {
      const stops = route.stops;
      const segIdx = Math.min(idx % Math.max(1, stops.length - 1), stops.length - 2);
      const stop0 = stops[segIdx] || stops[0];
      const stop1 = stops[segIdx + 1] || stops[1] || stops[0];
      const initialProgress = 0.2 + (idx * 0.25) % 0.5;
      const lat = stop0.lat + (stop1.lat - stop0.lat) * initialProgress;
      const lng = stop0.lng + (stop1.lng - stop0.lng) * initialProgress;
      const bearing = Math.round((Math.atan2(stop1.lng - stop0.lng, stop1.lat - stop0.lat) * 180) / Math.PI);

      return {
        id: `bus-${route.id}`,
        routeId: route.id,
        routeName: `№${route.id}`,
        lat,
        lng,
        bearing,
        speedKmH: 36,
        nextStop: stop1.name,
        etaMinutes: 2,
        color: route.color,
        segmentIndex: segIdx,
        progress: initialProgress,
        direction: 1,
        status: 'moving',
        waitTimer: 0,
      };
    });
    setLiveBuses(initialBuses);
  }, [currentRegion]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const region = UZBEKISTAN_REGIONS.find(r => r.id === currentRegion) || UZBEKISTAN_REGIONS[0];

    const map = L.map(mapContainerRef.current, {
      center: [region.lat, region.lng],
      zoom: region.zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // When currentRegion changes, fly map to region
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const region = UZBEKISTAN_REGIONS.find(r => r.id === currentRegion);
    if (region) {
      map.flyTo([region.lat, region.lng], region.zoom, { duration: 1.2 });
    }
  }, [currentRegion]);

  // Draw Bus Routes for current region
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(routePolylinesRef.current).forEach(p => p.remove());
    routePolylinesRef.current = {};

    const regionRoutes = BUS_ROUTES.filter(r => r.region === currentRegion);

    regionRoutes.forEach(route => {
      const isHighlighted = highlightedResult?.buses?.includes(route.id) || activeBusRoute === route.id;
      const latlngs: L.LatLngExpression[] = route.stops.map(s => [s.lat, s.lng]);

      const polyline = L.polyline(latlngs, {
        color: route.color,
        weight: isHighlighted ? 6 : 4,
        opacity: isHighlighted ? 0.95 : 0.65,
        dashArray: isHighlighted ? undefined : '5, 8',
      }).addTo(map);

      polyline.bindTooltip(`<b>${route.name}</b><br/>Oraliq: ${route.interval}`, {
        sticky: true,
      });

      routePolylinesRef.current[route.id] = polyline;
    });
  }, [highlightedResult, activeBusRoute, currentRegion]);

  // Render Institution Markers for current region (or all matching)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    const regionLocations = INITIAL_LEGAL_LOCATIONS.filter(l => l.region === currentRegion);

    const filtered = regionLocations.filter(loc => {
      if (activeFilter === 'all') return true;
      return loc.type === activeFilter;
    });

    filtered.forEach(loc => {
      const isTarget = highlightedResult && (
        loc.id === highlightedResult.targetLocationId ||
        loc.name.toLowerCase().includes(highlightedResult.locationName.toLowerCase().slice(0, 10))
      );

      let bgGrad = 'bg-blue-600';
      let iconHtml = '🏛️';
      if (loc.type === 'notary') {
        bgGrad = 'bg-amber-600';
        iconHtml = '⚖️';
      } else if (loc.type === 'cadastre') {
        bgGrad = 'bg-rose-600';
        iconHtml = '🗺️';
      } else if (loc.type === 'traffic_police') {
        bgGrad = 'bg-emerald-600';
        iconHtml = '🚗';
      } else if (loc.type === 'dxm') {
        bgGrad = 'bg-indigo-600';
        iconHtml = '🏢';
      }

      const markerHtml = `
        <div class="relative group cursor-pointer">
          ${isTarget ? '<div class="absolute -inset-2 bg-emerald-400 rounded-full animate-ping opacity-75"></div>' : ''}
          <div class="w-10 h-10 ${bgGrad} text-white rounded-xl shadow-lg border-2 ${isTarget ? 'border-yellow-300 ring-4 ring-yellow-400/50' : 'border-white'} flex items-center justify-center text-lg transform hover:scale-110 transition-transform">
            ${iconHtml}
          </div>
          <div class="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow pointer-events-none">
            ${loc.name.split(' ')[0]} ${loc.name.split(' ')[1] || ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-legal-marker',
        html: markerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

      // Detailed Popup with Address and Buses
      marker.bindPopup(`
        <div class="p-1 space-y-1.5 font-sans min-w-[200px]">
          <div class="font-bold text-sm text-slate-900">${loc.name}</div>
          <div class="text-xs text-slate-600 flex items-start gap-1">
            <span class="text-red-500 font-bold">📍</span>
            <span>${loc.address}</span>
          </div>
          <div class="text-[11px] text-emerald-700 font-semibold">📞 ${loc.phone}</div>
          <div class="text-[11px] text-blue-600 font-bold pt-1 border-t border-slate-100">
            🚌 Qatnovchi avtobuslar: ${loc.buses.join(', ')}
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedLocation(loc);
        if (onSelectLocation) onSelectLocation(loc);
        map.flyTo([loc.lat, loc.lng], 15, { duration: 1.2 });
        marker.openPopup();
      });

      markersRef.current[loc.id] = marker;
    });
  }, [activeFilter, highlightedResult, onSelectLocation, currentRegion]);

  // Animate live buses moving realistically along their actual routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const interval = setInterval(() => {
      setLiveBuses(prevBuses => {
        const updated = prevBuses.map(bus => {
          const route = BUS_ROUTES.find(r => r.id === bus.routeId);
          if (!route || route.stops.length < 2) return bus;

          const stops = route.stops;
          let segIdx = bus.segmentIndex ?? 0;
          let progress = bus.progress ?? 0;
          let direction: 1 | -1 = bus.direction ?? 1;
          let status: 'moving' | 'at_stop' = bus.status || 'moving';
          let waitTimer = bus.waitTimer ?? 0;

          if (status === 'at_stop') {
            if (waitTimer > 0) {
              return {
                ...bus,
                waitTimer: waitTimer - 1,
                speedKmH: 0,
              };
            }
            // Done waiting at station, advance to next segment
            status = 'moving';
            waitTimer = 0;
            if (direction === 1) {
              segIdx += 1;
              if (segIdx >= stops.length - 1) {
                // Reached terminal station, turn back
                direction = -1;
                segIdx = stops.length - 2;
                progress = 1.0;
              } else {
                progress = 0.0;
              }
            } else {
              segIdx -= 1;
              if (segIdx < 0) {
                // Reached origin station, turn forward
                direction = 1;
                segIdx = 0;
                progress = 0.0;
              } else {
                progress = 1.0;
              }
            }
          }

          // Bound segment within route stops
          segIdx = Math.max(0, Math.min(stops.length - 2, segIdx));
          const stopA = stops[segIdx];
          const stopB = stops[segIdx + 1];

          // Realistic progress step per 800ms tick (~15 seconds between city stops)
          const step = 0.055;

          if (direction === 1) {
            progress += step;
            if (progress >= 1.0) {
              progress = 1.0;
              status = 'at_stop';
              waitTimer = 3; // wait 3 ticks (2.4 seconds) at stop
            }
          } else {
            progress -= step;
            if (progress <= 0.0) {
              progress = 0.0;
              status = 'at_stop';
              waitTimer = 3; // wait 3 ticks at stop
            }
          }

          const lat = stopA.lat + (stopB.lat - stopA.lat) * progress;
          const lng = stopA.lng + (stopB.lng - stopA.lng) * progress;

          const targetStop = direction === 1 ? stopB : stopA;
          const dLng = direction === 1 ? stopB.lng - stopA.lng : stopA.lng - stopB.lng;
          const dLat = direction === 1 ? stopB.lat - stopA.lat : stopA.lat - stopB.lat;
          const bearing = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);

          const remainingFrac = direction === 1 ? 1.0 - progress : progress;
          const etaMinutes = status === 'at_stop' ? 0 : Math.max(1, Math.ceil(remainingFrac * 3));
          const speedKmH = status === 'at_stop' ? 0 : 34 + Math.floor(Math.sin(Date.now() / 1500 + segIdx) * 5);

          return {
            ...bus,
            lat,
            lng,
            bearing,
            speedKmH,
            nextStop: targetStop.name,
            etaMinutes,
            segmentIndex: segIdx,
            progress,
            direction,
            status,
            waitTimer,
          };
        });

        // If user is tracking a specific bus, update tracking state
        if (trackingBus) {
          const current = updated.find(b => b.id === trackingBus.id);
          if (current) setTrackingBus(current);
        }

        return updated;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [trackingBus]);

  // Update Bus markers on map smoothly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old buses not in current region
    Object.keys(busMarkersRef.current).forEach(id => {
      if (!liveBuses.find(b => b.id === id)) {
        busMarkersRef.current[id].remove();
        delete busMarkersRef.current[id];
      }
    });

    liveBuses.forEach(bus => {
      const isStopped = bus.status === 'at_stop';
      const busHtml = `
        <div class="relative cursor-pointer group" title="${bus.routeName}">
          <div class="absolute -inset-1 rounded-full ${isStopped ? 'bg-amber-400 opacity-70 animate-pulse' : 'bg-emerald-400 opacity-60 animate-ping'}"></div>
          <div class="relative w-8 h-8 rounded-full shadow-2xl flex items-center justify-center text-white text-xs font-bold border-2 border-white transform transition-transform group-hover:scale-125" style="background-color: ${bus.color}">
            <span style="display:inline-block; transform: rotate(${bus.bearing || 0}deg); font-size: 13px;">🚌</span>
          </div>
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-1.5 rounded-full shadow border border-white whitespace-nowrap flex items-center gap-0.5">
            <span>${bus.routeName}</span>
            <span class="w-1.5 h-1.5 rounded-full ${isStopped ? 'bg-amber-400' : 'bg-emerald-400'}"></span>
          </div>
        </div>
      `;

      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: busHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const tooltipContent = `
        <div class="p-1 font-sans text-xs min-w-[170px]">
          <div class="font-bold text-slate-900 flex items-center justify-between">
            <span>Avtobus ${bus.routeName}</span>
            <span class="text-[10px] ${isStopped ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}">
              ${isStopped ? '● Bekatda' : '● ' + bus.speedKmH + ' km/s'}
            </span>
          </div>
          <div class="text-slate-600 mt-1">Keyingi: <b>${bus.nextStop}</b></div>
          <div class="text-blue-600 font-semibold text-[11px] mt-0.5">Kutilmoqda: ~${bus.etaMinutes} daqiqa</div>
        </div>
      `;

      if (busMarkersRef.current[bus.id]) {
        const marker = busMarkersRef.current[bus.id];
        marker.setLatLng([bus.lat, bus.lng]);
        marker.setIcon(busIcon);
        marker.setTooltipContent(tooltipContent);
      } else {
        const marker = L.marker([bus.lat, bus.lng], { icon: busIcon }).addTo(map);
        marker.bindTooltip(tooltipContent, { sticky: true });
        marker.on('click', () => {
          setTrackingBus(bus);
          setActiveBusRoute(bus.routeId);
          map.flyTo([bus.lat, bus.lng], 15, { duration: 0.8 });
        });
        busMarkersRef.current[bus.id] = marker;
      }
    });
  }, [liveBuses]);

  // When highlighted result arrives: switch to its region if different, pan and auto-open popup!
  useEffect(() => {
    if (!highlightedResult || !mapInstanceRef.current) return;

    // Find location
    let matched = INITIAL_LEGAL_LOCATIONS.find(l => l.id === highlightedResult.targetLocationId);
    if (!matched) {
      matched = INITIAL_LEGAL_LOCATIONS.find(l =>
        l.name.toLowerCase().includes(highlightedResult.locationName.toLowerCase().slice(0, 10))
      );
    }
    if (!matched && highlightedResult.lat && highlightedResult.lng) {
      matched = INITIAL_LEGAL_LOCATIONS.find(l => l.region === currentRegion) || INITIAL_LEGAL_LOCATIONS[0];
    }
    if (!matched) return;

    // If matched location is in a different region, switch to that region
    if (matched.region && matched.region !== currentRegion) {
      setCurrentRegion(matched.region);
      if (onRegionChange) onRegionChange(matched.region);
    }

    setSelectedLocation(matched);

    mapInstanceRef.current.flyTo([matched.lat, matched.lng], 15, {
      duration: 1.2,
    });

    const targetMarker = markersRef.current[matched.id];
    if (targetMarker) {
      setTimeout(() => {
        targetMarker.openPopup();
      }, 1200);
    }
  }, [highlightedResult]);

  const handleRegionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newReg = e.target.value;
    setCurrentRegion(newReg);
    if (onRegionChange) onRegionChange(newReg);
    setSelectedLocation(null);
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Top Map Controls, Region Selector and Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Region Selector (Viloyat tanlash - Andijon, Toshkent, Samarqand va boshqalar) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100">
            <Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <select
              value={currentRegion}
              onChange={handleRegionSelect}
              className="bg-transparent font-bold text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
            >
              {UZBEKISTAN_REGIONS.map(reg => (
                <option key={reg.id} value={reg.id} className="text-slate-900 bg-white dark:bg-slate-900">
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter buttons */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setActiveFilter('notary')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'notary' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-600'
              }`}
            >
              <span>⚖️</span>
              <span>{t.filterNotary}</span>
            </button>
            <button
              onClick={() => setActiveFilter('cadastre')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'cadastre' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <span>🗺️</span>
              <span>{t.filterCadastre}</span>
            </button>
            <button
              onClick={() => setActiveFilter('traffic_police')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'traffic_police' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              <span>🚗</span>
              <span>{t.filterTrafficPolice}</span>
            </button>
            <button
              onClick={() => setActiveFilter('dxm')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'dxm' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <span>🏢</span>
              <span>{t.filterDxm}</span>
            </button>
          </div>
        </div>

        {/* Live Buses Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 dark:border-slate-800 text-xs pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Bus className="w-3.5 h-3.5 text-blue-600" />
            <span>{liveBuses.length > 0 ? `${liveBuses.length} ta avtobus yo'lda` : "Avtobuslar qatnovda"}</span>
          </span>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Selected Location Card with EXACT Address and details */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-[440px] z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-900 text-lg">
                {selectedLocation.type === 'notary' ? '⚖️' : selectedLocation.type === 'cadastre' ? '🗺️' : selectedLocation.type === 'traffic_police' ? '🚗' : '🏢'}
              </span>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white leading-snug text-base">
                  {selectedLocation.name}
                </h3>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>{selectedLocation.address}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedLocation.hours}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <a href={`tel:${selectedLocation.phone}`} className="hover:underline font-semibold text-emerald-600 dark:text-emerald-400">
                {selectedLocation.phone}
              </a>
            </div>
          </div>

          {/* Transit Connection: Buses */}
          <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Bus className="w-3.5 h-3.5 text-blue-600" />
                <span>Qatnovchi avtobuslar:</span>
              </span>
              <span className="text-[11px] text-slate-500">5-8 daqiqa oraliq</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedLocation.buses.map(bId => (
                <button
                  key={bId}
                  onClick={() => {
                    setActiveBusRoute(bId);
                    const b = liveBuses.find(item => item.routeId === bId);
                    if (b) setTrackingBus(b);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                    activeBusRoute === bId
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400'
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-blue-400'
                  }`}
                >
                  <span>№{bId}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">● Harakatda</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                const textToRead = `${selectedLocation.name}. Aniq manzil: ${selectedLocation.address}. Qatnovchi avtobuslar: ${selectedLocation.buses.join(', ')}.`;
                voiceService.speak(textToRead, language);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t.readAloud}</span>
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              <span>{t.getDirections}</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Live Bus Tracker Detail Card */}
      {trackingBus && (
        <div className="absolute top-16 right-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-72 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                {trackingBus.routeName}
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Jonli Avtobus
              </span>
            </div>
            <button
              onClick={() => {
                setTrackingBus(null);
                setActiveBusRoute(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">{t.busNextStop}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-right max-w-[150px] truncate">
                {trackingBus.nextStop}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.busSpeed}:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {trackingBus.speedKmH} km/soat
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.busEta}:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                ~{trackingBus.etaMinutes} daqiqa
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
