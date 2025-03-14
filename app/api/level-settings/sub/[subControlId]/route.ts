import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { getServerSession } from "next-auth";
import connectToMongo from "@/app/lib/mongodb";
import SubControl from "@/app/models/SubControl";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface LevelSetting {
  level: number;
  isRequired: boolean;
}

export async function PUT(
  request: Request,
  { params }: { params: { subControlId: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToMongo();

    // Get and validate the subControlId from params
    const { subControlId } = params;

    // Validate subControlId
    if (!mongoose.Types.ObjectId.isValid(subControlId)) {
      return NextResponse.json(
        { error: "Invalid sub-control ID format" },
        { status: 400 }
      );
    }

    const levelSettings = (await request.json()) as LevelSetting[];

    // Validate level settings format
    if (!Array.isArray(levelSettings) || levelSettings.length !== 4) {
      return NextResponse.json(
        { error: "Invalid level settings format" },
        { status: 400 }
      );
    }

    for (const setting of levelSettings) {
      if (
        typeof setting.level !== "number" ||
        setting.level < 1 ||
        setting.level > 4 ||
        typeof setting.isRequired !== "boolean"
      ) {
        return NextResponse.json(
          { error: "Invalid level settings format" },
          { status: 400 }
        );
      }
    }

    // Sort level settings by level number for consistency
    const sortedSettings = [...levelSettings].sort((a, b) => a.level - b.level);

    // First find the document to ensure it exists
    const existingSubControl = await SubControl.findById(subControlId);
    if (!existingSubControl) {
      return NextResponse.json(
        { error: "Sub-control not found" },
        { status: 404 }
      );
    }

    // Update the document
    existingSubControl.levelSettings = sortedSettings;
    const updatedSubControl = await existingSubControl.save();

    return NextResponse.json(updatedSubControl);
  } catch (error) {
    console.error("Error updating sub-control level settings:", error);
    return NextResponse.json(
      { error: "Failed to update level settings" },
      { status: 500 }
    );
  }
}
