import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import uploadService from '@/services/uploadService';
import { Loader2 } from 'lucide-react';

interface UploadFormProps {
  onUploadSuccess?: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsUploading(true);
      await uploadService.upload(selectedFile, description || undefined);
      
      toast({
        title: 'File uploaded successfully',
        description: `${selectedFile.name} has been uploaded.`,
      });
      
      // Reset form
      setSelectedFile(null);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Callback to refresh list or perform other actions
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'There was a problem uploading your file.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="file" className="block text-sm font-medium">
          Select File
        </label>
        <Input
          id="file"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="cursor-pointer"
          disabled={isUploading}
        />
      </div>
      
      {selectedFile && (
        <div className="text-sm text-muted-foreground">
          Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description (optional)
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description for this file"
          disabled={isUploading}
        />
      </div>
      
      <Button type="submit" disabled={!selectedFile || isUploading} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          'Upload File'
        )}
      </Button>
    </form>
  );
};

export default UploadForm;