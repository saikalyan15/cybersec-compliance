import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";
import dbConnect from "@/app/lib/dbConnect";
import SubDomain from "@/app/models/SubDomain";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const subDomains = await SubDomain.find({}).sort({ subDomainId: 1 });
    return NextResponse.json(subDomains);
  } catch (error) {
    console.error("Error in GET /api/sub-domains:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
