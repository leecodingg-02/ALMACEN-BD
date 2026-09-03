/* Servicio de gestión de soporte y tickets de ayuda */

export function enviarTicketSoporte(datos) {
  const ticketsActuales = JSON.parse(
    localStorage.getItem("almacenweb_tickets") || "[]"
  );

  const nuevoTicket = {
    id: "NC-TK-" + Math.floor(100000 + Math.random() * 900000),
    fecha: new Date().toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    nombre: datos.nombre,
    correo: datos.correo,
    telefono: datos.telefono || "No registrado",
    tipoSolicitud: datos.tipoSolicitud || "General",
    asunto: datos.asunto,
    mensaje: datos.mensaje,
    estado: "Abierto / En gestión",
  };

  ticketsActuales.unshift(nuevoTicket);
  localStorage.setItem("almacenweb_tickets", JSON.stringify(ticketsActuales));

  return nuevoTicket;
}

export function obtenerHistorialTickets() {
  return JSON.parse(localStorage.getItem("almacenweb_tickets") || "[]");
}
