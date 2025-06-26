// Simulación de flujo del webhook inteligente 🚀

function simulaWebhook({ mensaje, psid, nombre }) {
  console.log("📩 Mensaje recibido de usuario:");
  console.log(`   🧑 Nombre: ${nombre}`);
  console.log(`   🆔 PSID: ${psid}`);
  console.log(`   💬 Mensaje: \"${mensaje}\"\n`);

  // 1. Parseo del mensaje
  console.log("🧠 Analizando mensaje...");
  // Simulación de extracción
  const telefono = "5551234567";
  const fecha = "mañana";
  const hora = "10:00 am";
  const intencion = "agendar_cita";
  const producto = "botox";
  console.log(`   📞 Teléfono: ${telefono}`);
  console.log(`   📅 Fecha: ${fecha}`);
  console.log(`   🕙 Hora: ${hora}`);
  console.log(`   🎯 Intención: ${intencion}`);
  console.log(`   💉 Producto: ${producto}\n`);

  // 2. Procesar contacto en HubSpot
  console.log("🏢 Buscando/creando contacto en HubSpot...");
  const contactoExiste = true;
  if (contactoExiste) {
    console.log("   ✅ Contacto encontrado, actualizando datos...");
  } else {
    console.log("   ➕ Contacto no existe, creando nuevo...");
  }

  // 3. Procesar deal en HubSpot
  console.log("💼 Procesando deal en HubSpot...");
  const dealAbierto = false;
  if (intencion === "cancelar") {
    if (dealAbierto) {
      console.log("   ❌ Intención cancelar: cerrando deal abierto...");
    } else {
      console.log("   ⚠️ No hay deal abierto para cerrar.");
    }
  } else if (producto) {
    if (dealAbierto) {
      console.log("   🔄 Deal abierto encontrado, actualizando info...");
    } else {
      console.log("   🆕 No hay deal abierto, creando uno nuevo...");
    }
  } else {
    console.log("   ⚠️ No se detectó producto, no se crea deal.");
  }

  // 4. Actualizar nombre del deal
  const dealName = `${producto.charAt(0).toUpperCase() + producto.slice(1)} - Consulta [${psid}]`;
  console.log(`🏷️  Nombre del deal: \"${dealName}\"\n`);

  // 5. Respuesta final
  console.log("✅ Proceso completado. Respuesta enviada al usuario.\n");
}

// Simulación de ejemplo
simulaWebhook({
  mensaje: "Hola, quiero una cita para botox mañana a las 10am. Mi teléfono es 5551234567.",
  psid: "1234567890",
  nombre: "Juan Pérez"
});
