
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { addTransfer, getEmployeeById } from "@/lib/data";
import { MoneyTransfer } from "@/types";

type TransferFormValues = Omit<MoneyTransfer, 'id' | 'employeeName' | 'date' | 'lastUpdated' | 'status'>;

const currencies = ["USD", "EUR", "GBP", "AED", "SAR", "EGP"];

const TransferForm = () => {
  const { id } = useParams<{ id: string }>();
  const employee = getEmployeeById(id || "");
  const [loading, setLoading] = useState(false);
  
  const form = useForm<TransferFormValues>({
    defaultValues: {
      employeeId: id || "",
      amount: 0,
      currency: "USD",
      destination: "",
      beneficiaryName: "",
      beneficiaryPhone: "",
      notes: ""
    }
  });
  
  const onSubmit = (values: TransferFormValues) => {
    if (!employee) return;
    
    setLoading(true);
    try {
      addTransfer({
        ...values,
        employeeName: employee.name
      });
      
      toast.success("Money transfer initiated", {
        description: `Transfer of ${values.currency} ${values.amount} to ${values.beneficiaryName} has been initiated.`
      });
      
      form.reset({
        employeeId: id || "",
        amount: 0,
        currency: "USD",
        destination: "",
        beneficiaryName: "",
        beneficiaryPhone: "",
        notes: ""
      });
    } catch (error) {
      toast.error("Failed to initiate transfer", {
        description: "There was an error processing your request. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Country</FormLabel>
              <FormControl>
                <Input placeholder="Enter destination country" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="beneficiaryName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beneficiary Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter beneficiary name" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="beneficiaryPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beneficiary Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter beneficiary phone number" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter any additional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Initiate Transfer"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransferForm;
