const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
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

  res.json({ intencion, telefono, fecha, hora, producto });
});

app.listen(3000, () => {
  console.log("Servidor en puerto 3000");
});
