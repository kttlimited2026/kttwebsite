import React, { useState } from "react";
import { dbService } from "../services/dbService";
import { Settings, Booking } from "../types";
import LaundryItemCalculator, { LAUNDRY_ITEMS } from "../components/LaundryItemCalculator";
import FoodItemCalculator, { FOOD_ITEMS } from "../components/FoodItemCalculator";
import BarItemCalculator, { BAR_ITEMS } from "../components/BarItemCalculator";
import CleaningItemCalculator, { CLEANING_ITEMS } from "../components/CleaningItemCalculator";

export default function BookingPage({ pre, settings, initialCode }: { pre?: string; settings?: Settings; initialCode?: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"pending" | "sent" | "failed">("pending");
  const [paidRef, setPaidRef] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", altPhone: "", service: pre || "", date: "", time: "", address: "", notes: "" });

  React.useEffect(() => {
    if (pre) {
      setForm(f => ({ ...f, service: pre }));
    }
  }, [pre]);
  
  const [isExpress, setIsExpress] = useState(false);
  const [referralCode, setReferralCode] = useState(initialCode || "");
  const [promoApplied, setPromoApplied] = useState(!!initialCode);

  const [laundryQuantities, setLaundryQuantities] = useState<Record<string, number>>({});
  const [foodQuantities, setFoodQuantities] = useState<Record<string, number>>({});
  const [barQuantities, setBarQuantities] = useState<Record<string, number>>({});
  const [cleaningQuantities, setCleaningQuantities] = useState<Record<string, number>>({});

  const expressFeeVal = Number(settings?.expressFee || "5000");
  const referralDiscountVal = Number(settings?.referralDiscountAmount || "1000");
  const referralMinOrderVal = Number(settings?.referralMinOrder || "5000");

  const [promoError, setPromoError] = useState("");

  const h = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const targetEmail = settings?.email || "Chatkttlimited@gmail.com";

  const isLaundryService = form.service.includes("Laundry");
  const isFoodService = form.service.includes("Food") || form.service.includes("Meal");
  const isBarService = form.service.includes("Bar") || form.service.includes("Drink") || form.service.includes("Beer") || form.service.includes("Wine");
  const isCombinedFoodBar = form.service.includes("Combined");
  const isCleaningService = form.service.includes("Cleaning") && !isLaundryService;
  const isPlanService = form.service.includes("Plan") || form.service.includes("Subscription") || form.service.includes("Starter") || form.service.includes("Classic") || form.service.includes("Premium");

  const showFoodCalc = isFoodService || isCombinedFoodBar;
  const showBarCalc = isBarService || isCombinedFoodBar;
  const showLaundryCalc = isLaundryService;
  const showCleaningCalc = isCleaningService;

  const activeLaundryItems = (settings?.customLaundryItems && settings.customLaundryItems.length > 0) ? settings.customLaundryItems : LAUNDRY_ITEMS;
  const activeFoodItems = (settings?.customFoodItems && settings.customFoodItems.length > 0) ? settings.customFoodItems : FOOD_ITEMS;
  const activeBarItems = (settings?.customBarItems && settings.customBarItems.length > 0) ? settings.customBarItems : BAR_ITEMS;
  const activeCleaningItems = CLEANING_ITEMS;

  // Laundry
  const totalLaundryPieces = showLaundryCalc
    ? Object.values(laundryQuantities).reduce((a: number, b: number) => a + (Number(b) || 0), 0)
    : 0;

  const laundryCalculatedTotal = showLaundryCalc
    ? activeLaundryItems.reduce((sum: number, item) => sum + (laundryQuantities[item.id] || 0) * item.price, 0)
    : 0;

  const selectedLaundrySummaryList = showLaundryCalc && Number(totalLaundryPieces) > 0
    ? activeLaundryItems
        .filter(item => (laundryQuantities[item.id] || 0) > 0)
        .map(item => `${laundryQuantities[item.id]}x ${item.name} (₦${((laundryQuantities[item.id] || 0) * item.price).toLocaleString()})`)
    : [];

  const selectedLaundrySummaryText = selectedLaundrySummaryList.join(", ");

  const handleChangeLaundryQty = (itemId: string, qty: number) => setLaundryQuantities(prev => ({ ...prev, [itemId]: qty }));
  const handleClearLaundryQty = () => setLaundryQuantities({});

  // Food
  const totalFoodPortions = showFoodCalc
    ? Object.values(foodQuantities).reduce((a: number, b: number) => a + (Number(b) || 0), 0)
    : 0;

  const foodCalculatedTotal = showFoodCalc
    ? activeFoodItems.reduce((sum: number, item) => sum + (foodQuantities[item.id] || 0) * item.price, 0)
    : 0;

  const selectedFoodSummaryList = showFoodCalc && Number(totalFoodPortions) > 0
    ? activeFoodItems
        .filter(item => (foodQuantities[item.id] || 0) > 0)
        .map(item => `${foodQuantities[item.id]}x ${item.name} (₦${((foodQuantities[item.id] || 0) * item.price).toLocaleString()})`)
    : [];

  const selectedFoodSummaryText = selectedFoodSummaryList.join(", ");

  const handleChangeFoodQty = (itemId: string, qty: number) => setFoodQuantities(prev => ({ ...prev, [itemId]: qty }));
  const handleClearFoodQty = () => setFoodQuantities({});

  // Bar
  const totalBarBottles = showBarCalc
    ? Object.values(barQuantities).reduce((a: number, b: number) => a + (Number(b) || 0), 0)
    : 0;

  const barCalculatedTotal = showBarCalc
    ? activeBarItems.reduce((sum: number, item) => sum + (barQuantities[item.id] || 0) * item.price, 0)
    : 0;

  const selectedBarSummaryList = showBarCalc && Number(totalBarBottles) > 0
    ? activeBarItems
        .filter(item => (barQuantities[item.id] || 0) > 0)
        .map(item => `${barQuantities[item.id]}x ${item.name} (₦${((barQuantities[item.id] || 0) * item.price).toLocaleString()})`)
    : [];

  const selectedBarSummaryText = selectedBarSummaryList.join(", ");

  const handleChangeBarQty = (itemId: string, qty: number) => setBarQuantities(prev => ({ ...prev, [itemId]: qty }));
  const handleClearBarQty = () => setBarQuantities({});

  // Cleaning
  const totalCleaningSpaces = showCleaningCalc
    ? Object.values(cleaningQuantities).reduce((a: number, b: number) => a + (Number(b) || 0), 0)
    : 0;

  const cleaningCalculatedTotal = showCleaningCalc
    ? activeCleaningItems.reduce((sum: number, item) => sum + (cleaningQuantities[item.id] || 0) * item.price, 0)
    : 0;

  const selectedCleaningSummaryList = showCleaningCalc && Number(totalCleaningSpaces) > 0
    ? activeCleaningItems
        .filter(item => (cleaningQuantities[item.id] || 0) > 0)
        .map(item => `${cleaningQuantities[item.id]}x ${item.name} (₦${((cleaningQuantities[item.id] || 0) * item.price).toLocaleString()})`)
    : [];

  const selectedCleaningSummaryText = selectedCleaningSummaryList.join(", ");

  const handleChangeCleaningQty = (itemId: string, qty: number) => setCleaningQuantities(prev => ({ ...prev, [itemId]: qty }));
  const handleClearCleaningQty = () => setCleaningQuantities({});

  const getBasePrice = (serviceName: string) => {
    if (serviceName.includes("Laundry")) {
      return Number(totalLaundryPieces) > 0 ? laundryCalculatedTotal : 5000;
    }
    if (serviceName.includes("Food") || serviceName.includes("Meal") || serviceName.includes("Bar") || serviceName.includes("Drink") || serviceName.includes("Combined")) {
      const foodBarSum = (showFoodCalc ? foodCalculatedTotal : 0) + (showBarCalc ? barCalculatedTotal : 0);
      return foodBarSum > 0 ? foodBarSum : (serviceName.includes("Food") ? 3500 : 2000);
    }
    if (serviceName.includes("Cleaning")) {
      return Number(totalCleaningSpaces) > 0 ? cleaningCalculatedTotal : (serviceName.includes("Office") ? 25000 : 15000);
    }
    if (serviceName.includes("Starter")) return 15000;
    if (serviceName.includes("Classic")) return 28500;
    if (serviceName.includes("Premium")) return 49000;
    if (serviceName.includes("Plan") || serviceName.includes("Subscription")) return 28500;
    return 10000;
  };

  const basePrice = form.service ? getBasePrice(form.service) : 0;
  const expressPrice = isExpress ? expressFeeVal : 0;
  const currentSubtotal = basePrice + expressPrice;
  const isMinOrderMet = currentSubtotal >= referralMinOrderVal;

  const handleApplyPromo = () => {
    setPromoError("");
    if (!referralCode.trim()) return;

    if (!form.service) {
      setPromoError("Please select a service first to verify minimum order eligibility.");
      return;
    }

    if (!isMinOrderMet) {
      setPromoError(`⚠️ Referral code requires a minimum order of ₦${referralMinOrderVal.toLocaleString()}. Your current subtotal is ₦${currentSubtotal.toLocaleString()}.`);
      setPromoApplied(false);
      return;
    }

    setPromoApplied(true);
  };

  const discountPrice = (promoApplied && isMinOrderMet) ? referralDiscountVal : 0;
  const estimatedTotal = Math.max(0, currentSubtotal - discountPrice);

  const finalizePaidBooking = async (paystackRef: string) => {
    setLoading(true);

    const itemsBreakdownCombined = [
      selectedLaundrySummaryText ? `🧺 Laundry: ${selectedLaundrySummaryText}` : "",
      selectedFoodSummaryText ? `🍲 Food: ${selectedFoodSummaryText}` : "",
      selectedBarSummaryText ? `🍾 Bar & Drinks: ${selectedBarSummaryText}` : "",
      selectedCleaningSummaryText ? `🧹 Cleaning: ${selectedCleaningSummaryText}` : "",
      isPlanService ? `💳 Subscription Plan: ${form.service}` : ""
    ].filter(Boolean).join(" | ");

    const bookingPayload: Booking = {
      ...form,
      status: "new",
      paymentStatus: "paid",
      paystackReference: paystackRef,
      paymentMethod: "paystack",
      paidAmount: estimatedTotal,
      paidAt: new Date().toISOString(),
      isExpress,
      expressFeeAmount: isExpress ? expressFeeVal : 0,
      referralCodeApplied: promoApplied ? referralCode.trim() : "",
      referralDiscountAmount: promoApplied ? referralDiscountVal : 0,
      totalEstimatedPrice: estimatedTotal,
      laundryItemsBreakdown: itemsBreakdownCombined || (isLaundryService ? "Standard Laundry Package" : isCleaningService ? "Standard Cleaning Package" : isPlanService ? `Plan Subscription (${form.service})` : "Standard Service Order")
    };

    try {
      // 1. Save booking to Firestore database
      await dbService.createBooking(bookingPayload);
      setPaidRef(paystackRef);

      // 2. Dispatch real automated e-commerce email to business owner via FormSubmit AJAX endpoint
      try {
        const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            _subject: `💳 PAID ONLINE VIA PAYSTACK: ${form.service} - ${form.name}`,
            _template: "table",
            _captcha: "false",
            "Payment Status": "🟢 PAID ONLINE (Paystack)",
            "Paystack Reference": paystackRef,
            "Amount Paid": `₦${estimatedTotal.toLocaleString()}`,
            "Customer Name": form.name,
            "Customer Email": form.email,
            "Phone Number": form.phone || "Not provided",
            "Alternative Phone Number": form.altPhone || "Not provided",
            "Service Ordered": form.service,
            "Order Itemized Details": itemsBreakdownCombined || (isLaundryService ? "Standard Package" : (showFoodCalc || showBarCalc) ? "Standard Food/Bar Order" : "N/A"),
            "Emergency Express Service": isExpress ? `⚡ YES (+₦${expressFeeVal.toLocaleString()})` : "Standard Delivery",
            "Referral Code Applied": promoApplied ? `🎁 ${referralCode} (-₦${referralDiscountVal.toLocaleString()})` : "None",
            "Preferred Date": form.date || "Flexible",
            "Preferred Time": form.time || "Flexible",
            "Delivery / Service Address": form.address || "Not specified",
            "Special Instructions": form.notes || "None",
            _replyto: form.email
          })
        });

        if (response.ok) {
          setEmailStatus("sent");
        } else {
          setEmailStatus("failed");
        }
      } catch (err) {
        console.warn("Automated email dispatch note:", err);
        setEmailStatus("failed");
      }

      setSent(true);
    } catch (err) {
      console.error("Booking creation error:", err);
      alert("Failed to record booking. Please contact us via WhatsApp with your payment reference: " + paystackRef);
    } finally {
      setLoading(false);
    }
  };

  const go = async () => {
    if (!form.name || !form.address || !form.service) {
      alert("Please fill in your Name, Delivery Address, and select a Service.");
      return;
    }

    if (!form.phone) {
      alert("Please enter a valid Phone Number for payment receipt & dispatch updates.");
      return;
    }

    setLoading(true);

    const generatedRef = `KTT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const paystackPublicKey = settings?.paystackPublicKey || "pk_live_7bdb2390c39862dbc3699090128503bde566ab45";

    const paystackEmail = form.email || (form.phone ? `${form.phone.replace(/[^0-9]/g, '')}@kingstreattech.com` : `customer-${Date.now()}@kingstreattech.com`);

    const paystackPop = (window as any).PaystackPop;
    if (paystackPop && typeof paystackPop.setup === "function") {
      try {
        const handler = paystackPop.setup({
          key: paystackPublicKey,
          email: paystackEmail,
          amount: Math.round(estimatedTotal * 100), // in kobo
          ref: generatedRef,
          currency: "NGN",
          metadata: {
            custom_fields: [
              { display_name: "Customer Name", variable_name: "customer_name", value: form.name },
              { display_name: "Service Ordered", variable_name: "service", value: form.service },
              { display_name: "Phone", variable_name: "phone", value: form.phone },
              { display_name: "Delivery Address", variable_name: "address", value: form.address }
            ]
          },
          callback: async function(response: { reference: string }) {
            const finalRef = response.reference || generatedRef;
            await finalizePaidBooking(finalRef);
          },
          onClose: function() {
            setLoading(false);
            alert("Payment pop-up was closed. Online payment is required to confirm your booking.");
          }
        });
        handler.openIframe();
      } catch (err) {
        console.error("Paystack setup error:", err);
        fallbackInitialize(generatedRef);
      }
    } else {
      fallbackInitialize(generatedRef);
    }
  };

  const fallbackInitialize = async (ref: string) => {
    try {
      const paystackEmail = form.email || (form.phone ? `${form.phone.replace(/[^0-9]/g, '')}@kingstreattech.com` : `customer-${Date.now()}@kingstreattech.com`);
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: paystackEmail,
          amount: estimatedTotal,
          reference: ref,
          metadata: {
            customer_name: form.name,
            service: form.service,
            phone: form.phone
          }
        })
      });

      const data = await response.json();
      if (data.status && data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        alert(data.message || "Failed to initialize Paystack payment. Please check network and try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Paystack fallback init error:", err);
      alert("Error contacting payment gateway. Please try again or contact support.");
      setLoading(false);
    }
  };

  const whatsappMsg = encodeURIComponent(
    `Hello Kings Treat Tech! I just completed my online payment on Paystack.\n\n` +
    `💳 Paystack Ref: ${paidRef}\n` +
    `💰 Amount Paid: ₦${estimatedTotal.toLocaleString()}\n` +
    `👤 Name: ${form.name}\n` +
    `📧 Email: ${form.email}\n` +
    `📞 Phone: ${form.phone || 'N/A'}\n` +
    `${form.altPhone ? `📱 Alt Phone: ${form.altPhone}\n` : ""}` +
    `🛠 Service: ${form.service}\n` +
    `${selectedLaundrySummaryText ? `🧺 Laundry Items (${totalLaundryPieces} pcs): ${selectedLaundrySummaryText}\n` : ""}` +
    `${selectedFoodSummaryText ? `🍲 Restaurant Dishes (${totalFoodPortions} items): ${selectedFoodSummaryText}\n` : ""}` +
    `${selectedBarSummaryText ? `🍾 Bar Drinks (${totalBarBottles} bottles/cans): ${selectedBarSummaryText}\n` : ""}` +
    `${selectedCleaningSummaryText ? `🧹 Cleaning Spaces (${totalCleaningSpaces} areas): ${selectedCleaningSummaryText}\n` : ""}` +
    `${isExpress ? `⚡ Express Emergency: YES (+₦${expressFeeVal.toLocaleString()})\n` : ""}` +
    `${promoApplied ? `🎁 Referral Discount: -₦${referralDiscountVal.toLocaleString()} (Code: ${referralCode})\n` : ""}` +
    `📅 Date/Time: ${form.date} ${form.time}\n` +
    `📍 Address: ${form.address || 'N/A'}`
  );

  const emailSubject = encodeURIComponent(`💳 PAID ONLINE BOOKING: ${form.service} - ${form.name}`);
  const emailBody = encodeURIComponent(
    `NEW PAID BOOKING DETAILS:\n\n` +
    `Paystack Reference: ${paidRef}\n` +
    `Amount Paid: ₦${estimatedTotal.toLocaleString()}\n` +
    `Customer Name: ${form.name}\n` +
    `Email: ${form.email}\n` +
    `Phone: ${form.phone}\n` +
    `Alt Phone: ${form.altPhone || "N/A"}\n` +
    `Service: ${form.service}\n` +
    `Express Service: ${isExpress ? "YES (+₦" + expressFeeVal + ")" : "Standard"}\n` +
    `Referral Code: ${promoApplied ? referralCode : "None"}\n` +
    `Date & Time: ${form.date} ${form.time}\n` +
    `Address: ${form.address}\n` +
    `Notes: ${form.notes}\n`
  );

  return (<>
    <div className="page-hero"><div className="page-hero-inner">
      <div className="sec-lbl">Schedule a Service</div><h1 className="fd">Book with KTT</h1>
      <p>Fill in the form — your order is logged instantly and sent to our admin team!</p>
    </div></div>
    <div className="sec" style={{maxWidth:740}}>
      {sent ? (
        <div className="success" style={{ background: "#111", border: "1px solid #39FF14", borderRadius: 16, padding: "36px 24px", textAlign: "center" }}>
          <div style={{fontSize:54,marginBottom:12}}>🎉</div>
          <h3 style={{ color: "#fff", fontSize: 24, marginBottom: 8 }}>Payment Successful &amp; Booking Confirmed!</h3>
          <p style={{ color: "#aaa", fontSize: 14, marginBottom: 16 }}>
            Thank you, <strong style={{color:"#39FF14"}}>{form.name}</strong>. Your payment for <strong>{form.service}</strong> has been processed via Paystack.
          </p>

          <div style={{ background: "rgba(57, 255, 20, 0.12)", border: "1px solid rgba(57, 255, 20, 0.4)", borderRadius: 12, padding: "14px 18px", marginBottom: 20, textAlign: "center" }}>
            <div style={{ color: "#39FF14", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              💳 Paystack Online Payment Confirmed
            </div>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "monospace" }}>
              Reference: {paidRef || "KTT-PAYSTACK"}
            </div>
            <div style={{ color: "#ccc", fontSize: 13, marginTop: 4 }}>
              Total Amount Paid: <strong style={{ color: "#39FF14" }}>₦{estimatedTotal.toLocaleString()}</strong>
            </div>
          </div>

          {isExpress && (
            <div style={{ background: "rgba(255, 140, 0, 0.15)", border: "1px solid rgba(255, 140, 0, 0.4)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#FF8C00", fontSize: 13, fontWeight: 700 }}>
              ⚡ Marked as EXPRESS EMERGENCY Order! Priority dispatch assigned.
            </div>
          )}

          {/* Email Delivery Status Banner */}
          <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>
                {emailStatus === "sent" ? "📩" : "📧"}
              </span>
              <strong style={{ color: "#fff", fontSize: 14 }}>
                {emailStatus === "sent" ? "Automated E-Receipt Dispatched!" : "Order Logged to Store Database"}
              </strong>
            </div>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
              Official receipt and dispatch alert routed to <strong>{targetEmail}</strong>.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
            <a 
              href={`https://wa.me/${settings?.whatsapp || "2348160880608"}?text=${whatsappMsg}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ background: "#25D366", color: "#000", padding: "12px 24px", borderRadius: 8, fontWeight: 800, textDecoration: "none", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              💬 Confirm Dispatch on WhatsApp
            </a>

            <a 
              href={`mailto:${targetEmail}?subject=${emailSubject}&body=${emailBody}`}
              target="_blank"
              rel="noreferrer"
              style={{ background: "#333", color: "#fff", border: "1px solid #555", padding: "12px 20px", borderRadius: 8, fontWeight: 600, textDecoration: "none", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              ✉️ Email Receipt
            </a>

            <button 
              onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", altPhone: "", service: pre || "", date: "", time: "", address: "", notes: "" }); setIsExpress(false); setPromoApplied(false); setReferralCode(""); setPaidRef(""); }}
              style={{ background: "#222", color: "#ccc", border: "1px solid #444", padding: "12px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
            >
              ➕ Place Another Order
            </button>
          </div>
        </div>
      ) : (
        <div className="form-box">
          <h2 className="fd" style={{fontSize:20,marginBottom:6,color:"#fff"}}>Booking Details</h2>
          <p style={{color:"#888",fontSize:13,fontWeight:300,marginBottom:24}}>Fields marked * are required. You will receive an instant confirmation.</p>
          <div className="fg">
            {[
              {l:"Full Name *",n:"name",ph:"Your full name"},
              {l:"Delivery Address *",n:"address",ph:"Full delivery / service address in Abuja"},
              {l:"Phone Number *",n:"phone",ph:"08160880608",t:"tel"},
              {l:"Alternative Phone Number",n:"altPhone",ph:"e.g. 08012345678 (Optional)",t:"tel"}
            ].map(f=>(
              <div key={f.n} className="f">
                <label>{f.l}</label>
                <input className="fi" name={f.n} type={f.t||"text"} placeholder={f.ph} value={(form as any)[f.n]} onChange={h}/>
              </div>
            ))}
            <div className="f"><label>Service *</label>
              <select className="fi" name="service" value={form.service} onChange={h}>
                <option value="">Select a service</option>
                <option>Food Delivery &amp; Restaurant Meals</option>
                <option>Bar &amp; Drinks Menu</option>
                <option>Food &amp; Bar Combined</option>
                <option>Laundry &amp; Dry Cleaning</option>
                <option>Home Cleaning</option>
                <option>Office Cleaning</option>
                <option>Monthly Subscription Plan - Starter (₦15,000/mo)</option>
                <option>Monthly Subscription Plan - Classic (₦28,500/mo)</option>
                <option>Monthly Subscription Plan - Premium (₦49,000/mo)</option>
              </select>
            </div>
            <div className="f"><label>Date</label><input className="fi" name="date" type="date" value={form.date} onChange={h}/></div>
            <div className="f"><label>Time</label><input className="fi" name="time" type="time" value={form.time} onChange={h}/></div>

            {/* Interactive Laundry Calculator */}
            {showLaundryCalc && (
              <div className="f full">
                <LaundryItemCalculator
                  quantities={laundryQuantities}
                  onChangeQuantity={handleChangeLaundryQty}
                  onClearAll={handleClearLaundryQty}
                  customItems={activeLaundryItems}
                />
              </div>
            )}

            {/* Interactive Food Calculator */}
            {showFoodCalc && (
              <div className="f full">
                <FoodItemCalculator
                  quantities={foodQuantities}
                  onChangeQuantity={handleChangeFoodQty}
                  onClearAll={handleClearFoodQty}
                  customItems={activeFoodItems}
                />
              </div>
            )}

            {/* Interactive Bar Calculator */}
            {showBarCalc && (
              <div className="f full" style={{ marginTop: showFoodCalc ? 12 : 0 }}>
                <BarItemCalculator
                  quantities={barQuantities}
                  onChangeQuantity={handleChangeBarQty}
                  onClearAll={handleClearBarQty}
                  customItems={activeBarItems}
                />
              </div>
            )}

            {/* Interactive Cleaning Calculator */}
            {showCleaningCalc && (
              <div className="f full">
                <CleaningItemCalculator
                  quantities={cleaningQuantities}
                  onChangeQuantity={handleChangeCleaningQty}
                  onClearAll={handleClearCleaningQty}
                  customItems={activeCleaningItems}
                />
              </div>
            )}

            {/* Subscription Plan Card */}
            {isPlanService && (
              <div className="f full" style={{ background: "rgba(57,255,20,0.06)", border: "1px solid #39FF14", borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ color: "#39FF14", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>💳</span> Monthly Subscription Plan Selected
                </div>
                <div style={{ color: "#fff", fontSize: 13, marginTop: 4, fontWeight: 700 }}>
                  {form.service}
                </div>
                <p style={{ color: "#aaa", fontSize: 12, marginTop: 4, margin: 0 }}>
                  Includes bundled food deliveries, laundry pickups, and routine cleaning with priority support and waived delivery fees!
                </p>
              </div>
            )}
            
            {/* Express Emergency Service Toggle */}
            {settings?.expressEnabled !== false && (
              <div className="f full" style={{ marginTop: 6, marginBottom: 6 }}>
                <div 
                  onClick={() => setIsExpress(!isExpress)}
                  style={{
                    background: isExpress ? "rgba(255, 140, 0, 0.15)" : "#141414",
                    border: isExpress ? "1px solid #FF8C00" : "1px solid #2A2A2A",
                    borderRadius: 12,
                    padding: "14px 18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input 
                      type="checkbox" 
                      checked={isExpress} 
                      onChange={e => setIsExpress(e.target.checked)} 
                      style={{ width: 18, height: 18, accentColor: "#FF8C00", cursor: "pointer" }}
                    />
                    <div>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>⚡</span> Express 24-Hr / Same-Day Emergency Dispatch
                      </div>
                      <div style={{ color: "#aaa", fontSize: 12, marginTop: 2 }}>
                        Urgent turnaround for laundry or emergency home cleaning in Abuja (+₦{expressFeeVal.toLocaleString()})
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#FF8C00", background: "rgba(255,140,0,0.2)", padding: "4px 10px", borderRadius: 20 }}>
                    +₦{expressFeeVal.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Referral / Promo Code Perk Section */}
            {settings?.referralEnabled !== false && (
              <div className="f full" style={{ marginTop: 4, marginBottom: 10 }}>
                <label style={{ color: "#39FF14", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyBetween: "space-between", gap: 6 }}>
                  <span>🎁 Referral Phone Code (₦{referralDiscountVal.toLocaleString()} Off on ₦{referralMinOrderVal.toLocaleString()}+ orders)</span>
                </label>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <input 
                    className="fi" 
                    value={referralCode}
                    onChange={e => { setReferralCode(e.target.value); setPromoApplied(false); setPromoError(""); }}
                    placeholder={`Enter phone referral code e.g. REF-08160880608`}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    style={{
                      background: promoApplied ? "#39FF14" : "#222",
                      color: promoApplied ? "#0A0A0A" : "#fff",
                      border: "1px solid #3A3A3A",
                      borderRadius: 10,
                      padding: "0 18px",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    {promoApplied ? "✓ Applied!" : "Apply Code"}
                  </button>
                </div>
                {promoError && (
                  <div style={{ fontSize: 12, color: "#FF6B6B", marginTop: 6, fontWeight: 600 }}>
                    {promoError}
                  </div>
                )}
                {promoApplied && isMinOrderMet && (
                  <div style={{ fontSize: 12, color: "#39FF14", marginTop: 6, fontWeight: 600 }}>
                    🎉 Perk code valid! ₦{referralDiscountVal.toLocaleString()} referral discount applied to your order of ₦{currentSubtotal.toLocaleString()}.
                  </div>
                )}
              </div>
            )}

            <div className="f full"><label>Special Notes / Instructions</label><textarea className="fi fi-ta" name="notes" placeholder="Special instructions (e.g. gate code, landmark, food preferences...)" value={form.notes} onChange={h}/></div>
            
            {/* Price Estimation Summary Card */}
            {form.service && (
              <div className="f full" style={{ background: "#111", border: "1px solid #2A2A2A", borderRadius: 12, padding: "14px 18px", marginTop: 4 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "#888", fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>
                  Order Breakdown
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#ccc", marginBottom: 4 }}>
                  <span>{isLaundryService ? `Laundry Items (${totalLaundryPieces} pcs):` : isFoodService ? `Restaurant Dishes (${totalFoodPortions} items):` : `Base Service (${form.service}):`}</span>
                  <span>₦{basePrice.toLocaleString()}</span>
                </div>

                {showLaundryCalc && selectedLaundrySummaryList.length > 0 && (
                  <div style={{ background: "#161616", borderRadius: 8, padding: "8px 12px", margin: "6px 0 10px 0", fontSize: 12, color: "#aaa" }}>
                    <div style={{ color: "#39FF14", fontWeight: 700, marginBottom: 4 }}>Selected Garments &amp; Goods:</div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {selectedLaundrySummaryList.map((itemStr, idx) => (
                        <li key={idx}>{itemStr}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {showFoodCalc && selectedFoodSummaryList.length > 0 && (
                  <div style={{ background: "#161616", borderRadius: 8, padding: "8px 12px", margin: "6px 0 10px 0", fontSize: 12, color: "#aaa" }}>
                    <div style={{ color: "#39FF14", fontWeight: 700, marginBottom: 4 }}>Selected Restaurant Dishes:</div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {selectedFoodSummaryList.map((itemStr, idx) => (
                        <li key={idx}>{itemStr}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {showBarCalc && selectedBarSummaryList.length > 0 && (
                  <div style={{ background: "#161616", borderRadius: 8, padding: "8px 12px", margin: "6px 0 10px 0", fontSize: 12, color: "#aaa" }}>
                    <div style={{ color: "#FFBB00", fontWeight: 700, marginBottom: 4 }}>Selected Bar Drinks &amp; Bottles:</div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {selectedBarSummaryList.map((itemStr, idx) => (
                        <li key={idx}>{itemStr}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {showCleaningCalc && selectedCleaningSummaryList.length > 0 && (
                  <div style={{ background: "#161616", borderRadius: 8, padding: "8px 12px", margin: "6px 0 10px 0", fontSize: 12, color: "#aaa" }}>
                    <div style={{ color: "#39FF14", fontWeight: 700, marginBottom: 4 }}>Selected Cleaning Areas &amp; Rooms:</div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {selectedCleaningSummaryList.map((itemStr, idx) => (
                        <li key={idx}>{itemStr}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {isExpress && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#FF8C00", marginBottom: 4 }}>
                    <span>⚡ Emergency Express Delivery:</span>
                    <span>+₦{expressFeeVal.toLocaleString()}</span>
                  </div>
                )}
                {promoApplied && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#39FF14", marginBottom: 4 }}>
                    <span>🎁 Referral Discount Perk:</span>
                    <span>-₦{referralDiscountVal.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ borderTop: "1px solid #222", paddingTop: 8, marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: "#fff" }}>
                  <span>Estimated Total:</span>
                  <span style={{ color: "#39FF14" }}>₦{estimatedTotal.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Paystack Payment CTA */}
            <div style={{ marginTop: 16 }}>
              <button 
                type="button"
                className="f-submit" 
                onClick={go} 
                disabled={loading}
                style={{ background: "#39FF14", color: "#000", fontSize: 16, fontWeight: 900, border: "none", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "16px", borderRadius: 12 }}
              >
                {loading ? "⏳ Opening Paystack Gateway..." : `Make Payment Now — ₦${estimatedTotal.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </>);
}

