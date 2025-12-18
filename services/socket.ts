
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000"; 

class SocketService {
  public socket: Socket | null = null;
  private listeners: {[key: string]: Function[]} = {};

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 5000,
    });

    this.socket.on("connect", () => {
      this.addLog("Handshake estabelecido com o motor ZapFlow.");
      this.emitInternal("status", "connected");
      this.socket?.emit("request_qr");
    });

    // Mapeamento exato com o backend fornecido
    this.socket.on("qr_code", (qr: string) => {
      this.addLog("Novo QR Code recebido do servidor.");
      this.emitInternal("qr", qr);
    });

    this.socket.on("status", (s: string) => {
      this.addLog(`Status da Instância: ${s}`);
      this.emitInternal("server_status", s);
    });

    this.socket.on("connection_data", (info: any) => {
      this.addLog(`Dados da sessão sincronizados: ${info.name}`);
      this.emitInternal("ready", info);
    });

    this.socket.on("new_message", (data: any) => {
      this.emitInternal("message", data);
    });

    this.socket.on("campaign_progress_update", (progress: any) => {
      this.emitInternal("campaign_update", progress);
    });

    this.socket.on("disconnect", (reason) => {
      this.addLog(`Socket desconectado: ${reason}`);
      this.emitInternal("status", "disconnected");
    });
  }

  private addLog(message: string) {
    const log = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      message
    };
    this.emitInternal("log", log);
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
      // O backend usa POST /api/send-message ou socket emit?
      // O server.js fornecido emite 'new_message' mas não tem listener 'message' para envio
      // Vamos usar a API REST para maior confiabilidade de envio conforme o server.js
      fetch(`${SOCKET_URL}/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: to, message: text })
      });
    }
  }

  logout() {
    fetch(`${SOCKET_URL}/api/session/clear`, { method: 'POST' });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
