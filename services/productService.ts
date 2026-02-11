import { http } from "../config/api";

export interface Product {
  id: string;
  barcode: string;
  productName: string;
  salePrice: number;
  currentStock: number;
  category: string; // ou Category se você tiver um enum tipado no front
}


export function getProducts() {
  return http<Product[]>("/v1/inventory");
}

export async function createProduct(product: Product): Promise<Product> {
  return await http<Product>("/v1/inventory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(product)
  });
}

export async function getProductsByBarcode(barcode: string) {
  return http<Product>(`/v1/inventory/${barcode}`);
}

export async function deleteProduct(barcode: string) {
  return http<Product>(`/v1/inventory/${barcode}`, {
    method: "DELETE"
  });
}

