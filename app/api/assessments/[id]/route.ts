import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import dbConnect from "@/app/lib/dbConnect";
import Assessment from "@/app/models/Assessment";
import User from "@/app/models/User";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to delete the assessment
    if (
      session.user.role !== "admin" &&
      assessment.createdBy.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await assessment.deleteOne();

    return NextResponse.json({ message: "Assessment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { error: "Failed to delete assessment" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const assessment = await Assessment.findById(id)
      .populate("createdBy", "username firstName lastName email")
      .populate("owner", "username firstName lastName email")
      .populate("controls.evidenceOwner", "username firstName lastName email");

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to view the assessment
    if (
      session.user.role !== "admin" &&
      assessment.createdBy._id.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to edit the assessment
    if (
      session.user.role !== "admin" &&
      assessment.createdBy.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, date, dueDate, controls, owner } = body;

    if (!name || !date || !controls || !Array.isArray(controls)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate owner exists if provided
    if (owner) {
      const ownerUser = await User.findById(owner);
      if (!ownerUser) {
        return NextResponse.json(
          { error: "Invalid owner ID" },
          { status: 400 }
        );
      }
    }

    // Validate evidence owner IDs
    const evidenceOwnerIds = controls.map(
      (control: any) => control.evidenceOwner
    );
    const validUsers = await User.find({
      _id: { $in: evidenceOwnerIds },
    });

    if (validUsers.length !== evidenceOwnerIds.length) {
      return NextResponse.json(
        { error: "Invalid evidence owner ID(s)" },
        { status: 400 }
      );
    }

    // Update assessment
    assessment.name = name;
    assessment.date = date;
    assessment.dueDate = dueDate;
    assessment.controls = controls;
    assessment.owner = owner;

    await assessment.save();

    // Return the updated assessment with populated fields
    const updatedAssessment = await Assessment.findById(id)
      .populate("createdBy", "username firstName lastName email")
      .populate("owner", "username firstName lastName email")
      .populate("controls.evidenceOwner", "username firstName lastName email");

    return NextResponse.json(updatedAssessment);
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}
