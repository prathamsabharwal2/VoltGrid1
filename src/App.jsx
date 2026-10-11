import { useMemo, useState } from "react";
import "./App.css";

const project = {
  code: "PS046",
  name: "Distributed EV Charging Station & Grid Load Balancing Platform",
  team: "PS46-S19-05",
};

const stationsSeed = [
  { id: "ST-101", name: "Riverside EV Hub", location: "New Delhi", connectors: 12, available: 8, capacity: 240, load: 68, status: "Available", rate: 12 },
  { id: "ST-102", name: "Green Valley Station", location: "Gurugram", connectors: 8, available: 2, capacity: 180, load: 84, status: "High Load", rate: 11 },
  { id: "ST-103", name: "Tech Park Fast Charge", location: "Bengaluru", connectors: 16, available: 11, capacity: 360, load: 52, status: "Available", rate: 13 },
  { id: "ST-104", name: "Central Mall Station", location: "Hyderabad", connectors: 10, available: 0, capacity: 150, load: 96, status: "Critical", rate: 14 },
  { id: "ST-105", name: "Airport EV Point", location: "Mumbai", connectors: 20, available: 14, capacity: 480, load: 41, status: "Available", rate: 15 },
  { id: "ST-106", name: "Industrial Grid Hub", location: "Chennai", connectors: 14, available: 4, capacity: 300, load: 88, status: "High Load", rate: 12 },
];

const sessionsSeed = [
  { id: "SES-501", user: "Pratham Sabharwal", station: "ST-101", energy: 18.6, rate: 12, status: "ACTIVE", duration: "48 min" },
  { id: "SES-500", user: "Aarav Mehta", station: "ST-102", energy: 24.2, rate: 11, status: "ACTIVE", duration: "55 min" },
  { id: "SES-499", user: "Riya Sharma", station: "ST-103", energy: 31.5, rate: 13, status: "COMPLETED", duration: "72 min" },
];

const services = [
  ["User Service", "JWT authentication & user management", "AUTH"],
  ["Station Service", "CRUD, connector availability & telemetry", "STATION"],
  ["Session Service", "Plug-in workflow & energy updates", "SESSION"],
  ["Billing Service", "Dynamic billing & invoice generation", "BILLING"],
  ["API Gateway", "Central routing & distributed load balancing", "GATEWAY"],
  ["Eureka Server", "Dynamic service discovery", "DISCOVERY"],
  ["Message Broker", "Asynchronous event communication", "ASYNC"],
];

const requirements = [
  ["User management", "User Service", "Registration, authentication, JWT-protected operations"],
  ["Station management", "Station Service", "CRUD APIs, availability, connector status, telemetry"],
  ["Charging workflow", "Session Service", "Plug-in → active session → completion"],
  ["Energy updates", "Session Service", "Update consumption while a session is active"],
  ["Billing", "Billing Service", "Energy-based dynamic session billing and invoices"],
  ["Security", "JWT / Spring Security", "Stateless authentication for protected endpoints"],
  ["Routing", "API Gateway", "Single entry point for frontend/client requests"],
  ["Discovery", "Netflix Eureka", "Service registration and dynamic discovery"],
  ["Messaging", "Message Broker", "Async events between loosely coupled services"],
  ["Load balancing", "Gateway + service instances", "Distribute peak traffic across instances"],
  ["Validation", "Unit / Integration / E2E", "Test individual services and complete workflow"],
  ["Deployment", "Cloud/container-ready", "Deploy and validate end-to-end platform"],
];

