import React, { useEffect, useRef, useState } from "react";
import Section from "../component/common/Section.jsx";

export default function Notifications() {
  const [status, setStatus] = useState<{ text: string; color: string }>({ text: "Connexion au serveur...", color: "#6c757d" });
  const [notifs, setNotifs] = useState<Array<{ id: string; message: string; commandeId?: string; at: number }>>([]);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const ensureSocketIo = async (): Promise<any> => {
      if ((window as any).io) return (window as any).io;
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.socket.io/4.5.4/socket.io.min.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Socket.IO CDN load failed"));
        document.head.appendChild(s);
      });
      return (window as any).io;
    };

    (async () => {
      try {
        const io = await ensureSocketIo();
        if (cancelled) return;
        const base = "http://172.20.36.251:4000";
        const socket = (window as any).__app_socket || io(base, {
          transports: ["websocket", "polling"],
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
        });
        (window as any).__app_socket = socket;
        socketRef.current = socket;

        const onConnect = () => {
          if (cancelled) return;
          setStatus({ text: "✅ Connecté au serveur WebSocket", color: "#2ecc71" });
          console.log("[WS] connected", { id: socket.id, base });
        };

        const onDisconnect = () => {
          if (cancelled) return;
          setStatus({ text: "❌ Déconnecté du serveur", color: "#e74c3c" });
          console.warn("[WS] disconnected");
        };

        const onConnectError = (err: any) => {
          if (cancelled) return;
          setStatus({ text: "❌ Erreur de connexion WebSocket", color: "#e74c3c" });
          console.error("[WS] connect_error", err);
        };

        const onError = (err: any) => { console.error("[WS] error", err); };

        const onReconnectAttempt = (n: number) => console.log("[WS] reconnect_attempt", n);
        const onReconnectFailed = () => console.error("[WS] reconnect_failed");

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onConnectError);
        socket.on("error", onError);
        socket.io.on("reconnect_attempt", onReconnectAttempt);
        socket.io.on("reconnect_failed", onReconnectFailed);

        const onNouvelle = (data: any) => {
          if (cancelled) return;
          const n = {
            id: (data?.commande?._id || Math.random().toString(36).slice(2)) as string,
            message: String(data?.message || "Nouvelle commande"),
            commandeId: data?.commande?._id,
            at: Date.now(),
          };
          setNotifs((prev) => [n, ...prev].slice(0, 50));
          console.log("[WS] nouvelle_commande", data);
          try { window.dispatchEvent(new Event('notif:new')); } catch {}
        };
        socket.on("nouvelle_commande", onNouvelle);
      } catch (_) {
        if (!cancelled) setStatus({ text: "❌ Impossible de se connecter", color: "#e74c3c" });
      }
    })();

    return () => {
      cancelled = true;
      try {
        const s: any = socketRef.current;
        if (s) {
          s.off("connect");
          s.off("disconnect");
          s.off("connect_error");
          s.off("error");
          s.off("nouvelle_commande");
          if (s.io && s.io.off) {
            s.io.off("reconnect_attempt");
            s.io.off("reconnect_failed");
          }
        }
      } catch {}
    };
  }, []);

  useEffect(() => {
    // Mark notifications as seen when this page opens
    try { window.dispatchEvent(new Event('notif:seen')); } catch {}
  }, []);

  return (
    <Section title="Notifications" style={{ background: "linear-gradient(180deg, #A00000 0%, #000000 100%)" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="badge rounded-pill" style={{ background: status.color }}>{status.text}</div>
        <small className="text-white-50">Total: {notifs.length}</small>
      </div>

      <div className="d-flex flex-column" style={{ gap: 10 }}>
        {notifs.length === 0 && (
          <div className="text-white-50 text-center py-4">Aucune notification pour le moment</div>
        )}
        {notifs.map((n) => (
          <div key={n.id + ":" + n.at} className="p-3 rounded-3 bg-dark border-start border-4" style={{ borderColor: "#6b9bd1" }}>
            <div className="d-flex justify-content-between align-items-center">
              <strong>{n.message}</strong>
              <small className="text-white-50">{new Date(n.at).toLocaleTimeString()}</small>
            </div>
            {n.commandeId && (
              <div className="mt-1 small text-white-50">Commande ID : {n.commandeId}</div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
