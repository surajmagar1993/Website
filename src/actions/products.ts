"use server";

import { createClient } from "@/lib/supabase-server";
import { logActivity } from "@/lib/logger-server";
import { revalidatePath } from "next/cache";

export type ProductFormData = {
  name: string;
  category: string;
  serial_number: string;
  model: string;
  status: string;
};

export async function createProduct(data: ProductFormData) {
  try {
    const supabase = await createClient();
    
    // 1. Perform Action
    const { data: product, error } = await supabase
      .from("products")
      .insert(data)
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
  } catch (error) {
    console.error("Create Product Error:", error);
    return { success: false, error };
  }
}

export async function updateProduct(id: string, data: ProductFormData) {
  try {
    const supabase = await createClient();

    // 1. Perform Action
    const { data: product, error } = await supabase
      .from("products")
      .update(data)
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
  } catch (error) {
    console.error("Update Product Error:", error);
    return { success: false, error };
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
  } catch (error) {
    console.error("Delete Product Error:", error);
    return { success: false, error };
  }
}
