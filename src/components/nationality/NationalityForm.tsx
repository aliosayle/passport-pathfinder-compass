import { useState } from "react";
import { Nationality } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface NationalityFormProps {
  nationality?: Nationality;
  onSubmit: (data: Nationality) => void;
  onClose: () => void;
}

const NationalityForm = ({ nationality, onSubmit, onClose }: NationalityFormProps) => {
  const [name, setName] = useState(nationality?.name || "");
  const [code, setCode] = useState(nationality?.code || "");
  const [visaRequirements, setVisaRequirements] = useState(
    nationality?.visa_requirements || nationality?.visaRequirements || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!code.trim()) {
      newErrors.code = "Code is required";
    } else if (code.length > 3 || code.length < 2) {
      newErrors.code = "Country code should be 2-3 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const nationalityData: Nationality = {
        id: nationality?.id || `NAT${Date.now().toString().slice(-6)}`,
        name,
        code,
        visa_requirements: visaRequirements || undefined
      };
      
      // Submit data to parent component
      await onSubmit(nationalityData);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing the nationality data.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
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
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : nationality ? "Update Nationality" : "Add Nationality"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NationalityForm;
