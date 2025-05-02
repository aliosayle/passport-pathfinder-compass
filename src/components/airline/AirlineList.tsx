
import { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Airline } from "@/types";
import { airlines } from "@/lib/data";
import { Plane } from "lucide-react";
import AirlineForm from "./AirlineForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AirlineListProps {
  onSelect?: (airline: Airline) => void;
  onEdit?: (airline: Airline) => void;
}

const AirlineList = ({ onSelect, onEdit }: AirlineListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);

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
            {filteredAirlines.length === 0 ? (
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
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(airline)}
                    >
                      Edit
                    </Button>
                    {onSelect && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelect(airline)}
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
        <DialogContent className="sm:max-w-[550px]">
          <AirlineForm
            airline={selectedAirline || undefined}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AirlineList;
