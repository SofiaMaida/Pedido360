import EventEmitter from "events";
import { Server } from "socket.io";

export const EVENTO_CAMBIO_ESTADO = "pedido:estado:cambiado";

export const notificacionesEmitter = new EventEmitter();

let ioInstance = null;

export const configureNotificaciones = (httpServer, options = {}) => {
  if (!httpServer) {
    throw new Error("Se requiere un servidor HTTP para inicializar Socket.IO");
  }

  if (ioInstance) {
    return ioInstance;
  }

  const defaultOptions = {
    cors: {
      origin: "*",
      credentials: true,
    },
  };

  ioInstance = new Server(httpServer, {
    ...defaultOptions,
    ...options,
    cors: {
      ...defaultOptions.cors,
      ...options.cors,
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log(`[Notificaciones] Cliente Socket.IO conectado: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(
        `[Notificaciones] Cliente Socket.IO desconectado: ${socket.id} (${reason})`
      );
    });
  });

  return ioInstance;
};

export const getSocketIO = () => ioInstance;

export const notifyCambioEstado = async (pedido) => {
  if (!pedido) {
    console.warn("[Notificaciones] Pedido inválido, no se emite notificación");
    return null;
  }

  const plain =
    typeof pedido?.toObject === "function" ? pedido.toObject() : pedido;

  const payload = {
    id: plain._id?.toString?.() ?? plain.id ?? null,
    estado: plain.estado ?? null,
    mesa: plain.mesa ?? null,
    mesero: plain.mesero ?? null,
    actualizadoEn: new Date().toISOString(),
    pedido: plain,
  };

  notificacionesEmitter.emit(EVENTO_CAMBIO_ESTADO, payload);

  if (ioInstance) {
    ioInstance.emit(EVENTO_CAMBIO_ESTADO, payload);
    console.info(
      `[Notificaciones] Emitido cambio de estado vía Socket.IO para el pedido ${payload.id} -> ${payload.estado}`
    );
  } else {
    console.warn(
      "[Notificaciones] Socket.IO no inicializado; solo se notificó internamente"
    );
  }

  return payload;
};