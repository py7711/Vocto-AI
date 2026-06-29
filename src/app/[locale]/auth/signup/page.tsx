import {AuthPage} from "@/components/auth-pages";

export const metadata = {
  title: {
    absolute: "Sign Up | UniScribe - AI Audio & Video Transcription"
  }
};

export default function SignUpPage() {
  return <AuthPage mode="signup" />;
}
