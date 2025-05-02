
import { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VisaType } from "@/types";
import { visaTypes } from "@/lib/data";
import { Stamp, Filter, Flag } from "lucide-react";
import VisaForm from "./VisaForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VisaList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);

  const uniqueCountries = Array.from(new Set(visaTypes.map(visa => visa.countryName)));
  
  const filteredVisas = visaTypes.filter(visa => {
    const matchesSearch = 
      visa.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visa.duration.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = countryFilter === "all" || visa.countryName === countryFilter;
    
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Stamp className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Visa Types</h2>
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
                      <span>{visa.countryName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{visa.type}</TableCell>
                  <TableCell>{visa.duration}</TableCell>
                  <TableCell className="max-w-xs truncate">{visa.requirements}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVisa(visa)}
                    >
                      Edit
                    </Button>
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
