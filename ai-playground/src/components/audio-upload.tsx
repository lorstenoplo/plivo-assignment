"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Mic, Play, Pause, Trash2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AudioUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export function AudioUpload({
  onFileSelect,
  isProcessing = false,
}: AudioUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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
      if (file.type.startsWith("audio/")) {
        setSelectedFile(file);
        onFileSelect(file);

        // Create audio URL for preview
        const audioUrl = URL.createObjectURL(file);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }
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
      const audioFile = files.find((file) => file.type.startsWith("audio/"));

      if (audioFile) {
        handleFileSelect(audioFile);
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

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const clearFile = () => {
    setSelectedFile(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (audioRef.current) {
      audioRef.current.src = "";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {!selectedFile ? (
        <Card
          className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
            dragActive
              ? "border-blue-500 bg-blue-50/50 scale-[1.02] shadow-lg"
              : "border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
          } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  dragActive
                    ? "bg-blue-500 text-white scale-110"
                    : "bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:scale-105"
                }`}
              >
                {dragActive ? (
                  <Upload className="w-8 h-8" />
                ) : (
                  <Volume2 className="w-8 h-8" />
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Audio File
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your audio file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports MP3, WAV, M4A, and other audio formats
                </p>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                disabled={isProcessing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileInput}
                className="hidden"
                disabled={isProcessing}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedFile.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

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

            {/* Audio Player Controls */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayback}
                  className="w-8 h-8 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={isProcessing}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </Button>

                <div className="flex-1 space-y-1">
                  <Progress
                    value={duration ? (currentTime / duration) * 100 : 0}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>

            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
