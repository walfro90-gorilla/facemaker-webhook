export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const mensaje = (req.body.mensaje || "").toLowerCase();

  const telefono = mensaje.match(/\b\d{10}\b/)?.[0] || "";
  const fecha = mensaje.match(/\b(hoy|mañana|lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/i)?.[0] || "";
  const hora = mensaje.match(/\b(\d{1,2})(?::\d{2})?\s?(am|pm)?\b/i)?.[0] || "";

  let intencion = "";
  if (mensaje.includes("cita") || mensaje.includes("agendar")) {
    intencion = "agendar_cita";
  } else if (mensaje.includes("precio") || mensaje.includes("información") || mensaje.includes("cuánto")) {
    intencion = "pedir_informacion";
  } else if (mensaje.includes("pagar") || mensaje.includes("depósito") || mensaje.includes("apartar")) {
    intencion = "realizar_pago";
  }

  const productos = ["aumento mamario", "botox", "láser", "rinoplastia", "suero", "emerald", "cirugía", "rejuvenecimiento"];
  const producto = productos.find(p => mensaje.includes(p)) || "";

  res.status(200).json({ intencion, telefono, fecha, hora, producto });
}
