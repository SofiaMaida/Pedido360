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
        "❌ No se encontró 'socket.io-client'. Ejecuta `npm install` dentro de backend/ antes de correr esta prueba."
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
        "❌ Falta la dependencia 'socket.io'. Ejecuta `npm install` en backend/ y vuelve a intentar."
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
      console.log(`🔌 Servidor Socket.IO de prueba en http://127.0.0.1:${port}`);
      resolve(port);
    });
  }).then(async (port) => {
    const client = SocketClient(`http://127.0.0.1:${port}`);

    const cleanup = () => {
      client.close();
      ioServer.close(() => {
        console.log("🛑 Socket.IO de prueba detenido");
        httpServer.close();
      });
    };

    client.on("connect", async () => {
      console.log("🧪 Cliente conectado, enviando notificación de prueba...");
      await notifyCambioEstado({
        _id: "000000000000000000000002",
        estado: "listo para servir",
        mesa: { numero: 12 },
        mesero: { nombre: "Luis" },
      });
    });

    client.on(EVENTO_CAMBIO_ESTADO, (payload) => {
      console.log("🎉 Evento recibido en el cliente Socket.IO:", payload);
      cleanup();
    });

    client.on("disconnect", () => {
      console.log("👋 Cliente desconectado");
    });

    setTimeout(() => {
      console.error("⚠️ Tiempo de espera agotado sin recibir evento");
      cleanup();
    }, 5000);
  });
};

main().catch((error) => {
  console.error("❌ Error en la prueba manual de notificaciones:", error);
  httpServer.close();
  ioServer?.close?.();
  process.exitCode = 1;
});