"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AudioUpload } from "@/components/audio-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Clock, MessageCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Speaker {
  id: string;
  label: string;
  segments: Array<{
    text: string;
    startTime: number;
    endTime: number;
  }>;
}

interface AnalysisResult {
  transcript: string;
  speakers: Speaker[];
  summary: string;
  keyTopics: string[];
  sentiment: string;
  duration: number;
}

export default function ConversationAnalysis() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError("");
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const analyzeAudio = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError("");

    try {
      // Convert audio to base64
      const base64Audio = await convertToBase64(selectedFile);

      // Send to Gemini API for analysis
      const response = await fetch("/api/analyze-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioData: base64Audio,
          mimeType: selectedFile.type,
          fileName: selectedFile.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze audio");
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div
      style={{
        background:
          "linear-gradient(to bottom right, rgb(239 246 255), rgb(255 255 255), rgb(250 245 255))",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Conversation Analysis
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Upload an audio file to get speech-to-text transcription with
                speaker diarization, conversation summary, and key insights
                powered by AI.
              </p>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <AudioUpload
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
            />

            {selectedFile && !isProcessing && !result && (
              <div className="text-center mt-6">
                <Button
                  onClick={analyzeAudio}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Analyze Conversation
                </Button>
              </div>
            )}

            {isProcessing && (
              <Card className="mt-6 border-blue-200 bg-blue-50/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-blue-800 font-medium">
                      Analyzing conversation... This may take a few moments.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="mt-6 border-red-200 bg-red-50/30">
                <CardContent className="p-6">
                  <div className="text-red-800 text-center">
                    <p className="font-medium">Analysis Failed</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-green-50/30">
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-800">
                      {result.speakers.length}
                    </p>
                    <p className="text-sm text-green-600">Speakers Detected</p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/30">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-800">
                      {formatTime(result.duration)}
                    </p>
                    <p className="text-sm text-blue-600">Duration</p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/30">
                  <CardContent className="p-4 text-center">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold text-purple-800">
                      {result.sentiment}
                    </p>
                    <p className="text-sm text-purple-600">Overall Sentiment</p>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Conversation Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {result.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Key Topics */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.keyTopics.map((topic, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Speaker Diarization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Speaker Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {result.speakers.map((speaker, index) => (
                    <div key={speaker.id} className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`${
                            index === 0
                              ? "bg-blue-500 text-white"
                              : "bg-purple-500 text-white"
                          }`}
                        >
                          {speaker.label}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {speaker.segments.length} segments
                        </span>
                      </div>

                      <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                        {speaker.segments.map((segment, segIndex) => (
                          <div
                            key={segIndex}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs text-gray-500">
                                {formatTime(segment.startTime)} -{" "}
                                {formatTime(segment.endTime)}
                              </span>
                            </div>
                            <p className="text-gray-800">{segment.text}</p>
                          </div>
                        ))}
                      </div>

                      {index < result.speakers.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Full Transcript */}
              <Card>
                <CardHeader>
                  <CardTitle>Full Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                      {result.transcript}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
