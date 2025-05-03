import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Nationality } from "@/types";
import { Globe, Loader2 } from "lucide-react";
import NationalityForm from "./NationalityForm";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { nationalityService } from "@/services/nationalityService";
import { useToast } from "@/hooks/use-toast";

interface NationalityListProps {
  onSelect?: (nationality: Nationality) => void;
  onEdit?: (nationality: Nationality) => void;
}

const NationalityList = ({ onSelect, onEdit }: NationalityListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNationality, setSelectedNationality] = useState<Nationality | null>(null);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const fetchNationalities = async () => {
    try {
      setLoading(true);
      const data = await nationalityService.getAll();
      setNationalities(data);
      setError("");
    } catch (err) {
      console.error("Error fetching nationalities:", err);
      setError("Failed to load nationality data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNationalities();
  }, []);

  const filteredNationalities = nationalities.filter(
    nationality => 
      nationality.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nationality.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (nationality: Nationality) => {
    setSelectedNationality(nationality);
    setIsFormOpen(true);
    if (onEdit) onEdit(nationality);
  };

  const handleAddNew = () => {
    setSelectedNationality(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Nationality) => {
    try {
      if (selectedNationality) {
        // Update existing nationality
        await nationalityService.update(selectedNationality.id, data);
        toast({
          title: "Nationality Updated",
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Create new nationality
        await nationalityService.create(data);
        toast({
          title: "Nationality Added",
          description: `${data.name} has been added successfully.`,
        });
      }
      setIsFormOpen(false);
      fetchNationalities(); // Refresh the list
    } catch (error) {
      console.error("Error saving nationality:", error);
      toast({
        title: "Error",
        description: "Failed to save nationality data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Nationalities</h2>
        </div>
        <Button onClick={handleAddNew}>Add New Nationality</Button>
      </div>

      <div className="flex items-center space-x-2 pb-4">
        <Input
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading nationality data...</span>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Visa Requirements</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNationalities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No nationalities found
                  </TableCell>
                </TableRow>
              ) : (
                filteredNationalities.map((nationality) => (
                  <TableRow key={nationality.id}>
                    <TableCell className="font-medium">{nationality.name}</TableCell>
                    <TableCell>{nationality.code}</TableCell>
                    <TableCell>{nationality.visa_requirements || nationality.visaRequirements || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(nationality)}
                      >
                        Edit
                      </Button>
                      {onSelect && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelect(nationality)}
                          className="ml-2"
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
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogTitle>
            {selectedNationality ? "Edit Nationality" : "Add New Nationality"}
          </DialogTitle>
          <DialogDescription>
            {selectedNationality
              ? "Update the nationality information"
              : "Enter details for the new nationality"}
          </DialogDescription>
          <NationalityForm
            nationality={selectedNationality || undefined}
            onSubmit={handleFormSubmit}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NationalityList;
