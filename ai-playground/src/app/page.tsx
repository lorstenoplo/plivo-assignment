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

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Playground
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unleash the power of multi-modal AI with conversation analysis,
              image understanding, and document summarization
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">
                  🎙️ Audio Analysis
                </CardTitle>
                <CardDescription>
                  Upload audio files for speech-to-text conversion and speaker
                  diarization
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">
                  🖼️ Image Analysis
                </CardTitle>
                <CardDescription>
                  Generate detailed descriptions and insights from your images
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">
                  📄 Document Summary
                </CardTitle>
                <CardDescription>
                  Summarize PDFs, documents, and web content with AI precision
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="space-y-4 mt-12">
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/auth/signup")}
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/auth/signin")}
                className="text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Create an account or sign in to explore all AI-powered features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
