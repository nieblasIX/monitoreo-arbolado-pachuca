import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- DATOS DEL SISTEMA ---
const SOLICITUDES_INICIALES = [
  { id: 1, arboles: 89, palmeras: 2, total: 91, ubicacion: "Calle de la Minería c/ Blvd. Fomento Minero", obra: "Reconstrucción con pavimento hidráulico de Av. Fomento Minero", lat: 20.089, lng: -98.731, acento: "#2d6a4f" },
  { id: 2, arboles: 0, palmeras: 32, total: 32, ubicacion: "Av. Tecnológico de Monterrey", obra: "Reconstrucción de Av. Tecnológico de Monterrey", lat: 20.092, lng: -98.754, acento: "#40916c" },
  { id: 3, arboles: 55, palmeras: 0, total: 55, ubicacion: "Av. Constructores c/ Blvd. Felipe Ángeles", obra: "Ampliación Av. Constructores – Blvd. Felipe Ángeles y Blvd. Colosio", lat: 20.053, lng: -98.779, acento: "#1b4332" },
  { id: 4, arboles: 14, palmeras: 0, total: 14, ubicacion: "Blvd. Luis Donaldo Colosio – frente Plaza del Valle", obra: "Ampliación lateral de servicios Blvd. Colosio – Plaza del Valle", lat: 20.088, lng: -98.723, acento: "#52b788" },
  { id: 5, arboles: 29, palmeras: 0, total: 29, ubicacion: "Blvd. Colosio – tramo Blvd. Nuevo Hidalgo a Blvd. Felipe Ángeles (frente SICT)", obra: "Ampliación lateral Blvd. Colosio – tramo Nuevo Hidalgo a Blvd. Felipe Ángeles", lat: 20.053, lng: -98.779, acento: "#74c69d" },
];

const CAPAS = [
  { id: 1, urgencia: "Alta", capa: "Cobertura vegetal histórica (2000 vs 2025)", fuente: "Landsat 5/8/9 via Google Earth Engine", formato: "GEE Script", prueba: "Línea base del arbolado urbano para cuantificar pérdida", link: "https://google.com" },
  
  { 
    id: 2, 
    urgencia: "Alta", 
    capa: "Temperatura Superficial Transparente (LST 2000-2025)", 
    fuente: "Landsat TIRS — GEE Nube", 
    formato: "GEE App", 
    prueba: "Isla de calor urbana generada por pérdida acumulada de vegetación", 
    link: "https://resistenciatuza.projects.earthengine.app/view/pachuca-isla-de-calor" 
  },
  
  { id: 3, urgencia: "Alta", capa: "Permeabilidad del suelo y Escorrentía", fuente: "Edafología INEGI + SRTM GEE", formato: "GeoTIFF", prueba: "Reducción de infiltración → mayor riesgo de inundación por pavimento", link: "https://resistenciatuza.projects.earthengine.app/view/pachuca-cobertura-vegetal" },
];


const LEGAL = [
  { ref: "Art. 4° CPEUM", desc: "Derecho a un medio ambiente sano para su desarrollo y bienestar", uso: "Fundamento principal para amparos colectivos y denuncias ciudadanas." },
  { ref: "Art. 8° CPEUM", desc: "Derecho de petición: toda solicitud debe ser respondida por escrito", uso: "Exigir permisos, dictámenes técnicos y respuestas formales a SEMARNATH." },
  { ref: "Arts. 28–29 LGEEPA", desc: "Obras sujetas a Manifestación de Impacto Ambiental (MIA) obligatoria", uso: "Exigir la MIA antes de cualquier derribo; sin ella, el acto es ilegítimo." },
  { ref: "Ley de Amparo", desc: "Amparo indirecto contra actos que vulneren derechos ambientales", uso: "Presentar ante Juzgado de Distrito con el expediente geomático como prueba." },
];

const PROTOCOLO = [
  { fase: "ANTES", subtitulo: "Documenta antes de que ocurra", color: "#1b4332", pasos: ["Fotografía y georreferencia cada árbol con GPS (App: ODK Collect u offline)", "Mide el DAP (Diámetro a 1.30m) e identifica la especie con iNaturalist", "Captura Google Street View histórico como evidencia pre-obra"] },
  { fase: "DURANTE", subtitulo: "Actúa en tiempo real con evidencia", color: "#92400e", pasos: ["Filma en video continuo el proceso de derribo con fecha y hora en pantalla", "Fotografía número de placa de maquinaria y credenciales del personal"] }
];