function App() {
  const [page, setPage] = useState("dashboard");
  const [stations, setStations] = useState(stationsSeed);
  const [sessions, setSessions] = useState(sessionsSeed);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const notify = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__vgToast);
    window.__vgToast = window.setTimeout(() => setToast(""), 2400);
  };

  const filteredStations = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return stations;
    return stations.filter(s => `${s.id} ${s.name} ${s.location}`.toLowerCase().includes(q));
  }, [stations, search]);

  const activeSessions = sessions.filter(s => s.status === "ACTIVE");
  const networkLoad = Math.round(stations.reduce((a, s) => a + s.load, 0) / stations.length);
  const totalCapacity = stations.reduce((a, s) => a + s.capacity, 0);
  const availablePorts = stations.reduce((a, s) => a + s.available, 0);

  const startSession = (station) => {
    if (!station.available) return notify("No connector available at this station.");
    const next = {
      id: `SES-${501 + sessions.length}`,
      user: "Pratham Sabharwal",
      station: station.id,
      energy: 0,
      rate: station.rate,
      status: "ACTIVE",
      duration: "0 min",
    };
    setStations(prev => prev.map(s => s.id === station.id ? { ...s, available: s.available - 1 } : s));
    setSessions(prev => [next, ...prev]);
    notify(`Plug-in event accepted for ${station.id}`);
    setPage("sessions");
  };

  const stopSession = (id) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "COMPLETED", duration: "61 min", energy: s.energy || 18.2 } : s));
    notify("CHARGING_COMPLETED event published to Billing Service.");
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">⚡</div>
          <div><b>VoltGrid</b><span>Infrastructure</span></div>
        </div>
        <div className="project-code">{project.code} · {project.team}</div>

        <div className="nav-label">OPERATIONS</div>
        <Nav icon="▦" text="Overview" active={page === "dashboard"} onClick={() => setPage("dashboard")} />
        <Nav icon="⌁" text="Grid Monitoring" active={page === "grid"} onClick={() => setPage("grid")} />
        <Nav icon="⚡" text="Charging Stations" active={page === "stations"} onClick={() => setPage("stations")} />
        <Nav icon="◷" text="Charging Sessions" active={page === "sessions"} onClick={() => setPage("sessions")} />
        <Nav icon="₹" text="Billing" active={page === "billing"} onClick={() => setPage("billing")} />

        <div className="nav-label">PLATFORM</div>
        <Nav icon="◇" text="Microservices" active={page === "services"} onClick={() => setPage("services")} />
        <Nav icon="✓" text="Project Specifications" active={page === "specs"} onClick={() => setPage("specs")} />

        <div className="sidebar-footer">
          <div className="secure-chip">● SYSTEM ONLINE</div>
          <span>JWT · Gateway · Eureka</span>
          <span>Async Messaging · Load Balancing</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="crumb">PS046 / VOLTGRID INFRASTRUCTURE</div>
            <h1>{titleFor(page)}</h1>
          </div>
          <div className="top-actions">
            <div className="search">
              <span>⌕</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search station, ID or city" />
            </div>
            <div className="profile"><b>PS</b><span>Pratham Sabharwal<small>Team Lead</small></span></div>
          </div>
        </header>

        {page === "dashboard" && <Dashboard stations={stations} sessions={sessions} networkLoad={networkLoad} totalCapacity={totalCapacity} availablePorts={availablePorts} onNavigate={setPage} onStop={stopSession} />}
        {page === "stations" && <Stations stations={filteredStations} onStart={startSession} onAdd={() => notify("Station CRUD form ready for backend integration.")} />}
        {page === "sessions" && <Sessions sessions={sessions} onStop={stopSession} />}
        {page === "billing" && <Billing sessions={sessions} />}
        {page === "grid" && <Grid stations={stations} networkLoad={networkLoad} />}
        {page === "services" && <Services />}
        {page === "specs" && <Specifications />}

        <footer>
          <span><b>PS046</b> · Distributed EV Charging Station & Grid Load Balancing Platform</span>
          <span>Frontend prototype · Ready for microservice API integration</span>
        </footer>
      </main>

      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}

function Nav({ icon, text, active, onClick }) {
  return <button className={`nav ${active ? "active" : ""}`} onClick={onClick}><i>{icon}</i><span>{text}</span></button>;
}

function titleFor(page) {
  return {
    dashboard: "Network Operations",
    grid: "Grid Load & Power Stability",
    stations: "Charging Station Management",
    sessions: "Charging Session Control",
    billing: "Dynamic Session Billing",
    services: "Microservices & Infrastructure",
    specs: "PS046 Project Specifications",
  }[page];
}

