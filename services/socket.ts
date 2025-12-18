
import { io, Socket } from "socket.io-client";

// URL do seu servidor backend Node.js (Baileys/WPPConnect)
// Altere para o IP do seu servidor em produção
const SOCKET_URL = "http://localhost:3001"; 

class SocketService {
  public socket: Socket | null = null;
  private listeners: {[key: string]: Function[]} = {};

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Conectado ao servidor de Sockets");
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
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  private emitInternal(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  sendMessage(to: string, text: string) {
    if (this.socket) {
      this.socket.emit("send_message", { to, text });
    }
  }
}

export const socketService = new SocketService();
