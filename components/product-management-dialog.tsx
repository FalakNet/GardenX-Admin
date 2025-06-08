"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { createProduct, updateProduct } from "@/actions/products"
import { toast } from "sonner"
import type { Product } from "@/types"

interface ProductManagementDialogProps {
  product?: Product | null
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function ProductManagementDialog({ product, trigger, onSuccess }: ProductManagementDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    unit: "",
    stock_quantity: "",
    image_url: "",
  })

  const isEditing = !!product

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        category: product.category,
        price: product.price.toString(),
        unit: product.unit,
        stock_quantity: product.stock_quantity.toString(),
        image_url: product.image_url || "",
      })
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        unit: "",
        stock_quantity: "",
        image_url: "",
      })
    }
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.category || !formData.price || !formData.unit) {
      toast.error("Please fill in all required fields")
      return
    }

    const price = Number.parseFloat(formData.price)
    const stockQuantity = Number.parseInt(formData.stock_quantity) || 0

    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    setIsLoading(true)
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        price,
        unit: formData.unit,
        stock_quantity: stockQuantity,
        image_url: formData.image_url.trim() || null,
      }

      let result
      if (isEditing && product) {
        result = await updateProduct(product.id, productData)
      } else {
        result = await createProduct(productData)
      }

      if (result) {
        toast.success(`Product ${isEditing ? "updated" : "created"} successfully`)
        setOpen(false)
        onSuccess?.()
      } else {
        toast.error(`Failed to ${isEditing ? "update" : "create"} product`)
      }
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} product:`, error)
      toast.error(`Failed to ${isEditing ? "update" : "create"} product`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const defaultTrigger = (
    <Button size="sm" className="bg-green-600 hover:bg-green-700">
      <Plus className="h-4 w-4 mr-2" />
      Add Product
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the product information below." : "Create a new product for your inventory."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Plants">Plants</SelectItem>
                    <SelectItem value="Seeds">Seeds</SelectItem>
                    <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="bunch">Bunch</SelectItem>
                    <SelectItem value="packet">Packet</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (AED) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange("stock_quantity", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                type="url"
                value={formData.image_url}
                onChange={(e) => handleInputChange("image_url", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
