import React, { useState } from "react";

export interface BarItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export const BAR_ITEMS: BarItem[] = [
  // Beer
  { id: "star-lager", name: "Star Lager", price: 1500, category: "Beer" },
  { id: "heineken", name: "Heineken", price: 2000, category: "Beer" },
  { id: "guinness-stout", name: "Guinness Stout", price: 1700, category: "Beer" },
  { id: "gulder", name: "Gulder", price: 1500, category: "Beer" },
  { id: "trophy", name: "Trophy", price: 1400, category: "Beer" },
  { id: "hero", name: "Hero", price: 1500, category: "Beer" },
  { id: "budweiser", name: "Budweiser", price: 2000, category: "Beer" },
  { id: "legend-extra-stout", name: "Legend Extra Stout", price: 1600, category: "Beer" },
  { id: "goldberg", name: "Goldberg", price: 1500, category: "Beer" },

  // Spirits
  { id: "orijin-bitters", name: "Orijin bitters", price: 5500, category: "Spirits" },
  { id: "jameson", name: "Jameson", price: 65000, category: "Spirits" },
  { id: "jack-daniels", name: "Jack Daniel's", price: 85000, category: "Spirits" },
  { id: "vodka-smirnoff", name: "Vodka (Smirnoff)", price: 45000, category: "Spirits" },
  { id: "gin-beefeater", name: "Gin (Beefeater)", price: 30000, category: "Spirits" },
  { id: "tequila-sierra", name: "Tequila (Sierra)", price: 80000, category: "Spirits" },
  { id: "rum-bacardi", name: "Rum (Bacardi)", price: 35000, category: "Spirits" },
  { id: "hennessy-vs", name: "Hennessy VS", price: 90000, category: "Spirits" },
  { id: "johnnie-walker-red", name: "Johnnie Walker Red Label", price: 60000, category: "Spirits" },

  // Wine
  { id: "red-wine", name: "Red Wine", price: 18000, category: "Wine" },
  { id: "white-wine", name: "White Wine", price: 18000, category: "Wine" },
  { id: "rose-wine", name: "Rosé Wine", price: 20000, category: "Wine" },
  { id: "sparkling-wine", name: "Sparkling Wine", price: 28000, category: "Wine" },
];

interface BarItemCalculatorProps {
  quantities: Record<string, number>;
  onChangeQuantity: (itemId: string, newQty: number) => void;
  onClearAll: () => void;
  customItems?: BarItem[];
}

