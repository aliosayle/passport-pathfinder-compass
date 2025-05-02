
import { useState } from "react";
import { Airline } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addAirline, updateAirline } from "@/lib/data";

interface AirlineFormProps {
  airline?: Airline;
  onClose: () => void;
}

const AirlineForm = ({ airline, onClose }: AirlineFormProps) => {
  const [name, setName] = useState(airline?.name || "");
  const [code, setCode] = useState(airline?.code || "");
  const [contactInfo, setContactInfo] = useState(airline?.contactInfo || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!code.trim()) {
      newErrors.code = "Code is required";
    } else if (code.length > 3) {
      newErrors.code = "Airline code should be 2-3 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      if (airline) {
        // Update existing
        updateAirline({
          ...airline,
          name,
          code,
          contactInfo: contactInfo || undefined,
        });
        toast({
          title: "Airline Updated",
          description: `${name} has been updated successfully.`
        });
      } else {
        // Create new
        addAirline({
          name,
          code,
          contactInfo: contactInfo || undefined,
        });
        toast({
          title: "Airline Added",
          description: `${name} has been added successfully.`
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing the airline data.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {airline ? "Edit Airline" : "Add New Airline"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Airline Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Emirates"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">Airline Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="EK"
              maxLength={3}
              className={errors.code ? "border-destructive" : ""}
            />
            {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactInfo">Contact Information</Label>
          <Input
            id="contactInfo"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="customer.service@airline.com"
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {airline ? "Update Airline" : "Add Airline"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AirlineForm;
