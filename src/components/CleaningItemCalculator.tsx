import React, { useState } from "react";

export interface CleaningItem {
  id: string;
  name: string;
  category: "Home Cleaning" | "Office Cleaning" | "Deep Cleaning";
  price: number;
  unit: string;
  description?: string;
}

export const CLEANING_ITEMS: CleaningItem[] = [
  { id: "living_room", name: "Living Room / Parlour", category: "Home Cleaning", price: 4000, unit: "room", description: "Dusting, floor scrubbing, furniture wipe & vacuum" },
  { id: "bedroom_std", name: "Standard Bedroom", category: "Home Cleaning", price: 3000, unit: "room", description: "Bed making, wardrobe exterior dusting, floor mop" },
  { id: "bedroom_master", name: "Master Bedroom Suite", category: "Home Cleaning", price: 4500, unit: "room", description: "Detailed dusting, suite polish, floor sanitize" },
  { id: "kitchen_deep", name: "Kitchen Deep Degreasing", category: "Home Cleaning", price: 6000, unit: "kitchen", description: "Stove top degreasing, sink polish, cabinet wipe" },
  { id: "bathroom_sanitize", name: "Bathroom & Toilet Scrub", category: "Home Cleaning", price: 3500, unit: "bathroom", description: "Tile bleaching, toilet disinfection, mirror polish" },
  { id: "balcony_veranda", name: "Balcony / Veranda Wash", category: "Home Cleaning", price: 2500, unit: "area", description: "Railing wipe & patio floor pressure wash" },
  
  { id: "office_desk", name: "Office Workstation / Desk", category: "Office Cleaning", price: 1500, unit: "desk", description: "Screen dusting, cable tidy, desk sanitize" },
  { id: "exec_office", name: "Executive Office Suite", category: "Office Cleaning", price: 6000, unit: "office", description: "Desk, executive chair polish, carpet vacuum & trash dump" },
  { id: "conference_rm", name: "Conference / Boardroom", category: "Office Cleaning", price: 8000, unit: "room", description: "Table polish, chair wipe, glass board clean" },
  { id: "reception_lobby", name: "Reception Lobby & Entry", category: "Office Cleaning", price: 7000, unit: "area", description: "Floor buff, glass door polish, seating area sanitize" },
  
  { id: "post_construction", name: "Post-Construction Deep Scrub", category: "Deep Cleaning", price: 15000, unit: "space", description: "Paint spot removal, cement dust scrubbing, full polish" },
  { id: "move_in_out", name: "Move-In / Move-Out Sanitize", category: "Deep Cleaning", price: 12000, unit: "flat", description: "Comprehensive wall, cabinet, drawer & floor deep wash" },
  { id: "sofa_upholstery", name: "Sofa / Upholstery Shampoo", category: "Deep Cleaning", price: 5000, unit: "seat", description: "Fabric stain removal & anti-bacterial deep steam wash" },
  { id: "carpet_wash", name: "Carpet & Rug Wash", category: "Deep Cleaning", price: 4000, unit: "rug", description: "Deep foam wash, dirt extraction & deodorizing" },
];

interface Props {
  quantities: Record<string, number>;
  onChangeQuantity: (itemId: string, qty: number) => void;
  onClearAll: () => void;
  customItems?: CleaningItem[];
}