export default function BarItemCalculator({
  quantities,
  onChangeQuantity,
  onClearAll,
  customItems,
}: BarItemCalculatorProps) {
  const activeItems = (customItems && customItems.length > 0) ? customItems : BAR_ITEMS;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const rawCategories = Array.from(new Set(activeItems.map(item => item.category)));
  const categories = ["All", ...rawCategories];

  const filteredItems = activeItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalBottles = Object.values(quantities).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
  const totalPrice = activeItems.reduce((sum: number, item) => {
    const qty = quantities[item.id] || 0;
    return sum + qty * item.price;
  }, 0);

  return (
    <div className="laundry-calc-box" style={{ border: "1px solid rgba(255, 187, 0, 0.3)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14, width: "100%", boxSizing: "border-box" }}>
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <h4 style={{ margin: 0, color: "#FFBB00", fontSize: 15, fontWeight: 800, wordBreak: "break-word", lineHeight: 1.3 }}>
            🍾 Select Bar Menu Drinks &amp; Liquors
          </h4>
          <p style={{ margin: "4px 0 0 0", color: "#aaa", fontSize: 12, wordBreak: "break-word", lineHeight: 1.35 }}>
            Chilled beers, fine spirits, premium whiskies &amp; wines. Order total updates instantly!
          </p>
        </div>

        {totalBottles > 0 && (
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
            🗑️ Clear ({totalBottles} drinks)
          </button>
        )}
      </div>

      {/* Category Tabs & Search Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14, width: "100%", boxSizing: "border-box" }}>
        <input
          type="text"
          placeholder="🔍 Search drinks (e.g. Heineken, Jameson, Hennessy)..."
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
                background: selectedCategory === cat ? "#FFBB00" : "#1A1A1A",
                color: selectedCategory === cat ? "#000" : "#ccc",
                border: "1px solid",
                borderColor: selectedCategory === cat ? "#FFBB00" : "#333",
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
              <th style={{ padding: "10px 12px" }}>Drink Item</th>
              <th style={{ padding: "10px 12px" }}>Category</th>
              <th style={{ padding: "10px 12px" }}>Price</th>
              <th style={{ padding: "10px 12px", textAlign: "center", width: 140 }}>Quantity</th>
              <th style={{ padding: "10px 12px", textAlign: "right" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 20, textAlign: "center", color: "#666" }}>
                  No drinks found matching "{searchTerm}"
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
                      background: isSelected ? "rgba(255, 187, 0, 0.08)" : "transparent",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "8px 12px", color: isSelected ? "#FFBB00" : "#fff", fontWeight: isSelected ? 700 : 500 }}>
                      {item.name}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#888", fontSize: 12 }}>
                      {item.category}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#aaa" }}>
                      ₦{item.price.toLocaleString()}
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
                            background: isSelected ? "#261D00" : "#1A1A1A",
                            border: isSelected ? "1px solid #FFBB00" : "1px solid #333",
                            color: isSelected ? "#FFBB00" : "#fff",
                          }}
                        />
                        <button
                          type="button"
                          className="laundry-qty-btn"
                          onClick={() => onChangeQuantity(item.id, qty + 1)}
                          style={{
                            background: "rgba(255, 187, 0, 0.2)",
                            border: "1px solid #FFBB00",
                            color: "#FFBB00",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: isSelected ? "#FFBB00" : "#888", fontWeight: 700 }}>
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
            No drinks found matching "{searchTerm}"
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
                  background: isSelected ? "rgba(255, 187, 0, 0.1)" : "#141414",
                  border: isSelected ? "1px solid #FFBB00" : "1px solid #262626",
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
                  <span style={{ color: isSelected ? "#FFBB00" : "#fff", fontWeight: isSelected ? 800 : 600, fontSize: 14, minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.name}
                  </span>
                  <span style={{ color: "#aaa", fontSize: 13, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }}>
                    ₦{item.price.toLocaleString()}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: isSelected ? "#FFBB00" : "#888", fontSize: 12, fontWeight: 700, minWidth: 0, flex: "1 1 auto" }}>
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
                        background: isSelected ? "#261D00" : "#1A1A1A",
                        border: isSelected ? "1px solid #FFBB00" : "1px solid #333",
                        color: isSelected ? "#FFBB00" : "#fff",
                      }}
                    />
                    <button
                      type="button"
                      className="laundry-qty-btn"
                      onClick={() => onChangeQuantity(item.id, qty + 1)}
                      style={{
                        background: "rgba(255, 187, 0, 0.2)",
                        border: "1px solid #FFBB00",
                        color: "#FFBB00",
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

      {/* Notice & Live Summary */}
      <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: "#888", fontStyle: "italic", borderTop: "1px dashed #333", paddingTop: 8 }}>
        PRICES ARE SUBJECT TO CHANGE WITHOUT PRIOR NOTICE. THANK YOU FOR YOUR PATRONAGE!
      </div>

      <div
        style={{
          marginTop: 10,
          padding: "12px 14px",
          background: "#191400",
          border: "1px solid #FFBB00",
          borderRadius: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <span style={{ color: "#aaa", fontSize: 13 }}>Total Drinks Selected: </span>
          <strong style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>{totalBottles} item(s)</strong>
        </div>
        <div>
          <span style={{ color: "#aaa", fontSize: 13 }}>Calculated Total: </span>
          <strong style={{ color: "#FFBB00", fontSize: 18, fontWeight: 900 }}>₦{totalPrice.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}
