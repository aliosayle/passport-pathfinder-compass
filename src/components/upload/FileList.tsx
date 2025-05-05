import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import uploadService, { UploadFile } from '@/services/uploadService';
import { formatDistanceToNow } from 'date-fns';
import { Download, MoreHorizontal, Trash, PenLine, Eye } from 'lucide-react';
import FileViewerModal from './FileViewerModal';

interface FileListProps {
  employeeId?: string; // Display files for specific employee
  userId?: string; // If provided, show files for specific user (admin only)
  refreshTrigger?: number; // To trigger refresh from parent component
  compact?: boolean; // Display in compact mode (for tabs)
}

const FileList: React.FC<FileListProps> = ({ employeeId, userId, refreshTrigger = 0, compact = false }) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showFileViewerModal, setShowFileViewerModal] = useState<boolean>(false);
  const [newDescription, setNewDescription] = useState<string>('');
  const { toast } = useToast();

  // Fetch files based on context
  const fetchFiles = async () => {
    try {
      setLoading(true);
      let fileData: UploadFile[];
      
      if (employeeId) {
        // Fetch files for specific employee
        fileData = await uploadService.getByEmployeeId(employeeId);
      } else if (userId) {
        // Admin viewing specific user's files
        fileData = await uploadService.getByUserId(userId);
      } else {
        // User viewing their own files
        fileData = await uploadService.getMyUploads();
      }
      
      setFiles(fileData);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Failed to load files',
        description: 'There was a problem fetching the file list.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refresh when trigger changes
  useEffect(() => {
    fetchFiles();
  }, [employeeId, userId, refreshTrigger]);

  // Handle file download
  const handleDownload = (file: UploadFile) => {
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

  // Handle file view
  const handleViewFile = (file: UploadFile) => {
    setSelectedFile(file);
    setShowFileViewerModal(true);
  };

  // Open edit description dialog
  const handleEditDescription = (file: UploadFile) => {
    setSelectedFile(file);
    setNewDescription(file.description || '');
    setShowDescriptionDialog(true);
  };

  // Save updated description
  const handleSaveDescription = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadService.updateDescription(selectedFile.id, newDescription);
      
      // Update local state
      setFiles((prevFiles) => 
        prevFiles.map((file) => 
          file.id === selectedFile.id 
            ? { ...file, description: newDescription } 
            : file
        )
      );
      
      toast({
        title: 'Description updated',
        description: 'File description has been updated successfully.',
      });
      
      setShowDescriptionDialog(false);
    } catch (error) {
      console.error('Error updating description:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update file description.',
        variant: 'destructive',
      });
    }
  };

  // Open delete confirmation dialog
  const handleDeletePrompt = (file: UploadFile) => {
    setSelectedFile(file);
    setShowDeleteDialog(true);
  };

  // Delete file
  const handleDeleteConfirm = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadService.delete(selectedFile.id);
      
      // Update local state
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== selectedFile.id));
      
      toast({
        title: 'File deleted',
        description: 'File has been deleted successfully.',
      });
      
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete file.',
        variant: 'destructive',
      });
    }
  };

  // Format file size for display
  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // Get file icon based on type
  const getFileTypeIcon = (fileType: string): string => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType.includes('pdf')) {
      return '📄';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return '📊';
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
      return '🗜️';
    } else {
      return '📁';
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No files found. Upload a file to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date</TableHead>
                  {!compact && <TableHead>Description</TableHead>}
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="text-center text-lg">
                      {getFileTypeIcon(file.file_type)}
                    </TableCell>
                    <TableCell className="font-medium">{file.original_name}</TableCell>
                    <TableCell>{formatFileSize(file.file_size)}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(file.upload_date), { addSuffix: true })}</TableCell>
                    {!compact && (
                      <TableCell className="max-w-[200px] truncate">
                        {file.description || '—'}
                      </TableCell>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewFile(file)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View File
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditDescription(file)}>
                            <PenLine className="mr-2 h-4 w-4" />
                            Edit Description
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePrompt(file)} className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      {/* Edit Description Dialog */}
      <Dialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Description</DialogTitle>
            <DialogDescription>
              Update the description for {selectedFile?.original_name}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Enter a description for this file"
            className="min-h-[100px]"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveDescription}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedFile?.original_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete File</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Viewer Modal */}
      <FileViewerModal
        open={showFileViewerModal}
        onClose={() => setShowFileViewerModal(false)}
        file={selectedFile}
      />
    </div>
  );
};

export default FileList;