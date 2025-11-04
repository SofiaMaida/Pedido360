import { createServer } from "http";

const httpServer = createServer();

let ioServer;

const main = async () => {
  let SocketClient;
  let notificacionesModule;

  try {
    ({ io: SocketClient } = await import("socket.io-client"));
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND") {
      console.error(
        "[Prueba] No se encontró 'socket.io-client'. Ejecuta `npm install` dentro de backend/ antes de correr esta prueba."
      );
      httpServer.close();
      process.exitCode = 1;
      return;
    }

    throw error;
  }

  try {
    notificacionesModule = await import("../src/utils/notificaciones.js");
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND") {
      console.error(
        "[Prueba] Falta la dependencia 'socket.io'. Ejecuta `npm install` en backend/ y vuelve a intentar."
      );
      httpServer.close();
      process.exitCode = 1;
      return;
    }

    throw error;
  }

  const { configureNotificaciones, notifyCambioEstado, EVENTO_CAMBIO_ESTADO } =
    notificacionesModule;

  ioServer = configureNotificaciones(httpServer, {
    cors: { origin: "*" },
  });

  await new Promise((resolve) => {
    httpServer.listen(0, "127.0.0.1", () => {
      const { port } = httpServer.address();
      console.log(`[Prueba] Servidor Socket.IO en http://127.0.0.1:${port}`);
      resolve(port);
    });
  }).then(async (port) => {
    const client = SocketClient(`http://127.0.0.1:${port}`);

    let timeoutId;
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      if (timeoutId) clearTimeout(timeoutId);
      client.close();
      ioServer.close(() => {
        console.log("[Prueba] Socket.IO de prueba detenido");
        httpServer.close();
      });
    };

    client.once("connect", async () => {
      console.log("[Prueba] Cliente conectado, enviando notificación de prueba...");
      await notifyCambioEstado({
        _id: "000000000000000000000002",
        estado: "listo para servir",
        mesa: { numero: 12 },
        mesero: { nombre: "Luis" },
      });
    });

    client.once(EVENTO_CAMBIO_ESTADO, (payload) => {
      console.log("[Prueba] Evento recibido en el cliente:", payload);
      cleanup();
    });

    client.once("disconnect", () => {
      console.log("[Prueba] Cliente desconectado");
    });

    timeoutId = setTimeout(() => {
      if (cleaned) return;
      console.error("[Prueba] Tiempo de espera agotado sin recibir evento");
      cleanup();
    }, 5000);
  });
};

main().catch((error) => {
  console.error("[Prueba] Error en la prueba manual de notificaciones:", error);
  httpServer.close();
  ioServer?.close?.();
  process.exitCode = 1;
});

