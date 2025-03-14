import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import dbConnect from "@/app/lib/dbConnect";
import MainControl from "@/app/models/MainControl";
import SubControl from "@/app/models/SubControl";
import SubDomain from "@/app/models/SubDomain";

interface SubDomainInfo {
  name: string;
  id: string;
}

interface SubDomainMap {
  [key: string]: SubDomainInfo;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get all sub-controls
    const subControls = await SubControl.find()
      .populate("controlId", "name")
      .lean();

    // Get all main control IDs that have sub-controls
    const mainControlIdsWithSubs = Array.from(
      new Set(subControls.map((sc) => sc.controlId))
    );

    // Get main controls that don't have sub-controls
    const mainControlsWithoutSubs = await MainControl.find({
      _id: { $nin: mainControlIdsWithSubs },
    }).lean();

    // Get all unique sub-domain IDs
    const subDomainIds = Array.from(
      new Set([
        ...subControls.map((sc) => sc.subDomainId),
        ...mainControlsWithoutSubs.map((mc) => mc.subDomainId),
      ])
    );

    // Get sub-domains
    const subDomains = await SubDomain.find({
      subDomainId: { $in: subDomainIds },
    }).lean();

    // Create a map of sub-domain details
    const subDomainMap: SubDomainMap = subDomains.reduce((acc, sd) => {
      acc[sd.subDomainId] = {
        name: sd.name,
        id: sd.subDomainId,
      };
      return acc;
    }, {} as SubDomainMap);

    // Format controls for the response
    const formattedControls = [
      // Format sub-controls
      ...subControls.map((sc) => ({
        controlId: sc.subControlId,
        name: sc.name,
        evidenceOwner: "",
        verifiedEvidence: "",
        missingEvidence: "",
        status: "Not Implemented",
        comments: "",
        artifactLink: "",
        subDomainName: subDomainMap[sc.subDomainId]?.name || "",
        subDomainId: sc.subDomainId,
      })),
      // Format main controls without sub-controls
      ...mainControlsWithoutSubs.map((mc) => ({
        controlId: mc.controlId,
        name: mc.name,
        evidenceOwner: "",
        verifiedEvidence: "",
        missingEvidence: "",
        status: "Not Implemented",
        comments: "",
        artifactLink: "",
        subDomainName: subDomainMap[mc.subDomainId]?.name || "",
        subDomainId: mc.subDomainId,
      })),
    ];

    return NextResponse.json(formattedControls);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
