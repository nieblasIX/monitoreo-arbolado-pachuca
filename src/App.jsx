import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- INVENTARIO CIENTÍFICO Y PEDAGÓGICO DE ÁRBOLES (REGISTRO GARMIN) ---
const INVENTARIO_ARBOLES = [
  {
    id: 101,
    especie_comun: "Fresno Mexicano",
    especie_cientifica: "Fraxinus uhdei",
    origen: "Nativo de México",
    dap_cm: 65,
    altura_m: 12,
    salud: "Excelente",
    lat: 20.0892,
    lng: -98.7312,
    foto_url: "https://unsplash.com",
    rol_fauna: "Sus copas densas proveen sitios críticos de anidación para el tirano pajarero y refugio invernal para aves migratorias.",
    rol_humanidad: "Este árbol maduro captura más de 120 kg de CO₂ al año y sus raíces retienen cientos de litros de agua de lluvia, evitando que tu calle se inunde."
  },
  {
    id: 102,
    especie_comun: "Huizache",
    especie_cientifica: "Vachellia farnesiana",
    origen: "Nativo (Zonas Áridas)",
    dap_cm: 30,
    altura_m: 4,
    salud: "Bueno",
    lat: 20.0921,
    lng: -98.7543,
    foto_url: "https://unsplash.com",
    rol_fauna: "Sus flores amarillas altamente aromáticas son un oasis alimenticio vital para las abejas nativas y polinizadores de Pachuca.",
    rol_humanidad: "Es un arquitecto del suelo: fija nitrógeno en la tierra de forma natural, mejorando la fertilidad urbana y resistiendo sequías extremas sin pedir agua."
  }
];

const SOLICITUDES_INICIALES = [
  { id: 1, arboles: 89, palmeras: 2, total: 91, ubicacion: "Calle de la Minería c/ Blvd. Fomento Minero", obra: "Reconstrucción con pavimento hidráulico de Av. Fomento Minero", lat: 20.089, lng: -98.731, acento: "#2d6a4f" },
  { id: 2, arboles: 0, palmeras: 32, total: 32, ubicacion: "Av. Tecnológico de Monterrey", obra: "Reconstrucción de Av. Tecnológico de Monterrey", lat: 20.092, lng: -98.754, acento: "#40916c" },
  { id: 3, arboles: 55, palmeras: 0, total: 55, ubicacion: "Av. Constructores c/ Blvd. Felipe Ángeles", obra: "Ampliación Av. Constructores – Blvd. Felipe Ángeles y Blvd. Colosio", lat: 20.053, lng: -98.779, acento: "#1b4332" },
  { id: 4, arboles: 14, palmeras: 0, total: 14, ubicacion: "Blvd. Luis Donaldo Colosio – frente Plaza del Valle", obra: "Ampliación lateral de servicios Blvd. Colosio – Plaza del Valle", lat: 20.088, lng: -98.723, acento: "#52b788" },
  { id: 5, arboles: 29, palmeras: 0, total: 29, ubicacion: "Blvd. Colosio – tramo Blvd. Nuevo Hidalgo a Blvd. Felipe Ángeles (frente SICT)", obra: "Ampliación lateral Blvd. Colosio – tramo Nuevo Hidalgo a Blvd. Felipe Ángeles", lat: 20.053, lng: -98.779, acento: "#74c69d" },
];

