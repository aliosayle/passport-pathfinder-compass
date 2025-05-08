import { useState, useEffect } from "react";
import { VisaType } from "@/services/visaTypeService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { visaTypeService } from "@/services/visaTypeService";
import { nationalityService } from "@/services/nationalityService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface VisaFormProps {
  visa?: VisaType;
  onClose: () => void;
  onSuccess?: () => void;
}

const VisaForm = ({ visa, onClose, onSuccess }: VisaFormProps) => {
  const [type, setType] = useState(visa?.type || "");
  const [countryCode, setCountryCode] = useState(visa?.country_code || "");
  const [countryName, setCountryName] = useState(visa?.country_name || "");
  const [duration, setDuration] = useState(visa?.duration || "");
  const [requirements, setRequirements] = useState(visa?.requirements || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nationalities, setNationalities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadNationalities = async () => {
      try {
        setLoading(true);
        const data = await nationalityService.getAll();
        setNationalities(data);
      } catch (error) {
        console.error("Error loading nationalities:", error);
        toast({
          title: "Error",
          description: "Failed to load country list. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadNationalities();
  }, [toast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const visaData = {
        type,
        country_code: countryCode,
        country_name: countryName,
        duration,
        requirements,
      };

      if (visa) {
        // Update existing
        await visaTypeService.update(visa.id, visaData);
        toast({
          title: "Visa Type Updated",
          description: `${type} visa for ${countryName} has been updated successfully.`
        });
      } else {
        // Create new
        await visaTypeService.create(visaData);
        toast({
          title: "Visa Type Added",
          description: `${type} visa for ${countryName} has been added successfully.`
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error saving visa type:", error);
      toast({
        title: "Error",
        description: "There was an error processing the visa type data.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading country data...</p>
      </div>
    );
  }

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
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {visa ? "Updating..." : "Creating..."}
              </>
            ) : (
              visa ? "Update Visa Type" : "Add Visa Type"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VisaForm;
