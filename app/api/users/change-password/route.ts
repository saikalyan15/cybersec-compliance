import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/User";
import { authOptions } from "@/app/api/auth/options";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface IUser extends mongoose.Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  password: string;
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in change-password:", session);

    if (!session?.user) {
      console.log("No session or user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, currentPassword, newPassword } = await request.json();
    console.log("Received userId:", userId);

    if (!userId || !currentPassword || !newPassword) {
      console.log("Missing fields:", {
        userId,
        hasCurrentPass: !!currentPassword,
        hasNewPass: !!newPassword,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    if (!mongoose.isValidObjectId(userId)) {
      console.log("Invalid user ID format:", userId);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(userId);
    console.log("Found user:", user ? "yes" : "no");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Update password and reset the passwordResetRequired flag
    user.password = newPassword;
    user.passwordResetRequired = false;
    await user.save();

    // Return success with the updated passwordResetRequired status
    return NextResponse.json({
      message: "Password updated successfully",
      passwordResetRequired: false,
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to change password",
      },
      { status: 500 }
    );
  }
}
