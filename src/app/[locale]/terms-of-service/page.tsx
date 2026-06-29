import {LegalPage} from "@/components/legal-pages";

export const metadata = {
  title: {
    absolute: "Terms of Service | UniScribe - AI Audio & Video Transcription"
  }
};

export default function TermsOfServiceRoute() {
  return <LegalPage type="terms" />;
}
