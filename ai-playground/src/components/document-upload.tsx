"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Link,
  Globe,
  Download,
  BookOpen,
  FileImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  isProcessing?: boolean;
}

export function DocumentUpload({
  onFileSelect,
  onUrlSubmit,
  isProcessing = false,
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/markdown",
      ];

      if (
        allowedTypes.includes(file.type) ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".txt")
      ) {
        setSelectedFile(file);
        onFileSelect(file);
      } else {
        alert(
          "Please upload a supported document format (PDF, DOC, DOCX, TXT, MD)"
        );
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      const documentFile = files[0];

      if (documentFile) {
        handleFileSelect(documentFile);
      }
    },
    [handleFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUrlSubmit(url.trim());
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearUrl = () => {
    setUrl("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf")
      return <FileImage className="w-6 h-6 text-red-500" />;
    if (file.type.includes("word"))
      return <FileText className="w-6 h-6 text-blue-500" />;
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type === "application/pdf") return "PDF Document";
    if (file.type.includes("word")) return "Word Document";
    if (file.type === "text/plain") return "Text File";
    if (file.name.endsWith(".md")) return "Markdown File";
    return "Document";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Analyze URL</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {!selectedFile ? (
            <Card
              className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
                dragActive
                  ? "border-green-500 bg-green-50/50 scale-[1.02] shadow-lg shadow-green-200"
                  : "border-dashed border-2 border-gray-300 hover:border-green-400 hover:bg-green-50/30"
              } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CardContent className="p-12">
                <div className="text-center space-y-6">
                  <div
                    className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                      dragActive
                        ? "bg-green-500 text-white scale-110 shadow-lg"
                        : "bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:scale-105 shadow-md"
                    }`}
                  >
                    {dragActive ? (
                      <Upload className="w-10 h-10" />
                    ) : (
                      <BookOpen className="w-10 h-10" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Upload Your Document
                    </h3>
                    <p className="text-gray-600 mb-4 text-lg">
                      Drag and drop your document here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, DOC, DOCX, TXT, MD • Max 50MB
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      disabled={isProcessing}
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Choose Document
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </div>
              </CardContent>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 opacity-10">
                <BookOpen className="w-8 h-8 text-green-500" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-10">
                <FileText className="w-8 h-8 text-emerald-500" />
              </div>
            </Card>
          ) : (
            <Card className="border-green-200 bg-green-50/30 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* File Info Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                        {getFileIcon(selectedFile)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {selectedFile.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(selectedFile.size)} •{" "}
                          {getFileTypeLabel(selectedFile)}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = URL.createObjectURL(selectedFile);
                          link.download = selectedFile.name;
                          link.click();
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFile}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={isProcessing}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Type
                      </p>
                      <p className="font-semibold text-gray-900">
                        {getFileTypeLabel(selectedFile)}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Size
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Status
                      </p>
                      <p className="font-semibold text-green-600">Ready</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        AI Model
                      </p>
                      <p className="font-semibold text-green-600">Gemini 2.5</p>
                    </div>
                  </div>

                  {/* Processing overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                      <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-medium text-green-800">
                            Processing...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-6">
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="url"
                    className="text-lg font-semibold text-gray-900"
                  >
                    Website URL
                  </Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com/article"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="pl-10 h-12 text-lg"
                        disabled={isProcessing}
                        required
                      />
                    </div>
                    {url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearUrl}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={isProcessing}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Enter the URL of an article, blog post, or webpage you want
                    to summarize
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={!url.trim() || isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Analyze URL
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
