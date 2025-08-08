"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DocumentUpload } from "@/components/document-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  BookOpen,
  Loader2,
  ArrowLeft,
  Hash,
  Clock,
  BarChart3,
  Globe,
  Copy,
  Check,
  Download,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { ContentHistoryComponent } from "@/components/ContentHistory";

interface DocumentSummaryResult {
  title: string;
  summary: string;
  detailedSummary: string;
  keyPoints: string[];
  topics: string[];
  wordCount: number;
  readingTime: number;
  sentiment: string;
  difficulty: string;
  structure: {
    sections: number;
    tables: number;
    images: number;
    links: number;
  };
  metadata: {
    author?: string;
    publishDate?: string;
    language: string;
    source: string;
  };
  quotes: string[];
  actionItems: string[];
  fullText?: string;
}

export default function DocumentSummarization() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DocumentSummaryResult | null>(null);
  const [error, setError] = useState<string>("");
  const [copiedSection, setCopiedSection] = useState<string>("");
  const [analysisType, setAnalysisType] = useState<"document" | "url">(
    "document"
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  const handleFileSelect = () => {
    setResult(null);
    setError("");
    setAnalysisType("document");
  };

  const handleUrlSubmit = (url: string) => {
    setResult(null);
    setError("");
    setAnalysisType("url");
    analyzeUrl(url);
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

  const analyzeDocument = async (file: File) => {
    setIsProcessing(true);
    setError("");

    try {
      const base64Document = await convertToBase64(file);

      const response = await fetch("/api/analyze-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentData: base64Document,
          mimeType: file.type,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze document");
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeUrl = async (url: string) => {
    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/analyze-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze URL");
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

  const downloadSummary = () => {
    if (!result) return;

    const content = `
Document Summary Report
=====================

Title: ${result.title}

Summary:
${result.summary}

Detailed Summary:
${result.detailedSummary}

Key Points:
${result.keyPoints.map((point) => `• ${point}`).join("\n")}

Topics:
${result.topics.map((topic) => `• ${topic}`).join("\n")}

Action Items:
${result.actionItems.map((item) => `• ${item}`).join("\n")}

Key Quotes:
${result.quotes.map((quote) => `"${quote}"`).join("\n\n")}

Metadata:
• Word Count: ${result.wordCount}
• Reading Time: ${result.readingTime} minutes
• Sentiment: ${result.sentiment}
• Difficulty: ${result.difficulty}
• Language: ${result.metadata.language}
• Source: ${result.metadata.source}
${result.metadata.author ? `• Author: ${result.metadata.author}` : ""}
${
  result.metadata.publishDate
    ? `• Publish Date: ${result.metadata.publishDate}`
    : ""
}

Generated by AI Playground
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
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
          "linear-gradient(to bottom right, rgb(240 253 244), rgb(255 255 255), rgb(209 250 229))",
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Document & URL Summarization
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Upload documents (PDF, DOC, DOCX) or analyze web content to get
                comprehensive summaries, key insights, and actionable
                information powered by AI.
              </p>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <DocumentUpload
              onFileSelect={(file) => {
                handleFileSelect();
                analyzeDocument(file);
              }}
              onUrlSubmit={handleUrlSubmit}
              isProcessing={isProcessing}
            />

            {isProcessing && (
              <Card className="mt-6 border-green-200 bg-green-50/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                    <span className="text-green-800 font-medium">
                      {analysisType === "document"
                        ? "Analyzing document... Extracting text, tables, and charts."
                        : "Analyzing webpage... Extracting content and structure."}
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
              {/* Header with Title and Actions */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {result.title}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>{result.metadata.source}</span>
                        </span>
                        {result.metadata.author && (
                          <span>By {result.metadata.author}</span>
                        )}
                        {result.metadata.publishDate && (
                          <span>{result.metadata.publishDate}</span>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={downloadSummary}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Report</span>
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardContent className="p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-800">
                      {result.wordCount.toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-600">Words</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50/30">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-800">
                      {result.readingTime}
                    </p>
                    <p className="text-sm text-green-600">Min Read</p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/30">
                  <CardContent className="p-4 text-center">
                    <Hash className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold text-purple-800">
                      {result.topics.length}
                    </p>
                    <p className="text-sm text-purple-600">Topics</p>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50/30">
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-2xl font-bold text-orange-800">
                      {result.sentiment}
                    </p>
                    <p className="text-sm text-orange-600">Sentiment</p>
                  </CardContent>
                </Card>

                <Card className="border-cyan-200 bg-cyan-50/30">
                  <CardContent className="p-4 text-center">
                    <Eye className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
                    <p className="text-2xl font-bold text-cyan-800">
                      {result.difficulty}
                    </p>
                    <p className="text-sm text-cyan-600">Difficulty</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>Summary</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.summary, "summary")}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {copiedSection === "summary" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {result.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Detailed Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Detailed Analysis</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(result.detailedSummary, "detailed")
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
                    {result.detailedSummary}
                  </p>
                </CardContent>
              </Card>

              {/* Key Points and Topics */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.topics.map((topic, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Items (if any) */}
              {result.actionItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Action Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Key Quotes (if any) */}
              {result.quotes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Quotes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.quotes.map((quote, index) => (
                        <blockquote
                          key={index}
                          className="border-l-4 border-green-500 pl-4 italic text-gray-700 bg-gray-50 p-4 rounded-r-lg"
                        >
                          &ldquo;{quote}&rdquo;
                        </blockquote>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Document Structure */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {result.structure.sections}
                      </p>
                      <p className="text-sm text-gray-600">Sections</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {result.structure.tables}
                      </p>
                      <p className="text-sm text-gray-600">Tables</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {result.structure.images}
                      </p>
                      <p className="text-sm text-gray-600">Images</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {result.structure.links}
                      </p>
                      <p className="text-sm text-gray-600">Links</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Language
                      </p>
                      <p className="text-gray-900">
                        {result.metadata.language}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Source Type
                      </p>
                      <p className="text-gray-900">{result.metadata.source}</p>
                    </div>
                    {result.metadata.author && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Author
                        </p>
                        <p className="text-gray-900">
                          {result.metadata.author}
                        </p>
                      </div>
                    )}
                    {result.metadata.publishDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Published
                        </p>
                        <p className="text-gray-900">
                          {result.metadata.publishDate}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* History Component */}
        <div className="container mx-auto px-4 pb-8">
          <ContentHistoryComponent
            contentType="document"
            className="max-w-4xl mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
