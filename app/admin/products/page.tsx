import { Sidebar } from "@/components/sidebar"
import { ProductsClient } from "@/components/products-client"
import { getProducts } from "@/actions/products"

export default async function Products() {
  const products = await getProducts()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <ProductsClient products={products} />
    </div>
  )
}
