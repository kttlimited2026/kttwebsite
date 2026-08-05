import React, { useState } from "react";

export interface LaundryItem {
  id: string;
  name: string;
  price: number;
  category: string;
  priceDisplay?: string;
}

export const LAUNDRY_ITEMS: LaundryItem[] = [
  // Everyday Wear
  { id: "t-shirt", name: "T-Shirt", price: 500, category: "Everyday Wear" },
  { id: "polo-shirt", name: "Polo Shirt", price: 500, category: "Everyday Wear" },
  { id: "shirt", name: "Shirt (Long/Short Sleeve)", price: 600, category: "Everyday Wear" },
  { id: "trouser", name: "Trouser", price: 500, category: "Everyday Wear" },
  { id: "jeans", name: "Jeans", price: 1000, category: "Everyday Wear" },
  { id: "shorts", name: "Shorts", price: 500, category: "Everyday Wear" },
  { id: "skirt", name: "Skirt", price: 500, category: "Everyday Wear" },
  { id: "blouse", name: "Blouse", price: 500, category: "Everyday Wear" },
  { id: "childrens-wear", name: "Children’s Wear", price: 500, category: "Everyday Wear" },
  { id: "school-uniform", name: "School Uniform", price: 500, category: "Everyday Wear" },

  // Traditional & Executive
  { id: "native-top", name: "Native Top", price: 1000, category: "Traditional & Executive" },
  { id: "senator-wear", name: "Senator Wear", price: 1500, category: "Traditional & Executive" },
  { id: "suit-2pc", name: "Suit (2 Piece)", price: 2000, category: "Traditional & Executive" },
  { id: "suit-3pc", name: "Suit (3 Piece)", price: 4000, category: "Traditional & Executive" },
  { id: "blazer", name: "Blazer", price: 2000, category: "Traditional & Executive" },
  { id: "waistcoat", name: "Waistcoat", price: 1500, category: "Traditional & Executive" },
  { id: "agbada", name: "Agbada", price: 2500, category: "Traditional & Executive" },
  { id: "kaftan", name: "Kaftan", price: 1500, category: "Traditional & Executive" },

  // Dresses & Outerwear
  { id: "dress-short", name: "Dress (Short)", price: 1500, category: "Dresses & Outerwear" },
  { id: "dress-long", name: "Dress (Long/Evening)", price: 1500, category: "Dresses & Outerwear" },
  { id: "jacket", name: "Jacket", price: 1500, category: "Dresses & Outerwear" },
  { id: "winter-coat", name: "Winter Coat", price: 2500, category: "Dresses & Outerwear" },
  { id: "leather-jacket", name: "Leather Jacket", price: 3000, category: "Dresses & Outerwear" },

  // Bedding & Home
  { id: "bedsheet-single", name: "Bed Sheet (Single)", price: 1500, category: "Bedding & Home" },
  { id: "bedsheet-double", name: "Bed Sheet (Double)", price: 2000, category: "Bedding & Home" },
  { id: "duvet-single", name: "Duvet (Single)", price: 2500, category: "Bedding & Home" },
  { id: "duvet-double", name: "Duvet (Double/King)", price: 4000, category: "Bedding & Home" },
  { id: "pillow-case", name: "Pillow Case", price: 200, category: "Bedding & Home" },
  { id: "blanket", name: "Blanket", price: 2000, category: "Bedding & Home" },
  { id: "curtain-panel", name: "Curtain (per panel)", price: 1500, priceDisplay: "1,500 – 3,000", category: "Bedding & Home" },
  { id: "carpet", name: "Carpet", price: 4000, category: "Bedding & Home" },
  { id: "rug", name: "Rug", price: 3000, category: "Bedding & Home" },

  // Specialty & Delicate
  { id: "sofa-cleaning", name: "Sofa Cleaning", price: 12000, category: "Specialty & Delicate" },
  { id: "wedding-gown", name: "Wedding Gown", price: 11000, category: "Specialty & Delicate" }
];

interface LaundryItemCalculatorProps {
  quantities: Record<string, number>;
  onChangeQuantity: (itemId: string, newQty: number) => void;
  onClearAll: () => void;
  customItems?: LaundryItem[];
}

export default function LaundryItemCalculator({
  quantities,
  onChangeQuantity,
  onClearAll,
  customItems,
}: LaundryItemCalculatorProps) {
  const activeItems = (customItems && customItems.length > 0) ? customItems : LAUNDRY_ITEMS;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const rawCategories = Array.from(new Set(activeItems.map(item => item.category)));
  const categories = ["All", ...rawCategories];

  const filteredItems = activeItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPieces = Object.values(quantities).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
  const totalPrice = activeItems.reduce((sum, item) => {
    const qty = quantities[item.id] || 0;
    return sum + qty * item.price;
  }, 0);

  return (
    <div className="laundry-calc-box">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14, width: "100%", boxSizing: "border-box" }}>
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <h4 style={{ margin: 0, color: "#39FF14", fontSize: 15, fontWeight: 800, wordBreak: "break-word", lineHeight: 1.3 }}>
            🧺 Select Laundry Items &amp; Quantities
          </h4>
          <p style={{ margin: "4px 0 0 0", color: "#aaa", fontSize: 12, wordBreak: "break-word", lineHeight: 1.35 }}>
            Add piece counts for garments or bedding. Total updates instantly!
          </p>
        </div>

        {totalPieces > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            style={{
              background: "rgba(255, 107, 107, 0.15)",
              color: "#FF6B6B",
              border: "1px solid rgba(255, 107, 107, 0.4)",
              borderRadius: 8,
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            🗑️ Clear ({totalPieces} items)
          </button>
        )}
      </div>

      {/* Category Tabs & Search Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14, width: "100%", boxSizing: "border-box" }}>
        <input
          type="text"
          placeholder="🔍 Search laundry item (e.g. Suit, Duvet, Shirt)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: "#161616",
            border: "1px solid #333",
            color: "#fff",
            borderRadius: 8,
            padding: "9px 12px",
            fontSize: 13,
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
            maxWidth: "100%",
          }}
        />

        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, width: "100%", boxSizing: "border-box", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? "#39FF14" : "#1A1A1A",
                color: selectedCategory === cat ? "#000" : "#ccc",
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
              <th style={{ padding: "10px 12px" }}>Item Name</th>
              <th style={{ padding: "10px 12px" }}>Price per Unit</th>
              <th style={{ padding: "10px 12px", textAlign: "center", width: 140 }}>Quantity</th>
              <th style={{ padding: "10px 12px", textAlign: "right" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#666" }}>
                  No items found matching "{searchTerm}"
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
                    <td style={{ padding: "8px 12px", color: isSelected ? "#39FF14" : "#fff", fontWeight: isSelected ? 700 : 500 }}>
                      {item.name}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#aaa" }}>
                      ₦{item.priceDisplay || item.price.toLocaleString()}
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
            No items found matching "{searchTerm}"
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
                    ₦{item.priceDisplay || item.price.toLocaleString()}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: isSelected ? "#39FF14" : "#888", fontSize: 12, fontWeight: 700, minWidth: 0, flex: "1 1 auto" }}>
                    {isSelected ? `Subtotal: ₦${subtotal.toLocaleString()}` : item.category}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
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
          <span style={{ color: "#aaa", fontSize: 13 }}>Total Pieces: </span>
          <strong style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>{totalPieces} piece(s)</strong>
        </div>
        <div>
          <span style={{ color: "#aaa", fontSize: 13 }}>Calculated Total: </span>
          <strong style={{ color: "#39FF14", fontSize: 18, fontWeight: 900 }}>₦{totalPrice.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}
