import { useState } from "react";

const SOLICITUDES = [
  { id: 1, arboles: 89, palmeras: 2, total: 91,
    ubicacion: "Calle de la Minería c/ Blvd. Fomento Minero",
    obra: "Reconstrucción con pavimento hidráulico de Av. Fomento Minero",
    coords: "20.089°N, 98.731°O", acento: "#2d6a4f" },
  { id: 2, arboles: 0, palmeras: 32, total: 32,
    ubicacion: "Av. Tecnológico de Monterrey",
    obra: "Reconstrucción de Av. Tecnológico de Monterrey",
    coords: "20.092°N, 98.754°O", acento: "#40916c" },
  { id: 3, arboles: 55, palmeras: 0, total: 55,
    ubicacion: "Av. Constructores c/ Blvd. Felipe Ángeles",
    obra: "Ampliación Av. Constructores – Blvd. Felipe Ángeles y Blvd. Colosio",
    coords: "20.053°N, 98.779°O", acento: "#1b4332" },
  { id: 4, arboles: 14, palmeras: 0, total: 14,
    ubicacion: "Blvd. Luis Donaldo Colosio – frente Plaza del Valle",
    obra: "Ampliación lateral de servicios Blvd. Colosio – Plaza del Valle",
    coords: "20.088°N, 98.723°O", acento: "#52b788" },
  { id: 5, arboles: 29, palmeras: 0, total: 29,
    ubicacion: "Blvd. Colosio – tramo Blvd. Nuevo Hidalgo a Blvd. Felipe Ángeles (frente SICT)",
    obra: "Ampliación lateral Blvd. Colosio – tramo Nuevo Hidalgo a Blvd. Felipe Ángeles",
    coords: "20.053°N, 98.779°O", acento: "#74c69d" },
];

const CAPAS = [
  { id:1, urgencia:"Inmediata", capa:"Inventario fotográfico del arbolado", fuente:"Levantamiento ciudadano — ODK Collect / Epicollect5", formato:"GeoJSON / CSV", prueba:"Especie, DAP, altura, estado fitosanitario individual de cada ejemplar" },
  { id:2, urgencia:"Inmediata", capa:"Registro Antes / Durante / Después", fuente:"Ciudadanos + Google Street View histórico", formato:"JPG / MP4 + GeoJSON", prueba:"Evidencia fotográfica y videográfica del daño real y cambio temporal" },
  { id:3, urgencia:"Alta", capa:"Cobertura vegetal histórica — 2005", fuente:"INEGI Serie VI Uso de Suelo y Vegetación", formato:"SHP / GeoTIFF", prueba:"Línea base del arbolado urbano para cuantificar pérdida" },
  { id:4, urgencia:"Alta", capa:"Cobertura vegetal actual — 2024–25", fuente:"INEGI Ortofotos + digitalización ciudadana en QGIS", formato:"SHP", prueba:"Pérdida real y cuantificable de cobertura de copa arbolada" },
  { id:5, urgencia:"Alta", capa:"Temperatura Superficial (LST)", fuente:"Landsat 8/9 — USGS EarthExplorer (2000 vs. 2025)", formato:"GeoTIFF", prueba:"Isla de calor urbana generada por pérdida acumulada de vegetación" },
  { id:6, urgencia:"Alta", capa:"PDU Municipal 2020 vs. 2024", fuente:"Ayuntamiento de Pachuca vía INFOMEX / Transparencia", formato:"PDF / SHP", prueba:"Cambios de uso de suelo no justificados y omisiones al arbolado urbano" },
  { id:7, urgencia:"Alta", capa:"Servicios ecosistémicos (valoración económica)", fuente:"i-Tree Eco — USFS (gratuito en línea)", formato:"Tabular", prueba:"Valor en $ de CO₂ capturado, agua interceptada, sombra y calidad del aire" },
  { id:8, urgencia:"Alta", capa:"Permeabilidad del suelo", fuente:"Edafología INEGI + análisis de impermeabilidad en QGIS", formato:"GeoTIFF", prueba:"Reducción de infiltración → mayor escorrentía e inundaciones urbanas" },
  { id:9, urgencia:"Alta", capa:"Dictámenes técnicos vs. permisos otorgados", fuente:"PROFEPA / SEMARNATH Hidalgo / Ayuntamiento vía INFOMEX", formato:"PDF", prueba:"Irregularidades, omisiones y permisos sin sustento técnico-ambiental" },
  { id:10, urgencia:"Media", capa:"Escurrimientos superficiales", fuente:"SIATL — INEGI", formato:"SHP", prueba:"Mayor riesgo de inundación por suelo sellado con pavimento hidráulico" },
  { id:11, urgencia:"Media", capa:"Fauna urbana asociada", fuente:"iNaturalist / registros ciudadanos georeferenciados", formato:"CSV / API", prueba:"Dependencia ecológica: aves, insectos polinizadores, mamíferos urbanos" },
  { id:12, urgencia:"Media", capa:"Corredores biológicos urbanos", fuente:"Análisis de conectividad — QGIS / Fragstats", formato:"SHP", prueba:"Fragmentación del hábitat y pérdida de conectividad ecológica urbana" },
  { id:13, urgencia:"Media", capa:"Microclima local (temperatura y humedad)", fuente:"Mediciones ciudadanas + Weather Underground / CONAGUA", formato:"CSV", prueba:"Impacto térmico real antes y después del derribo (evidencia de campo)" },
  { id:14, urgencia:"Media", capa:"Edad y especie del arbolado", fuente:"Análisis visual + CONABIO + catálogos botánicos regionales", formato:"Tabular", prueba:"Irreversibilidad del daño: árboles maduros o centenarios no se recuperan" },
];

