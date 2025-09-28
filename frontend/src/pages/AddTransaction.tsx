import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NotesEditor from "@/components/editor/NotesEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CreateTransactionParams } from "@/types/transactions";
import {
  CreateTransaction,
  ListActiveCategories,
  ListPaymentMethods,
} from "../../wailsjs/go/main/App";
import toast from "react-hot-toast";

type TransactionType = "income" | "expense" | "sale" | "purchase";
type PaymentStatus = "pending" | "completed" | "partial";

const transactionTabs = [
  {
    type: "sale" as TransactionType,
    label: "Sale",
    icon: "🛒",
    color: "text-blue-600",
  },
  {
    type: "purchase" as TransactionType,
    label: "Purchase",
    icon: "📦",
    color: "text-orange-600",
  },
  {
    type: "expense" as TransactionType,
    label: "Expense",
    icon: "📉",
    color: "text-red-600",
  },
  {
    type: "income" as TransactionType,
    label: "Income",
    icon: "📈",
    color: "text-green-600",
  },
];

export const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [categories, setCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    customerVendor: "",
    paymentMethod: "none",
    description: "",
    category: "none",
    paymentStatus: "pending" as PaymentStatus,
    referenceNumber: "",
    taxAmount: "",
    discountAmount: "",
    invoiceNumber: "",
    notes: "",
    recurringFrequency: "monthly",
    recurringEndDate: "",
  });

  // Calculate due amount
  const calculateDueAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    const tax = parseFloat(formData.taxAmount) || 0;
    const discount = parseFloat(formData.discountAmount) || 0;
    return Math.max(0, amount + tax - discount);
  };

  // Generate voucher number
  const generateVoucherNumber = () => {
    const prefix = activeTab.toUpperCase().substring(0, 3);
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${prefix}-${year}-${random}`;
  };

  useEffect(() => {
    loadCategories();
    loadPaymentMethods();
  }, []);

  const loadCategories = async () => {
    try {
      // Check if Wails runtime is available
      if (
        typeof window !== "undefined" &&
        (window as any).go &&
        (window as any).go.main
      ) {
        const data = await ListActiveCategories();
        setCategories(data || []);
      } else {
        console.warn("Wails runtime not available, using mock data");
        // Mock data for development
        setCategories([
          { id: "1", name: "Food & Dining", type: "expense" },
          { id: "2", name: "Transportation", type: "expense" },
          { id: "3", name: "Utilities", type: "expense" },
          { id: "4", name: "Salary", type: "income" },
          { id: "5", name: "Freelance", type: "income" },
          { id: "6", name: "General", type: "both" },
        ]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      // Fallback to mock data
      setCategories([
        { id: "1", name: "Food & Dining", type: "expense" },
        { id: "2", name: "Transportation", type: "expense" },
        { id: "3", name: "Utilities", type: "expense" },
        { id: "4", name: "Salary", type: "income" },
        { id: "5", name: "Freelance", type: "income" },
        { id: "6", name: "General", type: "both" },
      ]);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      // Check if Wails runtime is available
      if (
        typeof window !== "undefined" &&
        (window as any).go &&
        (window as any).go.main
      ) {
        const data = await ListPaymentMethods();
        setPaymentMethods(data || []);
      } else {
        console.warn("Wails runtime not available, using mock data");
        // Mock data for development
        setPaymentMethods([
          { id: "1", name: "Cash" },
          { id: "2", name: "Credit Card" },
          { id: "3", name: "Debit Card" },
          { id: "4", name: "Bank Transfer" },
          { id: "5", name: "PayPal" },
        ]);
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
      // Fallback to mock data
      setPaymentMethods([
        { id: "1", name: "Cash" },
        { id: "2", name: "Credit Card" },
        { id: "3", name: "Debit Card" },
        { id: "4", name: "Bank Transfer" },
        { id: "5", name: "PayPal" },
      ]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.amount || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if Wails runtime is available
    if (
      typeof window === "undefined" ||
      !(window as any).go ||
      !(window as any).go.main
    ) {
      toast.error("Cannot submit: Application not properly connected");
      return;
    }

    setIsSubmitting(true);
    try {
      const createData: CreateTransactionParams = {
        type: activeTab,
        description: formData.description,
        amount: parseFloat(formData.amount) || 0,
        transaction_date: format(date, "yyyy-MM-dd"),
        category: formData.category === "none" ? "" : formData.category,
        tags: tags,
        customer_vendor: formData.customerVendor || "",
        payment_method:
          formData.paymentMethod === "none" ? "" : formData.paymentMethod,
        payment_status: formData.paymentStatus,
        reference_number: formData.referenceNumber || "",
        invoice_number: formData.invoiceNumber || "",
        notes: formData.notes || "",
        attachments: [],
        tax_amount: parseFloat(formData.taxAmount) || 0,
        discount_amount: parseFloat(formData.discountAmount) || 0,
        currency: "USD",
        exchange_rate: 1,
        is_recurring: isRecurring,
        recurring_frequency:
          isRecurring && formData.recurringFrequency !== "none"
            ? formData.recurringFrequency
            : "",
        recurring_end_date: isRecurring ? formData.recurringEndDate : "",
        parent_transaction_id: "",
        created_by: "",
      } as any;

      await CreateTransaction(createData as any);
      toast.success("Transaction created successfully");
      navigate("/");
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-auto bg-background">
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-card rounded-2xl overflow-hidden shadow-xl border">
          {/* Transaction Type Tabs */}
          <div className="flex bg-muted/50 border-b">
            {transactionTabs.map((tab) => (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={cn(
                  "flex-1 py-4 text-center font-medium text-muted-foreground transition-all duration-300",
                  "hover:bg-muted/80 flex items-center justify-center gap-2",
                  activeTab === tab.type && [
                    "bg-background text-red-600 border-b-3 border-red-600",
                    tab.type === "income" && "text-green-600 border-green-600",
                    tab.type === "expense" && "text-red-600 border-red-600",
                    tab.type === "sale" && "text-blue-600 border-blue-600",
                    tab.type === "purchase" &&
                      "text-orange-600 border-orange-600",
                  ]
                )}
                style={
                  activeTab === tab.type
                    ? { borderBottomWidth: "3px", marginBottom: "-1px" }
                    : {}
                }
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-base">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Voucher Header */}
          <div
            className="px-8 py-6 text-white"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-semibold tracking-wide">
                {activeTab.toUpperCase()} VOUCHER
              </h1>
              <div className="bg-white/20 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
                {generateVoucherNumber()}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-xs opacity-90 uppercase tracking-wider mb-1.5 block">
                  Customer / Vendor
                </label>
                <Input
                  value={formData.customerVendor}
                  onChange={(e) =>
                    handleInputChange("customerVendor", e.target.value)
                  }
                  placeholder="Enter name"
                  className="bg-white/95 border-0 h-10 text-gray-800 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="text-xs opacity-90 uppercase tracking-wider mb-1.5 block">
                  Payment Method
                </label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    handleInputChange("paymentMethod", value)
                  }
                >
                  <SelectTrigger className="w-full bg-white/95 border-0 h-10 text-gray-800">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="none">None</SelectItem>
                    {paymentMethods.map((method: any) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs opacity-90 uppercase tracking-wider mb-1.5 block text-right">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 bg-white/95 border-0 text-gray-800",
                        !date && "text-gray-400"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => newDate && setDate(newDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Voucher Body */}
          <div className="p-8">
            <div className="grid grid-cols-5 gap-8">
              {/* Left Column - 3 columns wide */}
              <div className="col-span-3 space-y-5">
                {/* Amount Section */}
                <div className="bg-muted/30 p-5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-semibold text-purple-600">
                      $
                    </span>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        handleInputChange("amount", e.target.value)
                      }
                      placeholder="0.00"
                      className="flex-1 text-4xl font-semibold border-0 bg-transparent placeholder-muted-foreground focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      style={{ fontSize: "36px" }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm font-semibold uppercase tracking-wide mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter detailed transaction description..."
                    className="min-h-[100px] resize-vertical border-2 rounded-lg p-3 text-base focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Category and Tags in one row - responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-semibold uppercase tracking-wide">
                        Category
                      </Label>
                      <button className="text-sm text-purple-600 font-medium hover:text-purple-700">
                        + Add
                      </button>
                    </div>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger className="w-full h-10 border-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        <SelectItem value="none">None</SelectItem>
                        {categories
                          .filter(
                            (cat: any) =>
                              cat.type === activeTab || cat.type === "both"
                          )
                          .map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label className="text-sm font-semibold uppercase tracking-wide mb-2 block">
                      Tags
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                        placeholder="Add a tag"
                        className="flex-1 border-2 rounded-lg h-10"
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        className="w-10 h-10 p-0 bg-purple-600 hover:bg-purple-700 rounded-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:bg-purple-200 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section - Now in left column */}
                <div>
                  <Label className="text-sm font-semibold uppercase tracking-wide mb-2 block">
                    Notes
                  </Label>
                  <NotesEditor
                    value={formData.notes}
                    onChange={(value) => handleInputChange("notes", value)}
                    placeholder="Add any additional notes or special instructions..."
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Right Column - 2 columns wide */}
              <div className="col-span-2 space-y-5">
                {/* Payment Status */}
                <div>
                  <Label className="text-sm font-semibold uppercase tracking-wide mb-2 block">
                    Payment Status
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "pending", label: "Pending", color: "orange" },
                      {
                        value: "completed",
                        label: "Completed",
                        color: "green",
                      },
                      { value: "partial", label: "Partial", color: "blue" },
                    ].map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() =>
                          handleInputChange("paymentStatus", status.value)
                        }
                        className={cn(
                          "py-2 px-3 rounded-lg border-2 font-medium transition-all text-sm",
                          formData.paymentStatus === status.value
                            ? status.color === "orange"
                              ? "bg-orange-500 text-white border-orange-500"
                              : status.color === "green"
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-blue-500 text-white border-blue-500"
                            : "bg-card border hover:bg-muted/50"
                        )}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reference Number */}
                <div>
                  <Label className="text-sm font-semibold uppercase tracking-wide mb-2 block">
                    Reference Number
                  </Label>
                  <Input
                    value={formData.referenceNumber}
                    onChange={(e) =>
                      handleInputChange("referenceNumber", e.target.value)
                    }
                    placeholder="Enter reference #"
                    className="h-10 border-2 rounded-lg"
                  />
                </div>

                {/* Amounts Grid */}
                <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        + Tax
                      </Label>
                      <Input
                        type="number"
                        value={formData.taxAmount}
                        onChange={(e) =>
                          handleInputChange("taxAmount", e.target.value)
                        }
                        placeholder="0"
                        className="h-9 text-center font-medium bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        − Discount
                      </Label>
                      <Input
                        type="number"
                        value={formData.discountAmount}
                        onChange={(e) =>
                          handleInputChange("discountAmount", e.target.value)
                        }
                        placeholder="0"
                        className="h-9 text-center font-medium bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Due
                      </Label>
                      <div className="h-9 bg-background border rounded-md flex items-center justify-center font-semibold text-purple-600 text-sm">
                        ${calculateDueAmount().toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Number */}
                <div>
                  <Label className="text-sm font-semibold uppercase tracking-wide mb-2 block">
                    Invoice Number
                  </Label>
                  <Input
                    value={formData.invoiceNumber}
                    onChange={(e) =>
                      handleInputChange("invoiceNumber", e.target.value)
                    }
                    placeholder="Enter invoice number"
                    className="h-10 border-2 rounded-lg"
                  />
                </div>

                {/* Recurring Toggle */}
                <div className="bg-muted/30 p-4 rounded-xl">
                  <div className="flex items-center justify-between p-2 bg-background rounded-lg">
                    <span className="font-medium text-sm">
                      Recurring Transaction
                    </span>
                    <Switch
                      checked={isRecurring}
                      onCheckedChange={setIsRecurring}
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>

                  {isRecurring && (
                    <div className="mt-3 space-y-2">
                      <Select
                        value={formData.recurringFrequency}
                        onValueChange={(value) =>
                          handleInputChange("recurringFrequency", value)
                        }
                      >
                        <SelectTrigger className="h-9 bg-background">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        value={formData.recurringEndDate}
                        onChange={(e) =>
                          handleInputChange("recurringEndDate", e.target.value)
                        }
                        className="h-9 bg-background"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 px-8 py-6 bg-muted/30 border-t">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="px-8 py-2.5 h-auto text-base font-medium border-2 hover:bg-muted/50"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2.5 h-auto text-base font-medium bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white min-w-[180px]"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              {isSubmitting
                ? "Creating..."
                : `Create ${
                    activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                  }`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
