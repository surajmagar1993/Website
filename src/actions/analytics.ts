"use server";

import { createClient } from "@/lib/supabase-server";

export async function getDashboardStats() {
  const supabase = await createClient();

  try {
    // 1. Fetch Product Stats
    const { count: totalProducts, error: totalProductsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    const { count: rentedProducts, error: rentedProductsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "rented");

    if (totalProductsError || rentedProductsError) {
      console.error("Error fetching product stats:", totalProductsError || rentedProductsError);
    }

    const availableProducts = (totalProducts || 0) - (rentedProducts || 0);

    // 2. Fetch Ticket Stats
    const { count: totalTickets, error: totalTicketsError } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true });

    const { count: openTickets, error: openTicketsError } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "open");

    if (totalTicketsError || openTicketsError) {
      console.error("Error fetching ticket stats:", totalTicketsError || openTicketsError);
    }
    
    // 3. Fetch Recent Activity
    const { data: recentActivity, error: activityError } = await supabase
      .from("activity_logs")
      .select(`
        id,
        action,
        created_at,
        details,
        profiles:user_id (email)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (activityError) {
      console.error("Error fetching activity logs:", activityError);
    }

    // 4. Client Stats (Total Clients)
    const { count: totalClients, error: clientsError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "client");


    return {
      products: {
        total: totalProducts || 0,
        rented: rentedProducts || 0,
        available: availableProducts || 0,
      },
      tickets: {
        total: totalTickets || 0,
        open: openTickets || 0,
        closed: (totalTickets || 0) - (openTickets || 0),
      },
      clients: {
        total: totalClients || 0,
      },
      recentActivity: recentActivity || []
    };

  } catch (error) {
    console.error("Unexpected error fetching dashboard stats:", error);
    return null;
  }
}