const LEGAL = [
  { ref:"Art. 4° CPEUM", desc:"Derecho de toda persona a un medio ambiente sano para su desarrollo y bienestar", uso:"Fundamento principal para amparos colectivos y denuncias ciudadanas formales" },
  { ref:"Art. 8° CPEUM", desc:"Derecho de petición: toda solicitud ciudadana debe ser respondida por escrito por la autoridad", uso:"Exigir permisos, dictámenes técnicos y respuestas formales al Ayuntamiento y SEMARNATH" },
  { ref:"Arts. 28–29 LGEEPA", desc:"Obras y actividades sujetas a Manifestación de Impacto Ambiental (MIA) previa obligatoria", uso:"Exigir la MIA antes de cualquier derribo; sin ella, el acto de autoridad es ilegítimo" },
  { ref:"Arts. 160–189 LGEEPA", desc:"Inspección, vigilancia y denuncia ciudadana en materia de equilibrio ecológico", uso:"Interponer denuncia ante PROFEPA con el expediente geomático ciudadano como prueba" },
  { ref:"Ley Ambiental del Estado de Hidalgo", desc:"Regulación del arbolado urbano, áreas verdes y servicios ambientales en Hidalgo", uso:"Exigir dictamen previo de la SEMARNATH Hidalgo antes de cualquier derribo" },
  { ref:"NOM-059-SEMARNAT-2010", desc:"Listado oficial de especies de flora y fauna silvestres en riesgo de extinción en México", uso:"Identificar si algún árbol o fauna asociada (aves nidificantes) está protegida legalmente" },
  { ref:"Ley de Amparo — Arts. 1 y 17", desc:"Amparo indirecto contra actos de autoridad que vulneren derechos ambientales colectivos", uso:"Presentar ante Juzgado de Distrito con el expediente geomático como prueba técnica" },
  { ref:"LFTAIP — Ley de Transparencia", desc:"Derecho ciudadano de acceso a la información pública gubernamental", uso:"Solicitar vía INFOMEX/PNT: permisos, contratos, dictámenes y MIA de cada obra" },
  { ref:"Ley General de Cambio Climático", desc:"Compromisos NDC de México: conservación de sumideros de carbono y resiliencia urbana", uso:"Argumentar pérdida de sumideros urbanos frente a compromisos internacionales contraídos" },
  { ref:"Art. 115 CPEUM", desc:"Los municipios tienen obligación de preservar el equilibrio ecológico en su territorio", uso:"Responsabilidad directa del Ayuntamiento de Pachuca en la protección del arbolado urbano" },
];

