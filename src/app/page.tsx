"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import ChatInterface from "@/components/ChatInterface";
import { useApp } from "@/contexts/AppContext";

export default function Home() {
  const { sessionId, status } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <DashboardLayout sessionId={sessionId} status={status}>
      <ChatInterface />
    </DashboardLayout>
  );
}
