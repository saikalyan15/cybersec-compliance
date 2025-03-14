import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";
import dbConnect from "@/app/lib/dbConnect";
import Assessment from "@/app/models/Assessment";
import MainControl from "@/app/models/MainControl";
import SubControl from "@/app/models/SubControl";
import MainDomain from "@/app/models/MainDomain";
import SubDomain from "@/app/models/SubDomain";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch all assessments
    const assessments = await Assessment.find()
      .populate("owner", "firstName lastName")
      .lean();

    // Fetch all controls, domains, and sub-domains
    const mainControls = await MainControl.find().lean();
    const subControls = await SubControl.find().lean();
    const mainDomains = await MainDomain.find().lean();
    const subDomains = await SubDomain.find().lean();

    // Create lookup maps for efficient access
    const mainControlsMap = mainControls.reduce(
      (acc: { [key: string]: any }, control) => {
        // Main control ID is like "1-2-T-1"
        acc[control.controlId] = control;
        return acc;
      },
      {}
    );

    const subControlsMap = subControls.reduce(
      (acc: { [key: string]: any }, control) => {
        // Sub control ID is like "1-2-T-1-1"
        acc[control.subControlId] = control;
        return acc;
      },
      {}
    );

    // Log initial maps for debugging
    console.log(
      "Initial Main Controls:",
      mainControls.map((c) => c.controlId)
    );
    console.log(
      "Initial Sub Controls:",
      subControls.map((c) => c.subControlId)
    );

    const mainDomainsMap = mainDomains.reduce(
      (acc: { [key: number]: any }, domain) => {
        acc[domain.domainId] = domain;
        return acc;
      },
      {}
    );

    const subDomainsMap = subDomains.reduce(
      (acc: { [key: string]: any }, domain) => {
        acc[domain.subDomainId] = domain;
        return acc;
      },
      {}
    );

    // Enhance assessment controls with detailed information
    const enhancedAssessments = assessments.map((assessment) => {
      const enhancedControls = assessment.controls.map((control) => {
        const controlId = control.controlId; // e.g., "1-2-T-1-1"
        const parts = controlId.split("-"); // ["1", "2", "T", "1", "1"]

        // Extract IDs
        const domainId = parseInt(parts[0]); // 1
        const subDomainId = `${parts[0]}-${parts[1]}`; // "1-2"
        const mainControlId =
          parts.length === 5
            ? parts.slice(0, 4).join("-") // For sub-controls: "1-2-T-1"
            : controlId; // For main controls: already in correct format

        // Get the domain and control information
        const mainDomain = mainDomainsMap[domainId];
        const subDomain = subDomainsMap[subDomainId];
        const mainControl = mainControlsMap[mainControlId];
        const subControl =
          parts.length === 5 ? subControlsMap[controlId] : null;

        // Log for debugging
        console.log("Processing Control:", {
          controlId,
          mainControlId,
          foundMainControl: mainControl?.name,
          foundSubControl: subControl?.name,
        });

        return {
          ...control,
          domainId: parts[0], // "1"
          subDomainId: subDomainId, // "1-2"
          mainControlId: mainControlId, // "1-2-T-1"
          subControlId: controlId, // "1-2-T-1-1"
          mainControlName: mainControl?.name || "Unknown Control",
          subControlName:
            parts.length === 5
              ? subControl?.name || "Unknown Sub-Control"
              : mainControl?.name || "Unknown Control",
          mainDomainName: mainDomain?.name || "Unknown Domain",
          subDomainName: subDomain?.name || "Unknown Sub-Domain",
        };
      });

      return {
        ...assessment,
        controls: enhancedControls,
      };
    });

    // Log final debug information
    if (assessments.length > 0 && assessments[0].controls.length > 0) {
      const sampleControl = assessments[0].controls[0];
      console.log("Sample Control Details:", {
        original: sampleControl.controlId,
        mainId: sampleControl.controlId.split("-").slice(0, 4).join("-"),
        availableMainControls: Object.keys(mainControlsMap),
        foundMainControl:
          mainControlsMap[
            sampleControl.controlId.split("-").slice(0, 4).join("-")
          ]?.name,
      });
    }

    return NextResponse.json(enhancedAssessments);
  } catch (error) {
    console.error("Error in GET /api/assessments/detailed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
