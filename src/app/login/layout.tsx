import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Login | Genesoft Infotech",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