// --- COMPONENTES AUXILIARES ---
function RecenterMap({ lat, lng }) {
  const map = useMap();
  map.setView([lat, lng], 15);
  return null;
}

// --- COMPONENTE PRINCIPAL ---
function App() {
  const [seccionActiva, setSeccionActiva] = useState("expediente");
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES_INICIALES);
  const [obraSeleccionada, setObraSeleccionada] = useState(SOLICITUDES_INICIALES[0]);

  // Estado para el nuevo formulario de inventario ciudadano
  const [nuevaObra, setNuevaObra] = useState("");
  const [nuevaLat, setNuevaLat] = useState("");
  const [nuevaLng, setNuevaLng] = useState("");
  const [nuevosArboles, setNuevosArboles] = useState("");

  // Función para agregar reportes ciudadanos dinámicamente en memoria
  const handleAgregarReporte = (e) => {
    e.preventDefault();
    if (!nuevaObra || !nuevaLat || !nuevaLng) return alert("Por favor llena los campos obligatorios");

    const nuevoRegistro = {
      id: solicitudes.length + 1,
      obra: `🚨 [CIUDADANO] ${nuevaObra}`,
      ubicacion: "Reporte georreferenciado en campo por vecino",
      total: Number(nuevosArboles) || 0,
      lat: Number(nuevaLat),
      lng: Number(nuevaLng),
      acento: "#b91c1c"
    };

    setSolicitudes([nuevoRegistro, ...solicitudes]);
    setObraSeleccionada(nuevoRegistro);
    // Limpiar formulario
    setNuevaObra(""); setNuevaLat(""); setNuevaLng(""); setNuevosArboles("");
  };

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto', background: '#fafafa', minHeight: '100vh', color: '#333' }}>
      
      {/* Encabezado */}
      <header style={{ background: '#1b4332', color: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', marginBottom: '15px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>🌳 Expediente Geomático Ciudadano</h1>
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Defensa del Arbolado Urbano · Pachuca</p>
      </header>

      {/* Menú de Navegación Tipo App Móvil de 3 Pestañas */}
      <nav style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
        <button onClick={() => setSeccionActiva("expediente")} style={{ flex: 1, padding: '10px 5px', fontSize: '12px', borderRadius: '8px', border: 'none', background: seccionActiva === "expediente" ? "#2d6a4f" : "#e0e0e0", color: seccionActiva === "expediente" ? "white" : "#333", fontWeight: 'bold' }}>
          📍 Expedientes
        </button>
        <button onClick={() => setSeccionActiva("protocolos")} style={{ flex: 1, padding: '10px 5px', fontSize: '12px', borderRadius: '8px', border: 'none', background: seccionActiva === "protocolos" ? "#2d6a4f" : "#e0e0e0", color: seccionActiva === "protocolos" ? "white" : "#333", fontWeight: 'bold' }}>
          📸 Protocolos
        </button>
        <button onClick={() => setSeccionActiva("legal")} style={{ flex: 1, padding: '10px 5px', fontSize: '12px', borderRadius: '8px', border: 'none', background: seccionActiva === "legal" ? "#2d6a4f" : "#e0e0e0", color: seccionActiva === "legal" ? "white" : "#333", fontWeight: 'bold' }}>
          ⚖️ Marco Legal
        </button>
      </nav>

      {/* PESTAÑA 1: EXPEDIENTES (MAPA, LISTA Y SUBIDA) */}
      {seccionActiva === "expediente" && (
        <section>
          {/* Mapa Leaflet */}
          <div style={{ height: '220px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', zIndex: 1 }}>
            <MapContainer center={[obraSeleccionada.lat, obraSeleccionada.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[obraSeleccionada.lat, obraSeleccionada.lng]}>
                <Popup><strong>{obraSeleccionada.obra}</strong><br />🌲 {obraSeleccionada.total} ejemplares.</Popup>
              </Marker>
              <RecenterMap lat={obraSeleccionada.lat} lng={obraSeleccionada.lng} />
            </MapContainer>
          </div>

          {/* Formulario de carga (Punto Georreferenciado) */}
          <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#b91c1c' }}>➕ Levantar Punto / Inventario Ciudadano</h3>
            <form onSubmit={handleAgregarReporte} style={{ display: 'grid', gap: '8px' }}>
              <input type="text" placeholder="Nombre de la Obra o Calle afectada" value={nuevaObra} onChange={e => setNuevaObra(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12px' }} />
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="number" step="any" placeholder="Latitud (ej: 20.089)" value={nuevaLat} onChange={e => setNuevaLat(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12px' }} />
                <input type="number" step="any" placeholder="Longitud (ej: -98.731)" value={nuevaLng} onChange={e => setNuevaLng(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12px' }} />
              </div>
              <input type="number" placeholder="Número estimado de árboles" value={nuevosArboles} onChange={e => setNuevosArboles(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12px' }} />
              <button type="submit" style={{ background: '#b91c1c', color: 'white', padding: '8px', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>📍 Fijar y Guardar en Mapa</button>
            </form>
          </div>

          {/* Estudios GEE */}
          <h2 style={{ fontSize: '14px', color: '#1b4332', margin: '15px 0 5px 0' }}>🛰️ Análisis Satelital GEE (2000-2025)</h2>
          {CAPAS.map(c => (
            <div key={c.id} style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', margin: '5px 0', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', items: 'center' }}>
              <div style={{ maxWidth: '75%' }}>
                <h4 style={{ margin: 0, fontSize: '12px' }}>{c.capa}</h4>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>{c.prueba}</p>
              </div>
              <a href={c.link} target="_blank" rel="noreferrer" style={{ background: '#2d6a4f', color: 'white', textDecoration: 'none', padding: '5px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>GEE 🚀</a>
            </div>
          ))}

          {/* Lista de Solicitudes */}
          <h2 style={{ fontSize: '14px', color: '#1b4332', margin: '20px 0 5px 0' }}>📋 Solicitudes Registradas</h2>
          {solicitudes.map(s => (
            <div key={s.id} onClick={() => setObraSeleccionada(s)} style={{ background: 'white', padding: '10px', borderRadius: '8px', margin: '8px 0', cursor: 'pointer', boxShadow: obraSeleccionada.id === s.id ? '0 0 0 2px #2d6a4f' : '0 1px 3px rgba(0,0,0,0.05)', borderLeft: `5px solid ${s.acento}` }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '13px' }}>{s.obra}</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>📍 {s.ubicacion}</p>
              <span style={{ display: 'inline-block', marginTop: '5px', background: `${s.acento}15`, color: s.acento, padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>🌲 {s.total} Afectados</span>
            </div>
          ))}
        </section>
      )}

      {/* PESTAÑA 2: PROTOCOLOS (ANTES / DURANTE) */}
      {seccionActiva === "protocolos" && (
        <section>
          <h2 style={{ fontSize: '16px', color: '#1b4332' }}>📸 Protocolo de Registro Antes / Durante / Después</h2>
          {PROTOCOLO.map((p, idx) => (
            <div key={idx} style={{ background: 'white', padding: '15px', borderRadius: '10px', margin: '12px 0', borderLeft: `5px solid ${p.color}` }}>
              <h3 style={{ margin: 0, color: p.color, fontSize: '14px' }}>{p.fase}</h3>
              <p style={{ margin: '2px 0 10px 0', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>{p.subtitulo}</p>
              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12px' }}>
                {p.pasos.map((paso, i) => <li key={i} style={{ marginBottom: '6px' }}>{paso}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* PESTAÑA 3: MARCO LEGAL */}
      {seccionActiva === "legal" && (
        <section>
          <h2 style={{ fontSize: '16px', color: '#1b4332' }}>⚖️ Marco Legal y Defensa Ambiental</h2>
          <p style={{ fontSize: '11px', color: '#666', marginBottom: '10px' }}>Herramientas jurídicas para fundamentar amparos colectivos en Pachuca:</p>
          {LEGAL.map((l, idx) => (
            <div key={idx} style={{ background: 'white', padding: '12px', borderRadius: '8px', margin: '10px 0', border: '1px solid #e2e8f0' }}>
              <span style={{ background: '#1b4332', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{l.ref}</span>
              <h4 style={{ margin: '6px 0 4px 0', fontSize: '12px' }}>{l.desc}</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}><strong>Estrategia:</strong> {l.uso}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default App;
