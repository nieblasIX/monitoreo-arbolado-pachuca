import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- BASE DE DATOS GEOMÁTICA UNIFICADA (GARMIN + DIAGNÓSTICO FITOSANITARIO) ---
const INVENTARIO_ARBOLES = [
  {
    id: 101,
    obraId: 1, // Vinculado a Av. Fomento Minero
    especie_comun: "Fresno Mexicano",
    especie_cientifica: "Fraxinus uhdei",
    tipo: "Introducida",
    dap_cm: 65,
    altura_m: 12,
    estatus: "Sano",
    accion_requerida: "Proteger y Defender",
    lat: 20.0892,
    lng: -98.7312,
    foto_url: "https://unsplash.com",
    rol_fauna: "Sus copas densas proveen sitios críticos de anidación para el tirano pajarero y refugio invernal para aves migratorias.",
    rol_humanidad: "Este árbol maduro captura más de 120 kg de CO₂ al año y sus raíces retienen cientos de litros de agua de lluvia, evitando inundaciones.",
    color_estatus: "#166534"
  },
  {
    id: 102,
    obraId: 2, // Vinculado a Av. Tecnológico
    especie_comun: "Huizache",
    especie_cientifica: "Vachellia farnesiana",
    tipo: "Endémica / Nativa",
    dap_cm: 30,
    altura_m: 4,
    estatus: "Sano",
    accion_requerida: "Máxima Prioridad de Conservación",
    lat: 20.0921,
    lng: -98.7543,
    foto_url: "https://unsplash.com",
    rol_fauna: "Sus flores amarillas altamente aromáticas son un oasis alimenticio vital para las abejas nativas y polinizadores de Pachuca.",
    rol_humanidad: "Es un arquitecto del suelo: fija nitrógeno en la tierra de forma natural, mejorando la fertilidad urbana y resistiendo sequías extremas.",
    color_estatus: "#166534"
  },
  {
    id: 103,
    obraId: 1, // Vinculado a Av. Fomento Minero
    especie_comun: "Trueno",
    especie_cientifica: "Ligustrum lucidum",
    tipo: "Introducida",
    dap_cm: 40,
    altura_m: 7,
    estatus: "Crítico - Plaga de Muérdago",
    accion_requerida: "Reportar para Poda Sanitaria",
    lat: 20.0887,
    lng: -98.7320,
    foto_url: "https://unsplash.com",
    rol_fauna: "Ofrece cobertura menor a aves urbanas comunes, pero sufre de infestación severa que pone en riesgo a árboles nativos vecinos.",
    rol_humanidad: "Especie exótica que los desarrolladores justifican talar. Exigimos saneamiento forestal o trasplante selectivo, NO derribo masivo.",
    color_estatus: "#d97706"
  },
  {
    id: 104,
    obraId: 1, // Vinculado a Av. Fomento Minero
    especie_comun: "Mezquite",
    especie_cientifica: "Prosopis laevigata",
    tipo: "Endémica / Nativa",
    dap_cm: 55,
    altura_m: 6,
    estatus: "Sano",
    accion_requerida: "Máxima Prioridad de Conservación",
    lat: 20.0895,
    lng: -98.7305,
    foto_url: "https://unsplash.com",
    rol_fauna: "Especie clave de la región: su follaje y vainas sostienen mamíferos pequeños, insectos endémicos y avifauna del semidesierto hidalguense.",
    rol_humanidad: "Sus raíces ultra profundas previenen de forma masiva la erosión del suelo calizo de Pachuca y capturan agua hacia los mantos acuíferos.",
    color_estatus: "#166534"
  }
];

const SOLICITUDES_INICIALES = [
  { id: 1, arboles: 89, palmeras: 2, total: 91, ubicacion: "Calle de la Minería c/ Blvd. Fomento Minero", obra: "Pavimento Hidráulico Av. Fomento Minero", lat: 20.089, lng: -98.731, acento: "#2d6a4f" },
  { id: 2, arboles: 0, palmeras: 32, total: 32, ubicacion: "Av. Tecnológico de Monterrey", obra: "Reconstrucción de Av. Tecnológico", lat: 20.092, lng: -98.754, acento: "#40916c" },
];

