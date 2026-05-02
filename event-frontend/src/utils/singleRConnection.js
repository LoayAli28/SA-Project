// src/utils/signalRConnection.js
// Singleton SignalR connection — one connection for the whole app

let connection = null;
let isStarting = false;

export async function getConnection(token) {
  // Lazy import @microsoft/signalr
  const { HubConnectionBuilder, LogLevel, HttpTransportType } = await import('@microsoft/signalr');

  if (connection && connection.state === 'Connected') return connection;

  if (isStarting) {
    // Wait until connection is ready
    await new Promise(resolve => setTimeout(resolve, 500));
    return connection;
  }

  isStarting = true;

  connection = new HubConnectionBuilder()
    .withUrl('http://localhost:5197/hubs/notifications', { 
      accessTokenFactory: () => token,
      transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  try {
    await connection.start();
    console.log('[SignalR] Connected');
  } catch (err) {
    console.warn('[SignalR] Connection failed:', err.message);
    connection = null;
  } finally {
    isStarting = false;
  }

  return connection;
}

export async function stopConnection() {
  if (connection && connection.state === 'Connected') {
    await connection.stop();
    connection = null;
  }
}