const PROTOCOLO = [
  { fase:"ANTES", subtitulo:"Documenta antes de que ocurra", color:"#1b4332", icon:"ti-camera",
    pasos:[
      "Fotografía y georreferencia cada árbol con GPS (app: ODK Collect, Epicollect5 o Maps.me offline)",
      "Mide el DAP (Diámetro a la Altura del Pecho: 1.30 m) y estima la altura visualmente",
      "Identifica la especie con iNaturalist — genera evidencia científica ciudadana validada",
      "Captura y descarga Google Street View histórico de la zona como evidencia pre-obra (PDF o pantallazos)",
      "Graba video panorámico 360° de toda la zona con fecha y hora visibles en pantalla",
      "Solicita vía INFOMEX: permiso de derribo, dictamen técnico ambiental y MIA de la obra",
      "Documenta fauna asociada: nidos activos, madrigueras, líquenes, flora epífita en corteza",
      "Comparte los datos crudos con fecha, hora y GPS en grupos de vecinos y redes sociales",
    ]},
  { fase:"DURANTE", subtitulo:"Actúa en tiempo real con evidencia", color:"#92400e", icon:"ti-alert-triangle",
    pasos:[
      "Filma en video continuo el proceso de derribo con fecha y hora visibles en pantalla",
      "Fotografía número de placa de maquinaria y credenciales del personal directivo si es posible",
      "Verifica si existe aviso de obra con número de permiso oficial visible para el público",
      "Documenta si realizan (o no) medidas de protección, ahuyentamiento o reubicación de fauna",
      "Registra si hay — o no hay — supervisor ambiental acreditado presente en la obra",
      "Difunde en tiempo real en redes con coordenadas GPS: #ArbolesPachuca #ExpedienteVerde",
      "Llama AHORA a PROFEPA Denuncia Ciudadana: 800-776-3372 (servicio las 24 horas)",
      "Georreferencia el área exacta del derribo en tiempo real con GPS y marca en Google Maps",
    ]},
  { fase:"DESPUÉS", subtitulo:"Consolida el expediente jurídico", color:"#2d6a4f", icon:"ti-file-analytics",
    pasos:[
      "Fotografía los tocones resultantes: mide el diámetro y estima la edad por anillos visibles",
      "Mide temperatura superficial con termómetro infrarrojo en el área (antes vs. después del derribo)",
      "Documenta cambios en escorrentía durante la siguiente lluvia significativa (video del escurrimiento)",
      "Registra la ausencia de fauna que habitaba los árboles: aves, insectos, nidos abandonados",
      "Elabora el informe técnico geomático final con todas las capas de datos levantadas",
      "Presenta denuncia formal ante PROFEPA y SEMARNATH Hidalgo con el expediente completo",
      "Interpone queja formal ante la CNDH y la Comisión Estatal de Derechos Humanos de Hidalgo",
      "Exige compensación ambiental equivalente, plan de reforestación certificado y seguimiento",
    ]},
];

const DOC_TYPES = [
  { id:"protesta", label:"Carta de protesta ciudadana" },
  { id:"profepa", label:"Denuncia ante PROFEPA" },
  { id:"infomex", label:"Solicitud de información pública (INFOMEX)" },
  { id:"suspension", label:"Petición de suspensión de obra" },
  { id:"amparo", label:"Argumentos para juicio de amparo" },
];

