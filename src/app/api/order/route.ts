
import { connectToDatabase } from "@/lib/utils";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { auth } from "@/nextAuth/auth";

//////////////////////////////////////////////////////////////////

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const {
      shopName,
      clientName,
      clientNumber,
      deliveryDate,
      pickupDate,
      category,
      subcategory,
      measurements,
    } = await req.json();

    // Basic fallback validation
    if (
      !shopName ||
      !deliveryDate ||
      !pickupDate ||
      !category ||
      !subcategory
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newOrder = await Order.create({
      shopName,
      clientName,
      clientNumber,
      deliveryDate,
      pickupDate,
      category,
      subcategory,
      measurements,
    });

    return NextResponse.json(
      {
        message: "Order submitted successfully!",
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving order:", error);

    return NextResponse.json(
      {
        message: "Failed to submit order.",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

//////////////////////////////////////////////////////////////////

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const shop = searchParams.get("shop") || "";
    const category = searchParams.get("category") || "";
    const subcategory = searchParams.get("subcategory") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: Record<string, unknown> = {};

    if (shop) query.shopName = { $regex: shop, $options: "i" };

    // Category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Subcategory filter
    if (subcategory && subcategory !== "all") {
      query.subcategory = subcategory;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Fetch limited data only (performance optimized)
    const orders = await Order.find(query)
      .select("shopName clientName clientNumber category subcategory createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    return NextResponse.json(
      {
        message: "Orders fetched successfully!",
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders.", error: String(error) },
      { status: 500 }
    );
  }
}
