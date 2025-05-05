import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UploadForm from '@/components/upload/UploadForm';
import FileList from '@/components/upload/FileList';
import { useAuth } from '@/contexts/AuthContext';

const UploadsPage: React.FC = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // Callback for when upload is successful
  const handleUploadSuccess = () => {
    // Increment trigger to refresh file list
    setRefreshTrigger(prev => prev + 1);
  };
  
  const isAdmin = user?.role === 'admin';

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">File Management</h1>
        <p className="text-muted-foreground">Upload and manage files in the system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Form Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Upload New File</CardTitle>
            <CardDescription>
              Upload files to the system (max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>

        {/* File List Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Files</CardTitle>
            <CardDescription>
              Manage your uploaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <Tabs defaultValue="my-files">
                <TabsList className="mb-4">
                  <TabsTrigger value="my-files">My Files</TabsTrigger>
                  <TabsTrigger value="all-files">All Files</TabsTrigger>
                </TabsList>
                <TabsContent value="my-files">
                  <FileList refreshTrigger={refreshTrigger} />
                </TabsContent>
                <TabsContent value="all-files">
                  <FileList refreshTrigger={refreshTrigger} />
                </TabsContent>
              </Tabs>
            ) : (
              <FileList refreshTrigger={refreshTrigger} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadsPage;