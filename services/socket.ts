
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000"; 

class SocketService {
  public socket: Socket | null = null;
  private listeners: {[key: string]: Function[]} = {};

  connect() {
    if (this.socket?.connected) return;

    this.addLog(`Iniciando tentativa de conexão em: ${SOCKET_URL}`);
    this.emitInternal("socket_status", "connecting");

    this.socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    this.socket.on("connect", () => {
      this.addLog("✅ Conectado ao servidor Node.js (Porta 8000)");
      this.emitInternal("socket_status", "connected");
      // Solicita QR assim que o socket conecta
      this.socket?.emit("request_qr");
    });

    this.socket.on("qr_code", (qr: string) => {
      this.addLog("📸 QR Code recebido do motor.");
      this.emitInternal("qr", qr);
    });

    this.socket.on("status", (s: string) => {
      this.addLog(`📡 Status do WhatsApp: ${s}`);
      this.emitInternal("whatsapp_status", s);
    });

    this.socket.on("connection_data", (info: any) => {
      this.addLog(`👤 Autenticado como: ${info.name || 'Usuário'}`);
      this.emitInternal("ready", info);
    });

    this.socket.on("connect_error", (err) => {
      this.addLog(`❌ Erro de rede: ${err.message}. Verifique se o servidor Node está rodando.`);
      this.emitInternal("socket_status", "disconnected");
    });

    this.socket.on("disconnect", (reason) => {
      this.addLog(`⚠️ Desconectado do servidor: ${reason}`);
      this.emitInternal("socket_status", "disconnected");
    });

    this.socket.on("new_message", (data: any) => {
      this.emitInternal("message", data);
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
      fetch(`${SOCKET_URL}/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: to, message: text })
      }).catch(e => this.addLog(`Erro ao enviar mensagem: ${e.message}`));
    } else {
      this.addLog("❌ Impossível enviar: Sem conexão com o servidor.");
    }
  }

  logout() {
    this.addLog("Solicitando desconexão total...");
    fetch(`${SOCKET_URL}/api/session/clear`, { method: 'POST' })
      .catch(e => this.addLog(`Erro ao limpar sessão: ${e.message}`));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
