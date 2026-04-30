import { useState } from "react";

const C = {
  bg: "#0D1117", grid: "#161B22", border: "#30363D",
  wheat: "#D4A843", olive: "#6A9E4F", sage: "#8FBF6A",
  rust: "#B05A2F", cream: "#E8D5A3", muted: "#8B949E",
  red: "#F85149", green: "#3FB950", blue: "#58A6FF",
  purple: "#BC8CFF", orange: "#FFA657", pink: "#FF7B72",
  teal: "#39D0D8", text: "#C9D1D9", dim: "#484F58",
};

const GROUP_COLORS = {
  "Auth & Users": C.blue,
  "Posts": C.olive,
  "Catalog": C.wheat,
  "Social": C.purple,
  "Messaging": C.teal,
  "Market": C.orange,
  "Admin": C.red,
};

const TABLES = [
  {
    group: "Auth & Users", name: "profiles", phase: "core", x: 40, y: 60,
    fields: [
      { name: "id", type: "uuid", pk: true, fk: "auth.users" },
      { name: "full_name", type: "text", req: true },
      { name: "username", type: "text", req: true, unique: true },
      { name: "avatar_url", type: "text" },
      { name: "role", type: "enum", req: true, note: "farmer|trader|citizen|admin" },
      { name: "phone", type: "text" },
      { name: "bio", type: "text" },
      { name: "region_id", type: "uuid", fk: "regions" },
      { name: "city", type: "text" },
      { name: "show_phone", type: "bool", default: "true" },
      { name: "is_profile_completed", type: "bool", default: "false" },
      { name: "created_at", type: "timestamptz" },
      { name: "updated_at", type: "timestamptz" },
    ]
  },
  {
    group: "Auth & Users", name: "user_activities", phase: "mvp", x: 40, y: 520,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", fk: "profiles", req: true },
      { name: "category_id", type: "uuid", fk: "categories", req: true },
    ]
  },
  {
    group: "Auth & Users", name: "user_followed_regions", phase: "mvp", x: 40, y: 680,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", fk: "profiles", req: true },
      { name: "region_id", type: "uuid", fk: "regions", req: true },
      { name: "created_at", type: "timestamptz" },
    ]
  },
  {
    group: "Auth & Users", name: "notification_settings", phase: "later", x: 40, y: 840,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", fk: "profiles", req: true },
      { name: "new_post_region", type: "bool", default: "true" },
      { name: "new_post_activity", type: "bool", default: "true" },
      { name: "messages", type: "bool", default: "true" },
      { name: "platform", type: "bool", default: "true" },
      { name: "updated_at", type: "timestamptz" },
    ]
  },
  {
    group: "Catalog", name: "regions", phase: "core", x: 420, y: 60,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "name_ar", type: "text", req: true },
      { name: "name_fr", type: "text" },
      { name: "code", type: "text", unique: true },
      { name: "sort_order", type: "int" },
    ]
  },
  {
    group: "Catalog", name: "categories", phase: "core", x: 420, y: 280,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "name_ar", type: "text", req: true },
      { name: "name_fr", type: "text" },
      { name: "slug", type: "text", unique: true },
      { name: "icon", type: "text" },
      { name: "parent_id", type: "uuid", fk: "categories" },
      { name: "sort_order", type: "int" },
      { name: "is_active", type: "bool", default: "true" },
    ]
  },
  {
    group: "Catalog", name: "units", phase: "core", x: 420, y: 520,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "name_ar", type: "text", req: true },
      { name: "name_fr", type: "text" },
      { name: "symbol", type: "text", req: true },
      { name: "sort_order", type: "int" },
    ]
  },
  {
    group: "Posts", name: "posts", phase: "core", x: 800, y: 60,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", fk: "profiles", req: true },
      { name: "type", type: "enum", req: true, note: "sell|buy" },
      { name: "category_id", type: "uuid", fk: "categories", req: true },
      { name: "title", type: "text", req: true },
      { name: "description", type: "text" },
      { name: "quantity", type: "numeric", req: true },
      { name: "unit_id", type: "uuid", fk: "units", req: true },
      { name: "price", type: "numeric", req: true },
      { name: "is_negotiable", type: "bool", default: "false" },
      { name: "region_id", type: "uuid", fk: "regions", req: true },
      { name: "city", type: "text" },
      { name: "status", type: "enum", default: "active", note: "active|expired|deleted|suspended" },
      { name: "expires_at", type: "timestamptz", req: true },
      { name: "created_at", type: "timestamptz" },
      { name: "updated_at", type: "timestamptz" },
    ]
  },
  {
    group: "Posts", name: "post_images", phase: "mvp", x: 800, y: 600,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "post_id", type: "uuid", fk: "posts", req: true },
      { name: "url", type: "text", req: true },
      { name: "storage_path", type: "text", req: true },
      { name: "sort_order", type: "int", default: "0" },
      { name: "created_at", type: "timestamptz" },
    ]
  },
  {
    group: "Posts", name: "post_views", phase: "later", x: 800, y: 820,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "post_id", type: "uuid", fk: "posts", req: true },
      { name: "viewer_id", type: "uuid", fk: "profiles", note: "nullable" },
      { name: "ip_hash", type: "text" },
      { name: "created_at", type: "timestamptz" },
    ]
  },
  {
    group: "Posts", name: "post_contacts", phase: "later", x: 1180, y: 600,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "post_id", type: "uuid", fk: "posts", req: true },
      { name: "requester_id", type: "uuid", fk: "profiles", note: "nullable" },
      { name: "contact_type", type: "enum", note: "phone|whatsapp" },
      { name: "created_at", type: "timestamptz" },
    ]
  },
  {
    group: "Social", name: "saved_posts", phase: "mvp", x: 1180, y: 60,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", fk: "profiles", req: true },
      { name: "post_id", type: "uuid", fk: "posts", req: true },
      { name: "created_at", type: "timestamptz" },
    ]
  },
  {
    group: "Social", name: "reports", phase: "mvp", x: 1180, y: 280,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "reporter_id", type: "uuid", fk: "profiles", req: true },
      { name: "post_id", type: "uuid", fk: "posts" },
      { name: "reported_user_id", type: "uuid", fk: "profiles" },
      { name: "reason", type: "text", req: true },
      { name: "status", type: "enum", default: "pending", note: "pending|reviewed|dismissed" },
      { name: "created_at", type: "timestamptz" },
    ]
  },
  {
    group: "Social", name: "notifications", phase: "later", x: 1180, y: 460,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", fk: "profiles", req: true },
      { name: "type", type: "text", req: true },
      { name: "title", type: "text" },
      { name: "body", type: "text" },
      { name: "data", type: "jsonb" },
      { name: "is_read", type: "bool", default: "false" },
      { name: "created_at", type: "timestamptz" },
    ]
  },
  {
    group: "Market", name: "price_history", phase: "later", x: 420, y: 680,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "category_id", type: "uuid", fk: "categories", req: true },
      { name: "region_id", type: "uuid", fk: "regions" },
      { name: "unit_id", type: "uuid", fk: "units", req: true },
      { name: "min_price", type: "numeric", req: true },
      { name: "max_price", type: "numeric", req: true },
      { name: "recorded_at", type: "timestamptz", req: true },
    ]
  },
  {
    group: "Admin", name: "admin_logs", phase: "later", x: 800, y: 1000,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "admin_id", type: "uuid", fk: "profiles", req: true },
      { name: "action", type: "text", req: true },
      { name: "target_type", type: "text", note: "user|post|report" },
      { name: "target_id", type: "uuid" },
      { name: "details", type: "jsonb" },
      { name: "created_at", type: "timestamptz" },
    ]
  },
  {
    group: "Admin", name: "static_pages", phase: "later", x: 1180, y: 820,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "slug", type: "text", unique: true, req: true },
      { name: "title_ar", type: "text", req: true },
      { name: "content_ar", type: "text" },
      { name: "updated_at", type: "timestamptz" },
    ]
  },
];

