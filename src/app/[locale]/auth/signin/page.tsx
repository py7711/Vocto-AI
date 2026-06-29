import {AuthPage} from "@/components/auth-pages";

export const metadata = {
  title: {
    absolute: "Sign In | UniScribe - AI Audio & Video Transcription"
  }
};

export default function SignInPage() {
  return <AuthPage mode="signin" />;
}
