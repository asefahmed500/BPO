"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { EASE_OUT } from "@/lib/motion-presets";

const metrics = [
  { label: "Active Agents", value: "1,247", change: "+12% vs last month" },
  { label: "Active Campaigns", value: "18", change: "+3 new this week" },
  { label: "CSAT Score", value: "94.2%", change: "+2.1% improvement" },
  { label: "Avg Response", value: "2.4 min", change: "18% faster" },
];

const weeklyData = [
  { day: "Mon", tickets: 1240 },
  { day: "Tue", tickets: 1480 },
  { day: "Wed", tickets: 1620 },
  { day: "Thu", tickets: 1380 },
  { day: "Fri", tickets: 1840 },
  { day: "Sat", tickets: 1560 },
  { day: "Sun", tickets: 1320 },
];

const agentStatus = [
  { label: "Available", count: 847, pct: 68, color: "#a7e5d3" },
  { label: "On Call", count: 312, pct: 25, color: "#c8b8e0" },
  { label: "Break", count: 68, pct: 5, color: "#f4c5a8" },
  { label: "Offline", count: 20, pct: 2, color: "#e7e5e4" },
];

const recentActivity = [
  { text: "Campaign 'Q3 Support' launched", time: "2 min ago", type: "success" },
  { text: "New agent batch onboarding completed", time: "15 min ago", type: "info" },
  { text: "CSAT alert triggered &mdash; Fintech vertical", time: "1 hr ago", type: "warning" },
  { text: "Weekly ops report generated", time: "3 hrs ago", type: "info" },
  { text: "Agent schedule updated &mdash; Night shift", time: "5 hrs ago", type: "update" },
];

interface NavItem {
  label: string;
  icon: string;
  active?: boolean;
  subItems?: string[];
}

const defaultNavItems: NavItem[] = [
  { label: "Overview", icon: "grid", active: true },
  { label: "Analytics", icon: "chart", subItems: ["Performance", "Reports", "Trends"] },
  { label: "Agents", icon: "users", subItems: ["Team", "Schedule", "Training"] },
  { label: "Campaigns", icon: "flag" },
  { label: "Clients", icon: "briefcase" },
  { label: "Settings", icon: "settings" },
];

function NavIcon({ name }: { name: string }) {
  const cls = "w-[18px] h-[18px] shrink-0";
  switch (name) {
    case "grid":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" /><rect width="7" height="7" x="14" y="3" /><rect width="7" height="7" x="3" y="14" /><rect width="7" height="7" x="14" y="14" /></svg>;
    case "chart":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>;
    case "users":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "flag":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg>;
    case "briefcase":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
    case "settings":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    default:
      return null;
  }
}

function CountUp({ end, enabled, suffix, duration = 1.2 }: { end: string; enabled: boolean; suffix?: string; duration?: number }) {
  const match = end.match(/^([\d.,]+)/);
  const numeric = match ? parseFloat(match[1].replace(/[,]/g, "")) : 0;
  const isDecimal = end.includes(".");
  const trailing = suffix ?? end.replace(/^[\d.,]+/, "");
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const controls = animate(0, numeric, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setCount(v),
    });
    return () => controls.stop();
  }, [enabled, numeric, duration]);
  if (!enabled) return <>{end}</>;
  return <>{isDecimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}{trailing}</>;
}

const chartPeriods = ["Week", "Month", "Quarter"];
const chartTicks = [2000, 1500, 1000, 500, 0];