export default function CleaningItemCalculator({
  quantities,
  onChangeQuantity,
  onClearAll,
  customItems,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const items = customItems && customItems.length > 0 ? customItems : CLEANING_ITEMS;

  const categories = ["All", "Home Cleaning", "Office Cleaning", "Deep Cleaning"];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalRooms = Object.values(quantities).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + (quantities[item.id] || 0) * item.price, 0);

  return (
    <div className="laundry-calc-box">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <h4 style={{ color: "#39FF14", fontSize: 15, fontWeight: 800, margin: 0, wordBreak: "break-word", lineHeight: 1.3 }}>
            🧹 Interactive Cleaning Area &amp; Room Calculator
          </h4>
          <p style={{ color: "#aaa", fontSize: 12, margin: "2px 0 0 0", wordBreak: "break-word", lineHeight: 1.35 }}>
            Select rooms or cleaning spaces to calculate your estimate
          </p>
        </div>

        {totalRooms > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            style={{
              background: "rgba(255, 94, 0, 0.15)",
              border: "1px solid #FF5E00",
              color: "#FF5E00",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Clear Selections
          </button>
        )}
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: 12, width: "100%", boxSizing: "border-box" }}>
        <input
          type="text"
          placeholder="🔍 Search rooms e.g. Bedroom, Kitchen, Office, Sofa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 12px",
            background: "#161616",
            border: "1px solid #333",
            borderRadius: 8,
            color: "#fff",
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
            maxWidth: "100%",
          }}
        />
      </div>

      {/* Category Pills */}
      <div style={{ marginBottom: 12, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, width: "100%", boxSizing: "border-box", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? "#39FF14" : "#1A1A1A",
                color: selectedCategory === cat ? "#0A0A0A" : "#ccc",
                border: "1px solid",
                borderColor: selectedCategory === cat ? "#39FF14" : "#333",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 0.15s ease",
                flexShrink: 0,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Item Table View */}
      <div
        className="laundry-desktop-table"
        style={{
          maxHeight: 340,
          overflowY: "auto",
          overflowX: "auto",
          width: "100%",
          border: "1px solid #222",
          borderRadius: 10,
          background: "#111",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 480 }}>
          <thead>
            <tr
              style={{
                background: "#181818",
                borderBottom: "1px solid #282828",
                textAlign: "left",
                color: "#888",
                fontSize: 11,
                textTransform: "uppercase",
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              <th style={{ padding: "10px 12px" }}>Cleaning Space / Room</th>
              <th style={{ padding: "10px 12px" }}>Rate</th>
              <th style={{ padding: "10px 12px", textAlign: "center", width: 140 }}>Quantity</th>
              <th style={{ padding: "10px 12px", textAlign: "right" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#666" }}>
                  No cleaning options found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const qty = quantities[item.id] || 0;
                const subtotal = qty * item.price;
                const isSelected = qty > 0;

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid #1c1c1c",
                      background: isSelected ? "rgba(57, 255, 20, 0.06)" : "transparent",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ color: isSelected ? "#39FF14" : "#fff", fontWeight: isSelected ? 700 : 500 }}>
                        {item.name}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>{item.description}</div>
                      )}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#aaa", whiteSpace: "nowrap" }}>
                      ₦{item.price.toLocaleString()} /{item.unit}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <button
                          type="button"
                          className="laundry-qty-btn"
                          onClick={() => onChangeQuantity(item.id, Math.max(0, qty - 1))}
                          style={{
                            background: "#222",
                            border: "1px solid #444",
                            color: "#fff",
                          }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          className="laundry-qty-input"
                          value={qty === 0 ? "" : qty}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            onChangeQuantity(item.id, isNaN(val) ? 0 : Math.max(0, val));
                          }}
                          placeholder="0"
                          style={{
                            background: isSelected ? "#0A200A" : "#1A1A1A",
                            border: isSelected ? "1px solid #39FF14" : "1px solid #333",
                            color: isSelected ? "#39FF14" : "#fff",
                          }}
                        />
                        <button
                          type="button"
                          className="laundry-qty-btn"
                          onClick={() => onChangeQuantity(item.id, qty + 1)}
                          style={{
                            background: "rgba(57, 255, 20, 0.15)",
                            border: "1px solid #39FF14",
                            color: "#39FF14",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: isSelected ? "#39FF14" : "#888", fontWeight: 700 }}>
                      {isSelected ? `₦${subtotal.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Touch Card List View */}
      <div className="laundry-mobile-card-list" style={{ maxHeight: 380, overflowY: "auto", width: "100%", boxSizing: "border-box" }}>
        {filteredItems.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#666", fontSize: 13 }}>
            No options found matching "{searchTerm}"
          </div>
        ) : (
          filteredItems.map((item) => {
            const qty = quantities[item.id] || 0;
            const subtotal = qty * item.price;
            const isSelected = qty > 0;

            return (
              <div
                key={item.id}
                style={{
                  background: isSelected ? "rgba(57, 255, 20, 0.08)" : "#141414",
                  border: isSelected ? "1px solid #39FF14" : "1px solid #262626",
                  borderRadius: 10,
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ color: isSelected ? "#39FF14" : "#fff", fontWeight: isSelected ? 800 : 600, fontSize: 14, minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.name}
                  </span>
                  <span style={{ color: "#aaa", fontSize: 13, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }}>
                    ₦{item.price.toLocaleString()} /{item.unit}
                  </span>
                </div>

                {item.description && (
                  <div style={{ fontSize: 11, color: "#888", lineHeight: 1.3 }}>
                    {item.description}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)", width: "100%", boxSizing: "border-box" }}>
                  <span style={{ color: isSelected ? "#39FF14" : "#888", fontSize: 12, fontWeight: 700, minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {isSelected ? `Subtotal: ₦${subtotal.toLocaleString()}` : item.category}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <button
                      type="button"
                      className="laundry-qty-btn"
                      onClick={() => onChangeQuantity(item.id, Math.max(0, qty - 1))}
                      style={{
                        background: "#222",
                        border: "1px solid #444",
                        color: "#fff",
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        flexShrink: 0,
                        padding: 0
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      className="laundry-qty-input"
                      value={qty === 0 ? "" : qty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        onChangeQuantity(item.id, isNaN(val) ? 0 : Math.max(0, val));
                      }}
                      placeholder="0"
                      style={{
                        background: isSelected ? "#0A200A" : "#1A1A1A",
                        border: isSelected ? "1px solid #39FF14" : "1px solid #333",
                        color: isSelected ? "#39FF14" : "#fff",
                        width: 38,
                        height: 32,
                        minWidth: 38,
                        flexShrink: 0,
                        padding: 0,
                        textAlign: "center"
                      }}
                    />
                    <button
                      type="button"
                      className="laundry-qty-btn"
                      onClick={() => onChangeQuantity(item.id, qty + 1)}
                      style={{
                        background: "rgba(57, 255, 20, 0.15)",
                        border: "1px solid #39FF14",
                        color: "#39FF14",
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        flexShrink: 0,
                        padding: 0
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Live Selected Summary */}
      <div
        style={{
          marginTop: 12,
          padding: "12px 14px",
          background: "#051405",
          border: "1px solid #39FF14",
          borderRadius: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <span style={{ color: "#aaa", fontSize: 13 }}>Selected Areas: </span>
          <strong style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>{totalRooms} space(s)</strong>
        </div>

        <div>
          <span style={{ color: "#aaa", fontSize: 13 }}>Cleaning Subtotal: </span>
          <strong style={{ color: "#39FF14", fontSize: 17, fontWeight: 900 }}>
            ₦{totalAmount.toLocaleString()}
          </strong>
        </div>
      </div>
    </div>
  );
}
