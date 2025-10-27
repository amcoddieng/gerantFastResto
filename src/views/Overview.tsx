import React from "react";
import Section from "../component/common/Section.jsx";
import { listCommandesGerant } from "../services/api_commandes.jsx";
import { listPlats } from "../services/api_plats.jsx";
import { listCategories } from "../services/api_categories.jsx";
import { listTables } from "../services/api_tables.jsx";

export default function Overview() {
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string>("");
  const [stats, setStats] = React.useState<{ commandes?: number; plats?: number; categories?: number; tables?: number }>({});
  const [ventesJour, setVentesJour] = React.useState<Array<{ platId: string; label: string; quantite: number }>>([]);

  const loadDashboard = React.useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

      const results = await Promise.allSettled([
        listCommandesGerant(undefined as any),
        listPlats({ page: 1, limit: 100 } as any),
        listCategories({ page: 1, limit: 100 } as any),
        listTables({ page: 1, limit: 100 } as any),
        listCommandesGerant({ from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10), statut: 'livrée', page: 1, limit: 100 } as any),
        listCommandesGerant({ statut: 'livrée', page: 1, limit: 100 } as any),
      ]);

      const [rCmd, rPlats, rCats, rTables, rToday, rAllLivree] = results;

      const commandes = rCmd.status === "fulfilled"
        ? (Array.isArray(rCmd.value) ? rCmd.value.length : (Array.isArray(rCmd.value?.data) ? rCmd.value.data.length : (rCmd.value?.total || rCmd.value?.count || rCmd.value?.length || 0)))
        : undefined;
      const plats = rPlats.status === "fulfilled"
        ? (Array.isArray(rPlats.value) ? rPlats.value.length : (Array.isArray(rPlats.value?.data) ? rPlats.value.data.length : (rPlats.value?.total || rPlats.value?.count || rPlats.value?.length || 0)))
        : undefined;
      const categories = rCats.status === "fulfilled"
        ? (Array.isArray(rCats.value) ? rCats.value.length : (Array.isArray(rCats.value?.data) ? rCats.value.data.length : (rCats.value?.total || rCats.value?.count || rCats.value?.length || 0)))
        : undefined;
      const tables = rTables.status === "fulfilled"
        ? (Array.isArray(rTables.value) ? rTables.value.length : (Array.isArray(rTables.value?.data) ? rTables.value.data.length : (rTables.value?.total || rTables.value?.count || rTables.value?.length || 0)))
        : undefined;

      setStats({ commandes, plats, categories, tables });

      const accepted = new Set(["livree", "livre", "livrer", "delivre", "delivree", "delivered"]);
      const sourceToday = rToday.status === "fulfilled" ? (rToday.value?.items || rToday.value?.data || rToday.value || []) : [];
      let items = sourceToday as any[];
      if (!items || items.length === 0) {
        // Fallback: aggregate across all delivered commands if none today
        items = rAllLivree.status === "fulfilled" ? ((rAllLivree as any).value?.items || (rAllLivree as any).value?.data || (rAllLivree as any).value || []) : [];
      }
      if (items && items.length > 0) {
        const platsData = rPlats.status === "fulfilled" ? (rPlats.value?.items || rPlats.value?.data || rPlats.value || []) : [];
        const nameMap: Record<string, string> = {};
        (platsData as any[]).forEach((p: any) => {
          const id = String(p?._id || p?.id || "");
          if (id) nameMap[id] = p?.nom || p?.name || id;
        });
        const map: Record<string, number> = {};
        items.forEach((cmd: any) => {
          const raw = String(cmd?.statut ?? cmd?.status ?? "").toLowerCase();
          const clean = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (!accepted.has(clean)) return;
          (cmd?.plats || []).forEach((p: any) => {
            const id = String(p.platId ?? "");
            if (!id) return;
            const q = Number(p.quantite) || 0;
            map[id] = (map[id] || 0) + q;
          });
        });
        const arr = Object.entries(map)
          .map(([platId, quantite]) => ({ platId, label: nameMap[platId] || platId, quantite }))
          .sort((a, b) => b.quantite - a.quantite)
          .slice(0, 8);
        setVentesJour(arr);
      } else {
        setVentesJour([]);
      }
    } catch (e: any) {
      setErr(String(e?.message || e || "Erreur"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => { await loadDashboard(); })();
    return () => { mounted = false; };
  }, [loadDashboard]);

  React.useEffect(() => {
    const socket: any = (window as any).__app_socket;
    if (!socket) return;
    const onNew = async () => { await loadDashboard(); };
    socket.on("nouvelle_commande", onNew);
    return () => { try { socket.off("nouvelle_commande", onNew); } catch {} };
  }, [loadDashboard]);

  const Card = ({ title, value, accent }: { title: string; value: React.ReactNode; accent: string }) => (
    <div className="card rounded-4 p-3 shadow border-2 bg-dark text-white">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="text-white-50" style={{ fontSize: 13 }}>{title}</div>
          <div className="fw-bold" style={{ fontSize: 24 }}>{value}</div>
        </div>
        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, background: accent, color: '#fff' }}>
          •
        </div>
      </div>
    </div>
  );

  return (
    <div className="d-flex flex-column gap-3">
      <Section title="Aperçu" style={{ background: "linear-gradient(180deg, #A00000 0%, #000000 100%)" }}>
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-lg-3">
            <Card title="Commandes" value={loading ? "..." : (stats.commandes ?? "-")} accent="#0ea5e9" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <Card title="Plats" value={loading ? "..." : (stats.plats ?? "-")} accent="#22c55e" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <Card title="Catégories" value={loading ? "..." : (stats.categories ?? "-")} accent="#f59e0b" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <Card title="Tables" value={loading ? "..." : (stats.tables ?? "-")} accent="#ef4444" />
          </div>
        </div>
        {err && <div className="text-danger mt-2">{err}</div>}
      </Section>

      <Section title="Ventes du jour (par plat)" style={{ background: "linear-gradient(180deg, #A00000 0%, #000000 100%)" }}>
        {loading && <div className="text-white-50">Chargement...</div>}
        {!loading && ventesJour.length === 0 && <div className="text-white-50">Aucune vente enregistrée aujourd'hui.</div>}
        {!loading && ventesJour.length > 0 && (
          <div className="d-flex flex-column gap-2">
            {ventesJour.map((v) => (
              <div key={v.platId} className="d-flex align-items-center gap-2">
                <div className="text-white-50" style={{ width: 160, fontSize: 12 }} title={v.label}>{String(v.label).slice(0, 22)}{String(v.label).length > 22 ? '…' : ''}</div>
                <div className="flex-grow-1">
                  <div className="bg-primary" style={{ height: 10, width: `${Math.max(6, (v.quantite / Math.max(1, ventesJour[0].quantite)) * 100)}%`, borderRadius: 6 }} />
                </div>
                <div className="small fw-semibold" style={{ width: 40, textAlign: 'right' }}>{v.quantite}</div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
