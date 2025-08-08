"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Camera, Trash2, Eye, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export function ImageUpload({
  onFileSelect,
  isProcessing = false,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
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
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        onFileSelect(file);

        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
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
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        handleFileSelect(imageFile);
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

  const clearFile = () => {
    setSelectedFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {!selectedFile ? (
        <Card
          className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
            dragActive
              ? "border-purple-500 bg-purple-50/50 scale-[1.02] shadow-lg shadow-purple-200"
              : "border-dashed border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50/30"
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
                    ? "bg-purple-500 text-white scale-110 shadow-lg"
                    : "bg-gradient-to-br from-purple-500 to-pink-600 text-white hover:scale-105 shadow-md"
                }`}
              >
                {dragActive ? (
                  <Upload className="w-10 h-10" />
                ) : (
                  <Camera className="w-10 h-10" />
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Upload Your Image
                </h3>
                <p className="text-gray-600 mb-4 text-lg">
                  Drag and drop your image here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, GIF, WebP and other image formats • Max
                  10MB
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  disabled={isProcessing}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Choose Image
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                disabled={isProcessing}
              />
            </div>
          </CardContent>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 opacity-10">
            <Sparkles className="w-8 h-8 text-purple-500" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-10">
            <Camera className="w-8 h-8 text-pink-500" />
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
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {selectedFile.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = imagePreview;
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

              {/* Image Preview */}
              <div className="relative">
                <div className="rounded-lg overflow-hidden bg-gray-100 shadow-inner">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-96 object-contain"
                    priority
                  />
                </div>

                {/* Image overlay for processing state */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                    <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-purple-800">
                          Analyzing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Format
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedFile.type.split("/")[1].toUpperCase()}
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
                  <p className="font-semibold text-purple-600">Gemini 2.5</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
