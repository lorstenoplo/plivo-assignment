"use client";

import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import Link from "next/link";

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.email}!</h1>
            <p className="text-muted-foreground">
              Choose your AI-powered tool below
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/conversation-analysis">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-2 hover:border-blue-300">
              <CardHeader>
                <CardTitle className="text-primary flex items-center space-x-2">
                  <span>🎙️</span>
                  <span>Conversation Analysis</span>
                </CardTitle>
                <CardDescription>
                  Upload audio files for speech-to-text conversion and speaker
                  diarization with AI-powered insights
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/image-analysis">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-2 hover:border-purple-300">
              <CardHeader>
                <CardTitle className="text-primary flex items-center space-x-2">
                  <span>🖼️</span>
                  <span>Image Analysis</span>
                </CardTitle>
                <CardDescription>
                  Generate detailed descriptions and insights from your images
                  with AI-powered visual analysis
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/document-summarization">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-2 hover:border-green-300">
              <CardHeader>
                <CardTitle className="text-primary flex items-center space-x-2">
                  <span>📄</span>
                  <span>Document Summarization</span>
                </CardTitle>
                <CardDescription>
                  Summarize PDFs, documents, and web content with AI precision
                  and comprehensive analysis
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
