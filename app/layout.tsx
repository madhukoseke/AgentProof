import "./globals.css";

export const metadata = {
  title: "AgentProof — CI/CD for AI Agents",
  description: "Build agents. Break them. Fix them. Trust them."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