function Chart({ data, visible }: { data: { day: string; tickets: number }[]; visible: boolean }) {
  const max = Math.max(...data.map((d) => d.tickets));
  const [period, setPeriod] = useState("Week");

  return (
    <div className="flex flex-col col-span-2 bg-white border border-[#e7e5e4] rounded-xl p-5 gap-4 transition-all duration-[400ms] ease-out">
      <div className="flex items-center justify-between">
        <span className="text-[#0c0a09] text-[15px] font-medium">Weekly Ticket Volume</span>
        <div className="flex items-center gap-1.5">
          {chartPeriods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all duration-200 ${
                period === p ? "bg-[#f0efed] text-[#0c0a09]" : "text-[#777169] hover:text-[#0c0a09]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between py-[2px] shrink-0 h-[160px]">
          {chartTicks.map((t) => (
            <span key={t} className="text-[#a8a29e] text-[11px] leading-none">{t.toLocaleString()}</span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative h-[160px]">
          {/* Horizontal grid lines */}
          {chartTicks.map((t) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-t border-[#f0efed]"
              style={{ bottom: `${(t / max) * 100}%` }}
            />
          ))}

          {/* Bars */}
          <div className="flex items-end justify-around h-full relative z-10">
            {data.map((d, i) => (
              <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-full flex justify-center px-[2px]">
                  <div
                    className="w-[70%] max-w-[28px] bg-[#292524] rounded-sm transition-all duration-[600ms] ease-out"
                    style={{
                      height: visible ? `${(d.tickets / max) * 100}%` : "0%",
                      transitionDelay: `${i * 60}ms`,
                    }}
                  />
                </div>
                <span className="text-[#4e4e4e] text-[11px] font-medium mt-1">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#f5f5f5]">
        <span className="text-[#777169] text-[11px]">{data.reduce((s, d) => s + d.tickets, 0).toLocaleString()} tickets handled this week</span>
        <span className="flex items-center gap-1 text-[#a7e5d3] text-[11px] font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
          +8.3% vs last week
        </span>
      </div>
    </div>
  );
}

export function DashboardSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const visible = useInView(sectionRef, { once: true, margin: "-100px" });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("Overview");
  const [activeSub, setActiveSub] = useState<string | null>(null);

  const totalAgents = agentStatus.reduce((s, a) => s + a.count, 0);

  return (
    <section ref={sectionRef} className="flex flex-col bg-[#f5f5f5] px-5 md:px-20 py-16 md:py-24 gap-8 overflow-hidden">
      <div className={`flex flex-col gap-3 max-w-[620px] transition-all duration-[400ms] ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <span className="text-[#777169] text-[12px] font-semibold tracking-[0.96px] uppercase">AI-Powered Operations</span>
        <h2 className="text-[#0c0a09] text-[32px] md:text-[36px] font-light leading-[1.17] tracking-[-0.36px]">
          Your entire BPO operation, at a glance
        </h2>
        <p className="text-[#4e4e4e] text-[16px] leading-[1.5] max-w-[540px]" style={{ letterSpacing: "0.16px" }}>
          Real-time visibility into every agent, campaign and KPI. Our AI layer surfaces anomalies, predicts attrition and recommends schedule optimizations before they become issues.
        </p>
      </div>

      <div className="relative rounded-2xl border border-[#e7e5e4] overflow-hidden bg-white transition-all duration-[600ms] ease-out"
        style={{
          boxShadow: visible ? "0 4px 24px rgba(0,0,0,0.04)" : "0 0 0 transparent",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transitionDelay: "100ms",
        }}
      >
        <div className="flex flex-col md:flex-row min-h-[520px]">
          {/* Sidebar */}
          <div className={`w-full md:w-[220px] shrink-0 bg-white border-b md:border-b-0 md:border-r border-[#e7e5e4] flex flex-col transition-all duration-[500ms] ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
            style={{ transitionDelay: "250ms" }}
          >
            <div className="flex items-center gap-2.5 px-4 h-[56px] border-b border-[#e7e5e4]">
              <div className="size-7 bg-[#292524] rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
              </div>
              <span className="text-[#0c0a09] text-[14px] font-medium">Northbridge</span>
            </div>

            <nav className="flex flex-col p-3 gap-0.5 flex-1">
              {defaultNavItems.map((item) => (
                <div key={item.label}>
                  <button
                    onClick={() => {
                      setActiveNav(item.label);
                      if (item.subItems) {
                        setOpenDropdown(openDropdown === item.label ? null : item.label);
                      }
                      setActiveSub(null);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                      activeNav === item.label && !item.subItems
                        ? "bg-[#f0efed] text-[#0c0a09]"
                        : "text-[#777169] hover:text-[#0c0a09] hover:bg-[#fafafa]"
                    }`}
                  >
                    <NavIcon name={item.icon} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.subItems && (
                      <svg
                        className={`w-3.5 h-3.5 text-[#a8a29e] transition-transform duration-200 ${openDropdown === item.label ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    )}
                  </button>
                  {item.subItems && openDropdown === item.label && (
                    <div className="flex flex-col ml-[10px] pl-[30px] border-l border-[#e7e5e4] gap-0.5 py-1">
                      {item.subItems.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => { setActiveSub(sub); setActiveNav(item.label); }}
                          className={`text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                            activeSub === sub
                              ? "bg-[#f0efed] text-[#0c0a09]"
                              : "text-[#777169] hover:text-[#0c0a09] hover:bg-[#fafafa]"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-3 px-4 py-3 border-t border-[#e7e5e4]">
              <div className="size-8 rounded-full bg-[#f0efed] flex items-center justify-center text-[#0c0a09] text-[13px] font-medium">JD</div>
              <div className="flex flex-col">
                <span className="text-[#0c0a09] text-[13px] font-medium">Jamal D.</span>
                <span className="text-[#777169] text-[11px]">Operations Lead</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-[#fafafa]">
            {/* Top bar */}
            <div className={`flex items-center px-5 h-[56px] border-b border-[#e7e5e4] bg-white transition-all duration-[400ms] ease-out ${visible ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: "350ms" }}
            >
              <div className="flex items-center gap-2 flex-1">
                <svg className="w-4 h-4 text-[#a8a29e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                <input
                  placeholder="Search campaigns, agents, reports..."
                  className="flex-1 bg-transparent text-[#0c0a09] text-[13px] outline-none placeholder:text-[#a8a29e]"
                  readOnly
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#777169] text-[12px]">Wed, Jul 3</span>
                <div className="relative">
                  <svg className="w-[18px] h-[18px] text-[#777169]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 4 9 4 9H2s4-2 4-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                  <span className="absolute -top-1 -right-1 size-4 bg-[#c8b8e0] rounded-full flex items-center justify-center text-white text-[9px] font-bold">3</span>
                </div>
              </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
              {metrics.map((m, i) => (
                <div
                  key={m.label}
                  className={`flex flex-col bg-white border border-[#e7e5e4] rounded-xl p-4 gap-1 transition-all duration-[400ms] ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: `${400 + i * 80}ms` }}
                >
                  <span className="text-[#777169] text-[11px] font-medium tracking-[0.3px] uppercase">{m.label}</span>
                  <span className="text-[#0c0a09] text-[24px] font-light leading-[1.2] tracking-[-0.4px]">
                    <CountUp end={m.value} enabled={visible} />
                  </span>
                  <span className="text-[#a7e5d3] text-[11px] font-medium">{m.change}</span>
                </div>
              ))}
            </div>

            {/* Two-column: Chart + AI Insight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-4 pb-3">
              <div
                className={`transition-all duration-[400ms] ease-out col-span-2 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "720ms" }}
              >
                <Chart data={weeklyData} visible={visible} />
              </div>

              {/* AI Insight */}
              <div
                className={`flex flex-col bg-white border border-[#e7e5e4] rounded-xl p-5 gap-3 transition-all duration-[400ms] ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "800ms" }}
              >
                <div className="flex items-center gap-2">
                  <div className="size-7 bg-[#292524] rounded-full flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 2a4 4 0 0 1 4 4c0 2-2 4-4 6-2-2-4-4-4-6a4 4 0 0 1 4-4z" />
                      <path d="M12 18v4" />
                      <path d="M8 22h8" />
                    </svg>
                  </div>
                  <span className="text-[#0c0a09] text-[14px] font-medium">AI Insight</span>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <span className="text-[#292524] text-[13px] font-medium">Attrition risk detected</span>
                  <p className="text-[#777169] text-[12px] leading-[1.5]">
                    4 agents in the Fintech vertical show declining sentiment scores. Recommend proactive check-in and schedule adjustment.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-[#e7e5e4]">
                  <span className="flex items-center gap-1 text-[#2b5c2b] text-[11px] font-medium">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                    94% confidence
                  </span>
                  <span className="text-[#777169] text-[11px] ml-auto">Updated 5 min ago</span>
                </div>
              </div>
            </div>

            {/* Bottom row: Agent Status + Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 pb-4">
              {/* Agent Status */}
              <div
                className={`flex flex-col bg-white border border-[#e7e5e4] rounded-xl p-5 gap-3 transition-all duration-[400ms] ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "880ms" }}
              >
                <span className="text-[#0c0a09] text-[14px] font-medium">Agent Status</span>
                <div className="flex h-2 bg-[#f0efed] rounded-full overflow-hidden">
                  {agentStatus.map((s) => (
                    <div key={s.label} className="h-full transition-all duration-[800ms] ease-out" style={{
                      width: visible ? `${s.pct}%` : "0%",
                      backgroundColor: s.color,
                      transitionDelay: "1s",
                    }} />
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {agentStatus.map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-0.5">
                      <span className="text-[#0c0a09] text-[18px] font-light">{s.count}</span>
                      <span className="text-[#777169] text-[10px] text-center">{s.label}</span>
                    </div>
                  ))}
                </div>
                <span className="text-[#777169] text-[11px]">{totalAgents.toLocaleString()} total agents online</span>
              </div>

              {/* Recent Activity */}
              <div
                className={`flex flex-col bg-white border border-[#e7e5e4] rounded-xl p-5 gap-3 transition-all duration-[400ms] ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "960ms" }}
              >
                <span className="text-[#0c0a09] text-[14px] font-medium">Recent Activity</span>
                <div className="flex flex-col gap-2.5">
                  {recentActivity.map((act, i) => (
                    <div
                      key={act.text}
                      className={`flex items-start gap-2.5 transition-all duration-[400ms] ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                      style={{ transitionDelay: `${1000 + i * 80}ms` }}
                    >
                      <div className={`size-2 rounded-full mt-[5px] shrink-0 ${
                        act.type === "success" ? "bg-[#a7e5d3]" :
                        act.type === "warning" ? "bg-[#f4c5a8]" :
                        "bg-[#c8b8e0]"
                      }`} />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[#0c0a09] text-[13px]" dangerouslySetInnerHTML={{ __html: act.text }} />
                        <span className="text-[#777169] text-[11px]">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
