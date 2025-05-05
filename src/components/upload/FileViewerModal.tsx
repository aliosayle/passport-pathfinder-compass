import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { UploadFile } from '@/services/uploadService';
import uploadService from '@/services/uploadService';
import { useToast } from '@/hooks/use-toast';

interface FileViewerModalProps {
  file: UploadFile | null;
  open: boolean;
  onClose: () => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, open, onClose }) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadFile = async () => {
      if (!file) return;

      try {
        setLoading(true);
        setError(null);
        // Use the getViewUrl method from uploadService instead of a non-existent viewFile function
        const url = uploadService.getViewUrl(file.id);
        setFileUrl(url);
      } catch (err) {
        console.error('Error loading file:', err);
        setError('Failed to load file. Please try again later.');
        toast({
          title: 'Error loading file',
          description: 'There was a problem loading the file for viewing.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (open && file) {
      loadFile();
    } else {
      setFileUrl(null);
    }
  }, [file, open, toast]);

  const handleDownload = () => {
    if (!file) return;

    try {
      const downloadUrl = uploadService.getDownloadUrl(file.id);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Download failed',
        description: 'There was a problem downloading the file.',
        variant: 'destructive',
      });
    }
  };

  // Determine content type to render appropriately
  const renderFileContent = () => {
    if (!file || !fileUrl) return null;

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4">
          <span className="text-destructive text-lg mb-2">⚠️</span>
          <p className="text-destructive font-medium">{error}</p>
        </div>
      );
    }

    // Handle different file types
    if (file.file_type.startsWith('image/')) {
      return (
        <div className="flex justify-center">
          <img 
            src={fileUrl} 
            alt={file.original_name}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      );
    } else if (file.file_type === 'application/pdf') {
      return (
        <iframe 
          src={fileUrl}
          title={file.original_name}
          className="w-full h-[70vh]" 
        />
      );
    } else {
      // For other file types, show a download prompt
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4">
          <p className="mb-4">This file type ({file.file_type}) can't be previewed directly.</p>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download File
          </Button>
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="truncate pr-4">
              {file?.original_name}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="my-4">
          {renderFileContent()}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {file?.file_size ? `${(file.file_size / 1024).toFixed(2)} KB` : ''}
            {file?.description && <span className="ml-2 hidden sm:inline">• {file.description}</span>}
          </div>
          <Button onClick={handleDownload} disabled={!file}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerModal;