import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import dbConnect from "@/app/lib/dbConnect";
import Assessment from "@/app/models/Assessment";
import User from "@/app/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get assessments with populated user data
    const assessments = await Assessment.find()
      .populate("createdBy", "username firstName lastName email")
      .populate("owner", "username firstName lastName email")
      .populate("controls.evidenceOwner", "username firstName lastName email")
      .sort({ createdAt: -1 });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.date || !data.dueDate) {
      return NextResponse.json(
        { error: "Assessment name, date, and due date are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(data.controls) || data.controls.length === 0) {
      return NextResponse.json(
        { error: "Controls array is required and cannot be empty" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Validate evidence owners exist
    const evidenceOwnerIds = data.controls
      .map((control: any) => control.evidenceOwner)
      .filter((id: string) => id);

    if (evidenceOwnerIds.length > 0) {
      const users = await User.find({ _id: { $in: evidenceOwnerIds } });
      const foundUserIds = users.map((user) => user._id.toString());
      const invalidUserIds = evidenceOwnerIds.filter(
        (id: string) => !foundUserIds.includes(id)
      );

      if (invalidUserIds.length > 0) {
        return NextResponse.json(
          { error: `Invalid evidence owner IDs: ${invalidUserIds.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Create assessment with the current user as creator
    const assessment = await Assessment.create({
      name: data.name,
      date: data.date,
      dueDate: data.dueDate,
      controls: data.controls,
      createdBy: session.user.id,
    });

    // Return the created assessment with populated user data
    const populatedAssessment = await Assessment.findById(assessment._id)
      .populate("createdBy", "username firstName lastName email")
      .populate("controls.evidenceOwner", "username firstName lastName email");

    return NextResponse.json(populatedAssessment, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}
