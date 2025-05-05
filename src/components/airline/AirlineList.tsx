import { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Airline } from "@/types";
import { Plane, Trash2, Loader2 } from "lucide-react";
import AirlineForm from "./AirlineForm";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { airlineService } from "@/services/airlineService";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface AirlineListProps {
  onSelect?: (airline: Airline) => void;
  onEdit?: (airline: Airline) => void;
}

const AirlineList = ({ onSelect, onEdit }: AirlineListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [airlineToDelete, setAirlineToDelete] = useState<Airline | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch airlines data
  const { data: airlines = [], isLoading, isError } = useQuery({
    queryKey: ['airlines'],
    queryFn: () => airlineService.getAll()
  });

  const filteredAirlines = airlines.filter(
    airline => 
      airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airline.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (airline: Airline) => {
    setSelectedAirline(airline);
    setIsFormOpen(true);
    if (onEdit) onEdit(airline);
  };

  const handleAddNew = () => {
    setSelectedAirline(null);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (airline: Airline) => {
    setAirlineToDelete(airline);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!airlineToDelete) return;
    
    try {
      await airlineService.delete(airlineToDelete.id);
      
      toast({
        title: "Airline Deleted",
        description: `${airlineToDelete.name} has been deleted successfully.`
      });
      
      // Refresh airlines data
      queryClient.invalidateQueries({ queryKey: ['airlines'] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the airline. It may be in use by tickets or flights.",
        variant: "destructive"
      });
    }
    
    setIsDeleteDialogOpen(false);
    setAirlineToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Plane className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Airlines</h2>
        </div>
        <Button onClick={handleAddNew}>Add New Airline</Button>
      </div>

      <div className="flex items-center space-x-2 pb-4">
        <Input
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading airlines...
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-destructive">
                  Error loading airlines. Please try again.
                </TableCell>
              </TableRow>
            ) : filteredAirlines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No airlines found
                </TableCell>
              </TableRow>
            ) : (
              filteredAirlines.map((airline) => (
                <TableRow key={airline.id}>
                  <TableCell className="font-medium">{airline.name}</TableCell>
                  <TableCell>{airline.code}</TableCell>
                  <TableCell>{airline.contactInfo || "N/A"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(airline)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(airline)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {onSelect && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelect(airline)}
                      >
                        Select
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogTitle>
            {selectedAirline ? "Edit Airline" : "Add New Airline"}
          </DialogTitle>
          <DialogDescription>
            {selectedAirline 
              ? "Edit the airline details below. Click update when you're done."
              : "Enter the details of the airline you want to add."}
          </DialogDescription>
          <AirlineForm
            airline={selectedAirline || undefined}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Airline</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {airlineToDelete?.name}? This action cannot be undone.
              <br />
              <br />
              <strong>Note:</strong> If this airline is associated with any tickets or flights, the deletion will fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AirlineList;
