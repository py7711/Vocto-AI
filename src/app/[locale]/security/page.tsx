import {InfoPage} from "@/components/info-pages";

export const metadata = {
  title: {
    absolute: "Security & Privacy | UniScribe"
  }
};

export default function SecurityRoute() {
  return <InfoPage type="security" />;
}
