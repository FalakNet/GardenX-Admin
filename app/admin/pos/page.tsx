"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  Users,
  UserPlus,
} from "lucide-react";
import { PaymentModal } from "@/components/payment-modal";
import {
  getPosProducts,
  createPosOrder,
  searchCustomerByPhone,
} from "@/actions/pos";
import { getCustomers, createCustomer } from "@/actions/customers";
import type { Product, Customer } from "@/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSSystem() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showPayment, setShowPayment] = useState(false);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useStoreCredit, setUseStoreCredit] = useState(false);
  const [storeCreditAmount, setStoreCreditAmount] = useState(0);

  // New customer form data
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "New" as Customer["status"],
  });

  // Prevent duplicate order creation
  const isProcessingOrderRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      const [productsData, customersData] = await Promise.all([
        getPosProducts(),
        getCustomers(),
      ]);
      setProducts(productsData);
      setCustomers(customersData);
    };

    loadData();
  }, []);

  // Reset store credit usage when customer changes
  useEffect(() => {
    setUseStoreCredit(false);
    setStoreCreditAmount(0);
  }, [customer]);

  const categories = [
    "All Categories",
    "Vegetables",
    "Plants",
    "Seeds",
    "Miscellaneous",
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesCategory =
      selectedCategory === "All Categories" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredCustomers = customers.filter((cust) => {
    if (!customerSearchTerm) return true;

    const searchLower = customerSearchTerm.toLowerCase();
    return (
      cust.name.toLowerCase().includes(searchLower) ||
      (cust.phone && cust.phone.includes(customerSearchTerm)) ||
      (cust.email && cust.email.toLowerCase().includes(searchLower))
    );
  });

  const addToCart = (product: Product) => {
    if (isProcessingOrderRef.current) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, change: number) => {
    if (isProcessingOrderRef.current) return;

    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = Math.max(0, item.quantity + change);
            return newQuantity === 0
              ? null
              : { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: number) => {
    if (isProcessingOrderRef.current) return;

    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    if (isProcessingOrderRef.current) return;

    setCart([]);
    setCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
    setUseStoreCredit(false);
    setStoreCreditAmount(0);
  };

  const lookupCustomer = async () => {
    if (!customerPhone || isProcessingOrderRef.current) return;

    const foundCustomer = await searchCustomerByPhone(customerPhone);
    if (foundCustomer) {
      setCustomer(foundCustomer);
      setCustomerName(foundCustomer.name);
      toast.success(`Customer found: ${foundCustomer.name}`);
    } else {
      setCustomer(null);
      toast.error("No customer found with that phone number");
    }
  };

  const selectExistingCustomer = (selectedCustomer: Customer) => {
    setCustomer(selectedCustomer);
    setCustomerName(selectedCustomer.name);
    setCustomerPhone(selectedCustomer.phone || "");
    setShowCustomerSelect(false);
    toast.success(`Selected customer: ${selectedCustomer.name}`);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomerData.name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    setIsLoading(true);
    try {
      const newCustomer = await createCustomer({
        customer_id: "", // Will be generated automatically
        name: newCustomerData.name.trim(),
        email: newCustomerData.email.trim() || undefined,
        phone: newCustomerData.phone.trim() || undefined,
        status: newCustomerData.status,
        store_credit: 0,
        rewards_earned: 0,
      });

      if (newCustomer) {
        // Update customers list
        const updatedCustomers = await getCustomers();
        setCustomers(updatedCustomers);

        // Select the new customer
        setCustomer(newCustomer);
        setCustomerName(newCustomer.name);
        setCustomerPhone(newCustomer.phone || "");

        // Reset form and close dialog
        setNewCustomerData({
          name: "",
          email: "",
          phone: "",
          status: "New",
        });
        setShowCreateCustomer(false);

        toast.success("Customer created and selected successfully");
      } else {
        toast.error("Failed to create customer");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreCreditChange = (checked: boolean) => {
    setUseStoreCredit(checked);
    if (checked && customer) {
      // Calculate how much store credit to use (up to the total or available credit)
      const maxCredit = Math.min(customer.store_credit, total);
      setStoreCreditAmount(maxCredit);
    } else {
      setStoreCreditAmount(0);
    }
  };

  const handleStoreCreditAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!customer) return;

    const value = Number.parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      setStoreCreditAmount(0);
      return;
    }

    // Limit to available store credit and total amount
    const maxCredit = Math.min(customer.store_credit, total);
    setStoreCreditAmount(Math.min(value, maxCredit));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;
  const finalTotal = Math.max(0, total - storeCreditAmount);
  const cashback = customer ? finalTotal * 0.1 : 0;
  const storeCreditUsed = storeCreditAmount; // Add this line to define the variable

  const handlePaymentComplete = async (
    paymentMethod: "cash" | "card" | "ziina",
    amountReceived?: number
  ) => {
    // Prevent duplicate order creation
    if (isProcessingOrderRef.current) {
      console.log("Order already being processed, ignoring duplicate call");
      return;
    }

    if (cart.length === 0) {
      toast.error("No items in cart");
      return;
    }

    isProcessingOrderRef.current = true;
    setIsLoading(true);

    try {
      console.log("Processing payment:", {
        paymentMethod,
        total: finalTotal,
        cartItems: cart.length,
        customer: customer?.name || "Guest",
      });

      // Validate cart items have valid data
      const validatedCart = cart.filter(
        (item) =>
          item.product &&
          item.product.id &&
          item.quantity > 0 &&
          item.product.price > 0
      );

      if (validatedCart.length === 0) {
        throw new Error("Cart contains invalid items");
      }

      if (finalTotal <= 0) {
        throw new Error("Invalid order total");
      }

      // Create the order with the final total after store credit
      const order = await createPosOrder(
        customerName.trim() || "Guest Customer",
        customer?.id || null,
        validatedCart,
        subtotal,
        tax,
        finalTotal,
        storeCreditUsed
      );

      if (!order) {
        throw new Error("Failed to create order - no order returned");
      }

      console.log("Order created successfully:", order.id);

      // Close payment modal first
      setShowPayment(false);

      // Clear cart and customer info
      setCart([]);
      setCustomer(null);
      setCustomerName("");
      setCustomerPhone("");
      setUseStoreCredit(false);
      setStoreCreditAmount(0);

      // Show success message
      let message = `Payment successful! Order ${order.order_id} created.`;
      if (storeCreditUsed > 0) {
        message += ` Used ${formatCurrency(storeCreditUsed)} AED store credit.`;
      }
      if (customer && cashback > 0) {
        message += ` Customer earned ${formatCurrency(cashback)} AED cashback.`;
      }

      toast.success(message, { duration: 5000 });

      // Log payment details
      console.log("Payment completed:", {
        orderId: order.id,
        paymentMethod,
        total: finalTotal,
        storeCreditUsed,
        cashbackEarned: cashback,
      });
    } catch (error) {
      console.error("Error processing payment:", error);

      let errorMessage =
        "There was an error processing your order. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { duration: 8000 });

      // Don't close the payment modal on error - let user try again
    } finally {
      setIsLoading(false);
      isProcessingOrderRef.current = false;
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0 || isProcessingOrderRef.current) return;
    setShowPayment(true);
  };

  const handleCancelPayment = () => {
    setShowPayment(false);
    isProcessingOrderRef.current = false;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                GardenX POS System
              </Button>
            </Link>
          </div>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={clearCart}
            disabled={isProcessingOrderRef.current}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Products Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isProcessingOrderRef.current}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={isProcessingOrderRef.current}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products List */}
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.image_url ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-medium text-sm">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {product.category}
                          </p>
                          <p className="text-xs text-gray-400">
                            Stock: {product.stock_quantity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 font-bold">
                          {formatCurrency(product.price)} AED/{product.unit}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          disabled={
                            product.stock_quantity <= 0 ||
                            isProcessingOrderRef.current
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Current Sale</h2>
                <Badge variant="secondary">{cart.length} items</Badge>
              </div>

              {/* Customer Information */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Customer Name (Optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={isProcessingOrderRef.current}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomerSelect(true)}
                    disabled={isProcessingOrderRef.current}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={isProcessingOrderRef.current}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateCustomer(true)}
                    disabled={isProcessingOrderRef.current}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                {customer && (
                  <div className="p-2 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      {customer.name}
                    </p>
                    <p className="text-xs text-green-600">
                      Store Credit: {formatCurrency(customer.store_credit)} AED
                    </p>
                    <p className="text-xs text-green-600">
                      Status: {customer.status}
                    </p>

                    {customer.store_credit > 0 && cart.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-green-100">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="use-credit"
                            checked={useStoreCredit}
                            onCheckedChange={handleStoreCreditChange}
                            disabled={isProcessingOrderRef.current}
                          />
                          <Label
                            htmlFor="use-credit"
                            className="text-xs text-green-700"
                          >
                            Use store credit
                          </Label>
                        </div>

                        {useStoreCredit && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max={Math.min(customer.store_credit, total)}
                                step="0.01"
                                value={storeCreditAmount}
                                onChange={handleStoreCreditAmountChange}
                                className="h-8 text-xs"
                                disabled={isProcessingOrderRef.current}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() =>
                                  setStoreCreditAmount(
                                    Math.min(customer.store_credit, total)
                                  )
                                }
                                disabled={isProcessingOrderRef.current}
                              >
                                Max
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No items in cart</p>
                  <p className="text-sm">
                    Click on products to add them to the cart
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(item.product.price)} AED/
                          {item.product.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          disabled={isProcessingOrderRef.current}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          disabled={isProcessingOrderRef.current}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={isProcessingOrderRef.current}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)} AED</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (5%)</span>
                  <span>{formatCurrency(tax)} AED</span>
                </div>

                {storeCreditAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Store Credit</span>
                    <span>-{formatCurrency(storeCreditAmount)} AED</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)} AED</span>
                </div>

                {customer && finalTotal > 0 && (
                  <div className="flex justify-between text-sm text-green-600 bg-green-50 p-2 rounded">
                    <span>Customer Cashback (10%)</span>
                    <span>+{formatCurrency(cashback)} AED</span>
                  </div>
                )}
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={
                  cart.length === 0 || isLoading || isProcessingOrderRef.current
                }
                onClick={handleCheckout}
              >
                {isLoading ? "Processing..." : "Checkout"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Selection Dialog */}
      <Dialog open={showCustomerSelect} onOpenChange={setShowCustomerSelect}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>
              Choose an existing customer for this sale
            </DialogDescription>
          </DialogHeader>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or phone number..."
                className="pl-10"
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No customers found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => selectExistingCustomer(cust)}
                  >
                    <div>
                      <p className="font-medium">{cust.name}</p>
                      <p className="text-sm text-gray-500">
                        {cust.phone || "No phone"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {cust.email || "No email"}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          cust.status === "VIP" ? "default" : "secondary"
                        }
                      >
                        {cust.status}
                      </Badge>
                      <p className="text-sm text-green-600">
                        Credit: {formatCurrency(cust.store_credit)} AED
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCustomerSelect(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Customer Dialog */}
      <Dialog open={showCreateCustomer} onOpenChange={setShowCreateCustomer}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer and select them for this sale
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-name">Name *</Label>
              <Input
                id="new-name"
                value={newCustomerData.name}
                onChange={(e) =>
                  setNewCustomerData({
                    ...newCustomerData,
                    name: e.target.value,
                  })
                }
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newCustomerData.email}
                onChange={(e) =>
                  setNewCustomerData({
                    ...newCustomerData,
                    email: e.target.value,
                  })
                }
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-phone">Phone</Label>
              <Input
                id="new-phone"
                type="tel"
                value={newCustomerData.phone}
                onChange={(e) =>
                  setNewCustomerData({
                    ...newCustomerData,
                    phone: e.target.value,
                  })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-status">Status</Label>
              <Select
                value={newCustomerData.status}
                onValueChange={(value) =>
                  setNewCustomerData({
                    ...newCustomerData,
                    status: value as Customer["status"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateCustomer(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create & Select"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={finalTotal}
          onPaymentComplete={handlePaymentComplete}
          onCancel={handleCancelPayment}
        />
      )}
    </div>
  );
}
