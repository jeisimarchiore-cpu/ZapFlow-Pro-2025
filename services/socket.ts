
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001"; 

class SocketService {
  public socket: Socket | null = null;
  private listeners: {[key: string]: Function[]} = {};

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 5000,
    });

    this.socket.on("connect", () => {
      this.emitInternal("status", "connected");
    });

    this.socket.on("qr", (qr: string) => {
      this.emitInternal("qr", qr);
    });

    this.socket.on("ready", (info: any) => {
      this.emitInternal("ready", info);
    });

    this.socket.on("message", (msg: any) => {
      this.emitInternal("message", msg);
    });

    this.socket.on("disconnect", () => {
      this.emitInternal("status", "disconnected");
    });

    this.socket.on("connect_error", (err) => {
      console.error("Erro de conexão socket:", err);
      this.emitInternal("error", err);
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  private emitInternal(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  sendMessage(to: string, text: string) {
    if (this.socket?.connected) {
      this.socket.emit("send_message", { to, text });
    } else {
      console.warn("Socket não conectado. Mensagem não enviada.");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