const CAPAS = [
  { id: 1, capa: "🔍 Mapa de Deforestación Crítica (2016-2026)", fuente: "Sentinel-2 Satélite ESA", prueba: "Zonas neón indican pérdida real de copas de árboles en las calles.", link: "https://earthengine.app" },
  { id: 2, capa: "🔥 Isla de Calor y Aumento Térmico (LST)", fuente: "Landsat 5 y 9 Térmico", prueba: "Zonas rojas flotantes exponen dónde subió la temperatura hasta +6°C.", link: "https://earthengine.app" },
  { id: 3, capa: "🌊 Suelo Sellado e Impermeabilidad Crítica", fuente: "Sentinel-2 + Relieve SRTM", prueba: "Zonas azul/naranja delatan concreto que impide filtrar agua y causa inundaciones.", link: "https://earthengine.app" },
];

const LEGAL = [
  { ref: "Art. 4° CPEUM", desc: "Derecho a un medio ambiente sano para su desarrollo y bienestar", uso: "Fundamento principal para amparos colectivos y denuncias ciudadanas." },
  { ref: "Arts. 28–29 LGEEPA", desc: "Obras sujetas a Manifestación de Impacto Ambiental (MIA) obligatoria", uso: "Exigir la MIA antes de cualquier derribo; sin ella, el acto es ilegítimo." },
];

const PROTOCOLO = [
  { fase: "ANTES", subtitulo: "Documenta antes de que ocurra", color: "#1b4332", pasos: ["Fotografía y georreferencia cada árbol con GPS", "Mide el DAP (Diámetro del tronco) e identifica la especie", "Guarda capturas históricas de Street View como antecedente previo"] }
];

function RecenterMap({ lat, lng }) {
  const map = useMap();
  map.setView([lat, lng], 16);
  return null;
}

