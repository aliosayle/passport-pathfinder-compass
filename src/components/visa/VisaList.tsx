
import { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VisaType } from "@/types";
import { visaTypes } from "@/lib/data";
import { IdCard } from "lucide-react";
import VisaForm from "./VisaForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VisaListProps {
  onSelect?: (visa: VisaType) => void;
  onEdit?: (visa: VisaType) => void;
}

const VisaList = ({ onSelect, onEdit }: VisaListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);

  const filteredVisas = visaTypes.filter(
    visa => 
      visa.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.countryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (visa: VisaType) => {
    setSelectedVisa(visa);
    setIsFormOpen(true);
    if (onEdit) onEdit(visa);
  };

  const handleAddNew = () => {
    setSelectedVisa(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <IdCard className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Visa Types</h2>
        </div>
        <Button onClick={handleAddNew}>Add New Visa Type</Button>
      </div>

      <div className="flex items-center space-x-2 pb-4">
        <Input
          placeholder="Search by type or country..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Country</TableHead>
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
                  <TableCell className="font-medium">{visa.type}</TableCell>
                  <TableCell>{visa.countryName} ({visa.countryCode})</TableCell>
                  <TableCell>{visa.duration}</TableCell>
                  <TableCell className="truncate max-w-[200px]">{visa.requirements}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(visa)}
                    >
                      Edit
                    </Button>
                    {onSelect && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelect(visa)}
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <VisaForm
            visa={selectedVisa || undefined}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisaList;
