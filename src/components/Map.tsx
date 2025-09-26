'use client'
import { useEffect, useRef } from 'react'
import maplibregl, { Map as MLMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Shop } from '@/lib/types'


export function MapView({ shops, selectedId, onSelect }:{ shops: Shop[], selectedId: string|null, onSelect: (id:string)=>void }){
const ref = useRef<HTMLDivElement | null>(null)
const mapRef = useRef<MLMap | null>(null)
const markersRef = useRef<Record<string, Marker>>({})


useEffect(() => {
if (!ref.current || mapRef.current) return
const map = new maplibregl.Map({
container: ref.current,
style: 'https://demotiles.maplibre.org/style.json',
center: [139.7671, 35.6812], // Tokyo
zoom: 9,
})
map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }))
mapRef.current = map
}, [])


useEffect(() => {
const map = mapRef.current
if (!map) return


// Clear markers not in current shops
for (const id in markersRef.current) {
if (!shops.find(s=>s.id===id)) {
markersRef.current[id].remove()
delete markersRef.current[id]
}
}


// Add/update markers
shops.forEach(s => {
if (!markersRef.current[s.id]) {
const el = document.createElement('div')
el.className = 'rounded-full'
el.style.width = '14px'
el.style.height = '14px'
el.style.border = '2px solid white'
el.style.boxShadow = '0 0 0 2px rgba(201,160,220,0.6)'
el.style.background = s.category==='concafe' ? '#FFB6C1' : s.category==='girlsbar' ? '#AEEEEE' : '#C9A0DC'
el.style.cursor = 'pointer'
el.addEventListener('click', ()=> onSelect(s.id))
const m = new maplibregl.Marker({ element: el }).setLngLat([s.lng, s.lat]).addTo(map)
markersRef.current[s.id] = m
} else {
markersRef.current[s.id].setLngLat([s.lng, s.lat])
}
})


// Fit bounds to results
if (shops.length > 0) {
const b = new maplibregl.LngLatBounds()
shops.forEach(s => b.extend([s.lng, s.lat]))
map.fitBounds(b, { padding: 60, duration: 500 })
}
}, [shops, onSelect])


useEffect(() => {
// Highlight selected marker (simple pulse)
const el = markersRef.current[selectedId || '']?.getElement?.()
if (el) {
el.animate([
{ boxShadow: '0 0 0 2px rgba(201,160,220,0.6)' },
{ boxShadow: '0 0 0 10px rgba(201,160,220,0.0)' }
], { duration: 900, iterations: 3 })
}
}, [selectedId])


return <div ref={ref} className="w-full h-[420px] rounded-2xl overflow-hidden"/>
}