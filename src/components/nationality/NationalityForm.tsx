
import { useState } from "react";
import { Nationality } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addNationality, updateNationality } from "@/lib/data";

interface NationalityFormProps {
  nationality?: Nationality;
  onClose: () => void;
}

const NationalityForm = ({ nationality, onClose }: NationalityFormProps) => {
  const [name, setName] = useState(nationality?.name || "");
  const [code, setCode] = useState(nationality?.code || "");
  const [visaRequirements, setVisaRequirements] = useState(nationality?.visaRequirements || "");
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
      newErrors.code = "Country code should be 2-3 characters";
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
      if (nationality) {
        // Update existing
        updateNationality({
          ...nationality,
          name,
          code,
          visaRequirements: visaRequirements || undefined,
        });
        toast({
          title: "Nationality Updated",
          description: `${name} has been updated successfully.`
        });
      } else {
        // Create new
        addNationality({
          name,
          code,
          visaRequirements: visaRequirements || undefined,
        });
        toast({
          title: "Nationality Added",
          description: `${name} has been added successfully.`
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing the nationality data.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {nationality ? "Edit Nationality" : "Add New Nationality"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Country Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="United States"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">Country Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="US"
              maxLength={3}
              className={errors.code ? "border-destructive" : ""}
            />
            {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="visaRequirements">Visa Requirements</Label>
          <Textarea
            id="visaRequirements"
            value={visaRequirements}
            onChange={(e) => setVisaRequirements(e.target.value)}
            placeholder="Details about visa requirements for this nationality..."
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {nationality ? "Update Nationality" : "Add Nationality"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NationalityForm;
