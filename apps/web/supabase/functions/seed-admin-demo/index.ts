import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRM_NAMES = [
  "Durand & Associés","Lexia Conseil","Martin-Leblanc","Avocats Réunis",
  "Moreau & Fils","Juris Atlantique","Sophie Bertrand","Themis Avocats",
  "Lefèvre & Partners","Patrimoine Conseil","Jean-Pierre Roux","Avocats Est",
  "Claire Dupont","Juridica Lyon","Mercier Avocats","Laurent & Associés",
  "Gauthier Avocats","Avocats Alpes","Marie-Anne Petit","Justitia Avocats",
  "François Legal","Girard-Blanc","Hélène Morin","Avocats Méditerranée",
  "Pierre & Associés","Bernard Avocats","Finance Conseil","Rousseau-Leroy",
  "Avocats Ouest","Isabelle Faure","Arnaud & Fils","Delacroix Avocats",
  "Marie Leclerc","Avocats Centre","Thomas Renard","Dupuis & Associés",
  "Anne-Marie Blanc","Juris Pro","Richard Fontaine","Conseil Plus",
];
const CITIES = ["Paris","Lyon","Marseille","Toulouse","Bordeaux","Nantes","Lille","Strasbourg","Nice","Montpellier"];
const SPECS = ["Droit du travail","Droit des affaires","Droit de la famille","Droit pénal","Droit fiscal","Droit immobilier"];
const TITLES = ["Licenciement","Télétravail 2025","Rupture conventionnelle","Création entreprise","Transmission","Contrats commerciaux","Divorce","Garde alternée","Pension alimentaire","Garde à vue","Optimisation fiscale","Achat immobilier","Voisinage","Bail commercial","Médiation","RGPD","Réforme justice","Aide juridictionnelle","Prescription","L'écrit en droit"];
const PLATFORMS = ["linkedin","facebook","google_business","instagram"];