const CAPAS = [
  { id: 1, urgencia: "Alta", capa: "Cobertura vegetal histórica (2016 vs 2026)", fuente: "Sentinel-2 via Google Earth Engine", formato: "GEE Script", prueba: "Línea base del arbolado urbano para cuantificar pérdida", link: "https://resistenciatuza.projects.earthengine.app/view/pachuca-cobertura-vegetal" },
  { id: 2, urgencia: "Alta", capa: "Temperatura Superficial Transparente (LST 2000-2025)", fuente: "Landsat 5 y 9", formato: "GEE App", prueba: "Isla de calor urbana generada por pérdida acumulada de vegetación", link: "https://resistenciatuza.projects.earthengine.app/view/pachuca-isla-de-calor" },
  { id: 3, urgencia: "Alta", capa: "Permeabilidad del suelo y Escorrentía", fuente: "Sentinel-2 + SRTM GEE", formato: "GeoTIFF", prueba: "Reducción de infiltración → mayor riesgo de inundación por pavimento", link: "https://resistenciatuza.projects.earthengine.app/view/pachuca-permeabilidad-suelo" },
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
  const [subSeccionExpediente, setSubSeccionExpediente] = useState("obras"); // Control de la sub-navegación UX
  
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES_INICIALES);
  const [obraSeleccionada, setObraSeleccionada] = useState(SOLICITUDES_INICIALES[0]);
  const [arbolSeleccionado, setArbolSeleccionado] = useState(INVENTARIO_ARBOLES[0]);

  // Variables para el registro ciudadano en memoria
  const [nuevaObra, setNuevaObra] = useState("");
  const [nuevaLat, setNuevaLat] = useState("");
  const [nuevaLng, setNuevaLng] = useState("");
  const [nuevosArboles, setNuevosArboles] = useState("");

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
    setSubSeccionExpediente("obras"); // Regresa a la pestaña para ver la obra fijada en el mapa
    setNuevaObra(""); setNuevaLat(""); setNuevaLng(""); setNuevosArboles("");
  };

  return (
    <div style={{ padding: '15px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '480px', margin: '0 auto', background: '#fcfdfd', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Encabezado Fino */}
      <header style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)', color: 'white', padding: '15px', borderRadius: '14px', textAlign: 'center', marginBottom: '15px', boxShadow: '0 10px 15px -3px rgba(22,101,52,0.1)' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800' }}>🌳 Expediente Geomático Ciudadano</h1>
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Defensa del Arbolado Urbano · Pachuca</p>
      </header>

      {/* Menú de Navegación de 3 Pestañas */}
      <nav style={{ display: 'flex', gap: '5px', marginBottom: '15px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
        <button onClick={() => setSeccionActiva("expediente")} style={{ flex: 1, padding: '10px 4px', fontSize: '12px', borderRadius: '9px', border: 'none', background: seccionActiva === "expediente" ? "white" : "transparent", color: seccionActiva === "expediente" ? "#166534" : "#64748b", fontWeight: '700' }}>
          📍 Expedientes
        </button>
        <button onClick={() => setSeccionActiva("protocolos")} style={{ flex: 1, padding: '10px 4px', fontSize: '12px', borderRadius: '9px', border: 'none', background: seccionActiva === "protocolos" ? "white" : "transparent", color: seccionActiva === "protocolos" ? "#166534" : "#64748b", fontWeight: '700' }}>
          📸 Protocolos
        </button>
        <button onClick={() => setSeccionActiva("legal")} style={{ flex: 1, padding: '10px 4px', fontSize: '12px', borderRadius: '9px', border: 'none', background: seccionActiva === "legal" ? "white" : "transparent", color: seccionActiva === "legal" ? "#166534" : "#64748b", fontWeight: '700' }}>
          ⚖️ Marco Legal
        </button>
      </nav>

      {/* PESTAÑA 1: EXPEDIENTES (EL CORAZÓN INTERACTIVO DEL SIG) */}
      {seccionActiva === "expediente" && (
        <section>
          {/* Mapa Leaflet Dinámico */}
          <div style={{ height: '220px', width: '100%', borderRadius: '16px', overflow: 'hidden', marginBottom: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', zIndex: 1 }}>
            <MapContainer 
              center={subSeccionExpediente === "garmin" ? [arbolSeleccionado.lat, arbolSeleccionado.lng] : [obraSeleccionada.lat, obraSeleccionada.lng]} 
              zoom={15} 
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {/* Desplegar Marcador de la Obra Activa o de los Puntos Garmin correspondientes */}
              {subSeccionExpediente !== "garmin" ? (
                <Marker position={[obraSeleccionada.lat, obraSeleccionada.lng]}>
                  <Popup><strong>{obraSeleccionada.obra}</strong><br />🌲 {obraSeleccionada.total || obraSeleccionada.arboles} ejemplares.</Popup>
                </Marker>
              ) : (
                INVENTARIO_ARBOLES.map(a => (
                  <Marker key={a.id} position={[a.lat, a.lng]} eventHandlers={{ click: () => setArbolSeleccionado(a) }}>
                    <Popup><strong>{a.especie_comun}</strong><br/>{a.especie_cientifica}</Popup>
                  </Marker>
                ))
              )}
              
              {subSeccionExpediente === "garmin" ? 
                <RecenterMap lat={arbolSeleccionado.lat} lng={arbolSeleccionado.lng} /> : 
                <RecenterMap lat={obraSeleccionada.lat} lng={obraSeleccionada.lng} />
              }
            </MapContainer>
          </div>

          {/* Sub-Navegación Fina y Elegante dentro de Expedientes */}
          <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', padding: '3px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #edf2f7' }}>
            <button onClick={() => setSubSeccionExpediente("obras")} style={{ flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '6px', fontWeight: '600', background: subSeccionExpediente === "obras" ? "#2d6a4f" : "transparent", color: subSeccionExpediente === "obras" ? "white" : "#475569" }}>📁 Obras</button>
            <button onClick={() => setSubSeccionExpediente("satelital")} style={{ flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '6px', fontWeight: '600', background: subSeccionExpediente === "satelital" ? "#2d6a4f" : "transparent", color: subSeccionExpediente === "satelital" ? "white" : "#475569" }}>🛰️ GEE Apps</button>
            <button onClick={() => setSubSeccionExpediente("garmin")} style={{ flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '6px', fontWeight: '600', background: subSeccionExpediente === "garmin" ? "#2d6a4f" : "transparent", color: subSeccionExpediente === "garmin" ? "white" : "#475569" }}>🌳 Garmin GPS</button>
            <button onClick={() => setSubSeccionExpediente("carga")} style={{ flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '6px', fontWeight: '600', background: subSeccionExpediente === "carga" ? "#b91c1c" : "transparent", color: subSeccionExpediente === "carga" ? "white" : "#475569" }}>➕ Carga</button>
          </div>

          {/* Sub-Sección A: Lista de Obras Civiles */}
          {subSeccionExpediente === "obras" && (
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', margin: '0 0 8px 0' }}>📋 SOLICITUDES DE DERRIBO AUDITADAS:</p>
              {solicitudes.map(s => (
                <div key={s.id} onClick={() => setObraSeleccionada(s)} style={{ background: 'white', padding: '12px', borderRadius: '12px', margin: '8px 0', cursor: 'pointer', border: obraSeleccionada.id === s.id ? '2px solid #2d6a4f' : '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', borderLeft: `5px solid ${s.acento || "#2d6a4f"}` }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700' }}>{s.obra}</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>📍 {s.ubicacion}</p>
                  <span style={{ display: 'inline-block', marginTop: '5px', background: `${s.acento || "#2d6a4f"}15`, color: s.acento || "#2d6a4f", padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>🌲 {s.total || s.arboles} Individuos Afectados</span>
                </div>
              ))}
            </div>
          )}

          {/* Sub-Sección B: Estudios Satelitales GEE */}
          {subSeccionExpediente === "satelital" && (
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', margin: '0 0 8px 0' }}>🛰️ ANÁLISIS DE ANOMALÍAS TEMPORALES (2000 - 2026):</p>
              {CAPAS.map(c => (
                <div key={c.id} style={{ background: 'white', padding: '12px', borderRadius: '12px', margin: '8px 0', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.01)' }}>
                  <div style={{ maxWidth: '75%' }}>
                    <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>{c.capa}</h4>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>{c.prueba}</p>
                  </div>
                  <a href={c.link} target="_blank" rel="noreferrer" style={{ background: '#2d6a4f', color: 'white', textDecoration: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>GEE 🚀</a>
                </div>
              ))}
            </div>
          )}

          {/* Sub-Sección C: Registro Garmin + Ficha Pedagógica Empática */}
          {subSeccionExpediente === "garmin" && (
            <div>
              {/* Tarjeta de Divulgación Emocional */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', marginBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <img src={arbolSeleccionado.foto_url} alt={arbolSeleccionado.especie_comun} style={{ width: '75px', height: '75px', borderRadius: '12px', objectFit: 'cover', background: '#f1f5f9' }} />
                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '9999px', fontWeight: '700' }}>{arbolSeleccionado.origen}</span>
                    <h3 style={{ margin: '4px 0 2px 0', fontSize: '15px', fontWeight: '800', color: '#14532d' }}>{arbolSeleccionado.especie_comun}</h3>
                    <p style={{ margin: 0, fontSize: '11px', fontStyle: 'italic', color: '#64748b' }}>{arbolSeleccionado.especie_cientifica}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#475569' }}>📏 Altura: <strong>{arbolSeleccionado.altura_m}m</strong> | Tronco (DAP): <strong>{arbolSeleccionado.dap_cm}cm</strong></p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'grid', gap: '8px' }}>
                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #0284c7' }}>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#0369a1', fontWeight: '700' }}>🦋 Refugio de Biodiversidad Local:</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: '1.4' }}>{arbolSeleccionado.rol_fauna}</p>
                  </div>
                  <div style={{ background: '#fdfcfa', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #166534' }}>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#14532d', fontWeight: '700' }}>💚 Beneficio Vital Humano:</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: '1.4' }}>{arbolSeleccionado.rol_humanidad}</p>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', margin: '10px 0 6px 0' }}>🌳 ÁRBOLES GEORREFERENCIADOS CON GPS:</p>
              <div style={{ display: 'grid', gap: '6px' }}>
                {INVENTARIO_ARBOLES.map(a => (
                  <div key={a.id} onClick={() => setArbolSeleccionado(a)} style={{ background: 'white', padding: '10px 12px', borderRadius: '12px', cursor: 'pointer', border: arbolSeleccionado.id === a.id ? '2px solid #166534' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>{a.especie_comun}</h4>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Garmin ID: #{a.id}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#166534', fontWeight: '600' }}>📍 Enfocar</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Sección D: Formulario de carga ciudadano */}
          {subSeccionExpediente === "carga" && (
            <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#b91c1c', fontWeight: '700' }}>➕ Levantar Punto / Alerta Ciudadana</h3>
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
          )}
        </section>
      )}

      {/* PESTAÑA 2: PROTOCOLO */}
      {seccionActiva === "protocolos" && (
        <section>
          <h2 style={{ fontSize: '15px', color: '#1b4332', fontWeight: '700', marginBottom: '10px' }}>📸 Protocolo de Registro Antes / Durante / Después</h2>
          {PROTOCOLO.map((p, idx) => (
            <div key={idx} style={{ background: 'white', padding: '12px', borderRadius: '12px', margin: '10px 0', borderLeft: `5px solid ${p.color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <h3 style={{ margin: 0, color: p.color, fontSize: '13px', fontWeight: '700' }}>{p.fase}</h3>
              <p style={{ margin: '2px 0 8px 0', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>{p.subtitulo}</p>
              <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '11px', color: '#334155' }}>
                {p.pasos.map((paso, i) => <li key={i} style={{ marginBottom: '5px' }}>{paso}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* PESTAÑA 3: LEGAL */}
      {seccionActiva === "legal" && (
        <section>
          <h2 style={{ fontSize: '15px', color: '#1b4332', fontWeight: '700', marginBottom: '10px' }}>⚖️ Marco Legal y Defensa Colectiva</h2>
          {LEGAL.map((l, idx) => (
            <div key={idx} style={{ background: 'white', padding: '12px', borderRadius: '12px', margin: '8px 0', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
              <span style={{ background: '#1b4332', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>{l.ref}</span>
              <h4 style={{ margin: '6px 0 4px 0', fontSize: '12px', fontWeight: '700' }}>{l.desc}</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.4' }}><strong>Estrategia jurídica:</strong> {l.uso}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default App;
