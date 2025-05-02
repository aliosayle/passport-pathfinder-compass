
import { useState } from "react";
import { VisaType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addVisaType, updateVisaType, nationalities } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VisaFormProps {
  visa?: VisaType;
  onClose: () => void;
}

const VisaForm = ({ visa, onClose }: VisaFormProps) => {
  const [type, setType] = useState(visa?.type || "");
  const [countryCode, setCountryCode] = useState(visa?.countryCode || "");
  const [countryName, setCountryName] = useState(visa?.countryName || "");
  const [duration, setDuration] = useState(visa?.duration || "");
  const [requirements, setRequirements] = useState(visa?.requirements || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!type.trim()) {
      newErrors.type = "Visa type is required";
    }
    
    if (!countryCode) {
      newErrors.countryCode = "Country is required";
    }
    
    if (!duration.trim()) {
      newErrors.duration = "Duration is required";
    }
    
    if (!requirements.trim()) {
      newErrors.requirements = "Requirements are required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    const country = nationalities.find(n => n.code === code);
    setCountryName(country?.name || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      if (visa) {
        // Update existing
        updateVisaType({
          ...visa,
          type,
          countryCode,
          countryName,
          duration,
          requirements,
        });
        toast({
          title: "Visa Type Updated",
          description: `${type} visa for ${countryName} has been updated successfully.`
        });
      } else {
        // Create new
        addVisaType({
          type,
          countryCode,
          countryName,
          duration,
          requirements,
        });
        toast({
          title: "Visa Type Added",
          description: `${type} visa for ${countryName} has been added successfully.`
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing the visa type data.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {visa ? "Edit Visa Type" : "Add New Visa Type"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Visa Type</Label>
            <Input
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Tourist"
              className={errors.type ? "border-destructive" : ""}
            />
            {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select 
              value={countryCode} 
              onValueChange={handleCountryChange}
            >
              <SelectTrigger 
                id="country" 
                className={errors.countryCode ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {nationalities.map((country) => (
                  <SelectItem key={country.id} value={country.code}>
                    {country.name} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.countryCode && <p className="text-sm text-destructive">{errors.countryCode}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="90 days"
            className={errors.duration ? "border-destructive" : ""}
          />
          {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
            id="requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Passport, application form, photo, etc."
            rows={3}
            className={errors.requirements ? "border-destructive" : ""}
          />
          {errors.requirements && <p className="text-sm text-destructive">{errors.requirements}</p>}
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {visa ? "Update Visa Type" : "Add Visa Type"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VisaForm;