function buildPrompt(docType, sol, nombre, detalles) {
  const ctx = `Información del caso:
- Ubicación: ${sol.ubicacion}, Pachuca de Soto, Hidalgo, México
- Árboles en riesgo de derribo: ${sol.total} ejemplares (${sol.arboles} árboles, ${sol.palmeras} palmeras)
- Obra que justifica el derribo: ${sol.obra}
- Irregularidad grave: NO hubo consulta ciudadana previa
- Promovente: ${nombre || "Ciudadano(a) residente de Pachuca de Soto, Hidalgo"}
- Fecha: ${new Date().toLocaleDateString("es-MX", { year:"numeric", month:"long", day:"numeric" })}
- Detalles adicionales aportados por el promovente: ${detalles || "Sin detalles adicionales"}`;

  const docs = {
    protesta:`Eres experto en derecho ambiental mexicano. Redacta una CARTA DE PROTESTA CIUDADANA formal, fundamentada y de tono firme pero respetuoso. Empieza directamente con el documento, sin preambles.
${ctx}
Dirígela al H. Ayuntamiento de Pachuca de Soto y a la Secretaría de Medio Ambiente y Recursos Naturales de Hidalgo (SEMARNATH).
Fundaméntala jurídicamente en: Artículo 4° Constitucional (derecho a medio ambiente sano), Arts. 28-29 LGEEPA (MIA requerida), Ley Ambiental del Estado de Hidalgo (protección del arbolado urbano).
Estructura: encabezado formal con lugar y fecha, destinatario, antecedentes precisos del caso, fundamento jurídico detallado, puntos petitorios numerados y específicos (mínimo 4), y espacio para nombre y firma del promovente.
Máximo 480 palabras.`,

    profepa:`Eres experto en derecho ambiental mexicano y procedimientos ante PROFEPA. Redacta una DENUNCIA CIUDADANA formal ante la Procuraduría Federal de Protección al Ambiente. Empieza directamente con el documento.
${ctx}
Fundaméntala en: Arts. 160-189 LGEEPA (facultades de inspección y vigilancia), posible omisión de MIA (Arts. 28-29 LGEEPA), posible afectación a especies en riesgo NOM-059-SEMARNAT-2010.
Estructura: datos del denunciante, descripción precisa y cronológica de los hechos denunciados, fundamento jurídico detallado, solicitud de inspección ocular inmediata, medidas cautelares urgentes solicitadas, y firma.
Máximo 480 palabras.`,

    infomex:`Eres experto en transparencia y acceso a la información pública en México. Redacta una SOLICITUD DE INFORMACIÓN PÚBLICA para presentar vía la Plataforma Nacional de Transparencia (PNT / INFOMEX). Empieza directamente con el documento.
${ctx}
Dirígela al Ayuntamiento de Pachuca de Soto como sujeto obligado. Fundaméntala en: LFTAIP (Ley Federal de Transparencia y Acceso a la Información Pública), Art. 8° Constitucional.
La solicitud debe requerir en puntos numerados (mínimo 6): 1) permiso oficial de derribo y número de folio, 2) dictamen técnico ambiental que sustenta el derribo, 3) Manifestación de Impacto Ambiental (MIA) si aplica, 4) contrato de obra y empresa ejecutora, 5) estudios de impacto vial y ambiental previos, 6) nombre y cédula del responsable técnico ambiental, 7) actas de consulta ciudadana previa.
Incluye datos del solicitante y plazo legal de respuesta (20 días hábiles). Máximo 380 palabras.`,

    suspension:`Eres experto en derecho ambiental mexicano. Redacta un ESCRITO DE PETICIÓN DE SUSPENSIÓN INMEDIATA DE OBRA con carácter urgente. Empieza directamente con el documento.
${ctx}
Dirígelo al Presidente Municipal Constitucional de Pachuca de Soto, Hidalgo.
Fundaméntalo en: Art. 8° Constitucional (derecho de petición de respuesta inmediata), Arts. 28-29 LGEEPA (MIA obligatoria no acreditada), Art. 4° Constitucional (derecho a medio ambiente sano), Ley Ambiental del Estado de Hidalgo.
Solicita explícitamente: a) suspensión inmediata de la obra, b) acreditación pública de la MIA, c) presentación del dictamen técnico ambiental, d) apertura del proceso de consulta ciudadana, e) designación de supervisor ambiental independiente para supervisar cualquier trabajo.
Tono: urgente, técnico y preciso. Máximo 480 palabras.`,

    amparo:`Eres experto en juicio de amparo en materia ambiental en México. Redacta los ARGUMENTOS JURÍDICOS PRINCIPALES para sustentar un Juicio de Amparo Indirecto. Empieza directamente con el documento.
${ctx}
Fundaméntalo en: Ley de Amparo Arts. 1, 17 y 61 fracción XX; Art. 4° Constitucional; Arts. 28-29 LGEEPA; interés legítimo colectivo en materia ambiental (criterio SCJN).
Desarrolla con precisión: 1) Acto reclamado (descripción exacta), 2) Autoridades responsables (Presidente Municipal, Director de Obras Públicas, SEMARNATH Hidalgo), 3) Derechos fundamentales violados con fundamentación, 4) Concepto de violación principal desarrollado, 5) Solicitud de suspensión provisional del acto.
Concluye con una nota clara de que el escrito completo debe ser firmado por abogado o abogada titulada. Máximo 500 palabras.`,
  };
  return docs[docType] || docs.protesta;
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [docType, setDocType] = useState("protesta");
  const [nombre, setNombre] = useState("");
  const [detalles, setDetalles] = useState("");
  const [solIdx, setSolIdx] = useState(0);
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalArboles = SOLICITUDES.reduce((a, s) => a + s.arboles, 0);
  const totalPalmeras = SOLICITUDES.reduce((a, s) => a + s.palmeras, 0);
  const total = totalArboles + totalPalmeras;
  const maxTotal = Math.max(...SOLICITUDES.map(s => s.total));

  const TABS = ["Expediente", "Protocolo A/D/D", "Capas Geomáticas", "Marco Legal", "Genera Documentos", "Acción Ciudadana"];

  const generateDoc = async () => {
    setLoading(true);
    setGenerated("");
    setCopied(false);
    const prompt = buildPrompt(docType, SOLICITUDES[solIdx], nombre, detalles);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = (data.content || []).map(b => b.text || "").join("");
      setGenerated(text || "No se obtuvo respuesta. Intenta de nuevo.");
    } catch {
      setGenerated("⚠️ Error de conexión. Verifica tu red e intenta de nuevo.");
    }
    setLoading(false);
  };

  const copyText = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const urgColor = { "Inmediata": ["#fee2e2","#991b1b"], "Alta": ["#fef3c7","#92400e"], "Media": ["#e0f2fe","#0c4a6e"] };

  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", maxWidth: 700 }}>

      {/* HEADER */}
      <div style={{ background:"#1b4332", padding:"1.5rem 1.25rem 1.1rem" }}>
        <div style={{ fontSize:10, letterSpacing:2.5, color:"#52b788", marginBottom:6, fontFamily:"monospace" }}>
          EXPEDIENTE CIUDADANO · PACHUCA DE SOTO, HIDALGO · {new Date().getFullYear()}
        </div>
        <h1 style={{ margin:"0 0 0.4rem", fontSize:21, fontWeight:400, color:"#d8f3dc", letterSpacing:0.3 }}>
          Guardianes del Arbolado Urbano
        </h1>
        <p style={{ margin:"0 0 1.1rem", fontSize:13, color:"#95d5b2", lineHeight:1.6 }}>
          Herramienta geomática y jurídica para que cualquier ciudadano o ciudadana de Pachuca pueda documentar, denunciar y amparar la flora, fauna y el derecho a un ambiente sano frente a {SOLICITUDES.length} solicitudes de derribo que suman <strong style={{ color:"#d8f3dc" }}>{total} ejemplares</strong> sin consulta ciudadana.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
          {[
            { n: total, label:"ejemplares en riesgo", sub:`${totalArboles} árboles · ${totalPalmeras} palmeras` },
            { n: 5, label:"solicitudes de derribo", sub:"sin consulta ciudadana" },
            { n: 5, label:"vialidades afectadas", sub:"Pachuca de Soto, Hgo." },
          ].map((s,i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.09)", borderRadius:8, padding:"0.7rem 0.8rem" }}>
              <div style={{ fontSize:26, fontWeight:300, color:"#d8f3dc", lineHeight:1 }}>{s.n}</div>
              <div style={{ fontSize:10.5, color:"#95d5b2", margin:"4px 0 2px", lineHeight:1.3 }}>{s.label}</div>
              <div style={{ fontSize:10, color:"#52b788" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", borderBottom:"2px solid #1b4332", overflowX:"auto", background:"var(--color-background-secondary)" }}>
        {TABS.map((name, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            padding:"0.55rem 0.85rem", border:"none", cursor:"pointer", fontSize:11.5, fontWeight:500,
            background: tab===i ? "#1b4332" : "transparent",
            color: tab===i ? "#d8f3dc" : "var(--color-text-secondary)",
            whiteSpace:"nowrap", transition:"all 0.15s", fontFamily:"Georgia, serif",
            borderBottom: tab===i ? "none" : "none"
          }}>{name}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ padding:"1.25rem 1rem", color:"var(--color-text-primary)" }}>

        {/* ── TAB 0: EXPEDIENTE ── */}
        {tab === 0 && (
          <div>
            <p style={{ fontSize:13, color:"var(--color-text-secondary)", marginBottom:"1rem", lineHeight:1.65 }}>
              Las siguientes 5 solicitudes fueron presentadas ante la SEMARNATH Hidalgo para derribar <strong>{total} ejemplares</strong> de flora urbana en vialidades de Pachuca. Ninguna fue sometida a consulta ciudadana previa, y no existe evidencia pública de Manifestación de Impacto Ambiental.
            </p>
            {SOLICITUDES.map(s => (
              <div key={s.id} style={{ background:"var(--color-background-primary)", border:`1.5px solid ${s.acento}`, borderRadius:12, padding:"0.9rem 1.1rem", marginBottom:"0.7rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <span style={{ fontSize:10, fontWeight:500, color:s.acento, letterSpacing:1.5, fontFamily:"monospace" }}>SOLICITUD {s.id}</span>
                  <span style={{ background:s.acento, color:"#fff", borderRadius:20, padding:"2px 10px", fontSize:11.5, fontWeight:500 }}>{s.total} ejemplares</span>
                </div>
                <div style={{ fontSize:13.5, fontWeight:500, color:"var(--color-text-primary)", marginBottom:3 }}>{s.ubicacion}</div>
                <div style={{ fontSize:11.5, color:"var(--color-text-secondary)", marginBottom:8, lineHeight:1.5 }}>{s.obra}</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:8 }}>
                  {s.arboles > 0 && <span style={{ background:"#d8f3dc", color:"#1b4332", borderRadius:6, padding:"2px 8px", fontSize:10.5 }}>{s.arboles} árboles</span>}
                  {s.palmeras > 0 && <span style={{ background:"#fef3c7", color:"#92400e", borderRadius:6, padding:"2px 8px", fontSize:10.5 }}>{s.palmeras} palmeras</span>}
                  <span style={{ background:"var(--color-background-secondary)", color:"var(--color-text-secondary)", borderRadius:6, padding:"2px 8px", fontSize:10.5 }}>{s.coords}</span>
                </div>
                <div style={{ height:4, background:"var(--color-background-secondary)", borderRadius:2 }}>
                  <div style={{ height:4, width:`${(s.total/maxTotal)*100}%`, background:s.acento, borderRadius:2 }} />
                </div>
              </div>
            ))}
            <div style={{ background:"#1b4332", color:"#d8f3dc", borderRadius:8, padding:"0.8rem 1rem", fontSize:12, lineHeight:1.7, marginTop:4 }}>
              <strong style={{ color:"#74c69d" }}>Zona crítica sin posibilidad de vuelo dron (zona restringida):</strong>{" "}
              Camellón Blvd. Felipe Ángeles entre calle Pirita y calle Plata, frente al SGM. Coordenadas: 20.0535°N, 98.7785°O → 20.0521°N, 98.7799°O. Alternativas: solicitar permiso AFAC, usar imágenes Sentinel-2 (Copernicus) o Planet Explorer, y levantamiento fotográfico georeferenciado desde nivel de calle.
            </div>
          </div>
        )}

        {/* ── TAB 1: PROTOCOLO ── */}
        {tab === 1 && (
          <div>
            <p style={{ fontSize:13, color:"var(--color-text-secondary)", marginBottom:"1.2rem", lineHeight:1.65 }}>
              Protocolo ciudadano de documentación en tres fases. Aplicable con un smartphone. La evidencia recolectada tiene valor técnico y jurídico ante autoridades y juzgados.
            </p>
            {PROTOCOLO.map((fase, fi) => (
              <div key={fi} style={{ border:`1.5px solid ${fase.color}`, borderRadius:12, marginBottom:"1rem", overflow:"hidden" }}>
                <div style={{ background:fase.color, color:"#fff", padding:"0.7rem 1.1rem", display:"flex", alignItems:"center", gap:10 }}>
                  <i className={`ti ${fase.icon}`} style={{ fontSize:18 }} aria-hidden="true" />
                  <div>
                    <div style={{ fontWeight:500, fontSize:13, letterSpacing:1.5 }}>FASE {fase.fase}</div>
                    <div style={{ fontSize:11, opacity:0.85 }}>{fase.subtitulo}</div>
                  </div>
                </div>
                <div style={{ padding:"0.7rem 1.1rem", background:"var(--color-background-primary)" }}>
                  {fase.pasos.map((paso, pi) => (
                    <div key={pi} style={{ display:"flex", gap:10, padding:"0.38rem 0", borderBottom: pi < fase.pasos.length-1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                      <span style={{ minWidth:18, height:18, background:fase.color, color:"#fff", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9.5, fontWeight:500, marginTop:2, flexShrink:0 }}>{pi+1}</span>
                      <span style={{ fontSize:12.5, lineHeight:1.55, color:"var(--color-text-primary)" }}>{paso}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ background:"#e8f5e9", border:"1px solid #2d6a4f", borderRadius:8, padding:"0.75rem 1rem", fontSize:12, color:"#1b4332", lineHeight:1.7 }}>
              <strong>Apps gratuitas recomendadas:</strong> ODK Collect (formularios GPS), Epicollect5 (inventario de campo), iNaturalist (identificación de especies), Maps.me (GPS offline), Google Earth (análisis temporal), Open Camera (fecha/hora en video).
            </div>
          </div>
        )}

        {/* ── TAB 2: CAPAS GEOMÁTICAS ── */}
        {tab === 2 && (
          <div>
            <p style={{ fontSize:13, color:"var(--color-text-secondary)", marginBottom:"1rem", lineHeight:1.65 }}>
              Estructura de capas complementada para construir el expediente técnico-jurídico. Ordenadas por urgencia de levantamiento. Todas las fuentes son públicas y gratuitas salvo las señaladas.
            </p>
            {CAPAS.map(c => {
              const [bg, tx] = urgColor[c.urgencia] || urgColor["Media"];
              return (
                <div key={c.id} style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:8, padding:"0.7rem 1rem", marginBottom:"0.5rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)", flex:1, paddingRight:8 }}>{c.capa}</div>
                    <span style={{ background:bg, color:tx, borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:500, whiteSpace:"nowrap" }}>{c.urgencia}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"60px 1fr", gap:"2px 8px", fontSize:11, color:"var(--color-text-secondary)" }}>
                    <span style={{ fontWeight:500 }}>Fuente</span><span>{c.fuente}</span>
                    <span style={{ fontWeight:500 }}>Formato</span><span>{c.formato}</span>
                    <span style={{ fontWeight:500 }}>Prueba</span><span style={{ color:"var(--color-text-primary)" }}>{c.prueba}</span>
                  </div>
                </div>
              );
            })}
            <div style={{ background:"#1b4332", color:"#d8f3dc", borderRadius:8, padding:"0.75rem 1rem", fontSize:11.5, lineHeight:1.8, marginTop:4 }}>
              <strong style={{ color:"#74c69d" }}>Herramientas SIG gratuitas:</strong> QGIS (escritorio), Google Earth Pro (temporal), EarthExplorer USGS (Landsat), INEGI Geoportal (ortofotos), Copernicus Open Hub (Sentinel-2), Planet Explorer (resolución media), OpenStreetMap/JOSM, i-Tree Eco, iNaturalist, ODK Collect, Epicollect5.
            </div>
          </div>
        )}

        {/* ── TAB 3: MARCO LEGAL ── */}
        {tab === 3 && (
          <div>
            <p style={{ fontSize:13, color:"var(--color-text-secondary)", marginBottom:"1rem", lineHeight:1.65 }}>
              Fundamentos jurídicos aplicables. Cada referencia habilita una acción ciudadana concreta y específica para proteger el arbolado urbano de Pachuca.
            </p>
            {LEGAL.map((l, i) => (
              <div key={i} style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderLeft:"3px solid #2d6a4f", borderRadius:8, padding:"0.7rem 1rem", marginBottom:"0.5rem" }}>
                <div style={{ fontSize:13, fontWeight:500, color:"#1b4332", marginBottom:3 }}>{l.ref}</div>
                <div style={{ fontSize:12, color:"var(--color-text-primary)", marginBottom:4, lineHeight:1.55 }}>{l.desc}</div>
                <div style={{ fontSize:11, color:"#2d6a4f", fontStyle:"italic" }}>→ {l.uso}</div>
              </div>
            ))}
            <div style={{ background:"#1b4332", color:"#d8f3dc", borderRadius:8, padding:"0.8rem 1rem", fontSize:11.5, lineHeight:1.9, marginTop:4 }}>
              <strong style={{ color:"#74c69d" }}>Contactos clave para denuncia:</strong><br />
              PROFEPA (24 hrs): <strong>800-PROFEPA (800-776-3372)</strong><br />
              SEMARNATH Hidalgo: (771) 713-8505 · CNDH: 800-715-2000<br />
              CEDH Hidalgo: (771) 713-0333 · INFOMEX/PNT: plataformanacionaldetransparencia.org.mx
            </div>
          </div>
        )}

        {/* ── TAB 4: GENERA DOCUMENTOS ── */}
        {tab === 4 && (
          <div>
            <p style={{ fontSize:13, color:"var(--color-text-secondary)", marginBottom:"1.1rem", lineHeight:1.65 }}>
              Genera documentos jurídicos personalizados con inteligencia artificial. Revisa siempre el texto antes de presentarlo. Para recursos legales formales (amparo, denuncias penales), consulta a un abogado ambientalista titulado.
            </p>
            <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"1rem 1.1rem", marginBottom:"1rem" }}>
              <div style={{ marginBottom:"0.7rem" }}>
                <label style={{ fontSize:11.5, fontWeight:500, color:"var(--color-text-secondary)", display:"block", marginBottom:4 }}>Tipo de documento</label>
                <select value={docType} onChange={e => setDocType(e.target.value)} style={{ width:"100%", fontSize:13 }}>
                  {DOC_TYPES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:"0.7rem" }}>
                <label style={{ fontSize:11.5, fontWeight:500, color:"var(--color-text-secondary)", display:"block", marginBottom:4 }}>Solicitud de derribo que afecta tu zona</label>
                <select value={solIdx} onChange={e => setSolIdx(Number(e.target.value))} style={{ width:"100%", fontSize:13 }}>
                  {SOLICITUDES.map((s,i) => <option key={i} value={i}>Solicitud {s.id} – {s.ubicacion} ({s.total} ej.)</option>)}
                </select>
              </div>
              <div style={{ marginBottom:"0.7rem" }}>
                <label style={{ fontSize:11.5, fontWeight:500, color:"var(--color-text-secondary)", display:"block", marginBottom:4 }}>Tu nombre completo (opcional)</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del promovente o colectivo" style={{ width:"100%", fontSize:13, boxSizing:"border-box" }} />
              </div>
              <div style={{ marginBottom:"1rem" }}>
                <label style={{ fontSize:11.5, fontWeight:500, color:"var(--color-text-secondary)", display:"block", marginBottom:4 }}>Detalles adicionales del caso (opcional pero recomendado)</label>
                <textarea value={detalles} onChange={e => setDetalles(e.target.value)} placeholder="Describe lo que observaste, irregularidades, fechas, maquinaria presente, aviso de obra, fauna avistada, etc." rows={3} style={{ width:"100%", fontSize:13, resize:"vertical", boxSizing:"border-box", fontFamily:"Georgia, serif" }} />
              </div>
              <button onClick={generateDoc} disabled={loading} style={{
                width:"100%", padding:"0.7rem", background: loading ? "#52b788" : "#1b4332",
                color:"#d8f3dc", border:"none", borderRadius:8, fontSize:14, fontWeight:400,
                cursor: loading ? "not-allowed" : "pointer", transition:"background 0.2s", fontFamily:"Georgia, serif"
              }}>
                {loading ? "Generando documento ..." : "Generar documento →"}
              </button>
            </div>

            {generated && (
              <div style={{ background:"var(--color-background-primary)", border:"1.5px solid #2d6a4f", borderRadius:12, padding:"1.1rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                  <div style={{ fontSize:11.5, fontWeight:500, color:"#1b4332" }}>Documento generado — revisa y adapta antes de usar</div>
                  <button onClick={copyText} style={{
                    background: copied ? "#2d6a4f" : "var(--color-background-secondary)",
                    color: copied ? "#d8f3dc" : "var(--color-text-primary)",
                    border:"0.5px solid var(--color-border-secondary)", borderRadius:6,
                    padding:"4px 12px", fontSize:11, cursor:"pointer", fontFamily:"Georgia, serif"
                  }}>
                    <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" /> {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <pre style={{ fontSize:12, lineHeight:1.75, color:"var(--color-text-primary)", whiteSpace:"pre-wrap", fontFamily:"Georgia, serif", margin:0 }}>{generated}</pre>
                <div style={{ marginTop:"0.75rem", padding:"0.5rem 0.75rem", background:"#fef3c7", borderRadius:6, fontSize:11, color:"#92400e", lineHeight:1.5 }}>
                  Documento generado como herramienta de apoyo ciudadano. Para recursos legales formales (amparo, denuncia penal), consulta a una abogada o abogado ambiental titulado.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: ACCIÓN CIUDADANA ── */}
        {tab === 5 && (
          <div>
            <p
             style={{ fontSize:13, color:"var(--color-text-secondary)", marginBottom:"1.1rem", lineHeight:1.65 }}>
              Pasos concretos que cualquier vecina, vecino o pachuqueño puede tomar hoy mismo para defender el arbolado urbano. No se necesitan conocimientos técnicos previos para empezar.
            </p>
            {[
              { title:"Documenta ahora mismo", icon:"ti-camera",
                items:["Descarga ODK Collect o Epicollect5 para levantar datos GPS de cada árbol en riesgo","Instala iNaturalist y fotografía los árboles: la app identifica especie automáticamente","Guarda Google Street View histórico de las zonas antes de que ocurra el derribo","Coordenadas de inicio: 20.0535°N, 98.7785°O (Blvd. Felipe Ángeles / frente al SGM)"]},
              { title:"Solicita información pública", icon:"ti-file-search",
                items:["Ingresa a plataformanacionaldetransparencia.org.mx y crea una cuenta gratuita","Usa la pestaña 'Genera Documentos' para generar tu solicitud INFOMEX en segundos","El Ayuntamiento tiene 20 días hábiles para responder con permisos y dictámenes","Si no responden o responden con evasivas, interpone recurso de revisión en la misma plataforma"]},
              { title:"Denuncia formalmente", icon:"ti-alert-triangle",
                items:["PROFEPA (las 24 horas): 800-776-3372 — denuncia por daño ambiental en proceso","SEMARNATH Hidalgo: (771) 713-8505 — solicita inspección técnica urgente","CNDH: 800-715-2000 — queja por violación al derecho a un medio ambiente sano","CEDH Hidalgo: (771) 713-0333 — queja ante la Comisión Estatal de Derechos Humanos"]},
              { title:"Difunde con evidencia geolocalizada", icon:"ti-share",
                items:["Publica con hashtags: #ArbolesPachuca #ExpedienteVerde #ArboladoHidalgo","Incluye siempre las coordenadas GPS exactas y la fecha/hora en cada publicación","Contacta medios locales: El Sol de Hidalgo, AM Hidalgo, Quadratín Hidalgo, Milenio Hidalgo","Organiza recorridos ciudadanos de documentación colectiva en grupo — la fuerza está en el número"]},
              { title:"Alternativa al dron (zona restringida SGM)", icon:"ti-satellite",
                items:["Solicita permiso de vuelo urgente por causa ambiental ante la AFAC (afac.gob.mx)","Usa imágenes satelitales gratuitas: Copernicus Open Hub (Sentinel-2, 10m de resolución)","Google Earth Pro permite comparar imágenes históricas de 2005 a la fecha","Levantamiento fotográfico sistemático desde nivel de calle con puntos de control GPS manuales"]},
            ].map((section, si) => (
              <div key={si} style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:10, padding:"0.85rem 1rem", marginBottom:"0.75rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <i className={`ti ${section.icon}`} style={{ fontSize:18, color:"#2d6a4f" }} aria-hidden="true" />
                  <div style={{ fontSize:13.5, fontWeight:500, color:"var(--color-text-primary)" }}>{section.title}</div>
                </div>
                {section.items.map((item, ii) => (
                  <div key={ii} style={{ display:"flex", gap:8, padding:"0.3rem 0", borderTop: ii > 0 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                    <i className="ti ti-arrow-right" style={{ fontSize:13, color:"#40916c", marginTop:3, flexShrink:0 }} aria-hidden="true" />
                    <span style={{ fontSize:12.5, lineHeight:1.55, color:"var(--color-text-primary)" }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ background:"#1b4332", color:"#d8f3dc", borderRadius:10, padding:"1rem 1.1rem", fontSize:12, lineHeight:1.85 }}>
              <div style={{ color:"#74c69d", fontWeight:500, marginBottom:4 }}>Cada árbol urbano maduro en Pachuca representa décadas de trabajo ecológico irreversible.</div>
              La evidencia geomática ciudadana es legalmente válida, técnicamente robusta y moralmente necesaria. La brecha de ignorancia se cierra con datos, empatía y acción colectiva. Los seres vivos que no pueden defenderse solos merecen que quienes sí pueden, lo hagan.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}