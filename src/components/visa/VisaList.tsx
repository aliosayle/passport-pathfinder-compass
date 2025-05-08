import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { visaTypeService, VisaType } from "@/services/visaTypeService";
import { Stamp, Filter, Flag, Loader2, Trash2 } from "lucide-react";
import VisaForm from "./VisaForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const VisaList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [visaToDelete, setVisaToDelete] = useState<VisaType | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVisaTypes();
  }, []);

  const fetchVisaTypes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await visaTypeService.getAll();
      setVisaTypes(data);
    } catch (error) {
      console.error("Error fetching visa types:", error);
      setError("Failed to load visa types. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Extract unique countries for filtering
  const uniqueCountries = Array.from(
    new Set(visaTypes.map(visa => visa.country_name))
  ).sort();

  const filteredVisas = visaTypes.filter(visa => {
    const matchesSearch = 
      visa.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.country_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.duration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visa.requirements && visa.requirements.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCountry = countryFilter === "all" || visa.country_name === countryFilter;
    
    return matchesSearch && matchesCountry;
  });

  const handleEditVisa = (visa: VisaType) => {
    setSelectedVisa(visa);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedVisa(null);
    setIsFormOpen(true);
  };

  const confirmDelete = (visa: VisaType) => {
    setVisaToDelete(visa);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!visaToDelete) return;
    
    try {
      await visaTypeService.delete(visaToDelete.id);
      toast({
        title: "Visa Type Deleted",
        description: `"${visaToDelete.type}" visa for ${visaToDelete.country_name} has been deleted.`
      });
      setVisaTypes(visaTypes.filter(v => v.id !== visaToDelete.id));
    } catch (error) {
      console.error("Error deleting visa type:", error);
      toast({
        title: "Error",
        description: "Failed to delete visa type. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setVisaToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    fetchVisaTypes();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading visa types...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchVisaTypes}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Stamp className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Visa Types</h2>
          <p className="text-sm text-muted-foreground ml-2">
            {visaTypes.length} {visaTypes.length === 1 ? "entry" : "entries"} found
          </p>
        </div>
        <Button onClick={handleAddNew}>Add New Visa Type</Button>
      </div>

      <div className="flex items-center space-x-2 pb-4">
        <Input
          placeholder="Search by type, country, duration..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {uniqueCountries.map((country) => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Visa Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVisas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No visa types found
                </TableCell>
              </TableRow>
            ) : (
              filteredVisas.map((visa) => (
                <TableRow key={visa.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Flag className="h-4 w-4 text-muted-foreground" />
                      <span>{visa.country_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{visa.type}</TableCell>
                  <TableCell>{visa.duration}</TableCell>
                  <TableCell className="max-w-xs truncate">{visa.requirements}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditVisa(visa)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => confirmDelete(visa)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedVisa ? "Edit Visa Type" : "Add New Visa Type"}</DialogTitle>
            <DialogDescription>
              {selectedVisa 
                ? "Update the details of an existing visa type." 
                : "Add a new visa type to the system."
              }
            </DialogDescription>
          </DialogHeader>
          <VisaForm
            visa={selectedVisa || undefined}
            onClose={() => setIsFormOpen(false)}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{visaToDelete?.type}" visa type for {visaToDelete?.country_name}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VisaList;
