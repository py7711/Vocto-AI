import {LegalPage} from "@/components/legal-pages";

export const metadata = {
  title: {
    absolute: "Privacy Policy | UniScribe - AI Audio & Video Transcription"
  }
};

export default function PrivacyPolicyRoute() {
  return <LegalPage type="privacy" />;
}