const PHASE_COLORS = { core: C.green, mvp: C.wheat, later: C.muted };
const PHASE_LABELS = { core: "أساسي", mvp: "MVP", later: "لاحقاً" };

const TABLE_W = 260;
const ROW_H = 22;
const HEADER_H = 36;

function getTableHeight(t) {
  return HEADER_H + t.fields.length * ROW_H + 8;
}

export default function ERD() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [hoveredTable, setHoveredTable] = useState(null);

  const CANVAS_W = 1500;
  const CANVAS_H = 1250;

  const visibleTables = filter === "all" ? TABLES : TABLES.filter(t => t.phase === filter);

  const selectedTable = selected ? TABLES.find(t => t.name === selected) : null;

  return (
    <div style={{
      direction: "rtl",
      fontFamily: "'Cairo', 'Noto Sans Arabic', monospace",
      background: C.bg,
      minHeight: "100vh",
      color: C.text,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        background: C.grid,
      }}>
        <div>
          <span style={{ fontSize: 20, marginLeft: 8 }}>🌾</span>
          <span style={{ fontWeight: 800, color: C.wheat, fontSize: 16 }}>صوت الفلاح</span>
          <span style={{ color: C.muted, fontSize: 12, marginRight: 8 }}> — ERD تفاعلي</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginRight: "auto", flexWrap: "wrap" }}>
          {["all", "core", "mvp", "later"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "4px 14px",
              borderRadius: 20,
              border: `1px solid ${f === "all" ? C.blue : PHASE_COLORS[f] || C.blue}`,
              background: filter === f ? (f === "all" ? C.blue : PHASE_COLORS[f] || C.blue) : "transparent",
              color: filter === f ? "#fff" : C.muted,
              fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: 600,
            }}>
              {f === "all" ? "الكل" : PHASE_LABELS[f]}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: C.muted }}>
          {Object.entries(GROUP_COLORS).map(([g, c]) => (
            <span key={g} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />
              {g}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Canvas */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <svg width={CANVAS_W} height={CANVAS_H} style={{ display: "block" }}>
            {/* Grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.dim} strokeWidth="0.3" opacity="0.4" />
              </pattern>
            </defs>
            <rect width={CANVAS_W} height={CANVAS_H} fill="url(#grid)" />

            {/* Group Labels */}
            {Object.entries(GROUP_COLORS).map(([group, color]) => {
              const groupTables = visibleTables.filter(t => t.group === group);
              if (!groupTables.length) return null;
              const minX = Math.min(...groupTables.map(t => t.x)) - 10;
              const minY = Math.min(...groupTables.map(t => t.y)) - 30;
              const maxX = Math.max(...groupTables.map(t => t.x + TABLE_W)) + 10;
              const maxY = Math.max(...groupTables.map(t => t.y + getTableHeight(t))) + 10;
              return (
                <g key={group}>
                  <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY}
                    fill={`${color}06`} stroke={`${color}25`} strokeWidth={1} strokeDasharray="4 4" rx={8} />
                  <text x={minX + 8} y={minY + 16} fill={`${color}90`} fontSize={10} fontWeight={700} fontFamily="Cairo, sans-serif">{group}</text>
                </g>
              );
            })}

            {/* Tables */}
            {visibleTables.map(table => {
              const color = GROUP_COLORS[table.group] || C.muted;
              const ph = PHASE_COLORS[table.phase];
              const h = getTableHeight(table);
              const isSelected = selected === table.name;
              const isHovered = hoveredTable === table.name;

              return (
                <g key={table.name} style={{ cursor: "pointer" }}
                  onClick={() => setSelected(isSelected ? null : table.name)}
                  onMouseEnter={() => setHoveredTable(table.name)}
                  onMouseLeave={() => setHoveredTable(null)}>

                  {/* Shadow */}
                  <rect x={table.x + 3} y={table.y + 3} width={TABLE_W} height={h}
                    fill="rgba(0,0,0,0.4)" rx={8} />

                  {/* Body */}
                  <rect x={table.x} y={table.y} width={TABLE_W} height={h}
                    fill={C.grid} stroke={isSelected ? color : isHovered ? `${color}80` : C.border}
                    strokeWidth={isSelected ? 2 : 1} rx={8} />

                  {/* Header */}
                  <rect x={table.x} y={table.y} width={TABLE_W} height={HEADER_H}
                    fill={`${color}22`} stroke="none" rx={8} />
                  <rect x={table.x} y={table.y + HEADER_H - 8} width={TABLE_W} height={8}
                    fill={`${color}22`} stroke="none" />

                  {/* Phase dot */}
                  <circle cx={table.x + TABLE_W - 12} cy={table.y + HEADER_H / 2} r={5}
                    fill={ph} opacity={0.9} />

                  {/* Table name */}
                  <text x={table.x + 12} y={table.y + HEADER_H / 2 + 5}
                    fill={color} fontSize={13} fontWeight={800} fontFamily="monospace">
                    {table.name}
                  </text>

                  {/* Fields */}
                  {table.fields.map((field, fi) => {
                    const fy = table.y + HEADER_H + fi * ROW_H + 4;
                    const isLast = fi === table.fields.length - 1;
                    return (
                      <g key={field.name}>
                        {!isLast && <line x1={table.x + 8} y1={fy + ROW_H - 1} x2={table.x + TABLE_W - 8} y2={fy + ROW_H - 1}
                          stroke={C.dim} strokeWidth={0.5} opacity={0.4} />}

                        {/* PK indicator */}
                        {field.pk && <text x={table.x + 8} y={fy + 14} fontSize={9} fill={C.wheat} fontWeight={700}>PK</text>}
                        {field.fk && !field.pk && <text x={table.x + 8} y={fy + 14} fontSize={9} fill={C.purple} fontWeight={700}>FK</text>}
                        {!field.pk && !field.fk && field.unique && <text x={table.x + 8} y={fy + 14} fontSize={9} fill={C.teal} fontWeight={700}>UQ</text>}

                        {/* Field name */}
                        <text x={table.x + 30} y={fy + 14}
                          fill={field.pk ? C.wheat : field.req ? C.text : C.muted}
                          fontSize={11} fontFamily="monospace" fontWeight={field.pk ? 700 : 400}>
                          {field.name}
                          {field.req && !field.pk ? " *" : ""}
                        </text>

                        {/* Field type */}
                        <text x={table.x + TABLE_W - 8} y={fy + 14}
                          fill={`${color}80`} fontSize={9} fontFamily="monospace" textAnchor="end">
                          {field.type}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Side panel */}
        <div style={{
          width: selectedTable ? 280 : 0,
          overflow: "hidden",
          transition: "width 0.3s",
          borderRight: selectedTable ? `1px solid ${C.border}` : "none",
          background: C.grid,
          flexShrink: 0,
        }}>
          {selectedTable && (() => {
            const color = GROUP_COLORS[selectedTable.group];
            return (
              <div style={{ padding: 20, width: 280 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color, fontFamily: "monospace" }}>{selectedTable.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{selectedTable.group}</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{
                    background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18,
                  }}>✕</button>
                </div>

                <div style={{
                  display: "inline-flex",
                  padding: "2px 10px",
                  borderRadius: 10,
                  background: `${PHASE_COLORS[selectedTable.phase]}20`,
                  color: PHASE_COLORS[selectedTable.phase],
                  fontSize: 11, fontWeight: 700, marginBottom: 16,
                }}>{PHASE_LABELS[selectedTable.phase]}</div>

                <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, fontWeight: 700 }}>الحقول ({selectedTable.fields.length})</div>

                {selectedTable.fields.map(f => (
                  <div key={f.name} style={{
                    padding: "8px 0",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{
                        fontFamily: "monospace", fontSize: 12,
                        color: f.pk ? C.wheat : f.fk ? C.purple : f.req ? C.text : C.muted,
                        fontWeight: f.pk ? 700 : 400,
                      }}>{f.name}{f.req && !f.pk ? " *" : ""}</span>
                      <span style={{ fontSize: 10, color: `${color}90`, fontFamily: "monospace" }}>{f.type}</span>
                    </div>
                    {(f.pk || f.fk || f.unique || f.note || f.default) && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {f.pk && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: `${C.wheat}20`, color: C.wheat }}>PRIMARY KEY</span>}
                        {f.fk && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: `${C.purple}20`, color: C.purple }}>→ {f.fk}</span>}
                        {f.unique && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: `${C.teal}20`, color: C.teal }}>UNIQUE</span>}
                        {f.default && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: `${C.dim}40`, color: C.muted }}>default: {f.default}</span>}
                        {f.note && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: `${C.dim}40`, color: C.muted }}>{f.note}</span>}
                      </div>
                    )}
                  </div>
                ))}

                {selectedTable.fields.filter(f => f.fk).length > 0 && (
                  <>
                    <div style={{ fontSize: 12, color: C.muted, margin: "16px 0 8px", fontWeight: 700 }}>العلاقات</div>
                    {selectedTable.fields.filter(f => f.fk).map(f => (
                      <div key={f.name} style={{
                        fontSize: 11, color: C.purple, padding: "4px 0",
                        display: "flex", gap: 6, alignItems: "center",
                      }}>
                        <span style={{ fontFamily: "monospace" }}>{f.name}</span>
                        <span style={{ color: C.dim }}>→</span>
                        <span style={{ fontFamily: "monospace", color: C.blue }}>{f.fk}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        padding: "10px 24px",
        borderTop: `1px solid ${C.border}`,
        background: C.grid,
        display: "flex",
        gap: 20,
        fontSize: 11,
        color: C.muted,
        flexWrap: "wrap",
      }}>
        <span><span style={{ color: C.wheat, fontWeight: 700 }}>PK</span> — مفتاح أساسي</span>
        <span><span style={{ color: C.purple, fontWeight: 700 }}>FK</span> — مفتاح أجنبي</span>
        <span><span style={{ color: C.teal, fontWeight: 700 }}>UQ</span> — فريد</span>
        <span><span style={{ color: C.text }}>*</span> — حقل إلزامي</span>
        <span style={{ marginRight: "auto" }}>اضغط على جدول لرؤية تفاصيله</span>
        <span style={{ display: "flex", gap: 10 }}>
          {Object.entries(PHASE_COLORS).map(([p, c]) => (
            <span key={p} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
              {PHASE_LABELS[p]}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
