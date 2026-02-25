"use server";

import { createClient } from "@/lib/supabase-server";
import { logActivity } from "@/lib/logger-server";
import { revalidatePath } from "next/cache";

export type ProductFormData = {
  name: string;
  category: string;
  asset_id: string; // Formerly serial_number / sku
  serial_number: string;
  model: string;
  brand: string; // New field
  status: string;
  description?: string; // New field
  specifications: Record<string, string>;
};

export async function createProduct(data: ProductFormData) {
  try {
    const supabase = await createClient();
    
    // 1. Perform Action
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: data.name,
        category: data.category,
        asset_id: data.asset_id,
        serial_number: data.serial_number,
        model: data.model,
        brand: data.brand,
        status: data.status,
        description: data.description,
        specifications: data.specifications,
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Log Activity
    await logActivity({
      action: 'create_product',
      entityType: 'product',
      entityId: product.id,
      details: { name: product.name, serial: product.serial_number }
    });

    revalidatePath('/dashboard/admin/products');
    return { success: true, data: product };
  } catch (error: unknown) {
    console.error("Create Product Error:", error);
    return { success: false, error: (error as Error)?.message || String(error) };
  }
}

export async function updateProduct(id: string, data: ProductFormData) {
  try {
    const supabase = await createClient();

    // 1. Perform Action
    const { data: product, error } = await supabase
      .from("products")
      .update({
        name: data.name,
        category: data.category,
        asset_id: data.asset_id,
        serial_number: data.serial_number,
        model: data.model,
        brand: data.brand,
        status: data.status,
        description: data.description,
        specifications: data.specifications,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // 2. Log Activity
    await logActivity({
      action: 'update_product',
      entityType: 'product',
      entityId: id,
      details: { changes: data }
    });

    revalidatePath('/dashboard/admin/products');
    return { success: true, data: product };
  } catch (error: unknown) {
    console.error("Update Product Error:", error);
    return { success: false, error: (error as Error)?.message || String(error) };
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabase = await createClient();

    // 1. Get details before delete for logging
    const { data: product } = await supabase.from("products").select("name, serial_number").eq("id", id).single();

    // 2. Perform Action
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // 3. Log Activity
    await logActivity({
      action: 'delete_product',
      entityType: 'product',
      entityId: id,
      details: { name: product?.name, serial: product?.serial_number }
    });

    revalidatePath('/dashboard/admin/products');
    return { success: true };
  } catch (error: unknown) {
    console.error("Delete Product Error:", error);
    return { success: false, error: (error as Error)?.message || String(error) };
  }
}

export async function deleteBulkProducts(ids: string[]) {
  try {
    const supabase = await createClient();

    // 1. Get details before delete for logging
    const { data: products } = await supabase.from("products").select("name, asset_id").in("id", ids);

    // 2. Perform Action
    const { error } = await supabase
      .from("products")
      .delete()
      .in("id", ids);

    if (error) throw error;

    // 3. Log Activity
    await logActivity({
      action: 'delete_bulk_products',
      entityType: 'product',
      entityId: 'bulk',
      details: { count: ids.length, items: products }
    });

    revalidatePath('/dashboard/admin/products');
    return { success: true };
  } catch (error: unknown) {
    console.error("Bulk Delete Products Error:", error);
    return { success: false, error: (error as Error)?.message || String(error) };
  }
}

export async function updateBulkProductStatus(ids: string[], status: string) {
  try {
    const supabase = await createClient();

    // 1. Perform Action
    const { error } = await supabase
      .from("products")
      .update({ status })
      .in("id", ids);

    if (error) throw error;

    // 2. Log Activity
    await logActivity({
      action: 'update_bulk_products_status',
      entityType: 'product',
      entityId: 'bulk',
      details: { count: ids.length, new_status: status }
    });

    revalidatePath('/dashboard/admin/products');
    return { success: true };
  } catch (error: unknown) {
    console.error("Bulk Update Products Status Error:", error);
    return { success: false, error: (error as Error)?.message || String(error) };
  }
}