function Dashboard({ stations, sessions, networkLoad, totalCapacity, availablePorts, onNavigate, onStop }) {
  const active = sessions.filter(s => s.status === "ACTIVE");
  return (
    <>
      <section className="hero">
        <div>
          <span className="live">● LIVE NETWORK</span>
          <h2>Distributed EV charging, monitored from one platform.</h2>
          <p>Track station availability, active charging sessions, energy flow, grid utilization and billing events.</p>
        </div>
        <button className="primary" onClick={() => onNavigate("stations")}>Manage Stations →</button>
      </section>

      <section className="metrics">
        <Metric label="Stations Online" value={`${stations.length}`} sub="6 configured in prototype" icon="⚡" />
        <Metric label="Available Connectors" value={availablePorts} sub="Across connected stations" icon="⌁" />
        <Metric label="Active Sessions" value={active.length} sub="High-concurrency events" icon="◷" />
        <Metric label="Network Load" value={`${networkLoad}%`} sub={`${totalCapacity} kW total capacity`} icon="◉" />
        <Metric label="Energy Today" value="1,842 kWh" sub="Telemetry snapshot" icon="↯" />
      </section>

      <div className="grid-2">
        <Panel title="Station Availability" action="Open management" onClick={() => onNavigate("stations")}>
          {stations.map(s => (
            <div className="availability" key={s.id}>
              <div className="station-label"><b>{s.name}</b><small>{s.id} · {s.location}</small></div>
              <div className="availability-bar"><i style={{ width: `${(s.available / s.connectors) * 100}%` }} /></div>
              <strong>{s.available}/{s.connectors}</strong>
              <Badge value={s.status} />
            </div>
          ))}
        </Panel>

        <Panel title="Grid Stability">
          <div className="gauge" style={{ "--load": `${networkLoad * 3.6}deg` }}>
            <div><strong>{networkLoad}%</strong><span>network load</span></div>
          </div>
          <div className="gauge-scale"><span>0%</span><span>50%</span><span>100%</span></div>
          <div className="callout warning">⚠ Peak utilization is monitored to identify high-load stations before service interruption.</div>
        </Panel>

        <Panel title="Active Charging Sessions" action="Session control" onClick={() => onNavigate("sessions")}>
          {active.length ? active.map(s => (
            <div className="session-line" key={s.id}>
              <div><b>{s.id}</b><small>{s.user} · {s.station}</small></div>
              <span><b>{s.energy} kWh</b><small>{s.duration}</small></span>
              <button className="outline" onClick={() => onStop(s.id)}>Complete</button>
            </div>
          )) : <Empty text="No active charging sessions." />}
        </Panel>

        <Panel title="Architecture Status" action="View services" onClick={() => onNavigate("services")}>
          <div className="mini-architecture">
            <span>React</span><b>→</b><span>API Gateway</span><b>→</b><span>Microservices</span>
          </div>
          <div className="mini-architecture second"><span>Microservices</span><b>↔</b><span>Message Broker</span><b>→</b><span>Billing</span></div>
          <p className="muted">Eureka provides service discovery; JWT protects secured client operations.</p>
        </Panel>
      </div>
    </>
  );
}

function Stations({ stations, onStart, onAdd }) {
  return (
    <>
      <section className="page-head">
        <div><span className="eyebrow">STATION SERVICE · CRUD + TELEMETRY</span><h2>Charging Station Management</h2><p>Manage station records, connector availability, power capacity and current grid load.</p></div>
        <button className="primary" onClick={onAdd}>＋ Add Station</button>
      </section>
      <div className="cards">
        {stations.map(s => (
          <article className="station-card" key={s.id}>
            <div className="card-top"><div className="station-icon">⚡</div><div><b>{s.name}</b><small>{s.id} · {s.location}</small></div><Badge value={s.status} /></div>
            <div className="telemetry">
              <Stat label="Connectors" value={`${s.available}/${s.connectors}`} />
              <Stat label="Capacity" value={`${s.capacity} kW`} />
              <Stat label="Current Load" value={`${s.load}%`} />
              <Stat label="Rate" value={`₹${s.rate}/kWh`} />
            </div>
            <div className="load-track"><i className={s.load >= 90 ? "critical" : s.load >= 80 ? "high" : ""} style={{ width: `${s.load}%` }} /></div>
            <div className="card-actions"><button className="primary" disabled={!s.available} onClick={() => onStart(s)}>{s.available ? "Start Charging" : "No Connector Available"}</button><button className="outline">View / Edit</button></div>
          </article>
        ))}
      </div>
    </>
  );
}

