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
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", altPhone: "", service: pre || "", date: "", time: "", address: "", notes: "" });

  React.useEffect(() => {
    if (pre) {
      setForm(f => ({ ...f, service: pre }));
    }
  }, [pre]);

  // Handle Paystack Redirect parameters if user returned from external bank authorization
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("reference") || urlParams.get("trxref");
    if (ref) {
      setPaidRef(ref);
      setLoading(true);
      fetch(`/api/paystack/verify/${encodeURIComponent(ref)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status && data.data?.status === 'success') {
            setEmailStatus('sent');
            setSent(true);
          }
        })
        .catch(err => console.error("Auto verify paystack error:", err))
        .finally(() => setLoading(false));
    }
  }, []);
  
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

  const h = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "phone" || name === "altPhone") {
      const cleaned = value.replace(/[^0-9]/g, "").slice(0, 11);
      setForm(f => ({ ...f, [name]: cleaned }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

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

  const handleApplyPromo = async () => {
    setPromoError("");
    const codeClean = referralCode.trim().toUpperCase();
    if (!codeClean) return;

    if (!form.service) {
      setPromoError("Please select a service first to verify minimum order eligibility.");
      setPromoApplied(false);
      return;
    }

    const refDigits = codeClean.replace(/[^0-9]/g, "");
    const userPhoneDigits = (form.phone || "").replace(/[^0-9]/g, "");

    if (userPhoneDigits && refDigits && userPhoneDigits === refDigits) {
      setPromoError("⚠️ Self-referral is not allowed. You cannot use your own phone number as a referral code.");
      setPromoApplied(false);
      return;
    }

    const prefix = (settings?.referralCodePrefix || "REF").toUpperCase();
    const isPrefixFormat = codeClean.startsWith(prefix + "-") && refDigits.length >= 10;
    const isPhoneFormat = refDigits.length === 11 && (
      refDigits.startsWith("070") || 
      refDigits.startsWith("080") || 
      refDigits.startsWith("081") || 
      refDigits.startsWith("090") || 
      refDigits.startsWith("091") || 
      refDigits.startsWith("071")
    );
    const isSpecialCode = ["WELCOME1000", "KTT1000", "KTT2026", "DISCOUNT1000", "REF1000"].includes(codeClean);

    let isValidInDB = false;
    if (!isPrefixFormat && !isPhoneFormat && !isSpecialCode) {
      try {
        const bookings = await dbService.getBookings();
        isValidInDB = bookings.some(b => {
          const bPhone = (b.phone || "").replace(/[^0-9]/g, "");
          const bRef = (b.referralCodeApplied || "").trim().toUpperCase();
          return (bPhone && bPhone === refDigits) || (bRef && bRef === codeClean);
        });
      } catch (err) {
        console.error("Referral DB check error:", err);
      }
    }

    if (!isPrefixFormat && !isPhoneFormat && !isSpecialCode && !isValidInDB) {
      setPromoError("⚠️ Invalid referral code. Please enter a valid 11-digit phone number or referral code (e.g. REF-08160880608 or 08160880608).");
      setPromoApplied(false);
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

  const sendOrderEmail = async (bookingData: Booking, docId?: string) => {
    try {
      // 1. Client-side FormSubmit AJAX endpoint
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: `📦 NEW ORDER: ${bookingData.service} - ${bookingData.name}`,
          _template: "table",
          _captcha: "false",
          "Order ID": docId || "N/A",
          "Payment Method": "💳 Paystack Online",
          "Payment Status": bookingData.paymentStatus === "paid" ? "🟢 PAID ONLINE" : "⏳ PENDING / DELIVERY",
          "Paystack Reference": bookingData.paystackReference || "N/A",
          "Amount": `₦${(bookingData.totalEstimatedPrice || 0).toLocaleString()}`,
          "Customer Name": bookingData.name,
          "Customer Email": bookingData.email || "Not provided",
          "Phone Number": bookingData.phone,
          "Alt Phone": bookingData.altPhone || "None",
          "Service Ordered": bookingData.service,
          "Itemized Details": bookingData.laundryItemsBreakdown || "Standard Package",
          "Express Emergency": bookingData.isExpress ? `⚡ YES (+₦${expressFeeVal.toLocaleString()})` : "Standard Delivery",
          "Referral Code": bookingData.referralCodeApplied || "None",
          "Preferred Date/Time": `${bookingData.date || 'Flexible'} ${bookingData.time || 'Flexible'}`,
          "Delivery Address": bookingData.address,
          "Special Notes": bookingData.notes || "None",
          _replyto: bookingData.email || targetEmail
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log("Client FormSubmit response:", data);
        if (data.success === "true" || data.success === true) setEmailStatus("sent");
      })
      .catch((err) => console.warn("Client FormSubmit error:", err));

      // 2. Server-side API dispatch
      const res = await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetEmail,
          orderDetails: {
            orderId: docId,
            customerName: bookingData.name,
            customerEmail: bookingData.email,
            phone: bookingData.phone,
            altPhone: bookingData.altPhone,
            service: bookingData.service,
            itemizedBreakdown: bookingData.laundryItemsBreakdown,
            isExpress: bookingData.isExpress,
            referralCode: bookingData.referralCodeApplied,
            amount: `₦${(bookingData.totalEstimatedPrice || 0).toLocaleString()}`,
            paymentStatus: bookingData.paymentStatus,
            paystackRef: bookingData.paystackReference,
            date: bookingData.date,
            time: bookingData.time,
            address: bookingData.address,
            notes: bookingData.notes
          }
        })
      });
      const data = await res.json();
      console.log("Server send-order-email response:", data);
      if (data.status || data.formsubmit?.success === "true") {
        setEmailStatus("sent");
      }
    } catch (err) {
      console.warn("Order email error:", err);
    }
  };

  const go = async () => {
    if (!form.name || !form.address || !form.service) {
      alert("Please fill in your Name, Delivery Address, and select a Service.");
      return;
    }

    const sanitizedPhone = (form.phone || "").replace(/[^0-9]/g, "");
    if (!sanitizedPhone || sanitizedPhone.length !== 11) {
      alert(`⚠️ Please enter a valid 11-digit Nigerian phone number (e.g. 08160880608). Current length: ${sanitizedPhone.length} digit(s).`);
      return;
    }

    const sanitizedAltPhone = (form.altPhone || "").replace(/[^0-9]/g, "");
    if (sanitizedAltPhone && sanitizedAltPhone.length !== 11) {
      alert(`⚠️ Alternative phone number must be a valid 11-digit Nigerian number (e.g. 08012345678) or left empty. Current length: ${sanitizedAltPhone.length} digit(s).`);
      return;
    }

    setLoading(true);

    const itemsBreakdownCombined = [
      selectedLaundrySummaryText ? `🧺 Laundry: ${selectedLaundrySummaryText}` : "",
      selectedFoodSummaryText ? `🍲 Food: ${selectedFoodSummaryText}` : "",
      selectedBarSummaryText ? `🍾 Bar & Drinks: ${selectedBarSummaryText}` : "",
      selectedCleaningSummaryText ? `🧹 Cleaning: ${selectedCleaningSummaryText}` : "",
      isPlanService ? `💳 Subscription Plan: ${form.service}` : ""
    ].filter(Boolean).join(" | ");

    const generatedRef = `KTT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const bookingPayload: Booking = {
      ...form,
      status: "new",
      paymentStatus: "pending",
      paystackReference: generatedRef,
      paymentMethod: "paystack",
      paidAmount: estimatedTotal,
      isExpress,
      expressFeeAmount: isExpress ? expressFeeVal : 0,
      referralCodeApplied: promoApplied ? referralCode.trim() : "",
      referralDiscountAmount: promoApplied ? referralDiscountVal : 0,
      totalEstimatedPrice: estimatedTotal,
      laundryItemsBreakdown: itemsBreakdownCombined || (isLaundryService ? "Standard Laundry Package" : isCleaningService ? "Standard Cleaning Package" : isPlanService ? `Plan Subscription (${form.service})` : "Standard Service Order")
    };

    // 1. SAVE TO FIRESTORE DATABASE IMMEDIATELY
    const docId = await dbService.createBooking(bookingPayload);
    if (docId) setCreatedBookingId(docId);

    // 2. DISPATCH ORDER EMAIL IMMEDIATELY TO Chatkttlimited@gmail.com
    sendOrderEmail(bookingPayload, docId || undefined);

    // 3. LAUNCH PAYSTACK ONLINE PAYMENT GATEWAY
    const paystackPublicKey = settings?.paystackPublicKey || "pk_live_7bdb2390c39862dbc3699090128503bde566ab45";
    const paystackEmail = form.email || (form.phone ? `${form.phone.replace(/[^0-9]/g, '')}@kingstreattech.com` : `customer-${Date.now()}@kingstreattech.com`);

    const loadPaystackInlineScript = (): Promise<boolean> => {
      return new Promise((resolve) => {
        if ((window as any).PaystackPop) { resolve(true); return; }
        const existingScript = document.getElementById("paystack-js-script");
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve(true));
          existingScript.addEventListener("error", () => resolve(false));
          return;
        }
        const script = document.createElement("script");
        script.id = "paystack-js-script";
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const scriptLoaded = await loadPaystackInlineScript();
    const paystackPop = (window as any).PaystackPop;

    if (scriptLoaded && paystackPop) {
      try {
        let paymentSuccess = false;
        const handleSuccess = async (reference: string) => {
          paymentSuccess = true;
          setPaidRef(reference);
          if (docId) {
            await dbService.updateBookingDetails(docId, {
              paymentStatus: "paid",
              paystackReference: reference,
              paidAmount: estimatedTotal,
              paidAt: new Date().toISOString()
            });
          }
          sendOrderEmail({ ...bookingPayload, paymentStatus: "paid", paystackReference: reference }, docId || undefined);
          setSent(true);
          setLoading(false);
        };

        if (typeof paystackPop.setup === "function") {
          const handler = paystackPop.setup({
            key: paystackPublicKey,
            email: paystackEmail,
            amount: Math.round(estimatedTotal * 100),
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
            callback: function(response: { reference: string }) {
              handleSuccess(response.reference || generatedRef);
            },
            onClose: function() {
              setLoading(false);
              if (!paymentSuccess) {
                setPaidRef(generatedRef);
              }
            }
          });
          if (handler && typeof handler.openIframe === "function") {
            handler.openIframe();
            return;
          }
        } else if (typeof paystackPop === "function") {
          const popup = new paystackPop();
          if (typeof popup.newTransaction === "function") {
            popup.newTransaction({
              key: paystackPublicKey,
              email: paystackEmail,
              amount: Math.round(estimatedTotal * 100),
              ref: generatedRef,
              currency: "NGN",
              onSuccess: (transaction: any) => {
                handleSuccess(transaction.reference || generatedRef);
              },
              onCancel: () => {
                setLoading(false);
                setPaidRef(generatedRef);
              }
            });
            return;
          }
        }
      } catch (err) {
        console.error("Paystack setup error:", err);
      }
    }

    await fallbackInitialize(generatedRef, docId || undefined, bookingPayload);
  };

  const fallbackInitialize = async (ref: string, docId?: string, bookingPayload?: Booking) => {
    try {
      const paystackEmail = form.email || (form.phone ? `${form.phone.replace(/[^0-9]/g, '')}@kingstreattech.com` : `customer-${Date.now()}@kingstreattech.com`);
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: paystackEmail,
          amount: estimatedTotal,
          reference: ref,
          callback_url: window.location.href,
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
        setPaidRef(ref);
        setSent(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Paystack fallback init error:", err);
      setPaidRef(ref);
      setSent(true);
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
        <div className="success" style={{ background: "#111", border: "2px solid #39FF14", borderRadius: 20, padding: "40px 24px", textAlign: "center", boxShadow: "0 10px 40px rgba(57, 255, 20, 0.15)" }}>
          <div style={{fontSize: 60, marginBottom: 12}}>🎉</div>
          <h2 style={{ color: "#39FF14", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            Thank You Very Much For Your Order!
          </h2>
          <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
            Dear <span style={{ color: "#39FF14" }}>{form.name}</span>, your payment for <strong>{form.service}</strong> has been received &amp; confirmed.
          </p>

          <div style={{ background: "rgba(57, 255, 20, 0.12)", border: "1px solid rgba(57, 255, 20, 0.4)", borderRadius: 14, padding: "16px 20px", marginBottom: 24, textAlign: "center" }}>
            <div style={{ color: "#39FF14", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              💳 Paystack Online Payment Confirmed
            </div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>
              Order Reference: {paidRef || "KTT-PAYSTACK"}
            </div>
            <div style={{ color: "#ccc", fontSize: 14, marginTop: 4 }}>
              Total Amount Paid: <strong style={{ color: "#39FF14", fontSize: 16 }}>₦{estimatedTotal.toLocaleString()}</strong>
            </div>
          </div>

          {isExpress && (
            <div style={{ background: "rgba(255, 140, 0, 0.15)", border: "1px solid rgba(255, 140, 0, 0.4)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, color: "#FF8C00", fontSize: 14, fontWeight: 700 }}>
              ⚡ Marked as EXPRESS EMERGENCY Order! Priority dispatch assigned.
            </div>
          )}

          {/* Direct WhatsApp Chat Section */}
          <div style={{ background: "#162416", border: "2px solid #25D366", borderRadius: 16, padding: "24px 20px", marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>💬</div>
            <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
              Chat with Us on WhatsApp
            </h3>
            <p style={{ color: "#bbb", fontSize: 13, marginBottom: 16, maxWidth: 500, margin: "0 auto 16px" }}>
              Click the button below to send your order reference directly to our customer care team on WhatsApp for live tracking, instant updates, or special instructions.
            </p>
            <a 
              href={`https://wa.me/${settings?.whatsapp || "2348160880608"}?text=${whatsappMsg}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ background: "#25D366", color: "#000", padding: "16px 32px", borderRadius: 12, fontWeight: 900, textDecoration: "none", fontSize: 16, display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 6px 20px rgba(37, 211, 102, 0.3)" }}
            >
              <span style={{ fontSize: 20 }}>💬</span> Chat on WhatsApp Now
            </a>
          </div>

          {/* Email Delivery Status */}
          <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, padding: "14px 18px", marginBottom: 24, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
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
            <div className="f">
              <label>Full Name *</label>
              <input className="fi" name="name" type="text" placeholder="Your full name" value={form.name} onChange={h} />
            </div>

            <div className="f">
              <label>Delivery Address *</label>
              <input className="fi" name="address" type="text" placeholder="Full delivery / service address in Abuja" value={form.address} onChange={h} />
            </div>

            <div className="f">
              <label>Phone Number (11 Digits) *</label>
              <input
                className="fi"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                placeholder="08160880608"
                value={form.phone}
                onChange={h}
              />
              <small style={{ color: "#39FF14", fontSize: 11, marginTop: 2 }}>🇳🇬 11-digit Nigerian number (e.g. 08160880608)</small>
            </div>

            <div className="f">
              <label>Alternative Phone Number (11 Digits)</label>
              <input
                className="fi"
                name="altPhone"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                placeholder="08012345678 (Optional)"
                value={form.altPhone}
                onChange={h}
              />
              <small style={{ color: "#888", fontSize: 11, marginTop: 2 }}>Optional 11-digit backup phone number</small>
            </div>
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

            {/* Submit Order / Payment CTA */}
            <div style={{ marginTop: 20 }}>
              <button 
                type="button"
                className="f-submit" 
                onClick={go} 
                disabled={loading}
                style={{ background: "#39FF14", color: "#000", fontSize: 16, fontWeight: 900, border: "none", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "16px", borderRadius: 12 }}
              >
                {loading ? "⏳ Opening Paystack Gateway..." : `Pay Online via Paystack — ₦${estimatedTotal.toLocaleString()}`}
              </button>

              {paidRef && !sent && (
                <div style={{ marginTop: 20, background: "rgba(57, 255, 20, 0.08)", border: "2px solid #39FF14", borderRadius: 14, padding: 18, textAlign: "center" }}>
                  <div style={{ color: "#39FF14", fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
                    📦 Order Logged! (Ref: {paidRef})
                  </div>
                  <p style={{ color: "#ccc", fontSize: 13, marginBottom: 14 }}>
                    Did you complete your payment on Paystack or via Bank Transfer? Click below to view your Thank You receipt &amp; chat with us on WhatsApp!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(true);
                      if (createdBookingId) {
                        dbService.updateBookingDetails(createdBookingId, { paymentStatus: "paid" });
                      }
                    }}
                    style={{ background: "#39FF14", color: "#000", fontWeight: 900, padding: "14px 28px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 15, width: "100%" }}
                  >
                    🎉 Confirm Payment &amp; View Thank You Screen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </>);
}

