import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

const POPAYAN = [2.4448, -76.6147];

function MapDragHandler({ onCenterChange }) {
  const map = useMap();
  useEffect(() => {
    const handler = () => {
      const c = map.getCenter();
      onCenterChange([c.lat, c.lng]);
    };
    map.on("moveend", handler);
    return () => map.off("moveend", handler);
  }, [map, onCenterChange]);
  return null;
}

function MapViewUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapPicker({ onConfirm, onCancel }) {
  const [center, setCenter] = useState(POPAYAN);
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    const q = searchText.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=CO`,
        { headers: { "User-Agent": "RecyclingPointsAdmin/1.0" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch {
      // silent
    } finally {
      setSearching(false);
    }
  }, [searchText]);

  const handleCenterChange = useCallback((c) => setCenter(c), []);

  return (
    <div className="panel-modal-bg" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="panel-modal" style={{ maxWidth: 680 }}>
        <div className="panel-modal-head">
          <span><i className="bi bi-geo-alt me-2"></i>Seleccionar ubicación</span>
          <button className="btn-icon" onClick={onCancel}><i className="bi bi-x-lg"></i></button>
        </div>
        <div className="panel-modal-body">
          <div className="input-group mb-2">
            <input
              className="form-control form-control-sm"
              placeholder="Buscar lugar (ej. Terraplaza Popayán)..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              className="btn btn-success btn-sm"
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <span className="spinner-border spinner-border-sm me-1" />
              ) : (
                <i className="bi bi-search me-1" />
              )}
              {searching ? "Buscando..." : "Buscar"}
            </button>
          </div>
          <div style={{ position: "relative", height: 400, borderRadius: 8, overflow: "hidden" }}>
            <MapContainer
              center={center}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapViewUpdater center={center} />
              <MapDragHandler onCenterChange={handleCenterChange} />
            </MapContainer>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -100%)",
              zIndex: 1000,
              fontSize: "2.2rem",
              color: "#2e7d32",
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
              pointerEvents: "none",
              lineHeight: 1,
            }}>
              <i className="bi bi-geo-alt-fill"></i>
            </div>
          </div>
          <div className="mt-2 text-muted small">
            <i className="bi bi-info-circle me-1"></i>
            Arrastra el mapa para ajustar la ubicación. El pin central indica la posición seleccionada.
          </div>
        </div>
        <div className="panel-modal-foot">
          <button className="btn-panel ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn-panel primary" onClick={() => onConfirm(center[0], center[1])}>
            <i className="bi bi-check-lg me-1"></i>Confirmar ubicación
          </button>
        </div>
      </div>
    </div>
  );
}
