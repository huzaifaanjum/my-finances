import type { Metadata } from "next";
import EducationView from "@/components/education/EducationView";

export const metadata: Metadata = { title: "Financial education" };

export default function EducationPage() {
  return <EducationView />;
}
