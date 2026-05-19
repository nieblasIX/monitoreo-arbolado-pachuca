import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- BASE DE DATOS GEOMÁTICA Y MATRIZ DE VALOR DE CONSERVACIÓN ---
const INVENTARIO_ARBOLES = [
  {
    id: 101, obraId: 1, 
    especie_comun: "Mezquite", especie_cientifica: "Prosopis laevigata", tipo: "Nativa / Endémica",
    // 1. Información Morfológica
    dap_cm: 55, altura_m: 6, cobertura_copa_m2: 28, edad_estimada_anos: 45,
    // 2. Diagnóstico Fitosanitario
    estatus_salud: "Sano", vigor: "Excelente", plagas: "Ninguna",
    // 3. Estatus de Gestión y Conservación
    accion_requerida: "Máxima Prioridad de Conservación (Retención Obligatoria)", color_estatus: "#166534",
    foto_url: "https://unsplash.com",
    // 4. Registro Biológico / Ecológico
    rol_fauna: "Especie clave: su follaje y vainas sostienen mamíferos pequeños, insectos endémicos y avifauna del semidesierto hidalguense.",
    rol_humanidad: "Sus raíces ultra profundas previenen la erosión del suelo calizo de Pachuca y recargan activamente los mantos acuíferos subsuperficiales."
  },
  {
    id: 102, obraId: 2, 
    especie_comun: "Huizache", especie_cientifica: "Vachellia farnesiana", tipo: "Nativa / Endémica",
    dap_cm: 30, altura_m: 4, cobertura_copa_m2: 15, edad_estimada_anos: 20,
    estatus_salud: "Sano", vigor: "Bueno", plagas: "Ninguna",
    accion_requerida: "Prioridad Alta de Conservación", color_estatus: "#166534",
    foto_url: "https://unsplash.com",
    rol_fauna: "Sus flores amarillas altamente aromáticas son un oasis alimenticio vital para las abejas nativas y polinizadores de la cuenca de Pachuca.",
    rol_humanidad: "Fija nitrógeno en la tierra de forma natural, restaurando terrenos degradados por maquinaria pesada y resistiendo sequías extremas."
  },
  {
    id: 103, obraId: 1, 
    especie_comun: "Nopal Cardón", especie_cientifica: "Opuntia spp.", tipo: "Nativa / Endémica",
    dap_cm: 45, altura_m: 3, cobertura_copa_m2: 12, edad_estimada_anos: 15,
    estatus_salud: "Sano", vigor: "Bueno", plagas: "Ninguna",
    accion_requerida: "Protección Biocultural del Paisaje", color_estatus: "#166534",
    foto_url: "https://unsplash.com",
    rol_fauna: "Provee alimento crítico (tunas) y agua metabólica a reptiles, aves endémicas y pequeños roedores del ecosistema local.",
    rol_humanidad: "Acompañante tradicional del maguey. Excelente retenedor de humedad que evita la desertificación y erosión hídrica en laderas viales."
  },
  {
    id: 111, obraId: 1, 
    especie_comun: "Trueno", especie_cientifica: "Ligustrum lucidum", tipo: "Introducida / Exótica",
    dap_cm: 40, altura_m: 7, cobertura_copa_m2: 18, edad_estimada_anos: 12,
    estatus_salud: "Enfermo", vigor: "Pobre", plagas: "Infestación Severa de Muérdago",
    accion_requerida: "Reportar para Poda Sanitaria y Control de Plagas", color_estatus: "#d97706",
    foto_url: "https://unsplash.com",
    rol_fauna: "Ofrece cobertura menor a avifauna común, pero sufre de parasitismo que dispersa semillas de muérdago hacia árboles nativos sanos.",
    rol_humanidad: "Especie exótica invasora. Exigimos un plan de manejo forestal y saneamiento selectivo por parte de las autoridades, NO tala masiva rasa."
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
  { ref: "Art. 4° CPEUM", desc: "Derecho a un medio ambiente sano para su desarrollo y bienestar", uso: "Fundamento principal para amparos colectivos ciudadanos." },
  { ref: "Arts. 28–29 LGEEPA", desc: "Obras sujetas a Manifestación de Impacto Ambiental (MIA) obligatoria", uso: "Exigir la MIA antes de cualquier derribo; sin ella, el acto es ilegítimo." },
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
  const [obraSeleccionada, setObraSeleccionada] = useState(SOLICITUDES_INICIALES);
  const [arbolSeleccionado, setArbolSeleccionado] = useState(INVENTARIO_ARBOLES);

  const arbolesDeLaObraActiva = INVENTARIO_ARBOLES.filter(a => a.obraId === obraSeleccionada.id);

  const descargarMetadatosGeoJSON = () => {
    const geojson = {
      type: "FeatureCollection",
      features: INVENTARIO_ARBOLES.map(a => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [a.lng, a.lat] },
        properties: { 
          id: a.id, especie: a.especie_comun, cientifica: a.especie_cientifica, tipo: a.tipo, 
          dap_cm: a.dap_cm, altura_m: a.altura_m, salud: a.estatus_salud, plagas: a.plagas, accion: a.accion_requerida 
        }
      }))
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "inventario_arbolado_pachuca.geojson");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ padding: '15px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '480px', margin: '0 auto', background: '#fcfdfd', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Encabezado Principal */}
      <header style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)', color: 'white', padding: '15px', borderRadius: '14px', textAlign: 'center', marginBottom: '15px' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800' }}>🌳 Expediente Geomático Ciudadano</h1>
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Defensa e Inventario Biocultural · Pachuca</p>
      </header>

      {/* Menú Principal */}
      <nav style={{ display: 'flex', gap: '5px', marginBottom: '15px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
        <button onClick={() => setSeccionActiva("expediente")} style={{ flex: 1, padding: '10px 4px', fontSize: '12px', borderRadius: '9px', border: 'none', background: seccionActiva === "expediente" ? "white" : "transparent", color: seccionActiva === "expediente" ? "#166534" : "#64748b", fontWeight: '700' }}>📍 Expedientes</button>
        <button onClick={() => setSeccionActiva("legal")} style={{ flex: 1, padding: '10px 4px', fontSize: '12px', borderRadius: '9px', border: 'none', background: seccionActiva === "legal" ? "white" : "transparent", color: seccionActiva === "legal" ? "#166534" : "#64748b", fontWeight: '700' }}>⚖️ Marco Legal</button>
      </nav>

      {/* SECCIÓN EXPEDIENTES */}
      {seccionActiva === "expediente" && (
        <section>
          {/* Mapa SIG */}
          <div style={{ height: '220px', width: '100%', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', zIndex: 1 }}>
            <MapContainer center={subSeccionExpediente === "garmin" ? [arbolSeleccionado.lat, arbolSeleccionado.lng] : [obraSeleccionada.lat, obraSeleccionada.lng]} zoom={16} style={{ height: "100%", width: "100%" }}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {subSeccionExpediente === "obras" ? (
                <>
                  <Marker position={[obraSeleccionada.lat, obraSeleccionada.lng]}><Popup><strong>Zona de Obra:</strong><br/>{obraSeleccionada.obra}</Popup></Marker>
                  {arbolesDeLaObraActiva.map(a => (<Marker key={a.id} position={[a.lat, a.lng]}><Popup><strong>{a.especie_comun}</strong><br/>Salud: {a.estatus_salud}</Popup></Marker>))}
                </>
              ) : (
                INVENTARIO_ARBOLES.map(a => (<Marker key={a.id} position={[a.lat, a.lng]} eventHandlers={{ click: () => setArbolSeleccionado(a) }}><Popup><strong>{a.especie_comun}</strong><br/>{a.estatus_salud}</Popup></Marker>))
              )}
              {subSeccionExpediente === "garmin" ? <RecenterMap lat={arbolSeleccionado.lat} lng={arbolSeleccionado.lng} /> : <RecenterMap lat={obraSeleccionada.lat} lng={obraSeleccionada.lng} />}
            </MapContainer>
          </div>

          {/* Sub-Filtros */}
          <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', padding: '3px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #edf2f7' }}>
            <button onClick={() => setSubSeccionExpediente("obras")} style={{ flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '6px', fontWeight: '700', background: subSeccionExpediente === "obras" ? "#2d6a4f" : "transparent", color: subSeccionExpediente === "obras" ? "white" : "#475569" }}>📁 Obras Civiles</button>
            <button onClick={() => setSubSeccionExpediente("satelital")} style={{ flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '6px', fontWeight: '700', background: subSeccionExpediente === "satelital" ? "#2d6a4f" : "transparent", color: subSeccionExpediente === "satelital" ? "white" : "#475569" }}>🛰️ Auditoría Satelital</button>
            <button onClick={() => setSubSeccionExpediente("garmin")} style={{ flex: 1, padding: '6px', fontSize: '11px', border: 'none', borderRadius: '6px', fontWeight: '700', background: subSeccionExpediente === "garmin" ? "#14532d" : "transparent", color: subSeccionExpediente === "garmin" ? "white" : "#475569" }}>🌳 Catálogo e Inventario</button>
          </div>

          {/* SUB-SECCIÓN A: OBRAS CIVILES */}
          {subSeccionExpediente === "obras" && (
            <div>
              {solicitudes.map(s => (
                <div key={s.id} onClick={() => setObraSeleccionada(s)} style={{ background: 'white', padding: '12px', borderRadius: '12px', margin: '8px 0', cursor: 'pointer', border: obraSeleccionada.id === s.id ? '2px solid #2d6a4f' : '1px solid #e2e8f0', borderLeft: `5px solid ${s.acento}` }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700' }}>{s.obra}</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>📍 {s.ubicacion}</p>
                  <div style={{ marginTop: '5px', fontSize: '10px', color: '#166534', fontWeight: '600' }}>🔍 {INVENTARIO_ARBOLES.filter(a => a.obraId === s.id).length} árboles Garmin mapeados en el entorno.</div>
                </div>
              ))}
            </div>
          )}

          {/* SUB-SECCIÓN B: AUDITORÍA SATELITAL */}
          {subSeccionExpediente === "satelital" && (
            <div>
              <div style={{ background: '#f0fdf4', padding: '8px 10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #bbf7d0', fontSize: '11px', color: '#14532d' }}>
                <strong>💡 Guía de Uso Rápido:</strong> Toca <strong>Ver Estudio</strong>. En el mapa de Google, las manchas de colores encendidos (neón/fuego) acusan las afectaciones directas sobre el suelo urbano de Pachuca.
              </div>
              {CAPAS.map(c => (
                <div key={c.id} style={{ background: 'white', padding: '10px', borderRadius: '12px', margin: '6px 0', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{maxWidth: '72%'}}><h4 style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>{c.capa}</h4><p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>{c.prueba}</p></div>
                  <a href={c.link} target="_blank" rel="noreferrer" style={{ background: '#2d6a4f', color: 'white', textDecoration: 'none', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Ver Estudio</a>
                </div>
              ))}
            </div>
          )}

          {/* SUB-SECCIÓN C: CATÁLOGO E INVENTARIO MATRIZ CIENTÍFICA */}
          {subSeccionExpediente === "garmin" && (
            <div>
              {/* EXTRACCIÓN DE METADATOS */}
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '12px', borderRadius: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '11px', color: '#0369a1', fontWeight: '800' }}>📊 DATOS DE INVESTIGACIÓN Y USO SOCIAL</h4>
                  <p style={{ margin: 0, fontSize: '10px', color: '#0284c7' }}>Extraer el inventario base en formato espacial GeoJSON</p>
                </div>
                <button onClick={descargarMetadatosGeoJSON} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Extraer 💾</button>
              </div>

              {/* Ficha Pedagógica Estructurada */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <img src={arbolSeleccionado.foto_url} alt={arbolSeleccionado.especie_comun} style={{ width: '85px', height: '85px', borderRadius: '12px', objectFit: 'cover' }} />
                  <div>
                    <span style={{ fontSize: '9px', textTransform: 'uppercase', background: arbolSeleccionado.tipo.includes('Endémica') ? '#dcfce7' : '#fee2e2', color: arbolSeleccionado.tipo.includes('Endémica') ? '#166534' : '#991b1b', padding: '2px 6px', borderRadius: '9999px', fontWeight: '700' }}>{arbolSeleccionado.tipo}</span>
                    <h3 style={{ margin: '3px 0 1px 0', fontSize: '15px', fontWeight: '800', color: '#14532d' }}>{arbolSeleccionado.especie_comun}</h3>
                    <p style={{ margin: 0, fontSize: '11px', fontStyle: 'italic', color: '#64748b' }}>{arbolSeleccionado.especie_cientifica}</p>
                    
                    <span style={{ display: 'inline-block', marginTop: '6px', background: `${arbolSeleccionado.color_estatus}15`, color: arbolSeleccionado.color_estatus, padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700' }}>
                      📍 Gestión: {arbolSeleccionado.accion_requerida}
                    </span>
                  </div>
                </div>

                {/* Grid Diagnóstico Técnico */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: '#f8fafc', padding: '8px', borderRadius: '8px', fontSize: '11px', marginBottom: '10px', border: '1px solid #edf2f7' }}>
                  <div><strong>📏 Info Morfológica:</strong><br/>• Altura: {arbolSeleccionado.altura_m}m<br/>• Tronco (DAP): {arbolSeleccionado.dap_cm}cm<br/>• Copa: {arbolSeleccionado.cobertura_copa_m2}m²<br/>• Edad aprox: {arbolSeleccionado.edad_estimada_anos} años</div>
                  <div><strong>⚠️ Diagnóstico Fitosanitario:</strong><br/>• Salud: {arbolSeleccionado.estatus_salud}<br/>• Vigor: {arbolSeleccionado.vigor}<br/>• Plagas: {arbolSeleccionado.plagas}</div>
                </div>

                <div style={{ display: 'grid', gap: '6px', fontSize: '11px', lineHeight: '1.4' }}>
                  <p style={{ margin: 0 }}><strong>🦋 Registro Biológico (Fauna):</strong> {arbolSeleccionado.rol_fauna}</p>
                  <p style={{ margin: 0 }}><strong>💚 Servicio Ecosistémico (Humanidad):</strong> {arbolSeleccionado.rol_humanidad}</p>
                </div>
              </div>

              {/* Selector de Ejemplar */}
              <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', margin: '10px 0 5px 0' }}>📋 SELECCIONA UN REGISTRO PARA DESPLEGAR VALOR DE CONSERVACIÓN:</p>
              <div style={{ display: 'grid', gap: '5px' }}>
                {INVENTARIO_ARBOLES.map(a => (
                  <div key={a.id} onClick={() => setArbolSeleccionado(a)} style={{ background: 'white', padding: '8px 10px', borderRadius: '12px', cursor: 'pointer', border: arbolSeleccionado.id === a.id ? '2px solid #166534' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', items: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>{a.especie_comun} <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>({a.especie_cientifica})</span></h4>
                      <span style={{ fontSize: '10px', color: '#475569' }}>Morfología: {a.altura_m}m alt | Salud: {a.estatus_salud}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>Mapear</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* PESTAÑA MARCO LEGAL */}
      {seccionActiva === "legal" && (
        <section>
          <h2 style={{ fontSize: '15px', color: '#1b4332', fontWeight: '700', marginBottom: '10px' }}>⚖️ Fundamentos para Amparos Colectivos</h2>
          {LEGAL.map((l, idx) => (
            <div key={idx} style={{ background: 'white', padding: '12px', borderRadius: '12px', margin: '8px 0', border: '1px solid #e2e8f0' }}>
              <span style={{ background: '#1b4332', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>{l.ref}</span>
              <h4 style={{ margin: '4px 0 4px 0', fontSize: '12px', fontWeight: '700' }}>{l.desc}</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}><strong>Estrategia jurídica:</strong> {l.uso}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default App;
