import { useState } from "react";
import { Airline } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { airlineService } from "@/services/airlineService";
import { Loader2 } from "lucide-react";

interface AirlineFormProps {
  airline?: Airline;
  onClose: () => void;
}

const AirlineForm = ({ airline, onClose }: AirlineFormProps) => {
  const [name, setName] = useState(airline?.name || "");
  const [code, setCode] = useState(airline?.code || "");
  const [contactInfo, setContactInfo] = useState(airline?.contactInfo || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        name,
        code,
        contact_info: contactInfo || undefined
      };
      
      if (airline) {
        // Update existing airline
        await airlineService.update(airline.id, payload);
        toast({
          title: "Airline Updated",
          description: `${name} has been updated successfully.`
        });
      } else {
        // Create new airline
        await airlineService.create(payload);
        toast({
          title: "Airline Added",
          description: `${name} has been added successfully.`
        });
      }
      
      // Refresh airlines data
      queryClient.invalidateQueries({ queryKey: ['airlines'] });
      onClose();
    } catch (error: any) {
      console.error("Error processing airline data:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "There was an error processing the airline data.",
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
            <Label htmlFor="name">Airline Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Emirates"
              className={errors.name ? "border-destructive" : ""}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {airline ? "Updating..." : "Creating..."}
              </>
            ) : (
              airline ? "Update Airline" : "Add Airline"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AirlineForm;
