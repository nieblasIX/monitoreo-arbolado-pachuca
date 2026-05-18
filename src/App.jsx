import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Datos de las Obras (Convertí tus coordenadas de texto a números reales para Leaflet)
const SOLICITUDES = [
  { id: 1, arboles: 89, palmeras: 2, total: 91,
    ubicacion: "Calle de la Minería c/ Blvd. Fomento Minero",
    obra: "Reconstrucción con pavimento hidráulico de Av. Fomento Minero",
    lat: 20.089, lng: -98.731, acento: "#2d6a4f" },
  { id: 2, arboles: 0, palmeras: 32, total: 32,
    ubicacion: "Av. Tecnológico de Monterrey",
    obra: "Reconstrucción de Av. Tecnológico de Monterrey",
    lat: 20.092, lng: -98.754, acento: "#40916c" },
  { id: 3, arboles: 55, palmeras: 0, total: 55,
    ubicacion: "Av. Constructores c/ Blvd. Felipe Ángeles",
    obra: "Ampliación Av. Constructores – Blvd. Felipe Ángeles y Blvd. Colosio",
    lat: 20.053, lng: -98.779, acento: "#1b4332" },
  { id: 4, arboles: 14, palmeras: 0, total: 14,
    ubicacion: "Blvd. Luis Donaldo Colosio – frente Plaza del Valle",
    obra: "Ampliación lateral de servicios Blvd. Colosio – Plaza del Valle",
    lat: 20.088, lng: -98.723, acento: "#52b788" },
  { id: 5, arboles: 29, palmeras: 0, total: 29,
    ubicacion: "Blvd. Colosio – tramo Blvd. Nuevo Hidalgo a Blvd. Felipe Ángeles (frente SICT)",
    obra: "Ampliación lateral Blvd. Colosio – tramo Nuevo Hidalgo a Blvd. Felipe Ángeles",
    lat: 20.053, lng: -98.779, acento: "#74c69d" },
];

const CAPAS = [
  { id: 1, urgencia: "Alta", capa: "Cobertura vegetal histórica (2000 vs 2025)", fuente: "Landsat 5/8/9 via Google Earth Engine", formato: "GEE Script", prueba: "Línea base del arbolado urbano para cuantificar pérdida temporal", link: "https://google.com" },
  { id: 2, urgencia: "Alta", capa: "Temperatura Superficial (LST 2000-2025)", fuente: "Landsat TIRS — GEE Nube", formato: "GEE App", prueba: "Isla de calor urbana generada por pérdida acumulada de vegetación", link: "https://google.com" },
  { id: 3, urgencia: "Alta", capa: "Permeabilidad del suelo y Escorrentía", fuente: "Edafología INEGI + SRTM GEE", formato: "GeoTIFF / Map", prueba: "Reducción de infiltración → mayor riesgo de inundación por pavimento", link: "https://google.com" },
  { id: 4, urgencia: "Alta", capa: "Cobertura vegetal actual detallada", fuente: "INEGI Ortofotos + digitalización QGIS", formato: "GeoJSON", prueba: "Pérdida real y cuantificable de cobertura de copa arbolada", link: "#" },
];

// Componente auxiliar para mover el mapa suavemente cuando el usuario da clic en una obra
function RecenterMap({ lat, lng }) {
  const map = useMap();
  map.setView([lat, lng], 16);
  return null;
}

