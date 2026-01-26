import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(decoded.id).select("-password -otp");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Fetch User Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email } = body; // Allow updating basic info

    await dbConnect();
    
    // Check if email is taken by another user if changed
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: decoded.id } });
      if (existing) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { $set: { name, email } },
      { new: true }
    ).select("-password -otp");

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