function App() {
  const [seccionActiva, setSeccionActiva] = useState("expediente");
  const [subSeccionExpediente, setSubSeccionExpediente] = useState("obras");
  
  const [solicitudes] = useState(SOLICITUDES_INICIALES);
  const [obraSeleccionada, setObraSeleccionada] = useState(SOLICITUDES_INICIALES[0]);
  const [arbolSeleccionado, setArbolSeleccionado] = useState(INVENTARIO_ARBOLES[0]);

  // Filtrar de forma automatizada los árboles registrados que pertenecen a la obra activa en el mapa
  const arbolesDeLaObraActiva = INVENTARIO_ARBOLES.filter(a => a.obraId === obraSeleccionada.id);

  return (
    <div style={{ padding: '15px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '480px', margin: '0 auto', background: '#fcfdfd', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Encabezado SIG-C */}
      <header style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)', color: 'white', padding: '15px', borderRadius: '14px', textAlign: 'center', marginBottom: '15px', boxShadow: '0 10px 15px -3px rgba(22,101,52,0.1)' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800' }}>🌳 Expediente Geomático Ciudadano</h1>
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Defensa y Monitoreo del Arbolado · Pachuca</p>
      </header>

      {/* Menú Superior Navegación */}
      <nav style={{ display: 'flex', gap: '5px', marginBottom: '15px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
        <button onClick={() => setSeccionActiva("expediente")} style={{ flex: 1, padding: '10px 4px', fontSize: '12px', borderRadius: '9px', border: 'none', background: seccionActiva === "expediente" ? "white" : "transparent", color: seccionActiva === "expediente" ? "#166534" : "#64748b", fontWeight: '700' }}>📍 Expedientes</button>
        <button onClick={() => setSeccionActiva("protocolos")} style={{ flex: 1, padding: '10px 4px', fontSize: '12px', borderRadius: '9px', border: 'none', background: seccionActiva === "protocolos" ? "white" : "transparent", color: seccionActiva === "protocolos" ? "#166534" : "#64748b", fontWeight: '700' }}>📸 Protocolos</button>
        <button onClick={() => setSeccionActiva("legal")} style={{ flex: 1, padding: '10px 4px', fontSize: '12px', borderRadius: '9px', border: 'none', background: seccionActiva === "legal" ? "white" : "transparent", color: seccionActiva === "legal" ? "#166534" : "#64748b", fontWeight: '700' }}>⚖️ Marco Legal</button>
      </nav>

      {/* PESTAÑA 1: EXPEDIENTES */}
      {seccionActiva === "expediente" && (
        <section>
          {/* Mapa Leaflet Dinámico */}
          <div style={{ height: '225px', width: '100%', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', zIndex: 1 }}>
            <MapContainer 
              center={subSeccionExpediente === "garmin" ? [arbolSeleccionado.lat, arbolSeleccionado.lng] : [obraSeleccionada.lat, obraSeleccionada.lng]} 
              zoom={16} 
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {/* COMPORTAMIENTO INTELIGENTE DEL MAPA */}
              {subSeccionExpediente === "obras" && (
                <>
                  <Marker position={[obraSeleccionada.lat, obraSeleccionada.lng]}>
                    <Popup><strong>🚨 Zona de Obra:</strong><br/>{obraSeleccionada.obra}</Popup>
                  </Marker>
                  {/* Puntos Garmin cargados automáticamente en el entorno de la obra activa */}
                  {arbolesDeLaObraActiva.map(a => (
                    <Marker key={a.id} position={[a.lat, a.lng]}>
                      <Popup><strong>{a.especie_comun}</strong><br/>Estatus: {a.estatus}</Popup>
                    </Marker>
                  ))}
                </>
              )}

              {subSeccionExpediente === "garmin" && (
                INVENTARIO_ARBOLES.map(a => (
                  <Marker key={a.id} position={[a.lat, a.lng]} eventHandlers={{ click: () => setArbolSeleccionado(a) }}>
                    <Popup><strong>{a.especie_comun}</strong><br/>{a.accion_requerida}</Popup>
                  </Marker>
                ))
              )}

              {subSeccionExpediente === "garmin" ? 
                <RecenterMap lat={arbolSeleccionado.lat} lng={arbolSeleccionado.lng} /> : 
                <RecenterMap lat={obraSeleccionada.lat} lng={obraSeleccionada.lng} />
              }
            </MapContainer>
          </div>

          {/* Sub-Navegación UX Adaptada */}
          <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', padding: '3px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #edf2f7' }}>
            <button onClick={() => setSubSeccionExpediente("obras")} style={{ flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '6px', fontWeight: '700', background: subSeccionExpediente === "obras" ? "#2d6a4f" : "transparent", color: subSeccionExpediente === "obras" ? "white" : "#475569" }}>📁 ObrasCiviles</button>
            <button onClick={() => setSubSeccionExpediente("satelital")} style={{ flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '6px', fontWeight: '700', background: subSeccionExpediente === "satelital" ? "#2d6a4f" : "transparent", color: subSeccionExpediente === "satelital" ? "white" : "#475569" }}>🛰️ Auditoría Satelital</button>
            <button onClick={() => setSubSeccionExpediente("garmin")} style={{ flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '6px', fontWeight: '700', background: subSeccionExpediente === "garmin" ? "#2d6a4f" : "transparent", color: subSeccionExpediente === "garmin" ? "white" : "#475569" }}>🌳 Catálogo Garmin</button>
          </div>

          {/* SUB-SECCIÓN A: OBRAS CIVILES + DETECCION AUTOMÁTICA GARMIN */}
          {subSeccionExpediente === "obras" && (
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', margin: '0 0 6px 0' }}>📋 SELECCIONA UNA SOLICITUD DE DERRIBO:</p>
              {solicitudes.map(s => (
                <div key={s.id} onClick={() => setObraSeleccionada(s)} style={{ background: 'white', padding: '12px', borderRadius: '12px', margin: '8px 0', cursor: 'pointer', border: obraSeleccionada.id === s.id ? '2px solid #2d6a4f' : '1px solid #e2e8f0', borderLeft: `5px solid ${s.acento}` }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700' }}>{s.obra}</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>📍 {s.ubicacion}</p>
                  <div style={{ marginTop: '6px', fontSize: '10px', color: '#475569', fontStyle: 'italic' }}>
                    🔍 En el mapa superior se activaron <strong>{INVENTARIO_ARBOLES.filter(a => a.obraId === s.id).length} árboles georreferenciados</strong> para esta obra.
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUB-SECCIÓN B: AUDITORÍA SATELITAL TRADUCIDA */}
          {subSeccionExpediente === "satelital" && (
            <div>
              {/* Guía didáctica práctica */}
              <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #bbf7d0', fontSize: '11px', color: '#14532d', lineHeight: '1.4' }}>
                <strong>💡 ¿Cómo usar los visores satelitales?</strong>
                <ol style={{ margin: '4px 0 0 0', paddingLeft: '14px' }}>
                  <li>Haz clic en el botón verde <strong>"Ver Estudio"</strong> para abrir el mapa espacial de Google.</li>
                  <li>Usa tu dedo para moverte por Pachuca y buscar tu colonia.</li>
                  <li>Las manchas de colores intensos delatan el daño destructivo acumulado. ¡Toma capturas para tus denuncias!</li>
                </ol>
              </div>

              {CAPAS.map(c => (
                <div key={c.id} style={{ background: 'white', padding: '12px', borderRadius: '12px', margin: '8px 0', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ maxWidth: '72%' }}>
                    <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{c.capa}</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#64748b' }}>{c.prueba}</p>
                  </div>
                  <a href={c.link} target="_blank" rel="noreferrer" style={{ background: '#2d6a4f', color: 'white', textDecoration: 'none', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Ver Estudio</a>
                </div>
              ))}
            </div>
          )}

          {/* SUB-SECCIÓN C: CATÁLOGO GARMIN + FITOSANITARIO COMPLETO */}
          {subSeccionExpediente === "garmin" && (
            <div>
              {/* Ficha Didáctica Dinámica */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <img src={arbolSeleccionado.foto_url} alt={arbolSeleccionado.especie_comun} style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' }} />
                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', background: arbolSeleccionado.tipo.includes('Endémica') ? '#dcfce7' : '#fee2e2', color: arbolSeleccionado.tipo.includes('Endémica') ? '#166534' : '#991b1b', padding: '2px 6px', borderRadius: '9999px', fontWeight: '700' }}>
                      {arbolSeleccionado.tipo}
                    </span>
                    <h3 style={{ margin: '3px 0 1px 0', fontSize: '15px', fontWeight: '800', color: '#14532d' }}>{arbolSeleccionado.especie_comun}</h3>
                    <p style={{ margin: 0, fontSize: '11px', fontStyle: 'italic', color: '#64748b' }}>{arbolSeleccionado.especie_cientifica}</p>
                    
                    {/* Semáforo Fitosanitario */}
                    <div style={{ marginTop: '5px', display: 'flex', gap: '5px', alignItems: 'center', fontSize: '10px', fontWeight: '700' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '5px', background: arbolSeleccionado.color_estatus }}></span>
                      <span style={{ color: '#475569' }}>Salud: {arbolSeleccionado.estatus}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: '8px', borderLeft: `4px solid ${arbolSeleccionado.color_estatus}`, marginBottom: '8px', fontSize: '11px' }}>
                  <strong>🎯 Acción Ciudadana:</strong> <span style={{ color: '#1e293b', fontWeight: '600' }}>{arbolSeleccionado.accion_requerida}</span>
                </div>

                <div style={{ display: 'grid', gap: '6px', fontSize: '11px' }}>
                  <p style={{ margin: 0, color: '#334155' }}><strong>🦋 Valor Ecológico:</strong> {arbolSeleccionado.rol_fauna}</p>
                  <p style={{ margin: 0, color: '#334155' }}><strong>💚 Beneficio Humano:</strong> {arbolSeleccionado.rol_humanidad}</p>
                </div>
              </div>

              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', margin: '10px 0 6px 0' }}>🌲 SELECCIONA UN ID GARMIN PARA DESPLEGAR FICHA:</p>
              <div style={{ display: 'grid', gap: '5px' }}>
                {INVENTARIO_ARBOLES.map(a => (
                  <div key={a.id} onClick={() => setArbolSeleccionado(a)} style={{ background: 'white', padding: '10px', borderRadius: '12px', cursor: 'pointer', border: arbolSeleccionado.id === a.id ? '2px solid #166534' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>{a.especie_comun} <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>({a.tipo.includes('Nativa') ? 'Nativa' : 'Exótica'})</span></h4>
                      <span style={{ fontSize: '10px', color: a.color_estatus, fontWeight: '600' }}>⚠️ {a.accion_requerida}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#166534', fontWeight: '600' }}>📍 Localizar</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* PESTAÑA 2: PROTOCOLO */}
      {seccionActiva === "protocolos" && (
        <section>
          <h2 style={{ fontSize: '15px', color: '#1b4332', fontWeight: '700' }}>📸 Protocolos de Monitoreo</h2>
          {PROTOCOLO.map((p, idx) => (
            <div key={idx} style={{ background: 'white', padding: '12px', borderRadius: '12px', margin: '10px 0', borderLeft: `5px solid ${p.color}` }}>
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
          <h2 style={{ fontSize: '15px', color: '#1b4332', fontWeight: '700' }}>⚖️ Marco Jurídico de Amparo</h2>
          {LEGAL.map((l, idx) => (
            <div key={idx} style={{ background: 'white', padding: '12px', borderRadius: '12px', margin: '8px 0', border: '1px solid #e2e8f0' }}>
              <span style={{ background: '#1b4332', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>{l.ref}</span>
              <h4 style={{ margin: '6px 0 4px 0', fontSize: '12px', fontWeight: '700' }}>{l.desc}</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}><strong>Uso legal:</strong> {l.uso}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default App;
