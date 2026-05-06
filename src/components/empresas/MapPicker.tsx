"use client"
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

const TUCUMAN = { lat: -26.8083, lng: -65.2176 }

interface Props {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}

export function MapPicker({ lat: latRaw, lng: lngRaw, onChange }: Props) {
  const lat = latRaw !== null && latRaw !== undefined ? Number(latRaw) : null
  const lng = lngRaw !== null && lngRaw !== undefined ? Number(lngRaw) : null
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const initLat = lat ?? TUCUMAN.lat
      const initLng = lng ?? TUCUMAN.lng

      const map = L.map(containerRef.current!).setView([initLat, initLng], 14)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker([initLat, initLng], { draggable: true }).addTo(map)
      markerRef.current = marker

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onChange(pos.lat, pos.lng)
      })

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng)
        onChange(e.latlng.lat, e.latlng.lng)
      })
    })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!markerRef.current || lat === null || lng === null) return
    markerRef.current.setLatLng([lat, lng])
    mapRef.current?.panTo([lat, lng])
  }, [lat, lng])

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="h-64 w-full rounded-lg border border-border overflow-hidden"
        style={{ zIndex: 0 }}
      />
      <div className="flex gap-3 text-xs text-muted-foreground font-mono">
        <span>Lat: <strong className="text-foreground">{lat?.toFixed(6) ?? '—'}</strong></span>
        <span>Lng: <strong className="text-foreground">{lng?.toFixed(6) ?? '—'}</strong></span>
        {(lat === null || lng === null) && (
          <span className="text-primary">Hacé click en el mapa o arrastrá el pin</span>
        )}
      </div>
    </div>
  )
}