function Sessions({ sessions, onStop }) {
  return (
    <>
      <section className="page-head"><div><span className="eyebrow">SESSION SERVICE · PLUG-IN WORKFLOW</span><h2>Charging Session Control</h2><p>Track plug-in events, active energy consumption and session completion.</p></div><div className="event-chip">ASYNC EVENTS ENABLED</div></section>
      <div className="workflow">
        {["PLUG-IN EVENT", "SESSION CREATED", "ENERGY UPDATES", "COMPLETED", "BILLING EVENT"].map((x, i) => <div className="flow-step" key={x}><b>{i + 1}</b><span>{x}</span></div>)}
      </div>
      <section className="table-card">
        <div className="table-title"><b>Session Records</b><span>Mock telemetry · API-ready</span></div>
        <table><thead><tr><th>SESSION</th><th>USER</th><th>STATION</th><th>ENERGY</th><th>RATE</th><th>STATUS</th><th>ACTION</th></tr></thead>
          <tbody>{sessions.map(s => <tr key={s.id}><td><b>{s.id}</b><small>{s.duration}</small></td><td>{s.user}</td><td>{s.station}</td><td>{s.energy} kWh</td><td>₹{s.rate}/kWh</td><td><Badge value={s.status} /></td><td>{s.status === "ACTIVE" ? <button className="outline" onClick={() => onStop(s.id)}>Complete</button> : <span className="done">✓ Completed</span>}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}

function Billing({ sessions }) {
  const completed = sessions.filter(s => s.status === "COMPLETED");
  const total = completed.reduce((a, s) => a + s.energy * s.rate, 0);
  return (
    <>
      <section className="page-head"><div><span className="eyebrow">BILLING SERVICE · DYNAMIC CALCULATION</span><h2>Dynamic Session Billing</h2><p>Billing records are derived from energy consumed × configured rate per kWh.</p></div></section>
      <section className="metrics compact"><Metric label="Completed Sessions" value={completed.length} sub="Billing events processed" icon="✓" /><Metric label="Energy Billed" value={`${completed.reduce((a, s) => a + s.energy, 0).toFixed(1)} kWh`} sub="Completed sessions" icon="↯" /><Metric label="Revenue Snapshot" value={`₹${total.toFixed(0)}`} sub="Prototype calculation" icon="₹" /></section>
      <section className="table-card"><div className="table-title"><b>Invoice Records</b><span>Energy × Rate</span></div>
        <table><thead><tr><th>BILL ID</th><th>SESSION</th><th>ENERGY</th><th>RATE</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
          <tbody>{completed.map((s, i) => <tr key={s.id}><td>BILL-{String(i + 1).padStart(3, "0")}</td><td>{s.id}</td><td>{s.energy} kWh</td><td>₹{s.rate}/kWh</td><td><b>₹{(s.energy * s.rate).toFixed(2)}</b></td><td><Badge value="GENERATED" /></td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}

function Grid({ stations, networkLoad }) {
  return (
    <>
      <section className="page-head"><div><span className="eyebrow">GRID MONITORING · TELEMETRY</span><h2>Grid Load & Power Stability</h2><p>Monitor station-level utilization and identify high-load or critical locations.</p></div><div className="live-box">● LIVE TELEMETRY</div></section>
      <div className="grid-2">
        <Panel title="Network Utilization">
          <div className="large-number">{networkLoad}% <small>average load</small></div>
          <div className="large-track"><i style={{ width: `${networkLoad}%` }} /></div>
          <div className="grid-stats"><Stat label="Configured Capacity" value="1,710 kW" /><Stat label="Available Capacity" value={`${Math.round(1710 * (1 - networkLoad / 100))} kW`} /><Stat label="Peak Alert Level" value={networkLoad >= 85 ? "HIGH" : "NORMAL"} /></div>
        </Panel>
        <Panel title="Load Balancing Objective">
          <div className="callout">⚖️ Distribute demand across available charging capacity and maintain visibility into peak utilization.</div>
          <ul className="clean-list"><li>Monitor station-level power consumption</li><li>Track active charging sessions</li><li>Identify high-load and critical stations</li><li>Provide load data for balancing decisions</li></ul>
        </Panel>
        <Panel title="Station Load Map" wide>
          {stations.map(s => <div className="load-row" key={s.id}><div><b>{s.id} · {s.name}</b><small>{s.capacity} kW capacity</small></div><div className="large-track"><i className={s.load >= 90 ? "critical" : s.load >= 80 ? "high" : ""} style={{ width: `${s.load}%` }} /></div><strong>{s.load}%</strong></div>)}
        </Panel>
      </div>
    </>
  );
}

function Services() {
  return (
    <>
      <section className="page-head"><div><span className="eyebrow">CLOUD-NATIVE INFRASTRUCTURE</span><h2>Microservices & Infrastructure</h2><p>Target architecture for secure, discoverable and independently scalable services.</p></div></section>
      <div className="service-grid">{services.map(([name, desc, tag]) => <article className="service-card" key={name}><div className="service-icon">{tag.slice(0, 1)}</div><div><b>{name}</b><p>{desc}</p></div><span className="healthy">● READY</span></article>)}</div>
      <section className="architecture-card">
        <div className="table-title"><b>PS046 Service Architecture</b><span>Logical design</span></div>
        <div className="arch-row"><span>React Frontend</span><b>→</b><span>API Gateway</span><b>→</b><span>User</span><span>Station</span><span>Session</span><span>Billing</span></div>
        <div className="arch-row"><span>JWT Security</span><b>↕</b><span>Eureka Discovery</span><b>↕</b><span>Load Balancing</span><b>↕</b><span>Message Broker</span></div>
      </section>
    </>
  );
}

function Specifications() {
  return (
    <>
      <section className="page-head"><div><span className="eyebrow">CONTINUOUS EVALUATION · PS046</span><h2>Project Specifications</h2><p>Functional and architectural requirements represented directly in the frontend.</p></div></section>
      <section className="spec-grid">
        {requirements.map(([area, component, detail], i) => <article className="spec-card" key={area}><div className="spec-no">{String(i + 1).padStart(2, "0")}</div><div><b>{area}</b><span>{component}</span><p>{detail}</p></div></article>)}
      </section>
      <section className="architecture-card">
        <div className="table-title"><b>End-to-End EV Charging Flow</b><span>Project workflow</span></div>
        <div className="journey">{["User Login", "JWT Token", "Station Discovery", "Plug-in Event", "Active Session", "Energy Updates", "Grid Monitoring", "Session Completion", "Billing Event", "Invoice"].map((x, i) => <div key={x}><b>{i + 1}</b><span>{x}</span></div>)}</div>
      </section>
    </>
  );
}

function Panel({ title, action, onClick, children, wide }) {
  return <section className={`panel ${wide ? "wide" : ""}`}><div className="panel-head"><h3>{title}</h3>{action && <button className="link" onClick={onClick}>{action} ↗</button>}</div>{children}</section>;
}

function Metric({ label, value, sub, icon }) {
  return <div className="metric"><div className="metric-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>;
}

function Stat({ label, value }) { return <div className="stat"><small>{label}</small><b>{value}</b></div>; }

function Badge({ value }) {
  const v = String(value).toLowerCase();
  const cls = v.includes("critical") || v.includes("full") ? "bad" : v.includes("high") ? "warn" : v.includes("active") || v.includes("available") || v.includes("generated") ? "good" : "neutral";
  return <span className={`badge ${cls}`}>● {value}</span>;
}

function Empty({ text }) { return <div className="empty">{text}</div>; }

export default App;
