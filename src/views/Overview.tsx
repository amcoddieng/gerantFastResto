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
  const [kpis, setKpis] = React.useState<{ revenuJour: number; commandesJour: number; depensesMoy: number; revenusMoy: number }>({ revenuJour: 0, commandesJour: 0, depensesMoy: 0, revenusMoy: 0 });
  const [weekly, setWeekly] = React.useState<Array<{ label: string; count: number }>>([]);
  const [topPlats, setTopPlats] = React.useState<any[]>([]);
  const [periodeBar, setPeriodeBar] = React.useState<'hebdo' | 'mensuel'>('hebdo');
  const [periodeDonut, setPeriodeDonut] = React.useState<'mensuel' | 'hebdo'>('mensuel');
  const donutRef = React.useRef<HTMLCanvasElement | null>(null);
  const barRef = React.useRef<HTMLCanvasElement | null>(null);
  const donutChartRef = React.useRef<any>(null);
  const barChartRef = React.useRef<any>(null);
  const [allCmd, setAllCmd] = React.useState<any[]>([]);
  const [details, setDetails] = React.useState<{ total:number; enCours:number; revenuTotal:number }>({ total: 0, enCours: 0, revenuTotal: 0 });

  // Helpers to compute periods
  const getPeriodBounds = React.useCallback((kind: 'hebdo'|'mensuel') => {
    const now = new Date();
    if (kind === 'hebdo') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0,0,0,0);
      const end = new Date(now);
      end.setHours(23,59,59,999);
      return { start, end };
    }
    // mensuel
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth()+1, 0, 23, 59, 59, 999);
    return { start, end };
  }, []);

  // Backend fields adapters
  const norm = (s: any) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const getDate = (c: any) => new Date(c?.createdAt ?? c?.date ?? c?.created_at ?? 0);
  const getStatus = (c: any) => norm(c?.statut ?? c?.status ?? c?.state ?? '');
  const getAmount = (c: any) => Number(c?.montantTotal ?? c?.total ?? c?.amount ?? 0);
  const getLines = (c: any) => (c?.plats ?? c?.items ?? c?.lines ?? []);
  const getLinePlatId = (p: any) => {
    let raw = p?.platId ?? p?.itemId ?? p?.productId ?? p?.id ?? p?.plat?._id ?? '';
    if (raw && typeof raw === 'object' && ('$oid' in raw)) return raw.$oid;
    return raw;
  };
  const getLineQty = (p: any) => Number(p?.quantite ?? p?.quantity ?? p?.qty ?? 0);
  const getPlatId = (p: any) => {
    const raw = p?._id ?? p?.id ?? p?.platId ?? '';
    if (raw && typeof raw === 'object' && ('$oid' in raw)) return raw.$oid;
    return raw;
  };
  const getPlatName = (p: any) => (p?.nom ?? p?.name ?? p?.title ?? '');
  const deepFirstString = (obj: any): string | undefined => {
    if (obj == null) return undefined;
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    if (Array.isArray(obj)) {
      for (const it of obj) { const s = deepFirstString(it); if (s) return s; }
      return undefined;
    }
    if (typeof obj === 'object') {
      const pref = ['fr','en','name','nom','title','label'];
      for (const k of pref) { if (k in obj) { const s = deepFirstString(obj[k]); if (s) return s; } }
      for (const v of Object.values(obj)) { const s = deepFirstString(v); if (s) return s; }
    }
    return undefined;
  };
  const getPlatDisplayName = (p: any) => {
    const n = getPlatName(p);
    const s = deepFirstString(n);
    return String(s || '');
  };
  const apiBase = String((import.meta as any).env.VITE_url_api || '').replace(/\/api.*/i, '');
  const getPlatImageUrl = (p: any) => {
    let img: any = p?.image ?? p?.photo ?? p?.images ?? p?.photos ?? '';
    if (Array.isArray(img)) img = img[0] || '';
    if (img && typeof img === 'object') img = img.url || img.src || deepFirstString(img) || '';
    img = String(img || '');
    if (!img) return '';
    if (/^https?:/i.test(img)) return img;
    return `${apiBase}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const loadDashboard = React.useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

      const results = await Promise.allSettled([
        listCommandesGerant({ limit: 20 } as any),
        listPlats({ disponible: true, limit: 20 } as any),
        listCategories({ active: true, limit: 20 } as any),
        listTables({} as any),
        listCommandesGerant({ limit: 20 } as any),
        listCommandesGerant({ limit: 20 } as any),
      ]);

      const [rCmd, rPlats, rCats, rTables, rToday, rAllLivree] = results;

      const commandes = rCmd.status === "fulfilled"
        ? (Array.isArray((rCmd as any).value) ? (rCmd as any).value.length : (Array.isArray((rCmd as any).value?.data) ? (rCmd as any).value.data.length : ((rCmd as any).value?.total || (rCmd as any).value?.count || (rCmd as any).value?.length || 0)))
        : undefined;
      const plats = rPlats.status === "fulfilled"
        ? (Array.isArray((rPlats as any).value) ? (rPlats as any).value.length : (Array.isArray((rPlats as any).value?.data) ? (rPlats as any).value.data.length : ((rPlats as any).value?.total || (rPlats as any).value?.count || (rPlats as any).value?.length || 0)))
        : undefined;
      const categories = rCats.status === "fulfilled"
        ? (Array.isArray((rCats as any).value) ? (rCats as any).value.length : (Array.isArray((rCats as any).value?.data) ? (rCats as any).value.data.length : ((rCats as any).value?.total || (rCats as any).value?.count || (rCats as any).value?.length || 0)))
        : undefined;
      const tables = rTables.status === "fulfilled"
        ? (Array.isArray((rTables as any).value) ? (rTables as any).value.length : (Array.isArray((rTables as any).value?.data) ? (rTables as any).value.data.length : ((rTables as any).value?.total || (rTables as any).value?.count || (rTables as any).value?.length || 0)))
        : undefined;

      setStats({ commandes, plats, categories, tables });

      const accepted = new Set(["livree", "livre", "livrer", "delivre", "delivree", "delivered","livrée"]);
      const sourceToday = rToday.status === "fulfilled" ? (rToday.value?.items || rToday.value?.data || rToday.value || []) : [];
      let items = sourceToday as any[];
      if (!items || items.length === 0) {
        // Fallback: aggregate across all delivered commands if none today
        items = rAllLivree.status === "fulfilled" ? ((rAllLivree as any).value?.items || (rAllLivree as any).value?.data || (rAllLivree as any).value || []) : [];
      }
      if (items && items.length > 0) {
        const platsDataRaw = rPlats.status === "fulfilled" ? ((rPlats as any).value?.items || (rPlats as any).value?.data || (rPlats as any).value || []) : [];
        const platsData: any[] = Array.isArray(platsDataRaw) ? platsDataRaw : [];
        const nameMap: Record<string, string> = {};
        (platsData as any[]).forEach((p: any) => {
          const id = String(getPlatId(p));
          if (id) nameMap[id] = getPlatDisplayName(p) || id;
        });
        const map: Record<string, number> = {};
        items.forEach((cmd: any) => {
          const status = getStatus(cmd);
          if (!accepted.has(status)) return;
          getLines(cmd).forEach((p: any) => {
            const id = String(getLinePlatId(p));
            if (!id) return;
            const q = getLineQty(p);
            map[id] = (map[id] || 0) + q;
          });
        });
        const arr = Object.entries(map)
          .map(([platId, quantite]) => ({ platId, label: nameMap[platId] || platId, quantite }))
          .sort((a, b) => b.quantite - a.quantite)
          .slice(0, 8);
        setVentesJour(arr);
        try {
          console.groupCollapsed('[DBG] top plats (aggregés)');
          console.table(arr);
          console.groupEnd();
        } catch {}
        // Top plats = plus commandés (commandes livrées)
        const topDetailed = arr
          .map(a => {
            const full = (platsData as any[]).find((p: any) => String(getPlatId(p)) === String(a.platId)) || {};
            return { ...full, _id: a.platId, nom: a.label, quantite: a.quantite };
          });
        setTopPlats(topDetailed);
        try {
          console.groupCollapsed('[DBG] topPlats detailed');
          console.table((topDetailed || []).map((p:any)=>({ id: p._id || getPlatId(p), nom: getPlatDisplayName(p), image: getPlatImageUrl(p), qte: p.quantite })));
          console.groupEnd();
        } catch {}
      } else {
        setVentesJour([]);
        const platsDataRaw = rPlats.status === "fulfilled" ? ((rPlats as any).value?.items || (rPlats as any).value?.data || (rPlats as any).value || []) : [];
        const platsData: any[] = Array.isArray(platsDataRaw) ? platsDataRaw : [];
        const fallback = platsData.slice(0, 8).map((p:any)=> ({ ...p, nom: getPlatDisplayName(p), quantite: 0 }));
        setTopPlats(fallback);
        try {
          console.groupCollapsed('[DBG] topPlats fallback');
          console.table((fallback || []).map((p:any)=>({ id: p._id || getPlatId(p), nom: getPlatDisplayName(p), image: getPlatImageUrl(p), qte: p.quantite })));
          console.groupEnd();
        } catch {}
      }

      // KPI calculations (fallbacks will be recomputed from allCmd useEffect)
      try {
        const allToday = rToday.status === "fulfilled" ? (rToday.value?.items || rToday.value?.data || rToday.value || []) : [];
        const revenuJour = (allToday as any[]).reduce((sum: number, c: any) => sum + (Number(c?.montantTotal)||0), 0);
        const commandesJour = (allToday as any[]).length;
        const allDelivered = rAllLivree.status === "fulfilled" ? (((rAllLivree as any).value?.items || (rAllLivree as any).value?.data || (rAllLivree as any).value) as any[]) : [];
        const totalRev = (allDelivered || []).reduce((s: number, c: any) => s + (Number(c?.montantTotal)||0), 0);
        const jours = Math.max(1, Math.ceil(((allDelivered || []).length)/Math.max(1, (stats?.commandes||0))));
        const revenusMoy = jours ? Math.round(totalRev / jours) : 0;
        const depensesMoy = Math.round(revenusMoy * 0.58);
        setKpis({ revenuJour, commandesJour, depensesMoy, revenusMoy });
      try {
        console.groupCollapsed('[DBG] KPI calculés (jour)');
        console.log({ revenuJour, commandesJour, depensesMoy, revenusMoy });
        console.groupEnd();
      } catch {}
      } catch {}

      // Weekly bar chart (last 7 days) default
      try {
        const now = new Date();
        const days: Array<{ label: string; count: number }> = [];
        const srcRaw = rCmd.status === "fulfilled" ? ((rCmd as any).value?.items || (rCmd as any).value?.data || (rCmd as any).value || []) : [];
        const src: any[] = Array.isArray(srcRaw) ? srcRaw : [];
        setAllCmd(src);
        try {
          console.groupCollapsed('[DBG] commandes chargées');
          console.log('count:', src.length);
          console.table((src.slice(0,5) || []).map((c:any)=>({
            date: getDate(c)?.toISOString?.() || null,
            statut: getStatus(c),
            montant: getAmount(c)
          })));
          console.groupEnd();
        } catch {}
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const dayKey = d.toISOString().slice(0,10);
          const label = d.toLocaleDateString(undefined, { weekday: 'short' });
          const count = (src as any[]).filter((c: any) => String((getDate(c) as any).toISOString?.() ?? '').startsWith(dayKey)).length;
          days.push({ label, count });
        }
        setWeekly(days);
      } catch {}
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

  // Recompute KPIs (jour) and Details (period) from DB commands
  React.useEffect(() => {
    try {
      const src = Array.isArray(allCmd) ? allCmd : [];
      const now = new Date();
      const start0 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0,0);
      const end0 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23,59,59,999);
      const accepted = new Set(["livree","livre","livrer","delivre","delivree","delivered","livrée","termine","terminee","completed","complete","cloture","closed","done"]);
      const todayDelivered = src.filter((c:any) => {
        const d = getDate(c);
        if (!isFinite(d.getTime()) || d < start0 || d > end0) return false;
        const s = getStatus(c);
        return accepted.has(s) || s.includes('livr') || s.includes('termin') || s.includes('clos');
      });
      const revenuJour = todayDelivered.reduce((s:number, c:any)=> s + getAmount(c), 0);
      const commandesJour = todayDelivered.length;
      // revenusMoy/depensesMoy approximés sur les 30 derniers jours
      const last30 = src.filter((c:any)=> { const d=getDate(c); return isFinite(d.getTime()) && (now.getTime()-d.getTime()) <= 30*24*60*60*1000; });
      const totalRev30 = last30.reduce((s:number,c:any)=> s + getAmount(c), 0);
      const revenusMoy = Math.round(totalRev30 / Math.max(1, new Date(now.getFullYear(), now.getMonth()+1,0).getDate()));
      const depensesMoy = Math.round(revenusMoy * 0.58);
      setKpis({ revenuJour, commandesJour, depensesMoy, revenusMoy });

      // Details panel numbers for selected donut period
      const { start, end } = getPeriodBounds(periodeDonut);
      const inPeriod = src.filter((c:any)=> { const d=getDate(c); return isFinite(d.getTime()) && d>=start && d<=end; });
      const total = inPeriod.length;
      const enCours = inPeriod.filter((c:any)=> {
        const s = String(c?.statut??c?.status??'').toLowerCase();
        const x = s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        return x.includes('prepa') || x.includes('attent') || x.includes('valid');
      }).length;
      const revenuTotal = inPeriod.reduce((s:number,c:any)=> s + getAmount(c), 0);
      setDetails({ total, enCours, revenuTotal });
      try {
        console.groupCollapsed('[DBG] Détails période');
        console.log({ periode: periodeDonut, total, enCours, revenuTotal });
        console.groupEnd();
      } catch {}
    } catch {}
  }, [allCmd, periodeDonut, getPeriodBounds]);

  

  // Render/Update Donut chart (répartition par statut)
  React.useEffect(() => {
    try {
      const Chart: any = (window as any).Chart;
      if (!Chart || !donutRef.current) return;
      const { start, end } = getPeriodBounds(periodeDonut);
      const src = Array.isArray(allCmd) ? allCmd : [];
      const inPeriod = src.filter(c => {
        const d = new Date(c?.createdAt || c?.date || 0);
        return d >= start && d <= end;
      });
      const map: Record<string, number> = {};
      inPeriod.forEach((c: any) => {
        const raw = String(c?.statut ?? c?.status ?? '').toLowerCase();
        const key = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        map[key] = (map[key] || 0) + 1;
      });
      const buckets: Array<{label:string, value:number, color:string}> = [
        { label:'Livrées', value: 0, color: '#E94040' },
        { label:'En préparation', value: 0, color: '#ef9a9a' },
        { label:'Validées', value: 0, color: '#ffb3b3' },
        { label:'En attente', value: 0, color: '#7f7f7f' },
        { label:'Invalidées', value: 0, color: '#444' },
      ];
      Object.entries(map).forEach(([k,v]) => {
        if (k.includes('livr')) buckets[0].value += v as number;
        else if (k.includes('prepa')) buckets[1].value += v as number;
        else if (k.includes('valid')) buckets[2].value += v as number;
        else if (k.includes('attent')) buckets[3].value += v as number;
        else buckets[4].value += v as number;
      });
      const data = {
        labels: buckets.map(b=>b.label),
        datasets: [{ data: buckets.map(b=>b.value), backgroundColor: buckets.map(b=>b.color), borderWidth: 0 }]
      };
      const centerTextPlugin = {
        id: 'centerText',
        beforeDraw: (chart: any) => {
          const {width, height, ctx} = chart;
          ctx.save();
          const txt = '100%';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'bold 24px system-ui, -apple-system, Segoe UI, Roboto';
          ctx.fillText(txt, width / 2, height / 2);
          ctx.restore();
        }
      } as any;
      const options = {
        cutout: '70%',
        elements: { arc: { borderWidth: 0 } },
        plugins: { legend: { display: false } }
      } as any;
      if (donutChartRef.current) {
        donutChartRef.current.data = data;
        donutChartRef.current.options = options;
        donutChartRef.current.update();
      } else {
        donutChartRef.current = new Chart(donutRef.current.getContext('2d'), { type: 'doughnut', data, options, plugins: [centerTextPlugin] });
      }
    } catch {}
    return () => {};
  }, [allCmd, periodeDonut, getPeriodBounds]);

  // Render/Update Bar chart (hebdomadaire ou mensuel)
  React.useEffect(() => {
    try {
      const Chart: any = (window as any).Chart;
      if (!Chart || !barRef.current) return;
      let labels: string[] = [];
      let values: number[] = [];
      if (periodeBar === 'hebdo') {
        const w = Array.isArray(weekly) ? weekly : [];
        labels = w.map(x=>x.label);
        values = w.map(x=>x.count);
      } else {
        // mensuel: compter par semaine du mois courant
        const { start, end } = getPeriodBounds('mensuel');
        const src = Array.isArray(allCmd) ? allCmd : [];
        // index de semaine (0..4/5)
        const counts: number[] = [0,0,0,0,0,0];
        src.forEach((c:any) => {
          const d = new Date(c?.createdAt || c?.date || 0);
          if (d < start || d > end) return;
          const day = d.getDate();
          const idx = Math.min(5, Math.floor((day-1)/7));
          counts[idx] += 1;
        });
        const weeks = ['S1','S2','S3','S4','S5','S6'];
        // supprimer les dernières semaines vides à la fin
        let lastIdx = counts.length-1; while(lastIdx>3 && counts[lastIdx]===0) lastIdx--;
        labels = weeks.slice(0, lastIdx+1);
        values = counts.slice(0, lastIdx+1);
      }
      const data = { labels, datasets: [{ data: values, backgroundColor: labels.map((_,i)=> i===values.indexOf(Math.max(...values)) ? '#E94040' : '#2b2b2b'), borderWidth: 0, borderRadius: 6 }] } as any;
      const options = { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#bbb' } }, y: { ticks: { color: '#bbb' } } } } as any;
      if (barChartRef.current) {
        barChartRef.current.data = data;
        barChartRef.current.update();
      } else {
        barChartRef.current = new Chart(barRef.current.getContext('2d'), { type: 'bar', data, options });
      }
    } catch {}
    return () => {};
  }, [weekly, periodeBar, allCmd, getPeriodBounds]);

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
      <Section title="Vue d’ensemble" style={{ background: "linear-gradient(180deg, #A00000 0%, #000000 100%)" }}>
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card rounded-4 p-3 shadow border-0" style={{ background: '#E94040' }}>
              <div className="text-white-50" style={{ fontSize: 13 }}>Revenus du jour</div>
              <div className="fw-bold" style={{ fontSize: 24 }}>
                {loading ? '...' : ` ${kpis.revenuJour.toLocaleString()} CFA`}
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card rounded-4 p-3 shadow border-0" style={{ background: '#ff8080' }}>
              <div className="text-dark" style={{ opacity: .85, fontSize: 13 }}>Commandes du jour</div>
              <div className="fw-bold text-dark" style={{ fontSize: 24 }}>{loading ? '...' : kpis.commandesJour}</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card rounded-4 p-3 shadow border-0" style={{ background: '#D32F2F' }}>
              <div className="text-white-50" style={{ fontSize: 13 }}>Dépenses moy.</div>
              <div className="fw-bold" style={{ fontSize: 24 }}> {loading ? '...' : ` ${kpis.depensesMoy.toLocaleString()} CFA`}</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card rounded-4 p-3 shadow border-0" style={{ background: '#ffb3b3' }}>
              <div className="text-dark" style={{ opacity: .85, fontSize: 13 }}>Revenus moy.</div>
              <div className="fw-bold text-dark" style={{ fontSize: 24 }}> {loading ? '...' : ` ${kpis.revenusMoy.toLocaleString()} CFA`}</div>
            </div>
          </div>
        </div>
        {err && <div className="text-danger mt-2">{err}</div>}
      </Section>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <Section title="Détails des ventes" style={{ background: "#111", borderRadius: 18, padding: 20 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="text-muted">{new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
              <div className="d-flex gap-2">
                <button className={`btn btn-sm ${periodeDonut==='mensuel'?'btn-dark':'btn-outline-secondary'}`} onClick={()=>setPeriodeDonut('mensuel')}>Mensuel</button>
                <button className={`btn btn-sm ${periodeDonut==='hebdo'?'btn-dark':'btn-outline-secondary'}`} onClick={()=>setPeriodeDonut('hebdo')}>Hebdomadaire</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-auto d-flex flex-column justify-content-center" style={{ minWidth: 180 }}>
                <div className="d-flex align-items-center mb-2"><span style={{display:'inline-block',width:16,height:8,background:'#E94040',borderRadius:4,marginRight:8}}></span><span className="text-light-50">Livrées</span></div>
                <div className="d-flex align-items-center mb-2"><span style={{display:'inline-block',width:16,height:8,background:'#ef9a9a',borderRadius:4,marginRight:8}}></span><span className="text-light-50">En préparation</span></div>
                <div className="d-flex align-items-center mb-2"><span style={{display:'inline-block',width:16,height:8,background:'#ffb3b3',borderRadius:4,marginRight:8}}></span><span className="text-light-50">Validées</span></div>
                <div className="d-flex align-items-center"><span style={{display:'inline-block',width:16,height:8,background:'#7f7f7f',borderRadius:4,marginRight:8}}></span><span className="text-light-50">En attente</span></div>
              </div>
              <div className="col-auto d-flex align-items-center justify-content-center" style={{ minWidth: 220 }}>
                <canvas ref={donutRef} width={200} height={200} />
              </div>
              <div className="col d-flex align-items-center">
                <ul className="list-unstyled m-0">
                  <li className="d-flex justify-content-between"><span>Total commandes</span><span>{details.total}</span></li>
                  <li className="d-flex justify-content-between"><span>Commandes en cours</span><span>{details.enCours}</span></li>
                  <li className="d-flex justify-content-between"><span>Croissance client</span><span>—</span></li>
                  <li className="d-flex justify-content-between"><span>Revenu total</span><span>{details.revenuTotal.toLocaleString()} CFA</span></li>
                </ul>
              </div>
            </div>
          </Section>
        </div>
        <div className="col-12 col-lg-6">
          <Section title="Graphique des commandes" style={{ background: "#111", borderRadius: 18, padding: 20 }}>
            <div className="d-flex justify-content-end mb-2 gap-2">
              <button className={`btn btn-sm ${periodeBar==='hebdo'?'btn-dark':'btn-outline-secondary'}`} onClick={()=>setPeriodeBar('hebdo')}>Hebdomadaire</button>
              <button className={`btn btn-sm ${periodeBar==='mensuel'?'btn-dark':'btn-outline-secondary'}`} onClick={()=>setPeriodeBar('mensuel')}>Mensuel</button>
            </div>
            <div className="position-relative" style={{ height: 260 }}>
              <canvas ref={barRef} height={240} />
            </div>
          </Section>
        </div>
      </div>

      <Section title="Commandes tendances" style={{ background: "linear-gradient(180deg, #A00000 0%, #000000 100%)" }}>
        <div className="position-relative">
          <div className="d-flex gap-3 overflow-auto" style={{ scrollSnapType: 'x mandatory' }}>
            {(Array.isArray(topPlats) ? topPlats : []).map((p: any) => (
              <div key={p._id} className="card shadow border-0 rounded-4 bg-dark text-white" style={{ minWidth: 300, scrollSnapAlign: 'start' }}>
                <div className="position-relative" style={{ height: 160 }}>
                  {getPlatImageUrl(p) ? (
                    <img src={getPlatImageUrl(p)} alt={getPlatDisplayName(p)} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="w-100 h-100 bg-secondary" />
                  )}
                </div>
                <div className="p-3 d-flex justify-content-between align-items-center">
                  <div className="text-truncate" style={{ maxWidth: 200 }}>{getPlatDisplayName(p) || '—'}</div>
                  <div className="text-white-50">x{Number(p.quantite||0)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
