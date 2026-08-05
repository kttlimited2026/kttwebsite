import React, { useState } from "react";
import { Service, Settings } from "../types";
import SvcCard from "../components/SvcCard";
import { WHY } from "../constants";
import LaundryItemCalculator from "../components/LaundryItemCalculator";
import FoodItemCalculator from "../components/FoodItemCalculator";
import BarItemCalculator from "../components/BarItemCalculator";

export default function Services({ svcs, goTo, settings }: { svcs: Service[]; goTo: (p: string, svc?: string) => void; settings?: Settings }) {
  const [laundryQuantities, setLaundryQuantities] = useState<Record<string, number>>({});
  const [foodQuantities, setFoodQuantities] = useState<Record<string, number>>({});
  const [barQuantities, setBarQuantities] = useState<Record<string, number>>({});

  const handleChangeLaundryQty = (itemId: string, qty: number) => {
    setLaundryQuantities(prev => ({ ...prev, [itemId]: qty }));
  };

  const handleClearLaundryQty = () => {
    setLaundryQuantities({});
  };

  const handleChangeFoodQty = (itemId: string, qty: number) => {
    setFoodQuantities(prev => ({ ...prev, [itemId]: qty }));
  };

  const handleClearFoodQty = () => {
    setFoodQuantities({});
  };

  const handleChangeBarQty = (itemId: string, qty: number) => {
    setBarQuantities(prev => ({ ...prev, [itemId]: qty }));
  };

  const handleClearBarQty = () => {
    setBarQuantities({});
  };

  return (<>
    <div className="page-hero"><div className="page-hero-inner">
      <div className="sec-lbl">What We Offer</div><h1 className="fd">Our Services</h1>
      <p>Four essential lifestyle services — select one and book in seconds.</p>
    </div></div>
    <div className="dash"><div className="dash-inner">
      <div className="dash-lbl">Tap any service card to get started</div>
      <div className="cards-grid">{svcs.map((s,i)=><SvcCard key={i} s={s} onBook={()=>goTo("booking")}/>)}</div>
    </div></div>

    {/* Dedicated Restaurant Menu & Price List Section */}
    <div className="sec" style={{ paddingTop: 20, paddingBottom: 20 }}>
      <div className="sec-hdr centered">
        <div className="sec-lbl">Restaurant Menu</div>
        <h2 className="fd sec-title">Food Delivery &amp; Meal Prep Menu</h2>
        <p className="sec-sub" style={{ margin: "0 auto" }}>
          Authentic Nigerian dishes, rich swallows, soups, and proteins. Select item quantities below to see your total instantly!
        </p>
      </div>

      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <FoodItemCalculator
          quantities={foodQuantities}
          onChangeQuantity={handleChangeFoodQty}
          onClearAll={handleClearFoodQty}
          customItems={settings?.customFoodItems}
        />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button
            onClick={() => goTo("booking")}
            style={{
              background: "linear-gradient(90deg, #39FF14, #28C80F)",
              color: "#000",
              border: "none",
              borderRadius: 10,
              padding: "14px 28px",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(57, 255, 20, 0.3)"
            }}
          >
            🍲 Order Food Delivery Now →
          </button>
        </div>
      </div>
    </div>

    {/* Dedicated Bar & Drinks Menu Section */}
    <div className="sec" style={{ paddingTop: 20, paddingBottom: 20 }}>
      <div className="sec-hdr centered">
        <div className="sec-lbl">Bar Menu &amp; Drinks</div>
        <h2 className="fd sec-title">Chilled Beers, Fine Spirits &amp; Wines</h2>
        <p className="sec-sub" style={{ margin: "0 auto" }}>
          Cold beers, premium whiskies, cognacs, tequilas, and fine red &amp; white wines delivered fast to your doorstep.
        </p>
      </div>

      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <BarItemCalculator
          quantities={barQuantities}
          onChangeQuantity={handleChangeBarQty}
          onClearAll={handleClearBarQty}
          customItems={settings?.customBarItems}
        />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button
            onClick={() => goTo("booking")}
            style={{
              background: "linear-gradient(90deg, #FFBB00, #E0A200)",
              color: "#000",
              border: "none",
              borderRadius: 10,
              padding: "14px 28px",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(255, 187, 0, 0.3)"
            }}
          >
            🍾 Order Bar &amp; Drinks Now →
          </button>
        </div>
      </div>
    </div>

    {/* Dedicated Laundry Itemized Price List Section */}
    <div className="sec" style={{ paddingTop: 20 }}>
      <div className="sec-hdr centered">
        <div className="sec-lbl">Itemized Laundry Rates</div>
        <h2 className="fd sec-title">Laundry &amp; Dry Cleaning Price List</h2>
        <p className="sec-sub" style={{ margin: "0 auto" }}>
          Transparent, per-item rates for all your garments, bedding, and home fabrics in Abuja. Select piece counts below for instant price calculation!
        </p>
      </div>

      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <LaundryItemCalculator
          quantities={laundryQuantities}
          onChangeQuantity={handleChangeLaundryQty}
          onClearAll={handleClearLaundryQty}
          customItems={settings?.customLaundryItems}
        />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button
            onClick={() => goTo("booking")}
            style={{
              background: "linear-gradient(90deg, #FF5E00, #E05300)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "14px 28px",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(255, 94, 0, 0.3)"
            }}
          >
            🧺 Proceed to Book Laundry Service Now →
          </button>
        </div>
      </div>
    </div>

    <div className="sec"><div className="sec-hdr centered"><div className="sec-lbl">Why KTT</div><h2 className="fd sec-title">The KTT difference</h2></div>
      <div className="why-grid">{WHY.map((w,i)=><div key={i} className="why-card"><div className="why-ico">{w.icon}</div><div><h4>{w.title}</h4><p>{w.desc}</p></div></div>)}</div>
    </div>
  </>);
}
