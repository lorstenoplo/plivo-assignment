"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Sparkles,
  Loader2,
  ArrowLeft,
  Palette,
  Tag,
  Users,
  MapPin,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

interface ImageAnalysisResult {
  description: string;
  detailedDescription: string;
  objects: string[];
  colors: string[];
  mood: string;
  style: string;
  people: {
    count: number;
    details: string[];
  };
  location: string;
  timeOfDay: string;
  textContent: string;
  technicalDetails: {
    composition: string;
    lighting: string;
    quality: string;
  };
  tags: string[];
}

export default function ImageAnalysis() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [error, setError] = useState<string>("");
  const [copiedSection, setCopiedSection] = useState<string>("");

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

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError("");

    try {
      const base64Image = await convertToBase64(selectedFile);

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: base64Image,
          mimeType: selectedFile.type,
          fileName: selectedFile.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(""), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
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
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, rgb(250 245 255), rgb(255 255 255), rgb(253 242 248))",
        backgroundAttachment: "fixed",
      }}
    >
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Image Analysis
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload any image and get detailed AI-powered descriptions, object
              detection, color analysis, and comprehensive insights powered by
              Gemini.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <ImageUpload
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
          />

          {selectedFile && !isProcessing && !result && (
            <div className="text-center mt-6">
              <Button
                onClick={analyzeImage}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze Image
              </Button>
            </div>
          )}

          {isProcessing && (
            <Card className="mt-6 border-purple-200 bg-purple-50/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  <span className="text-purple-800 font-medium">
                    Analyzing your image... This may take a few moments.
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
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-blue-200 bg-blue-50/30">
                <CardContent className="p-4 text-center">
                  <Tag className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-800">
                    {result.objects.length}
                  </p>
                  <p className="text-sm text-blue-600">Objects Detected</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/30">
                <CardContent className="p-4 text-center">
                  <Palette className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-800">
                    {result.colors.length}
                  </p>
                  <p className="text-sm text-purple-600">Colors Found</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/30">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-800">
                    {result.people.count}
                  </p>
                  <p className="text-sm text-green-600">People Detected</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50/30">
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold text-orange-800">
                    {result.timeOfDay || "Unknown"}
                  </p>
                  <p className="text-sm text-orange-600">Time of Day</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>AI Description</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(result.description, "description")
                    }
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copiedSection === "description" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {result.description}
                </p>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Detailed Analysis</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(result.detailedDescription, "detailed")
                    }
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copiedSection === "detailed" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {result.detailedDescription}
                </p>
              </CardContent>
            </Card>

            {/* Objects & Tags */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Objects Detected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.objects.map((object, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {object}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-purple-300 text-purple-700"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Color Palette</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {result.colors.map((color, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm bg-gradient-to-br"
                        style={{ background: color.toLowerCase() }}
                      ></div>
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-800"
                      >
                        {color}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scene Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Scene Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Location/Setting
                    </p>
                    <p className="text-gray-900">
                      {result.location || "Not specified"}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Mood/Atmosphere
                    </p>
                    <p className="text-gray-900">{result.mood}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Style</p>
                    <p className="text-gray-900">{result.style}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Composition
                    </p>
                    <p className="text-gray-900">
                      {result.technicalDetails.composition}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Lighting
                    </p>
                    <p className="text-gray-900">
                      {result.technicalDetails.lighting}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quality</p>
                    <p className="text-gray-900">
                      {result.technicalDetails.quality}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* People Details (if any) */}
            {result.people.count > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>People Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.people.details.map((detail, index) => (
                      <p
                        key={index}
                        className="text-gray-700 bg-gray-50 p-3 rounded-lg"
                      >
                        {detail}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Text Content (if any) */}
            {result.textContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Text Content (OCR)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(result.textContent, "text")
                      }
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {copiedSection === "text" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                      {result.textContent}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