const r = (a:number,b:number) => Math.floor(Math.random()*(b-a+1))+a;
const pk = <T,>(a:T[]):T => a[Math.floor(Math.random()*a.length)];
const ago = (n:number) => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString(); };
const dOnly = (s:string) => s.split("T")[0];
const DEMO_MARKER = "00000000-0000-0000-0000-0000000de000";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (d:unknown, s=200) => new Response(JSON.stringify(d), { status:s, headers:{...corsHeaders,"Content-Type":"application/json"} });

  try {
    const { action } = await req.json();
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (action === "check") {
      const { count } = await sb.from("law_firms").select("id",{count:"exact",head:true}).like("email","%@demo-socialpulse.fr");
      return json({ seeded: (count||0) > 0, count: count||0 });
    }

    if (action === "clear") {
      console.log("CLEAR: starting...");
      const [pubsRes, profsRes] = await Promise.all([
        sb.from("publications").select("id").like("title","%[DEMO]%"),
        sb.from("profiles").select("user_id").like("full_name","%[DEMO]%"),
      ]);
      const pubIds = (pubsRes.data||[]).map((x:any)=>x.id);
      const userIds = (profsRes.data||[]).map((x:any)=>x.user_id);
      console.log(`CLEAR: ${pubIds.length} pubs, ${userIds.length} users to delete`);

      const ops: Promise<any>[] = [
        sb.from("demo_requests").delete().like("full_name","%[DEMO]%"),
        sb.from("invoices").delete().like("invoice_number","DEMO-%"),
        sb.from("cm_assignments").delete().eq("assigned_by", DEMO_MARKER),
        sb.from("admin_internal_messages").delete().like("content","%[DEMO]%"),
      ];
      if (pubIds.length) {
        ops.push(sb.from("validation_audit_trail").delete().in("publication_id", pubIds.slice(0,100)));
        ops.push(sb.from("publication_metrics").delete().in("publication_id", pubIds.slice(0,100)));
        ops.push(sb.from("cm_activity_logs").delete().like("entity_type","%__admin_demo__%"));
      }
      await Promise.all(ops);

      if (pubIds.length) {
        for (let i=0; i<pubIds.length; i+=100) {
          await sb.from("publications").delete().in("id", pubIds.slice(i,i+100));
        }
      }

      if (userIds.length) {
        await Promise.all([
          sb.from("user_roles_simple").delete().in("user_id", userIds),
          sb.from("user_roles_v2").delete().in("user_id", userIds),
          sb.from("law_firm_members").delete().in("user_id", userIds),
        ]);
        await sb.from("profiles").delete().in("user_id", userIds);
      }
      await sb.from("law_firms").delete().like("email","%@demo-socialpulse.fr");
      console.log("CLEAR: done");
      return json({ success:true, message:"Données démo supprimées avec succès" });
    }

    // ── SEED ──
    console.log("SEED: starting...");
    const { count: existing } = await sb.from("law_firms").select("id",{count:"exact",head:true}).like("email","%@demo-socialpulse.fr");
    if ((existing||0) > 0) return json({ success:false, message:"Données démo déjà présentes. Supprimez d'abord.", already_seeded:true });

    const now = new Date();
    const seedId = crypto.randomUUID();

    // Step 1: Create firms (no FK issues)
    const packs = ["essentiel","essentiel","essentiel","avance","avance","avance","expert","expert"];
    const firmRows = FIRM_NAMES.map((name,i) => {
      const plan = packs[i%packs.length]; let active = true;
      // 2 suspended (i=32,33)
      if (i===32||i===33) active=false;
      return {
        name:`Cabinet ${name}`, city:CITIES[i%CITIES.length],
        postal_code:`${String(r(10,95)).padStart(2,"0")}000`,
        bar_association:`Barreau de ${CITIES[i%CITIES.length]}`,
        email:`cab${i}@demo-socialpulse.fr`,
        specialization_areas:[pk(SPECS),pk(SPECS)],
        subscription_plan:plan, is_active:active,
        created_at:ago(r(30,365)),
      };
    });
    console.log("SEED: inserting firms...");
    const { data:firms, error:fErr } = await sb.from("law_firms").insert(firmRows).select("id,subscription_plan,is_active");
    if (fErr) { console.error("Firms error:", fErr); throw new Error(`Firms: ${fErr.message}`); }
    console.log(`SEED: ${(firms||[]).length} firms created`);

    // Step 2: Create CM profiles (profiles table has no FK to auth.users based on schema)
    const cmNames = ["Camille Lefebvre","Maxime Dupuis","Léa Martin","Antoine Bernard","Clara Rousseau","Hugo Fontaine"];
    const cmUsers = cmNames.map((name,i) => ({
      id: crypto.randomUUID(), name,
      firms: i===0?12:i===5?3:r(5,9),
    }));

    console.log("SEED: inserting CM profiles...");
    const { error: profErr } = await sb.from("profiles").insert(cmUsers.map(cm=>({
      user_id:cm.id, full_name:`${cm.name} [DEMO]`,
      email:`cm${cm.id.slice(0,6)}@demo-socialpulse.fr`,
      role:"community_manager",
    })));
    if (profErr) { console.error("Profile error:", profErr); throw new Error(`Profiles: ${profErr.message}`); }
    console.log("SEED: CM profiles created");

    // Step 3: Roles
    console.log("SEED: inserting roles...");
    const [r1, r2] = await Promise.all([
      sb.from("user_roles_simple").insert(cmUsers.map(cm=>({ user_id:cm.id, role:"community_manager" }))),
      sb.from("user_roles_v2").insert(cmUsers.map(cm=>({ user_id:cm.id, role:"community_manager" }))),
    ]);
    if (r1.error) { console.error("Roles simple error:", r1.error); throw new Error(`Roles simple: ${r1.error.message}`); }
    if (r2.error) { console.error("Roles v2 error:", r2.error); throw new Error(`Roles v2: ${r2.error.message}`); }
    console.log("SEED: roles created");

    // Step 4: Assignments
    const active = (firms||[]).filter((f:any)=>f.is_active);
    const assigns:any[] = [], members:any[] = [];
    let fi = 0;
    for (const cm of cmUsers) {
      for (let j=0; j<cm.firms && fi<active.length; j++,fi++) {
        assigns.push({ cm_user_id:cm.id, lawyer_user_id:cm.id, law_firm_id:active[fi].id, is_active:true, assigned_by:DEMO_MARKER });
        members.push({ user_id:cm.id, law_firm_id:active[fi].id, role:"community_manager" });
      }
    }
    console.log(`SEED: inserting ${assigns.length} assignments...`);
    const [a1, a2] = await Promise.all([
      assigns.length ? sb.from("cm_assignments").insert(assigns) : {error:null},
      members.length ? sb.from("law_firm_members").insert(members) : {error:null},
    ]);
    if (a1.error) { console.error("Assignments error:", a1.error); throw new Error(`Assignments: ${a1.error.message}`); }
    if (a2.error) { console.error("Members error:", a2.error); throw new Error(`Members: ${a2.error.message}`); }
    console.log("SEED: assignments created");

    // Step 5: Invoices
    const prices:Record<string,number> = {essentiel:350,avance:550,expert:890};
    const invs:any[] = [];
    for (const f of firms||[]) {
      if (!f.is_active) continue;
      const price = prices[f.subscription_plan]||350;
      for (let m=0;m<6;m++) {
        const ps = new Date(now.getFullYear(),now.getMonth()-m,1);
        const pe = new Date(now.getFullYear(),now.getMonth()-m+1,0);
        const idx = (firms||[]).indexOf(f);
        let st = "paid"; if (m===0 && idx>=27 && idx<=31) st="overdue";
        invs.push({
          user_id: assigns.find((a:any)=>a.law_firm_id===f.id)?.cm_user_id || cmUsers[0].id,
          law_firm_id:f.id, amount:price+r(-50,50),
          invoice_number:`DEMO-${f.id.slice(0,8)}-${m}`,
          period_start:dOnly(ps.toISOString()), period_end:dOnly(pe.toISOString()),
          plan_name:f.subscription_plan, status:st, created_at:ps.toISOString(),
        });
      }
    }

    // Step 6: Publications
    const pubs:any[] = [];
    let vT=85, pT=23, rT=9, uT=5;
    for (const f of active) {
      const uid = assigns.find((a:any)=>a.law_firm_id===f.id)?.cm_user_id || cmUsers[0].id;
      for (let i=0;i<r(2,4);i++) {
        let vs:string, st:string, urg:string|null=null, sub:string|null=null, pub:string|null=null;
        if (vT>0) { vs="validated";st="publie";sub=ago(r(3,25));pub=ago(r(0,2));vT--; }
        else if (pT>0) { vs="submitted_to_lawyer";st="programme";sub=ago(r(0,3));pT--;if(uT>0){urg="urgent";uT--;} }
        else if (rT>0) { vs="refused";st="brouillon";sub=ago(r(1,7));rT--; }
        else { vs="validated";st="publie";sub=ago(r(5,30));pub=ago(r(1,4)); }
        pubs.push({
          user_id:uid, law_firm_id:f.id,
          title:`${TITLES[r(0,TITLES.length-1)]} [DEMO]`,
          content:"Contenu de démonstration.",
          platform:pk(PLATFORMS), status:st, validation_status:vs, urgency:urg,
          scheduled_date:dOnly(ago(r(-7,14))),
          scheduled_time:`${String(r(8,18)).padStart(2,"0")}:00:00`,
          source:"socialpulse", submitted_at:sub, published_at:pub,
          created_at:ago(r(1,30)),
        });
      }
    }

    // Step 7: Leads
    const leads = Array.from({length:32},(_,i)=>({
      full_name:`Me Lead-${i+1} [DEMO]`,
      email:`lead${i}@demo-socialpulse.fr`,
      phone:`06 ${r(10,99)} ${r(10,99)} ${r(10,99)} ${r(10,99)}`,
      specialty:pk(SPECS), firm_size:pk(["1-2","3-5","6-10","11-20"]),
      preferred_date:dOnly(ago(r(-14,14))),
      preferred_time:pk(["09:00","10:00","14:00","15:00"]),
      status:["pending","pending","scheduled","scheduled","completed","completed","completed","rejected"][i%8],
      terms_accepted:true, created_at:ago(r(0,30)),
    }));

    // Insert bulk data in parallel
    console.log(`SEED: inserting ${invs.length} invoices, ${pubs.length} pubs, ${leads.length} leads...`);
    const bulkResults = await Promise.all([
      sb.from("invoices").insert(invs),
      sb.from("publications").insert(pubs),
      sb.from("demo_requests").insert(leads),
    ]);
    for (const br of bulkResults) {
      if (br.error) { console.error("Bulk insert error:", br.error); throw new Error(`Bulk: ${br.error.message}`); }
    }
    console.log("SEED: bulk data created");

    // Step 8: Audit trail
    const { data: demoPubs } = await sb.from("publications").select("id,user_id").like("title","%[DEMO]%").limit(50);
    if (demoPubs?.length) {
      console.log("SEED: inserting audit trail...");
      const trail = Array.from({length:25},()=>{
        const pub = pk(demoPubs);
        const act = pk(["approve","reject","submit","publish","create"]);
        return { publication_id:pub.id, user_id:pub.user_id, action:act,
          previous_status:"draft", new_status:act==="approve"?"validated":act==="reject"?"refused":"published",
          comment:"__admin_demo__", created_at:ago(r(0,14)) };
      });
      const logs = Array.from({length:25},()=>{
        const cm = pk(cmUsers);
        return { cm_user_id:cm.id, law_firm_id:pk(active).id,
          action_type:pk(["create","edit","publish","schedule"]),
          entity_type:"publication__admin_demo__",
          entity_id:pk(demoPubs).id, details:{}, created_at:ago(r(0,7)) };
      });
      await Promise.all([
        sb.from("validation_audit_trail").insert(trail),
        sb.from("cm_activity_logs").insert(logs),
      ]);
      console.log("SEED: audit trail created");
    }

    // Step 9: Internal coordination messages
    console.log("SEED: inserting coordination messages...");
    const contextTypes = ["firm","lead","churn","cm_performance"];
    const msgTemplates = [
      "Pouvez-vous vérifier le planning de publication ?",
      "Le cabinet a signalé un problème de facturation.",
      "Attention au risque de churn sur ce compte.",
      "Les métriques d'engagement sont en baisse, proposez un plan d'action.",
      "Excellent travail sur les publications récentes !",
      "Le client souhaite augmenter sa fréquence de publication.",
      "Merci de préparer le bilan mensuel.",
      "RDV prévu demain matin avec le cabinet.",
      "Le lead a demandé une démo supplémentaire.",
      "Performance CM en hausse, continuez ainsi.",
      "Urgence : le cabinet menace de résilier.",
      "Nouveau brief éditorial à valider.",
    ];
    const coordMsgs:any[] = [];
    for (let i=0; i<20; i++) {
      const cm = pk(cmUsers);
      const firm = pk(active);
      const isSenderAdmin = i % 3 !== 0; // admin sends 2/3 of messages
      const ctxType = pk(contextTypes);
      coordMsgs.push({
        sender_id: isSenderAdmin ? cmUsers[0].id : cm.id, // first CM acts as admin proxy in demo
        recipient_id: isSenderAdmin ? cm.id : cmUsers[0].id,
        content: `${pk(msgTemplates)} [DEMO]`,
        is_urgent: i % 5 === 0,
        is_read: i > 10,
        context_type: i % 2 === 0 ? ctxType : null,
        context_id: i % 2 === 0 ? firm.id : null,
        context_label: i % 2 === 0 ? `Cabinet ${pk(FIRM_NAMES)}` : null,
        created_at: ago(r(0, 14)),
      });
    }
    await sb.from("admin_internal_messages").insert(coordMsgs);
    console.log("SEED: coordination messages created");

    const mrr = invs.filter((i:any)=>i.status==="paid"&&new Date(i.period_start).getMonth()===now.getMonth()).reduce((s:number,i:any)=>s+i.amount,0);
    console.log("SEED: complete!");

    return json({
      success:true, message:"Données démo Admin créées avec succès !",
      seed_id:seedId, seeded_at:now.toISOString(),
      stats:{ firms:(firms||[]).length, cms:cmUsers.length, publications:pubs.length, invoices:invs.length, leads:leads.length, mrr:Math.round(mrr), auditEntries:50, coordMessages:coordMsgs.length },
    });

  } catch (error) {
    console.error("SEED FATAL:", error);
    return json({ success:false, message: error.message || String(error) }, 500);
  }
});
