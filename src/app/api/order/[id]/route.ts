import { connectToDatabase } from "@/lib/utils";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { auth } from "@/nextAuth/auth";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

interface Params {
  params: Promise<{
    id: string;
  }>;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function GET(req: Request, { params }: Params) {
  try {
    await connectToDatabase();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Order fetched successfully!", order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Failed to fetch order", error: String(error) },
      { status: 500 }
    );
  }
}
