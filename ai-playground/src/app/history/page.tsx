"use client";

import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ContentHistoryComponent } from "@/components/ContentHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  ImageIcon,
  FileText,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
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

            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                <Clock className="inline w-8 h-8 mr-3" />
                Content Generation History
              </h1>
              <p className="text-gray-600 text-lg">
                View and manage your past AI content generations
              </p>
            </div>
          </div>

          {/* Content */}
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Your AI Content History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="conversation"
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Conversations
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Images
                  </TabsTrigger>
                  <TabsTrigger
                    value="document"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    URLs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <ContentHistoryComponent className="w-full" />
                </TabsContent>

                <TabsContent value="conversation" className="mt-6">
                  <ContentHistoryComponent
                    contentType="conversation"
                    className="w-full"
                  />
                </TabsContent>

                <TabsContent value="image" className="mt-6">
                  <ContentHistoryComponent
                    contentType="image"
                    className="w-full"
                  />
                </TabsContent>

                <TabsContent value="document" className="mt-6">
                  <ContentHistoryComponent
                    contentType="document"
                    className="w-full"
                  />
                </TabsContent>

                <TabsContent value="url" className="mt-6">
                  <ContentHistoryComponent
                    contentType="url"
                    className="w-full"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