function App() {
  const [seccionActiva, setSeccionActiva] = useState("obras");
  // Por defecto, el mapa se enfoca en la primera solicitud
  const [obraSeleccionada, setObraSeleccionada] = useState(SOLICITUDES[0]);

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto', background: '#fafafa', minHeight: '100vh' }}>
      
      {/* Encabezado */}
      <header style={{ background: '#1b4332', color: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', marginBottom: '15px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>🌳 Expediente Geomático Ciudadano</h1>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Defensa del Arbolado · Pachuca</p>
      </header>

      {/* Menú de Navegación Móvil */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button 
          onClick={() => setSeccionActiva("obras")}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: seccionActiva === "obras" ? "#2d6a4f" : "#e0e0e0", color: seccionActiva === "obras" ? "white" : "#333", fontWeight: 'bold' }}
        >
          📍 Ver Obras y Mapa
        </button>
        <button 
          onClick={() => setSeccionActiva("capas")}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: seccionActiva === "capas" ? "#2d6a4f" : "#e0e0e0", color: seccionActiva === "capas" ? "white" : "#333", fontWeight: 'bold' }}
        >
          🗺️ Estudios GEE (2000-2025)
        </button>
      </nav>

      {/* SECCIÓN 1: OBRAS + MAPA INTERACTIVO */}
      {seccionActiva === "obras" && (
        <section>
          {/* Contenedor del Mapa de Leaflet */}
          <div style={{ height: '250px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', zIndex: 1 }}>
            <MapContainer center={[obraSeleccionada.lat, obraSeleccionada.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[obraSeleccionada.lat, obraSeleccionada.lng]}>
                <Popup>
                  <strong>{obraSeleccionada.obra}</strong> <br /> 🌲 {obraSeleccionada.total} árboles afectados.
                </Popup>
              </Marker>
              <RecenterMap lat={obraSeleccionada.lat} lng={obraSeleccionada.lng} />
            </MapContainer>
          </div>

          <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', fontStyle: 'italic' }}>
            💡 Toca cualquier solicitud abajo para ubicarla en el mapa superior.
          </p>

          {/* Lista de Solicitudes Seleccionables */}
          <div>
            {SOLICITUDES.map(s => (
              <div 
                key={s.id} 
                onClick={() => setObraSeleccionada(s)}
                style={{ 
                  background: 'white', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  margin: '10px 0', 
                  cursor: 'pointer',
                  boxShadow: obraSeleccionada.id === s.id ? '0 0 0 2px #2d6a4f' : '0 2px 4px rgba(0,0,0,0.02)', 
                  borderLeft: `5px solid ${s.acento}`,
                  transition: '0.2s'
                }}
              >
                <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#1b4332' }}>{s.obra}</h3>
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#555' }}>📍 {s.ubicacion}</p>
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: `${s.acento}15`, color: s.acento, padding: '3px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                    🌲 {s.total} Impactados
                  </span>
                  <span style={{ fontSize: '11px', color: '#aaa' }}>{s.lat}°, {s.lng}°</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECCIÓN 2: ESTUDIOS HISTÓRICOS GOOGLE EARTH ENGINE */}
      {seccionActiva === "capas" && (
        <section>
          <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fca5a5' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#991b1b', fontWeight: 'bold' }}>
              📊 Evidencia Temporal de Daño Colectivo (2000 - 2025):
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#7f1d1d' }}>
              Línea base histórica que demuestra científicamente la pérdida de servicios ambientales frente al desarrollo urbano de Pachuca.
            </p>
          </div>

          {CAPAS.map(c => (
            <div key={c.id} style={{ background: 'white', padding: '12px', borderRadius: '10px', margin: '10px 0', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  {c.urgencia}
                </span>
                <span style={{ fontSize: '11px', color: '#666', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>
                  {c.formato}
                </span>
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#111' }}>{c.capa}</h3>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#444' }}><strong>Evidencia técnica:</strong> {c.prueba}</p>
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#777' }}><strong>Fuente de datos:</strong> {c.fuente}</p>
              
              <a 
                href={c.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ display: 'block', textDecoration: 'none', background: c.link === "#" ? "#f0f0f0" : "#2d6a4f", color: c.link === "#" ? "#aaa" : "white", textAlign: 'center', padding: '8px', borderRadius: '6px', marginTop: '10px', fontSize: '12px', fontWeight: 'bold', pointerEvents: c.link === "#" ? 'none' : 'auto' }}
              >
                {c.link === "#" ? "⏳ Recopilando datos en QGIS..." : "🚀 Abrir en Google Earth Engine"}
              </a>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default App;
