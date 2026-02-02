import { useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Progress } from "@/app/components/ui/progress";
import { toast } from "sonner";
import { CreditCard, Smartphone, Building, Heart, Download, MailCheck } from "lucide-react";

import { supaDonations } from "@/utils/supabaseApi";
import jsPDF from "jspdf";

export function DonatePage() {
  const [amount, setAmount] = useState<number>(499);
  const [type, setType] = useState<string>("one-time");

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const [paymentMethod, setPaymentMethod] = useState<string>("upi");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastDonationId, setLastDonationId] = useState<string | null>(null);
  const [lastDonationDate, setLastDonationDate] = useState<string | null>(null);

  const presetAmounts = [199, 499, 999, 1999];

  // ✅ Fake campaign progress (later dynamic)
  const goal = 100000;
  const raised = 45000;
  const progress = (raised / goal) * 100;

  const impactMessages: Record<number, string> = useMemo(
    () => ({
      199: "Your ₹199 provides basic stationery for a student",
      499: "Your ₹499 helps provide study material for 1 student",
      999: "Your ₹999 supports a child's education for a month",
      1999: "Your ₹1999 sponsors a family healthcare checkup",
    }),
    []
  );

  function validateEmail(value: string) {
    return /^\S+@\S+\.\S+$/.test(value);
  }

  // ✅ Certificate PDF (front-end download)
  function downloadCertificatePDF() {
    if (!name || !email || !lastDonationDate) {
      toast.error("Donation info missing for certificate");
      return;
    }

    const doc = new jsPDF("landscape", "pt", "a4");
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageW, pageH, "F");

    doc.setDrawColor(29, 78, 216);
    doc.setLineWidth(4);
    doc.rect(30, 30, pageW - 60, pageH - 60);

    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(1);
    doc.rect(45, 45, pageW - 90, pageH - 90);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(30);
    doc.text("CERTIFICATE OF APPRECIATION", pageW / 2, 120, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text("This certificate is proudly presented to", pageW / 2, 170, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(29, 78, 216);
    doc.text(name.toUpperCase(), pageW / 2, 215, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(55, 65, 81);
    doc.text(
      `For generously supporting our mission with a donation of ₹${amount}.`,
      pageW / 2,
      255,
      { align: "center" }
    );

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Donation Type: ${type}`, 90, 350);
    doc.text(`Payment Method: ${paymentMethod}`, 90, 372);
    doc.text(`Date: ${new Date(lastDonationDate).toLocaleString()}`, 90, 394);

    if (lastDonationId) {
      doc.setTextColor(100, 116, 139);
      doc.text(`Certificate Ref: ${lastDonationId}`, 90, 418);
    }

    doc.setDrawColor(200, 210, 255);
    doc.setLineWidth(1);
    doc.line(70, pageH - 150, pageW - 70, pageH - 150);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Authorized Signatory", pageW - 250, pageH - 110);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Thannmanngaadi Foundation", pageW - 280, pageH - 90);

    doc.save(`Donation-Certificate-${name.replace(/\s+/g, "_")}.pdf`);
  }

  async function sendCertificateEmail(donorName: string, donorEmail: string, donorAmount: number) {
    const res = await fetch("http://localhost:5050/donation/send-certificate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: donorName,
        email: donorEmail,
        amount: donorAmount,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.error || "Failed to send certificate email");
    }
    return data;
  }

  async function handleDonate() {
    if (!name.trim()) return toast.error("Please enter your full name");
    if (!email.trim()) return toast.error("Please enter your email");
    if (!validateEmail(email)) return toast.error("Please enter a valid email address");
    if (!amount || amount < 1) return toast.error("Please enter a valid amount");

    setIsSubmitting(true);
    try {
      // ✅ Save donation in Supabase
      const saved = await supaDonations.create({
        name,
        email,
        phone: phone || undefined,
        amount,
        type,
        paymentMethod,
      });

      setLastDonationId(saved?.id || null);
      setLastDonationDate(saved?.created_at || new Date().toISOString());

      toast.success("✅ Donation saved successfully!");
      toast.success("🎉 Thank you for your donation 🙏");

      // ✅ Send email certificate
      await sendCertificateEmail(name, email, amount);
      toast.success("📩 Certificate emailed successfully!");

      // clear form
      setName("");
      setEmail("");
      setPhone("");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to process donation");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-[#F8FAFC] py-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#0F172A] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Make a Donation
          </h1>
          <p className="text-xl text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
            Your contribution creates lasting impact in our communities
          </p>
        </div>

        <Card className="mb-8 p-6">
          <CardContent className="p-0">
            <div className="flex justify-between mb-2">
              <span className="font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>
                Current Campaign
              </span>
              <span className="text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
                ₹{raised.toLocaleString()} / ₹{goal.toLocaleString()}
              </span>
            </div>
            <Progress value={progress} className="h-3 mb-2" />
            <p className="text-sm text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
              {progress.toFixed(0)}% of our goal reached
            </p>
          </CardContent>
        </Card>

        <Card className="p-8">
          <CardContent className="p-0">
            <div className="mb-8">
              <Label className="text-lg font-semibold mb-4 block">Donation Type</Label>
              <Tabs value={type} onValueChange={setType}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="one-time">One-time</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="mb-8">
              <Label className="text-lg font-semibold mb-4 block">Select Amount</Label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    variant={amount === preset ? "default" : "outline"}
                    className={`h-16 text-lg ${
                      amount === preset ? "bg-[#1D4ED8] hover:bg-[#1e40af]" : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    ₹{preset}
                  </Button>
                ))}
              </div>

              <div>
                <Label htmlFor="custom-amount" className="mb-2 block">
                  Or Enter Custom Amount
                </Label>
                <Input
                  id="custom-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="text-xl p-6"
                  placeholder="Enter amount"
                />
              </div>

              {impactMessages[amount] && (
                <div className="mt-4 p-4 bg-[#38BDF8]/10 rounded-lg flex items-start gap-3">
                  <Heart className="text-[#1D4ED8] flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-gray-700" style={{ fontFamily: "Inter, sans-serif" }}>
                    {impactMessages[amount]}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-8">
              <Label className="text-lg font-semibold mb-4 block">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="grid gap-4">
                  {[
                    { value: "upi", label: "UPI", icon: Smartphone },
                    { value: "card", label: "Credit/Debit Card", icon: CreditCard },
                    { value: "netbanking", label: "Net Banking", icon: Building },
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.value}
                        className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:bg-[#F8FAFC]"
                        onClick={() => setPaymentMethod(method.value)}
                      >
                        <RadioGroupItem value={method.value} id={method.value} />
                        <Label htmlFor={method.value} className="flex items-center gap-2 cursor-pointer flex-1">
                          <Icon size={20} />
                          {method.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold">Your Information</h3>

              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone"
                />
              </div>
            </div>

            <Button
              onClick={handleDonate}
              disabled={isSubmitting}
              className="w-full h-14 text-lg bg-[#1D4ED8] hover:bg-[#1e40af] rounded-full"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {isSubmitting ? "Processing..." : `Donate ₹${amount}`}
            </Button>

            <p className="text-sm text-gray-600 text-center mt-4" style={{ fontFamily: "Inter, sans-serif" }}>
              Your donation is secure and will be used for community development programs
            </p>

            {lastDonationDate && (
              <div className="mt-6 p-4 border rounded-xl bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#0F172A] flex items-center gap-2">
                    <MailCheck size={18} className="text-green-600" />
                    Donation Successful
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    You can download your donation certificate.
                  </p>
                </div>

                <Button onClick={downloadCertificatePDF} variant="outline" className="rounded-full">
                  <Download size={18} className="mr-2" />
                  Download Certificate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
