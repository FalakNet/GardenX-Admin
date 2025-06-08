"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2 } from "lucide-react"
import { deleteProduct } from "@/actions/products"
import { formatCurrency } from "@/lib/utils"
import { ProductManagementDialog } from "@/components/product-management-dialog"
import { toast } from "sonner"
import type { Product } from "@/types"
import { useRouter } from "next/navigation"

interface ProductsClientProps {
  products: Product[]
}

export function ProductsClient({ products: initialProducts }: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const success = await deleteProduct(productId)
      if (success) {
        setProducts(products.filter((p) => p.id !== productId))
        toast.success("Product deleted successfully")
      } else {
        toast.error("Failed to delete product")
      }
    }
  }

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Products"
        subtitle="Manage your product inventory"
        actions={<ProductManagementDialog onSuccess={handleSuccess} />}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Management</CardTitle>
            <CardDescription>View, edit, and manage your product inventory.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Image</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Unit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-gray-500">
                        No products found. Try a different search term or add a new product.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <img
                            src={product.image_url || "/placeholder.svg?height=40&width=40"}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-gray-500 truncate max-w-xs">{product.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{product.category}</td>
                        <td className="py-3 px-4 text-sm font-medium">
                          {formatCurrency(product.price)} AED/{product.unit}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{product.unit}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              product.stock_quantity > 10
                                ? "bg-green-100 text-green-800"
                                : product.stock_quantity > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of Stock"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <ProductManagementDialog
                              product={product}
                              trigger={
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                              onSuccess={handleSuccess}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
