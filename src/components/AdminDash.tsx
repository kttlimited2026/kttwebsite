import React, { useState, useEffect } from "react";
import { dbService } from "../services/dbService";
import { Service, Plan, Settings, Booking, Media, SubAdmin } from "../types";
import { FOOD_ITEMS } from "./FoodItemCalculator";
import { LAUNDRY_ITEMS } from "./LaundryItemCalculator";
import { BAR_ITEMS } from "./BarItemCalculator";

// Helper for media upload
function MediaUp({ media, onChange }: { media: Media[]; onChange: (fn: (p: Media[]) => Media[]) => void }) {
  const [urlInput, setUrlInput] = useState("");

  const handle = (files: FileList) => Array.from(files).forEach(f => {
    const r = new FileReader();
    r.onload = e => onChange(p => [...p, { url: e.target?.result as string, type: f.type.startsWith("video") ? "video" : "image", name: f.name }]);
    r.readAsDataURL(f);
  });

  const addUrlImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const isVideo = urlInput.endsWith(".mp4") || urlInput.endsWith(".mov") || urlInput.includes("video");
    onChange(p => [...p, { url: urlInput.trim(), type: isVideo ? "video" : "image", name: "Added Image" }]);
    setUrlInput("");
  };

  return (
    <div>
      <div className="media-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); if(e.dataTransfer.files) handle(e.dataTransfer.files);}}>
        <input type="file" accept="image/*,video/*" multiple onChange={e=>{if(e.target.files) handle(e.target.files)}}/>
        <div className="media-drop-ico">📁</div>
        <div style={{fontSize:13,fontWeight:600,color:"#ccc"}}>Drop images or videos here</div>
        <p>or click to browse · JPG, PNG, WEBP, MP4, MOV</p>
      </div>

      <form onSubmit={addUrlImage} style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input 
          type="url" 
          placeholder="Or paste image URL (https://...)" 
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", background: "#0A0A0A", border: "1px solid #333", borderRadius: 6, color: "#fff", fontSize: 13 }}
        />
        <button 
          type="submit"
          style={{ background: "#FF5E00", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          + Add URL
        </button>
      </form>

      {media.length > 0 && (
        <div className="media-grid-a" style={{ marginTop: 16 }}>
          {media.map((m, i) => (
            <div key={i} className="media-item">
              {m.type === "video" ? <video src={m.url} muted style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <img src={m.url} alt={m.name || ""}/>}
              <button className="media-del" onClick={() => onChange(p => p.filter((_, j) => j !== i))}>✕</button>
              <span className="media-badge">{m.type === "video" ? "▶" : "IMG"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDash({ 
  svcs, setSvcs, plans, setPlans, onLogout, settings, setSettings, currentUserEmail, adminRole 
}: { 
  svcs: Service[]; setSvcs: (s: Service[]) => void; 
  plans: Plan[]; setPlans: (p: Plan[]) => void; 
  onLogout: () => void; 
  settings: Settings; setSettings: (s: Settings) => void;
  currentUserEmail?: string | null;
  adminRole?: 'superadmin' | 'subadmin' | string | null;
}) {
  const isSuperAdmin = currentUserEmail?.toLowerCase() === "okpuorba7@gmail.com" || currentUserEmail?.toLowerCase() === "chatkttlimited@gmail.com" || adminRole === "superadmin";

  // Check subadmin permissions if not superadmin
  const currentSubAdmin = settings.subAdmins?.find(s => s.email.toLowerCase() === currentUserEmail?.toLowerCase());
  const allowedPermissions = isSuperAdmin 
    ? ['overview', 'bookings', 'subadmins', 'services', 'menu_prices', 'media', 'plans', 'settings']
    : ['overview', ...(currentSubAdmin?.permissions || ['bookings'])];

  const ALL_TABS = [
    { id: "overview", l: "📊 Overview" },
    { id: "bookings", l: "📋 Bookings & Orders" },
    { id: "subadmins", l: "👥 Sub-Admins / Staff", superOnly: true },
    { id: "services", l: "⚙️ Services & Pricing" },
    { id: "menu_prices", l: "🍱 Food & Laundry Price List" },
    { id: "media", l: "🖼️ Media" },
    { id: "plans", l: "💳 Plans" },
    { id: "settings", l: "🔧 Site Settings" },
  ];

  const visibleTabs = ALL_TABS.filter(t => {
    if (t.superOnly && !isSuperAdmin) return false;
    return allowedPermissions.includes(t.id);
  });

  const [tab, setTab] = useState(visibleTabs[0]?.id || "overview");
  const [saved, setSaved] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Form state for adding sub-admin
  const [newSubEmail, setNewSubEmail] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubRole, setNewSubRole] = useState<'order_manager' | 'service_manager' | 'full_subadmin'>('order_manager');

  // Menu Prices Manager State
  const [activeMenuSubTab, setActiveMenuSubTab] = useState<'food' | 'bar' | 'laundry'>('food');
  const [foodSearch, setFoodSearch] = useState("");
  const [foodCatFilter, setFoodCatFilter] = useState("All");
  const [barSearch, setBarSearch] = useState("");
  const [barCatFilter, setBarCatFilter] = useState("All");
  const [laundrySearch, setLaundrySearch] = useState("");
  const [laundryCatFilter, setLaundryCatFilter] = useState("All");

  const activeFoodItems = (settings.customFoodItems && settings.customFoodItems.length > 0) ? settings.customFoodItems : FOOD_ITEMS;
  const activeBarItems = (settings.customBarItems && settings.customBarItems.length > 0) ? settings.customBarItems : BAR_ITEMS;
  const activeLaundryItems = (settings.customLaundryItems && settings.customLaundryItems.length > 0) ? settings.customLaundryItems : LAUNDRY_ITEMS;

  const handleUpdateFoodItem = (id: string, field: 'name' | 'price' | 'category', value: any) => {
    const updated = activeFoodItems.map(item => item.id === id ? { ...item, [field]: field === 'price' ? (Number(value) || 0) : value } : item);
    updSetting("customFoodItems", updated);
  };

  const handleAddFoodItem = () => {
    const newId = "food-" + Date.now();
    const newItem = { id: newId, name: "New Gourmet Dish", price: 4000, category: foodCatFilter !== "All" ? foodCatFilter : "Rice Dishes" };
    updSetting("customFoodItems", [newItem, ...activeFoodItems]);
  };

  const handleDeleteFoodItem = (id: string) => {
    if (window.confirm("Remove this food item from the restaurant menu?")) {
      updSetting("customFoodItems", activeFoodItems.filter(item => item.id !== id));
    }
  };

  const handleResetFoodItems = () => {
    if (window.confirm("Reset restaurant food menu prices back to default menu rates?")) {
      updSetting("customFoodItems", FOOD_ITEMS);
    }
  };

  const handleUpdateBarItem = (id: string, field: 'name' | 'price' | 'category', value: any) => {
    const updated = activeBarItems.map(item => item.id === id ? { ...item, [field]: field === 'price' ? (Number(value) || 0) : value } : item);
    updSetting("customBarItems", updated);
  };

  const handleAddBarItem = () => {
    const newId = "bar-" + Date.now();
    const newItem = { id: newId, name: "New Drink / Liquor Item", price: 2000, category: barCatFilter !== "All" ? barCatFilter : "Beer" };
    updSetting("customBarItems", [newItem, ...activeBarItems]);
  };

  const handleDeleteBarItem = (id: string) => {
    if (window.confirm("Remove this drink item from the bar menu?")) {
      updSetting("customBarItems", activeBarItems.filter(item => item.id !== id));
    }
  };

  const handleResetBarItems = () => {
    if (window.confirm("Reset bar menu drink prices back to default rates?")) {
      updSetting("customBarItems", BAR_ITEMS);
    }
  };

  const handleUpdateLaundryItem = (id: string, field: 'name' | 'price' | 'category', value: any) => {
    const updated = activeLaundryItems.map(item => item.id === id ? { ...item, [field]: field === 'price' ? (Number(value) || 0) : value } : item);
    updSetting("customLaundryItems", updated);
  };

  const handleAddLaundryItem = () => {
    const newId = "laundry-" + Date.now();
    const newItem = { id: newId, name: "New Garment / Fabric Item", price: 1000, category: laundryCatFilter !== "All" ? laundryCatFilter : "Everyday Wear" };
    updSetting("customLaundryItems", [newItem, ...activeLaundryItems]);
  };

  const handleDeleteLaundryItem = (id: string) => {
    if (window.confirm("Remove this item from the laundry price list?")) {
      updSetting("customLaundryItems", activeLaundryItems.filter(item => item.id !== id));
    }
  };

  const handleResetLaundryItems = () => {
    if (window.confirm("Reset laundry rates back to default price list?")) {
      updSetting("customLaundryItems", LAUNDRY_ITEMS);
    }
  };

  useEffect(() => {
    const unsub = dbService.subscribeToBookings(setBookings);
    return unsub;
  }, []);

  const save = async () => {
    setSaved(true);
    await Promise.all([
      ...svcs.map(s => dbService.updateService(s)),
      ...plans.map(p => dbService.updatePlan(p)),
      dbService.updateSettings(settings)
    ]);
    setTimeout(() => setSaved(false), 2500);
  };

  const seedData = async () => {
    if(!window.confirm("This will overwrite your existing service/plan descriptions in Firestore with defaults. Continue?")) return;
    setSaved(true);
    await Promise.all([
      ...svcs.map(s => dbService.updateService(s)),
      ...plans.map(p => dbService.updatePlan(p)),
      dbService.updateSettings(settings)
    ]);
    setTimeout(() => setSaved(false), 2500);
    alert("Database seeded successfully!");
  };

  const updSetting = (k: keyof Settings, v: any) => setSettings({ ...settings, [k]: v });
  
  const updBookingStatus = (id: string, status: string) => {
    dbService.updateBookingStatus(id, status);
  };

  const updSvc = (id: string, k: keyof Service, v: any) => setSvcs(svcs.map(s => s.id === id ? { ...s, [k]: v } : s));
  const updFeat = (id: string, i: number, v: string) => setSvcs(svcs.map(s => s.id === id ? { ...s, features: s.features.map((f, j) => j === i ? v : f) } : s));
  const addFeat = (id: string) => setSvcs(svcs.map(s => s.id === id ? { ...s, features: [...s.features, ""] } : s));
  const delFeat = (id: string, i: number) => setSvcs(svcs.map(s => s.id === id ? { ...s, features: s.features.filter((_, j) => j !== i) } : s));
  const updMedia = (id: string, fn: (p: Media[]) => Media[]) => setSvcs(svcs.map(s => s.id === id ? { ...s, media: fn(s.media) } : s));

  const updPlan = (id: string, k: keyof Plan, v: any) => setPlans(plans.map(x => x.id === (id || x.name) ? { ...x, [k]: v } : x));
  const updPlanFeat = (id: string, i: number, v: string) => setPlans(plans.map(x => x.id === (id || x.name) ? { ...x, features: x.features.map((f, j) => j === i ? v : f) } : x));
  const addPlanFeat = (id: string) => setPlans(plans.map(x => x.id === (id || x.name) ? { ...x, features: [...x.features, ""] } : x));
  const delPlanFeat = (id: string, i: number) => setPlans(plans.map(x => x.id === (id || x.name) ? { ...x, features: x.features.filter((_, j) => j !== i) } : x));

  const handleAddNewPlan = () => {
    const newId = "plan_" + Date.now();
    const newPlan: Plan = {
      id: newId,
      name: "New Monthly Plan",
      price: "15,000",
      period: "/month",
      badge: "POPULAR",
      featured: false,
      cta: "Choose Plan",
      ctaClass: "sec",
      features: ["Monthly Service Package", "Priority Dispatch", "Dedicated Support"]
    };
    setPlans([...plans, newPlan]);
  };

  const handleDeletePlan = async (plan: Plan) => {
    const planName = plan.name || "Selected";
    if (!window.confirm(`Are you sure you want to delete the "${planName}" subscription plan?`)) return;
    const planId = plan.id || plan.name;
    setPlans(plans.filter(x => (x.id || x.name) !== planId));
    if (plan.id) {
      await dbService.deletePlan(plan.id);
    }
  };

  const handleDeleteBooking = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the booking for ${name}?`)) return;
    await dbService.deleteBooking(id);
  };

  // Sub-Admin Management
  const handleAddSubAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail.trim() || !newSubEmail.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    let perms: Array<'bookings' | 'services' | 'media' | 'plans' | 'settings'> = ['bookings'];
    if (newSubRole === 'service_manager') {
      perms = ['bookings', 'services', 'media'];
    } else if (newSubRole === 'full_subadmin') {
      perms = ['bookings', 'services', 'media', 'plans', 'settings'];
    }

    const newSub: SubAdmin = {
      id: "sub_" + Date.now(),
      email: newSubEmail.trim().toLowerCase(),
      name: newSubName.trim() || "Staff Member",
      role: newSubRole,
      permissions: perms,
      addedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    const currentSubs = settings.subAdmins || [];
    if (currentSubs.some(s => s.email.toLowerCase() === newSub.email)) {
      alert("A sub-admin with this email already exists.");
      return;
    }

    const updatedSettings = {
      ...settings,
      subAdmins: [...currentSubs, newSub]
    };
    setSettings(updatedSettings);
    dbService.updateSettings(updatedSettings);

    setNewSubEmail("");
    setNewSubName("");
    alert(`Sub-admin ${newSub.email} added successfully! They can now log in with Google.`);
  };

  const handleRemoveSubAdmin = (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${email}?`)) return;
    const currentSubs = settings.subAdmins || [];
    const updatedSettings = {
      ...settings,
      subAdmins: currentSubs.filter(s => s.id !== id)
    };
    setSettings(updatedSettings);
    dbService.updateSettings(updatedSettings);
  };

  return (
    <div className="admin-wrap">
      {/* Role Banner Info */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "8px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#888" }}>
        <div>
          Logged in as: <strong style={{ color: "#fff" }}>{currentUserEmail || "Admin"}</strong> {isSuperAdmin ? <span style={{ color: "#39FF14", marginLeft: 6, fontWeight: 700 }}>(👑 Super Admin)</span> : <span style={{ color: "#FF5E00", marginLeft: 6, fontWeight: 700 }}>(👔 Sub-Admin)</span>}
        </div>
        {!isSuperAdmin && currentSubAdmin && (
          <div style={{ color: "#D4D4D8", fontSize: 11 }}>
            Permissions: <span style={{ color: "#39FF14", fontWeight: 600 }}>{currentSubAdmin.permissions.join(", ")}</span>
          </div>
        )}
      </div>

      <div className="admin-tabs">
        {visibleTabs.map(t => (
          <button key={t.id} className={`admin-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="admin-body">

        {tab === "overview" && <>
          <div className="admin-sec-title" style={{ fontSize: 22, fontWeight: 800 }}>👑 Admin Management Portal &amp; Website Editor</div>
          <div className="admin-sec-sub" style={{ fontSize: 14 }}>
            Welcome back, <strong style={{ color: "#39FF14" }}>{currentUserEmail || "Admin"}</strong>! Edit prices, phone numbers, services, and manage customer orders below.
          </div>

          {/* Stats Summary */}
          <div className="admin-stats-row">
            {[{ n: "2,500+", l: "Customers", c: "var(--neon-lime)", ch: "+12% this month" }, { n: bookings.length.toString(), l: "Orders / Bookings", c: "var(--bright-orange)", ch: "Total received" }, { n: svcs.length.toString(), l: "Active Services", c: "var(--neon-lime)", ch: "Live on site" }, { n: "98%", l: "Satisfaction", c: "var(--bright-orange)", ch: "Customer rating" }].map((s, i) => (
              <div key={i} className="admin-stat"><div className="admin-stat-n" style={{ color: s.c }}>{s.n}</div><div className="admin-stat-l">{s.l}</div><div className="admin-stat-c">{s.ch}</div></div>
            ))}
          </div>

          {/* Website Content & Pricing Management Hub */}
          <div style={{ marginTop: 28, marginBottom: 36 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
              🛠️ Website Content &amp; Price Editing Modules
            </h3>
            <p style={{ color: "#aaa", fontSize: 13, marginBottom: 18 }}>Select a module below or use the top menu tabs to edit anything on your website:</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              
              {/* Module 1: Food & Laundry Prices */}
              <div 
                onClick={() => setTab("menu_prices")}
                style={{ background: "#161616", border: "1px solid #333", borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#39FF14")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#333")}
              >
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🍱</div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Food, Bar &amp; Laundry Price List</h4>
                  <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                    Change prices, add or delete dishes for Restaurant meals, Drinks/Liquor bottles, and Laundry garments.
                  </p>
                </div>
                <button style={{ marginTop: 16, background: "rgba(57,255,20,0.15)", color: "#39FF14", border: "1px solid rgba(57,255,20,0.4)", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", textAlign: "left", width: "fit-content" }}>
                  Open Price Manager ➔
                </button>
              </div>

              {/* Module 2: Services & Pricing */}
              <div 
                onClick={() => setTab("services")}
                style={{ background: "#161616", border: "1px solid #333", borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#FF5E00")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#333")}
              >
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>⚙️</div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Services &amp; Base Prices</h4>
                  <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                    Edit Food, Laundry, Cleaning &amp; Bar service titles, taglines, detailed descriptions, base rates, delivery fees, and bullet points.
                  </p>
                </div>
                <button style={{ marginTop: 16, background: "rgba(255,94,0,0.15)", color: "#FF5E00", border: "1px solid rgba(255,94,0,0.4)", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", textAlign: "left", width: "fit-content" }}>
                  Edit Services ➔
                </button>
              </div>

              {/* Module 3: Contact & Site Settings */}
              <div 
                onClick={() => setTab("settings")}
                style={{ background: "#161616", border: "1px solid #333", borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#FFBB00")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#333")}
              >
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔧</div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Site Settings &amp; Contact Info</h4>
                  <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                    Update phone numbers, WhatsApp link, email, physical office address, operating hours, referral ₦1000 discount, and banner text.
                  </p>
                </div>
                <button style={{ marginTop: 16, background: "rgba(255,187,0,0.15)", color: "#FFBB00", border: "1px solid rgba(255,187,0,0.4)", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", textAlign: "left", width: "fit-content" }}>
                  Update Settings ➔
                </button>
              </div>

              {/* Module 4: Bookings & Customer Orders */}
              <div 
                onClick={() => setTab("bookings")}
                style={{ background: "#161616", border: "1px solid #333", borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#00F2FE")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#333")}
              >
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Bookings &amp; Orders ({bookings.length})</h4>
                  <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                    View incoming customer orders, change status (Confirmed/Done/Cancelled), and chat directly with customers on WhatsApp.
                  </p>
                </div>
                <button style={{ marginTop: 16, background: "rgba(0,242,254,0.15)", color: "#00F2FE", border: "1px solid rgba(0,242,254,0.4)", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", textAlign: "left", width: "fit-content" }}>
                  View Orders ({bookings.length}) ➔
                </button>
              </div>

              {/* Module 5: Subscription Plans */}
              <div 
                onClick={() => setTab("plans")}
                style={{ background: "#161616", border: "1px solid #333", borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#FF5E00")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#333")}
              >
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>💳</div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Subscription Plans</h4>
                  <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                    Edit monthly subscription packages (Starter ₦15k, Classic ₦28.5k, Premium ₦49k) and feature lists.
                  </p>
                </div>
                <button style={{ marginTop: 16, background: "rgba(255,94,0,0.15)", color: "#FF5E00", border: "1px solid rgba(255,94,0,0.4)", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", textAlign: "left", width: "fit-content" }}>
                  Manage Plans ➔
                </button>
              </div>

              {/* Module 6: Media Gallery */}
              <div 
                onClick={() => setTab("media")}
                style={{ background: "#161616", border: "1px solid #333", borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#39FF14")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#333")}
              >
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Media &amp; Gallery</h4>
                  <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                    Upload or paste image/video URLs to display on service pages and showcases.
                  </p>
                </div>
                <button style={{ marginTop: 16, background: "rgba(57,255,20,0.15)", color: "#39FF14", border: "1px solid rgba(57,255,20,0.4)", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", textAlign: "left", width: "fit-content" }}>
                  Manage Media ➔
                </button>
              </div>

              {/* Module 7: Referral & Reward Perks */}
              <div 
                onClick={() => setTab("settings")}
                style={{ background: "#161616", border: "1px solid #333", borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#39FF14")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#333")}
              >
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🎁</div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Referral Program &amp; Reward Perks</h4>
                  <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                    Set customer referral discount (currently ₦{settings.referralDiscountAmount || "1000"}), min order limit, &amp; referral code prefix.
                  </p>
                </div>
                <button style={{ marginTop: 16, background: "rgba(57,255,20,0.15)", color: "#39FF14", border: "1px solid rgba(57,255,20,0.4)", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", textAlign: "left", width: "fit-content" }}>
                  Edit Referral Perks ➔
                </button>
              </div>

              {/* Module 8: Express Emergency Service */}
              <div 
                onClick={() => setTab("settings")}
                style={{ background: "#161616", border: "1px solid #333", borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#FF8C00")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#333")}
              >
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Express 24-Hr &amp; Emergency Dispatch</h4>
                  <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                    Set 24-hour turnaround fee (currently +₦{settings.expressFee || "5000"}), badge title, and toggle express delivery on/off.
                  </p>
                </div>
                <button style={{ marginTop: 16, background: "rgba(255,140,0,0.15)", color: "#FF8C00", border: "1px solid rgba(255,140,0,0.4)", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", textAlign: "left", width: "fit-content" }}>
                  Edit Express Fee ➔
                </button>
              </div>

            </div>
          </div>

          {/* Quick Edit Essentials Form right on Overview tab */}
          <div style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: 16, padding: 24, marginBottom: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>⚡ Quick Edit Essential Website Details</h3>
                <p style={{ fontSize: 12, color: "#aaa", margin: "4px 0 0" }}>Update phone numbers, address, referral discount, express fee, and announcement banner instantly.</p>
              </div>
              <button className="save-btn" onClick={save} style={{ background: "#39FF14", color: "#000", fontWeight: 800, padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer" }}>
                {saved ? "✅ Saved Live!" : "💾 Save Changes Live"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <div className="af">
                <label>📞 Front Desk Hotline</label>
                <input value={settings.phone || ""} onChange={e => updSetting("phone", e.target.value)} placeholder="07066613373" />
              </div>
              <div className="af">
                <label>👔 Manager Hotline</label>
                <input value={settings.managerPhone || ""} onChange={e => updSetting("managerPhone", e.target.value)} placeholder="09047885282" />
              </div>
              <div className="af">
                <label>💬 WhatsApp Hotline (Format: 234...)</label>
                <input value={settings.whatsapp || ""} onChange={e => updSetting("whatsapp", e.target.value)} placeholder="2348160880608" />
              </div>
              <div className="af">
                <label>✉️ Email Address</label>
                <input value={settings.email || ""} onChange={e => updSetting("email", e.target.value)} placeholder="Ktt.inquiries@gmail.com" />
              </div>
            </div>

            {/* Added Referral & Express Quick Controls */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 16, background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 12, border: "1px solid #282828" }}>
              <div className="af">
                <label style={{ color: "#39FF14", fontWeight: 700 }}>🎁 Referral Discount Amount (₦)</label>
                <input value={settings.referralDiscountAmount || "1000"} onChange={e => updSetting("referralDiscountAmount", e.target.value)} placeholder="1000" />
              </div>
              <div className="af">
                <label style={{ color: "#39FF14", fontWeight: 700 }}>🎁 Referral Min Order Threshold (₦)</label>
                <input value={settings.referralMinOrder || "5000"} onChange={e => updSetting("referralMinOrder", e.target.value)} placeholder="5000" />
              </div>
              <div className="af">
                <label style={{ color: "#FF8C00", fontWeight: 700 }}>⚡ Express Delivery Surcharge Fee (₦)</label>
                <input value={settings.expressFee || "5000"} onChange={e => updSetting("expressFee", e.target.value)} placeholder="5000" />
              </div>
              <div className="af">
                <label style={{ color: "#FF8C00", fontWeight: 700 }}>⚡ Express Delivery Status</label>
                <select 
                  value={settings.expressEnabled !== false ? "true" : "false"}
                  onChange={e => updSetting("expressEnabled", e.target.value === "true")}
                  style={{ background: "#0A0A0A", color: "#fff", border: "1px solid #333", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}
                >
                  <option value="true">✅ Enabled (Customers can request Express)</option>
                  <option value="false">🚫 Disabled</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginTop: 16 }}>
              <div className="af">
                <label>📍 Physical Address</label>
                <input value={settings.address || ""} onChange={e => updSetting("address", e.target.value)} placeholder="First gate Apo mechanic Estate..." />
              </div>
              <div className="af">
                <label>📢 Header Announcement / Promo Banner (Leave empty to hide)</label>
                <input value={settings.banner || ""} onChange={e => updSetting("banner", e.target.value)} placeholder="e.g. 🔥 Special Offer: 20% Off First Cleaning Order!" />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button className="save-btn" onClick={save} style={{ background: "#FF5E00", color: "#fff", fontWeight: 800, padding: "10px 28px", borderRadius: 8, border: "none", cursor: "pointer" }}>
                {saved ? "✅ Saved to Website!" : "💾 Save Website Settings Live"}
              </button>
            </div>
          </div>

          {isSuperAdmin && (
            <div style={{marginTop:20,padding:20,background:"#1A1A1A",borderRadius:16,border:"1px solid #2A2A2A",textAlign:"center"}}>
              <h4 style={{color:"#fff",marginBottom:8}}>Database Reset &amp; Seed</h4>
              <p style={{color:"#888",fontSize:13,marginBottom:16}}>Need to reset default services, food menu dishes, and plans in Firestore?</p>
              <button className="btn-orange" style={{padding:"10px 24px", fontSize: 13}} onClick={seedData}>🚀 Seed Initial Data</button>
            </div>
          )}
        </>}

        {tab === "subadmins" && isSuperAdmin && <>
          <div className="admin-sec-title">Sub-Admin & Staff Management</div>
          <div className="admin-sec-sub">Create and give limited or full access to team members to manage bookings or services when you are away.</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, marginBottom: 40 }}>
            {/* Add Sub-Admin Form */}
            <form onSubmit={handleAddSubAdmin} style={{ background: "#1A1A1A", borderRadius: 14, border: "1px solid #2A2A2A", padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                ➕ Create Sub-Admin Access
              </h3>

              <div className="af">
                <label>Google Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. staff.ktt@gmail.com" 
                  value={newSubEmail}
                  onChange={e => setNewSubEmail(e.target.value)}
                  required
                />
                <span style={{ fontSize: 11, color: "#888", marginTop: 3, display: "block" }}>
                  Must be the exact Gmail address they use to sign in.
                </span>
              </div>

              <div className="af" style={{ marginTop: 14 }}>
                <label>Staff Name / Role Label</label>
                <input 
                  type="text" 
                  placeholder="e.g. Blessing (Order Manager)" 
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                />
              </div>

              <div className="af" style={{ marginTop: 14 }}>
                <label>Access Level & Permissions</label>
                <select 
                  value={newSubRole} 
                  onChange={e => setNewSubRole(e.target.value as any)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#0A0A0A", color: "#fff", border: "1px solid #2A2A2A", fontSize: 13, fontWeight: 600 }}
                >
                  <option value="order_manager">📦 Order & Booking Manager (Bookings Only)</option>
                  <option value="service_manager">⚙️ Service & Booking Manager (Bookings + Services + Media)</option>
                  <option value="full_subadmin">🛡️ Full Access Sub-Admin (All tabs except adding Sub-Admins)</option>
                </select>
              </div>

              <button 
                type="submit" 
                style={{ width: "100%", marginTop: 18, background: "#FF5E00", color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                ➕ Grant Access to Sub-Admin
              </button>
            </form>

            {/* List of active sub-admins */}
            <div style={{ background: "#1A1A1A", borderRadius: 14, border: "1px solid #2A2A2A", padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
                Active Sub-Admins ({settings.subAdmins?.length || 0})
              </h3>

              {(!settings.subAdmins || settings.subAdmins.length === 0) ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#888", fontSize: 13 }}>
                  No sub-admins added yet. Add a staff email on the left to allow them to log in and help manage orders.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {settings.subAdmins.map(sub => (
                    <div key={sub.id} style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 10, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{sub.name}</div>
                        <div style={{ fontSize: 12, color: "#39FF14", marginTop: 2 }}>{sub.email}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                          <span style={{ background: "rgba(255,94,0,0.15)", color: "#FF5E00", border: "1px solid rgba(255,94,0,0.3)", padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                            {sub.role.replace("_", " ")}
                          </span>
                          {sub.permissions.map(p => (
                            <span key={p} style={{ background: "#1A1A1A", color: "#AAA", border: "1px solid #333", padding: "2px 8px", borderRadius: 12, fontSize: 10 }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveSubAdmin(sub.id, sub.email)}
                        style={{ background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)", color: "#FF4D4D", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      >
                        Revoke Access
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>}

        {tab === "services" && allowedPermissions.includes("services") && <>
          <div className="admin-sec-title">Services & Pricing</div>
          <div className="admin-sec-sub">Set prices and descriptions for each service. Changes update live.</div>
          <div className="svc-editor-grid">
            {svcs.map(s => (
              <div key={s.id} className="admin-card">
                <div className="admin-card-hdr" style={{ borderLeft: `4px solid ${s.numColor}` }}>
                  <span style={{ fontSize: 20 }}>{s.emoji}</span><h3>{s.label}</h3>
                </div>
                <div className="admin-card-body">
                  <div className="af"><label>Service Title</label><input value={s.title} onChange={e => updSvc(s.id, "title", e.target.value)} /></div>
                  <div className="af"><label>Subtitle / Short Tagline</label><input value={s.sub} onChange={e => updSvc(s.id, "sub", e.target.value)} /></div>
                  <div className="af">
                    <label>Full Detailed Description</label>
                    <textarea 
                      rows={3} 
                      value={s.description || ""} 
                      placeholder="Write detailed information about this service..."
                      onChange={e => updSvc(s.id, "description", e.target.value)} 
                      style={{ width: "100%", padding: "10px 12px", background: "#0A0A0A", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, resize: "vertical" }}
                    />
                  </div>
                  <div className="price-row">
                    <div className="af"><label>Base Price (₦)</label><input value={s.basePrice} onChange={e => updSvc(s.id, "basePrice", e.target.value)} /></div>
                    <div className="af"><label>Delivery Fee (₦)</label><input value={s.deliveryFee} onChange={e => updSvc(s.id, "deliveryFee", e.target.value)} /></div>
                  </div>
                  <div className="feat-list">
                    {s.features.map((f, i) => <div key={i} className="feat-row"><input value={f} onChange={e => updFeat(s.id, i, e.target.value)} /><button className="feat-del" onClick={() => delFeat(s.id, i)}>✕</button></div>)}
                  </div>
                  <button className="feat-add" onClick={() => addFeat(s.id)}>+ Add Feature</button>
                </div>
              </div>
            ))}
          </div>
          <div className="save-bar">{saved ? <div className="saved-msg">✅ Saved!</div> : <p>Changes update live on the website after saving.</p>}<button className="save-btn" onClick={save}>💾 Save Changes</button></div>
        </>}

        {tab === "menu_prices" && allowedPermissions.includes("menu_prices") && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div>
              <div className="admin-sec-title">🍱 Food, Bar &amp; 🧺 Laundry Price List Manager</div>
              <div className="admin-sec-sub">Edit prices, item names, and categories for Restaurant Dishes, Bar Drinks/Liquors, and Laundry Garments. Updates instantly on the website &amp; mobile app.</div>
            </div>
          </div>

          {/* Sub-Tabs: Food Menu vs Bar Menu vs Laundry List */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveMenuSubTab('food')}
              style={{
                background: activeMenuSubTab === 'food' ? "#39FF14" : "#1A1A1A",
                color: activeMenuSubTab === 'food' ? "#000" : "#CCC",
                border: "1px solid " + (activeMenuSubTab === 'food' ? "#39FF14" : "#333"),
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              🍲 Restaurant Food Menu ({activeFoodItems.length} items)
            </button>
            <button
              onClick={() => setActiveMenuSubTab('bar')}
              style={{
                background: activeMenuSubTab === 'bar' ? "#FFBB00" : "#1A1A1A",
                color: activeMenuSubTab === 'bar' ? "#000" : "#CCC",
                border: "1px solid " + (activeMenuSubTab === 'bar' ? "#FFBB00" : "#333"),
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              🍾 Bar &amp; Drinks Menu ({activeBarItems.length} items)
            </button>
            <button
              onClick={() => setActiveMenuSubTab('laundry')}
              style={{
                background: activeMenuSubTab === 'laundry' ? "#FF5E00" : "#1A1A1A",
                color: activeMenuSubTab === 'laundry' ? "#FFF" : "#CCC",
                border: "1px solid " + (activeMenuSubTab === 'laundry' ? "#FF5E00" : "#333"),
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              🧺 Laundry Item Rates ({activeLaundryItems.length} items)
            </button>
          </div>

          {/* FOOD MENU EDITOR */}
          {activeMenuSubTab === 'food' && (
            <div style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
                  <input
                    type="text"
                    placeholder="🔍 Search food dish..."
                    value={foodSearch}
                    onChange={e => setFoodSearch(e.target.value)}
                    style={{ padding: "8px 14px", background: "#0A0A0A", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, minWidth: 220 }}
                  />
                  <select
                    value={foodCatFilter}
                    onChange={e => setFoodCatFilter(e.target.value)}
                    style={{ padding: "8px 14px", background: "#0A0A0A", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600 }}
                  >
                    {["All", ...Array.from(new Set(activeFoodItems.map(i => i.category)))].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleAddFoodItem}
                    style={{ background: "#39FF14", color: "#000", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer" }}
                  >
                    ➕ Add New Food Dish
                  </button>
                  <button
                    onClick={handleResetFoodItems}
                    style={{ background: "#222", color: "#888", border: "1px solid #444", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    🔄 Reset Defaults
                  </button>
                </div>
              </div>

              {/* Food Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
                {activeFoodItems
                  .filter(item => {
                    const matchesCat = foodCatFilter === "All" || item.category === foodCatFilter;
                    const matchesSearch = item.name.toLowerCase().includes(foodSearch.toLowerCase());
                    return matchesCat && matchesSearch;
                  })
                  .map(item => (
                    <div key={item.id} style={{ background: "#0D0D0D", border: "1px solid #222", borderRadius: 10, padding: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 2, minWidth: 180 }}>
                        <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 2 }}>Dish / Item Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleUpdateFoodItem(item.id, 'name', e.target.value)}
                          style={{ width: "100%", padding: "7px 10px", background: "#1A1A1A", border: "1px solid #333", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 600 }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 2 }}>Category</label>
                        <input
                          type="text"
                          value={item.category}
                          onChange={e => handleUpdateFoodItem(item.id, 'category', e.target.value)}
                          style={{ width: "100%", padding: "7px 10px", background: "#1A1A1A", border: "1px solid #333", borderRadius: 6, color: "#aaa", fontSize: 12 }}
                        />
                      </div>
                      <div style={{ width: 140 }}>
                        <label style={{ fontSize: 10, color: "#39FF14", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 2 }}>Price (₦)</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => handleUpdateFoodItem(item.id, 'price', e.target.value)}
                          style={{ width: "100%", padding: "7px 10px", background: "#1A1A1A", border: "1px solid #39FF14", borderRadius: 6, color: "#39FF14", fontSize: 14, fontWeight: 800 }}
                        />
                      </div>
                      <div style={{ paddingTop: 14 }}>
                        <button
                          onClick={() => handleDeleteFoodItem(item.id)}
                          style={{ background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.3)", color: "#FF4D4D", padding: "7px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* BAR MENU EDITOR */}
          {activeMenuSubTab === 'bar' && (
            <div style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
                  <input
                    type="text"
                    placeholder="🔍 Search bar drink / liquor..."
                    value={barSearch}
                    onChange={e => setBarSearch(e.target.value)}
                    style={{ padding: "8px 14px", background: "#0A0A0A", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, minWidth: 220 }}
                  />
                  <select
                    value={barCatFilter}
                    onChange={e => setBarCatFilter(e.target.value)}
                    style={{ padding: "8px 14px", background: "#0A0A0A", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600 }}
                  >
                    {["All", ...Array.from(new Set(activeBarItems.map(i => i.category)))].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleAddBarItem}
                    style={{ background: "#FFBB00", color: "#000", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer" }}
                  >
                    ➕ Add New Bar Item
                  </button>
                  <button
                    onClick={handleResetBarItems}
                    style={{ background: "#222", color: "#888", border: "1px solid #444", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    🔄 Reset Defaults
                  </button>
                </div>
              </div>

              {/* Bar Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
                {activeBarItems
                  .filter(item => {
                    const matchesCat = barCatFilter === "All" || item.category === barCatFilter;
                    const matchesSearch = item.name.toLowerCase().includes(barSearch.toLowerCase());
                    return matchesCat && matchesSearch;
                  })
                  .map(item => (
                    <div key={item.id} style={{ background: "#0D0D0D", border: "1px solid #222", borderRadius: 10, padding: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 2, minWidth: 180 }}>
                        <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 2 }}>Drink / Liquor Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleUpdateBarItem(item.id, 'name', e.target.value)}
                          style={{ width: "100%", padding: "7px 10px", background: "#1A1A1A", border: "1px solid #333", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 600 }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 2 }}>Category</label>
                        <input
                          type="text"
                          value={item.category}
                          onChange={e => handleUpdateBarItem(item.id, 'category', e.target.value)}
                          style={{ width: "100%", padding: "7px 10px", background: "#1A1A1A", border: "1px solid #333", borderRadius: 6, color: "#aaa", fontSize: 12 }}
                        />
                      </div>
                      <div style={{ width: 140 }}>
                        <label style={{ fontSize: 10, color: "#FFBB00", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 2 }}>Price (₦)</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => handleUpdateBarItem(item.id, 'price', e.target.value)}
                          style={{ width: "100%", padding: "7px 10px", background: "#1A1A1A", border: "1px solid #FFBB00", borderRadius: 6, color: "#FFBB00", fontSize: 14, fontWeight: 800 }}
                        />
                      </div>
                      <div style={{ paddingTop: 14 }}>
                        <button
                          onClick={() => handleDeleteBarItem(item.id)}
                          style={{ background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.3)", color: "#FF4D4D", padding: "7px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* LAUNDRY RATES EDITOR */}
          {activeMenuSubTab === 'laundry' && (
            <div style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
                  <input
                    type="text"
                    placeholder="🔍 Search laundry item..."
                    value={laundrySearch}
                    onChange={e => setLaundrySearch(e.target.value)}
                    style={{ padding: "8px 14px", background: "#0A0A0A", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, minWidth: 220 }}
                  />
                  <select
                    value={laundryCatFilter}
                    onChange={e => setLaundryCatFilter(e.target.value)}
                    style={{ padding: "8px 14px", background: "#0A0A0A", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600 }}
                  >
                    {["All", ...Array.from(new Set(activeLaundryItems.map(i => i.category)))].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleAddLaundryItem}
                    style={{ background: "#FF5E00", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer" }}
                  >
                    ➕ Add New Garment Item
                  </button>
                  <button
                    onClick={handleResetLaundryItems}
                    style={{ background: "#222", color: "#888", border: "1px solid #444", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    🔄 Reset Defaults
                  </button>
                </div>
              </div>

              {/* Laundry Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
                {activeLaundryItems
                  .filter(item => {
                    const matchesCat = laundryCatFilter === "All" || item.category === laundryCatFilter;
                    const matchesSearch = item.name.toLowerCase().includes(laundrySearch.toLowerCase());
                    return matchesCat && matchesSearch;
                  })
                  .map(item => (
                    <div key={item.id} style={{ background: "#0D0D0D", border: "1px solid #222", borderRadius: 10, padding: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 2, minWidth: 180 }}>
                        <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 2 }}>Garment / Fabric Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleUpdateLaundryItem(item.id, 'name', e.target.value)}
                          style={{ width: "100%", padding: "7px 10px", background: "#1A1A1A", border: "1px solid #333", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 600 }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 2 }}>Category</label>
                        <input
                          type="text"
                          value={item.category}
                          onChange={e => handleUpdateLaundryItem(item.id, 'category', e.target.value)}
                          style={{ width: "100%", padding: "7px 10px", background: "#1A1A1A", border: "1px solid #333", borderRadius: 6, color: "#aaa", fontSize: 12 }}
                        />
                      </div>
                      <div style={{ width: 140 }}>
                        <label style={{ fontSize: 10, color: "#FF5E00", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 2 }}>Rate (₦)</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => handleUpdateLaundryItem(item.id, 'price', e.target.value)}
                          style={{ width: "100%", padding: "7px 10px", background: "#1A1A1A", border: "1px solid #FF5E00", borderRadius: 6, color: "#FF5E00", fontSize: 14, fontWeight: 800 }}
                        />
                      </div>
                      <div style={{ paddingTop: 14 }}>
                        <button
                          onClick={() => handleDeleteLaundryItem(item.id)}
                          style={{ background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.3)", color: "#FF4D4D", padding: "7px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="save-bar">{saved ? <div className="saved-msg">✅ Price list saved live!</div> : <p>Click save to update prices live across the website &amp; mobile app.</p>}<button className="save-btn" onClick={save}>💾 Save Price List</button></div>
        </>}

        {tab === "media" && allowedPermissions.includes("media") && <>
          <div className="admin-sec-title">Photos & Videos</div>
          <div className="admin-sec-sub">Upload images and videos per service. They show as thumbnails on the service cards.</div>
          <div className="svc-editor-grid">
            {svcs.map(s => (
              <div key={s.id} className="admin-card">
                <div className="admin-card-hdr" style={{ borderLeft: `4px solid ${s.numColor}` }}>
                  <span style={{ fontSize: 20 }}>{s.emoji}</span><h3>{s.label}</h3>
                </div>
                <div className="admin-card-body">
                  <MediaUp media={s.media} onChange={fn => updMedia(s.id, fn)} />
                </div>
              </div>
            ))}
          </div>
          <div className="save-bar">{saved ? <div className="saved-msg">✅ Media saved!</div> : <p>Save to persist changes.</p>}<button className="save-btn" onClick={save}>💾 Save Media</button></div>
        </>}

        {tab === "plans" && allowedPermissions.includes("plans") && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div>
              <div className="admin-sec-title">Subscription Plans (Monthly & Packages)</div>
              <div className="admin-sec-sub">Edit plan names, prices, monthly periods, badges, features, or add new subscription options.</div>
            </div>
            <button 
              onClick={handleAddNewPlan}
              style={{ background: "#FF5E00", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(255,94,0,0.3)" }}
            >
              ➕ Create New Plan
            </button>
          </div>

          <div className="plans-editor-grid">
            {plans.map(p => (
              <div key={p.id || p.name} className="plan-editor" style={{ background: "#161616", border: p.featured ? "2px solid #FF5E00" : "1px solid #2A2A2A", borderRadius: 14, padding: 20 }}>
                <div className="plan-editor-hdr" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>{p.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <label className="feat-toggle" style={{ fontSize: 12, fontWeight: 600, color: "#39FF14", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="checkbox" checked={!!p.featured} onChange={e => updPlan(p.id || p.name, "featured", e.target.checked)} />
                      ⭐ Featured
                    </label>
                    <button 
                      onClick={() => handleDeletePlan(p)}
                      title="Delete this plan"
                      style={{ background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.3)", color: "#FF4D4D", borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer" }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="plan-editor-body">
                  <div className="af">
                    <label>Plan Name</label>
                    <input value={p.name} onChange={e => updPlan(p.id || p.name, "name", e.target.value)} />
                  </div>

                  <div className="price-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="af">
                      <label>Price (₦)</label>
                      <input value={p.price} onChange={e => updPlan(p.id || p.name, "price", e.target.value)} placeholder="e.g. 15,000" />
                    </div>
                    <div className="af">
                      <label>Billing Period</label>
                      <input value={p.period} onChange={e => updPlan(p.id || p.name, "period", e.target.value)} placeholder="e.g. /month, /year" />
                    </div>
                  </div>

                  <div className="price-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
                    <div className="af">
                      <label>Badge Tag (Optional)</label>
                      <input value={p.badge || ""} onChange={e => updPlan(p.id || p.name, "badge", e.target.value)} placeholder="e.g. POPULAR, BEST VALUE" />
                    </div>
                    <div className="af">
                      <label>Button Label</label>
                      <input value={p.cta || "Choose Plan"} onChange={e => updPlan(p.id || p.name, "cta", e.target.value)} />
                    </div>
                  </div>

                  <div className="af" style={{ marginTop: 14 }}>
                    <label style={{ color: "#aaa", fontSize: 12, fontWeight: 700 }}>Plan Included Features</label>
                    <div className="feat-list">
                      {p.features.map((f, i) => (
                        <div key={i} className="feat-row">
                          <input value={f} onChange={e => updPlanFeat(p.id || p.name, i, e.target.value)} />
                          <button className="feat-del" onClick={() => delPlanFeat(p.id || p.name, i)}>✕</button>
                        </div>
                      ))}
                    </div>
                    <button className="feat-add" onClick={() => addPlanFeat(p.id || p.name)}>+ Add Feature Bullet</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="save-bar">
            {saved ? <div className="saved-msg">✅ Subscription Plans saved & live!</div> : <p>Save to persist subscription plan updates across the website.</p>}
            <button className="save-btn" onClick={save}>💾 Save Plans</button>
          </div>
        </>}

        {tab === "bookings" && allowedPermissions.includes("bookings") && <>
          <div className="admin-sec-title">Orders &amp; Booking Management</div>
          <div className="admin-sec-sub">Real-time live orders placed on the website. Updates sync instantly across devices.</div>
          
          {/* Referral Reward Credits Tracker Ledger for Admin */}
          {(() => {
            const referralStats = bookings.reduce((acc, b) => {
              if (b.referralCodeApplied) {
                const code = b.referralCodeApplied.trim();
                const codePhoneDigits = code.replace(/[^0-9]/g, "");
                const bookingPhoneDigits = (b.phone || "").replace(/[^0-9]/g, "");

                const isSelfRedemption = codePhoneDigits.length >= 6 && bookingPhoneDigits.length >= 6 &&
                  (bookingPhoneDigits.includes(codePhoneDigits) || codePhoneDigits.includes(bookingPhoneDigits));

                if (!acc[code]) acc[code] = { count: 0, grossEarned: 0, redeemed: 0, usersReferred: [] };

                if (isSelfRedemption) {
                  acc[code].redeemed += Number(b.referralDiscountAmount || 1000);
                } else {
                  acc[code].count += 1;
                  acc[code].grossEarned += Number(b.referralDiscountAmount || 1000);
                  acc[code].usersReferred.push(b.name);
                }
              }
              return acc;
            }, {} as Record<string, { count: number; grossEarned: number; redeemed: number; usersReferred: string[] }>);

            const referralKeys = Object.keys(referralStats);
            if (referralKeys.length === 0) return null;

            return (
              <div style={{ background: "linear-gradient(135deg, #102010 0%, #0A120A 100%)", border: "1px solid rgba(57, 255, 20, 0.3)", borderRadius: 14, padding: "20px 24px", marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#39FF14", display: "flex", alignItems: "center", gap: 8 }}>
                      🎁 Referral Leaderboard &amp; Customer Reward Credit Ledger
                    </div>
                    <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                      Real-time accounting of friends referred, gross credit earned, redeemed credits spent on bookings, and net remaining credit balance.
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#fff" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(57,255,20,0.2)", textAlign: "left", color: "#888", fontSize: 11, textTransform: "uppercase" }}>
                        <th style={{ padding: "8px 12px" }}>Referrer Phone / Code</th>
                        <th style={{ padding: "8px 12px" }}>Friends Referred</th>
                        <th style={{ padding: "8px 12px" }}>Gross Earned</th>
                        <th style={{ padding: "8px 12px" }}>Credits Redeemed</th>
                        <th style={{ padding: "8px 12px" }}>Net Available Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralKeys.map((code) => {
                        const item = referralStats[code];
                        const netBalance = Math.max(0, item.grossEarned - item.redeemed);
                        return (
                          <tr key={code} style={{ borderBottom: "1px solid #1A2A1A" }}>
                            <td style={{ padding: "10px 12px", fontWeight: 800, color: "#39FF14", fontFamily: "monospace" }}>
                              {code}
                            </td>
                            <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                              {item.count} friend(s) <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>({item.usersReferred.join(", ") || "None"})</span>
                            </td>
                            <td style={{ padding: "10px 12px", color: "#39FF14", fontWeight: 700 }}>
                              +₦{item.grossEarned.toLocaleString()}
                            </td>
                            <td style={{ padding: "10px 12px", color: item.redeemed > 0 ? "#FF6B6B" : "#888", fontWeight: 700 }}>
                              -₦{item.redeemed.toLocaleString()}
                            </td>
                            <td style={{ padding: "10px 12px", fontWeight: 900, color: netBalance > 0 ? "#39FF14" : "#888" }}>
                              ₦{netBalance.toLocaleString()} {netBalance === 0 && item.redeemed > 0 ? "(Fully Used)" : "(Available)"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          <div style={{ background: "#1A1A1A", borderRadius: 13, border: "1px solid #2A2A2A", overflow: "auto" }}>
            <table className="bk-table">
              <thead>
                <tr>
                  <th>Customer Name &amp; Email</th>
                  <th>Contact Phone</th>
                  <th>Service Ordered</th>
                  <th>Date &amp; Time</th>
                  <th>Delivery Address</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Quick Actions</th>
                </tr>
              </thead>
              <tbody>{bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 36, color: "#888" }}>
                    No customer orders found yet. All website orders will automatically show up here in real time.
                  </td>
                </tr>
              ) : (
                bookings.map((b, i) => (
                  <tr key={b.id || i}>
                    <td style={{ fontWeight: 600, color: "#fff" }}>
                      <div>{b.name}</div>
                      <div style={{ fontSize: 11, color: "#39FF14", fontWeight: 500 }}>{b.email}</div>
                    </td>
                    <td style={{ color: "#39FF14", fontWeight: 600 }}>
                      <div>{b.phone || "N/A"}</div>
                      {b.altPhone && <div style={{ fontSize: 11, color: "#888", fontWeight: 400 }}>Alt: {b.altPhone}</div>}
                    </td>
                    <td style={{ color: "#FF5E00", fontWeight: 700 }}>
                      <div>{b.service}</div>
                      {b.isExpress && (
                        <div style={{ background: "#FF8C00", color: "#000", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 900, marginTop: 4, display: "inline-block" }}>
                          ⚡ EXPRESS EMERGENCY
                        </div>
                      )}
                      {b.referralCodeApplied && (
                        <div style={{ background: "rgba(57, 255, 20, 0.2)", color: "#39FF14", border: "1px solid rgba(57, 255, 20, 0.4)", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, marginTop: 4, display: "inline-block" }}>
                          🎁 Perk: {b.referralCodeApplied} (-₦{b.referralDiscountAmount || 1000})
                        </div>
                      )}
                      {b.totalEstimatedPrice !== undefined && (
                        <div style={{ fontSize: 11, color: "#fff", fontWeight: 800, marginTop: 2 }}>
                          Total: ₦{b.totalEstimatedPrice.toLocaleString()}
                        </div>
                      )}
                      <div style={{ background: b.paymentStatus === "paid" ? "rgba(57, 255, 20, 0.15)" : "rgba(255, 140, 0, 0.15)", color: b.paymentStatus === "paid" ? "#39FF14" : "#FF8C00", border: `1px solid ${b.paymentStatus === "paid" ? "rgba(57, 255, 20, 0.4)" : "rgba(255, 140, 0, 0.4)"}`, padding: "3px 7px", borderRadius: 4, fontSize: 10, fontWeight: 800, marginTop: 4, display: "inline-block" }}>
                        {b.paymentStatus === "paid" ? `💳 PAID ONLINE (${b.paystackReference ? b.paystackReference : "Paystack"})` : "💳 Payment Pending"}
                      </div>
                    </td>
                    <td>
                      <div>{b.date || "Flexible"}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{b.time || "Flexible"}</div>
                    </td>
                    <td style={{ fontSize: 12, maxWidth: 160, wordBreak: "break-word" }}>{b.address || "—"}</td>
                    <td style={{ fontSize: 12, maxWidth: 180, wordBreak: "break-word" }}>
                      {b.notes ? (
                        <div style={{ color: "#FFC107", background: "rgba(255,193,7,0.1)", padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,193,7,0.2)" }}>
                          💬 {b.notes}
                        </div>
                      ) : (
                        <span style={{ color: "#666" }}>None</span>
                      )}
                    </td>
                    <td>
                      <select 
                        value={b.status || "new"} 
                        onChange={e => b.id && updBookingStatus(b.id, e.target.value)}
                        style={{ background: "#0A0A0A", color: b.status === "done" ? "#39FF14" : b.status === "confirmed" ? "#00F2FE" : b.status === "cancelled" ? "#FF4D4D" : "#FF5E00", border: "1px solid #2A2A2A", borderRadius: 5, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                      >
                        <option value="new">🆕 New</option>
                        <option value="confirmed">⏳ Confirmed</option>
                        <option value="done">✅ Done</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {b.phone && (
                          <a 
                            href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${b.name}, regarding your order for ${b.service} at KTT...`)}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Reply on WhatsApp"
                            style={{ background: "#25D366", color: "#000", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, textDecoration: "none" }}
                          >
                            💬 WA
                          </a>
                        )}
                        {b.email && (
                          <a 
                            href={`mailto:${b.email}?subject=${encodeURIComponent(`Update on your KTT Order: ${b.service}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Reply by Email"
                            style={{ background: "#1A1A1A", border: "1px solid #333", color: "#fff", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: "none" }}
                          >
                            ✉️
                          </a>
                        )}
                        {b.id && (
                          <button 
                            onClick={() => handleDeleteBooking(b.id!, b.name)}
                            title="Delete Order"
                            style={{ background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.3)", color: "#FF4D4D", padding: "4px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}</tbody>
            </table>
          </div>
        </>}

        {tab === "settings" && allowedPermissions.includes("settings") && <>
          <div className="admin-sec-title">Site Settings</div>
          <div className="admin-sec-sub">Update contact info and branding.</div>
          <div className="settings-grid">
            <div className="settings-card">
              <h3>📞 Contact Information</h3>
              {(["phone", "managerPhone", "email", "whatsapp", "address"] as const).map((k) => (
                <div key={k} className="af"><label>{k === "phone" ? "Front Desk Hotline" : k === "managerPhone" ? "Manager Hotline" : k}</label><input value={settings[k] || ""} onChange={e => updSetting(k, e.target.value)} /></div>
              ))}
            </div>
            <div className="settings-card">
              <h3>📱 Social Media Links</h3>
              {(["instagram", "tiktok", "facebook", "twitter"] as const).map((k) => (
                <div key={k} className="af"><label>{k.charAt(0).toUpperCase() + k.slice(1)} URL</label><input value={settings[k] || ""} onChange={e => updSetting(k, e.target.value)} placeholder={`https://${k}.com/...`} /></div>
              ))}
            </div>
            <div className="settings-card">
              <h3>🕐 Operating Hours</h3>
              <div className="af"><label>Monday – Thursday</label><input value={settings.monThu || ""} onChange={e => updSetting("monThu", e.target.value)} placeholder="e.g. 9am – 10pm" /></div>
              <div className="af"><label>Friday – Saturday</label><input value={settings.friSat || ""} onChange={e => updSetting("friSat", e.target.value)} placeholder="e.g. 9am – 12am" /></div>
              <div className="af"><label>Sunday</label><input value={settings.sunday || ""} onChange={e => updSetting("sunday", e.target.value)} placeholder="e.g. 2pm – 10pm" /></div>
              <div className="af"><label>Public Holidays</label><input value={settings.holidays || ""} onChange={e => updSetting("holidays", e.target.value)} placeholder="e.g. 9am – 10pm" /></div>
            </div>
            <div className="settings-card">
              <h3>📢 Announcement Banner</h3>
              {(["banner", "bannerLink"] as const).map((k) => (
                <div key={k} className="af"><label>{k}</label><input value={settings[k] || ""} onChange={e => updSetting(k, e.target.value)} /></div>
              ))}
            </div>
            <div className="settings-card">
              <h3>🎁 Referral &amp; Reward Perks</h3>
              <div className="af">
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#39FF14", fontWeight: 700 }}>
                  <input 
                    type="checkbox" 
                    checked={settings.referralEnabled !== false} 
                    onChange={e => updSetting("referralEnabled", e.target.checked)} 
                    style={{ accentColor: "#39FF14", width: 16, height: 16 }}
                  />
                  Enable "Refer a Neighbor / Friend" Perk Banner &amp; Discount
                </label>
              </div>
              <div className="af">
                <label>Referral Headline</label>
                <input value={settings.referralHeadline || "Refer a Neighbor or Friend & Get ₦1,000 Off!"} onChange={e => updSetting("referralHeadline", e.target.value)} />
              </div>
              <div className="af">
                <label>Referral Banner Description</label>
                <input value={settings.referralDescription || "Word-of-mouth is our pride. Share your referral code with a neighbor or friend in Abuja, and get ₦1,000 off your next laundry or home cleaning booking!"} onChange={e => updSetting("referralDescription", e.target.value)} />
              </div>
              <div className="af">
                <label>Discount Amount (₦)</label>
                <input value={settings.referralDiscountAmount || "1000"} onChange={e => updSetting("referralDiscountAmount", e.target.value)} placeholder="1000" />
              </div>
              <div className="af">
                <label>Minimum Order Required for Referral Perk (₦)</label>
                <input value={settings.referralMinOrder || "5000"} onChange={e => updSetting("referralMinOrder", e.target.value)} placeholder="5000" />
              </div>
              <div className="af">
                <label>Referral Code Prefix</label>
                <input value={settings.referralCodePrefix || "REF"} onChange={e => updSetting("referralCodePrefix", e.target.value)} placeholder="e.g. REF" />
              </div>
            </div>

            <div className="settings-card">
              <h3>⚡ Express Emergency / Same-Day Service</h3>
              <div className="af">
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#FF8C00", fontWeight: 700 }}>
                  <input 
                    type="checkbox" 
                    checked={settings.expressEnabled !== false} 
                    onChange={e => updSetting("expressEnabled", e.target.checked)} 
                    style={{ accentColor: "#FF8C00", width: 16, height: 16 }}
                  />
                  Enable "Express 24-Hr Delivery &amp; Emergency Dispatch" Badge &amp; Booking Surcharge
                </label>
              </div>
              <div className="af">
                <label>Express Badge Title</label>
                <input value={settings.expressBadgeTitle || "⚡ Express 24-Hr Delivery & Emergency Same-Day Cleaning"} onChange={e => updSetting("expressBadgeTitle", e.target.value)} />
              </div>
              <div className="af">
                <label>Express Badge Subtitle</label>
                <input value={settings.expressBadgeSub || "Need urgent laundry before an event or emergency home cleaning for sudden guests? Request express 24-hr turnaround or same-day dispatch!"} onChange={e => updSetting("expressBadgeSub", e.target.value)} />
              </div>
              <div className="af">
                <label>Express Surcharge Fee (₦)</label>
                <input value={settings.expressFee || "5000"} onChange={e => updSetting("expressFee", e.target.value)} placeholder="5000" />
              </div>
            </div>

            <div className="settings-card" id="admin-security">
              <h3>🔐 Admin Security &amp; Access Control</h3>
              
              <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #2A2A2A" }}>
                <h4 style={{ fontSize: 13, color: "#FF5E00", fontWeight: 700, marginBottom: 8 }}>🔑 Admin Master Password</h4>
                <div className="af">
                  <label>Admin Login Password / PIN</label>
                  <input 
                    type="text" 
                    value={settings.adminPassword || "admin123"} 
                    onChange={e => updSetting("adminPassword", e.target.value)} 
                    placeholder="Set custom admin password..." 
                  />
                  <span style={{ fontSize: 11, color: "#888", marginTop: 4, display: "block" }}>
                    Used for direct password login without Google authentication. Default is <strong>admin123</strong>.
                  </span>
                </div>
              </div>

              {isSuperAdmin && (
                <div>
                  <h4 style={{ fontSize: 13, color: "#39FF14", fontWeight: 700, marginBottom: 12 }}>👥 Sub-Admin Team Members &amp; Staff Access</h4>
                  <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>
                    Grant staff or managers restricted admin access to view orders or update services.
                  </p>

                  <form onSubmit={handleAddSubAdmin} style={{ background: "#0A0A0A", padding: 14, borderRadius: 8, border: "1px solid #222", marginBottom: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div className="af">
                        <label style={{ fontSize: 11 }}>Sub-Admin Email (Gmail)</label>
                        <input 
                          type="email" 
                          placeholder="e.g. staff.ktt@gmail.com" 
                          value={newSubEmail}
                          onChange={e => setNewSubEmail(e.target.value)}
                          required
                          style={{ fontSize: 12, padding: "8px 10px" }}
                        />
                      </div>
                      <div className="af">
                        <label style={{ fontSize: 11 }}>Name / Role Label</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Blessing (Manager)" 
                          value={newSubName}
                          onChange={e => setNewSubName(e.target.value)}
                          style={{ fontSize: 12, padding: "8px 10px" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                      <div className="af" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: 11 }}>Role &amp; Access Level</label>
                        <select 
                          value={newSubRole} 
                          onChange={e => setNewSubRole(e.target.value as any)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#161616", color: "#fff", border: "1px solid #333", fontSize: 12 }}
                        >
                          <option value="order_manager">📦 Order &amp; Booking Manager (Orders Only)</option>
                          <option value="service_manager">⚙️ Service Manager (Orders + Services + Media)</option>
                          <option value="full_subadmin">🛡️ Full Sub-Admin (All features except adding sub-admins)</option>
                        </select>
                      </div>
                      <button 
                        type="submit" 
                        style={{ background: "#FF5E00", color: "#fff", border: "none", padding: "9px 16px", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        ➕ Add Sub-Admin
                      </button>
                    </div>
                  </form>

                  {/* Active Sub-Admins list */}
                  {settings.subAdmins && settings.subAdmins.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                      <span style={{ fontSize: 11, color: "#888", fontWeight: 700 }}>Active Sub-Admins ({settings.subAdmins.length}):</span>
                      {settings.subAdmins.map(sub => (
                        <div key={sub.id} style={{ background: "#0D0D0D", border: "1px solid #222", padding: "8px 12px", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                          <div>
                            <strong style={{ color: "#fff" }}>{sub.name}</strong> <span style={{ color: "#39FF14" }}>({sub.email})</span>
                            <span style={{ marginLeft: 8, background: "rgba(255,94,0,0.15)", color: "#FF5E00", padding: "1px 6px", borderRadius: 4, fontSize: 10 }}>{sub.role}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveSubAdmin(sub.id, sub.email)}
                            style={{ background: "transparent", border: "none", color: "#FF4D4D", cursor: "pointer", fontSize: 11, textDecoration: "underline" }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 14 }}>
                    <button 
                      type="button" 
                      onClick={() => setTab("subadmins")}
                      style={{ background: "rgba(57, 255, 20, 0.1)", border: "1px solid rgba(57, 255, 20, 0.3)", color: "#39FF14", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      👥 Open Dedicated Sub-Admins &amp; Staff Tab ➔
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="save-bar">{saved ? <div className="saved-msg">✅ Settings saved & live!</div> : <p>Save to persist changes.</p>}<button className="save-btn" onClick={save}>💾 Save Settings</button></div>
        </>}

      </div>
    </div>
  );
}
