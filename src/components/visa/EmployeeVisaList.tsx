import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { format, parseISO, isAfter, addDays } from 'date-fns';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EmployeeVisa } from '@/services/employeeVisaService';
import employeeVisaService from '@/services/employeeVisaService';
import EmployeeVisaForm from './EmployeeVisaForm';
import { useToast } from '@/hooks/use-toast';

interface EmployeeVisaListProps {
  employeeId?: string;
  showEmployee?: boolean;
}

const EmployeeVisaList: React.FC<EmployeeVisaListProps> = ({ employeeId, showEmployee = false }) => {
  const [visas, setVisas] = useState<EmployeeVisa[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editVisa, setEditVisa] = useState<EmployeeVisa | undefined>(undefined);
  const { toast } = useToast();

  const fetchVisas = async () => {
    try {
      setLoading(true);
      let data;
      if (employeeId) {
        data = await employeeVisaService.getByEmployeeId(employeeId);
      } else {
        data = await employeeVisaService.getAll();
      }
      setVisas(data);
    } catch (error) {
      console.error('Error fetching visas:', error);
      toast({
        title: "Error",
        description: "Could not load visa data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisas();
  }, [employeeId]);

  const handleAddVisa = () => {
    setEditVisa(undefined);
    setOpenForm(true);
  };

  const handleEditVisa = (visa: EmployeeVisa) => {
    setEditVisa(visa);
    setOpenForm(true);
  };

  const handleDeleteVisa = async (id: string) => {
    try {
      await employeeVisaService.delete(id);
      toast({
        title: "Success",
        description: "Visa deleted successfully",
      });
      fetchVisas();
    } catch (error) {
      console.error('Error deleting visa:', error);
      toast({
        title: "Error",
        description: "Failed to delete visa",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    fetchVisas();
    toast({
      title: "Success",
      description: editVisa ? "Visa updated successfully" : "Visa added successfully",
    });
  };

  const getStatusBadge = (status: string, expiryDate: string) => {
    const today = new Date();
    const expiry = parseISO(expiryDate);
    
    if (status === 'Expired' || isAfter(today, expiry)) {
      return <Badge className="bg-red-500">Expired</Badge>;
    }
    
    // Expiring in 30 days
    if (isAfter(addDays(today, 30), expiry)) {
      return <Badge className="bg-amber-500">Expiring Soon</Badge>;
    }
    
    switch (status) {
      case 'Valid':
        return <Badge className="bg-green-500">Valid</Badge>;
      case 'Processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      case 'Cancelled':
        return <Badge className="bg-gray-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Employee Visas</h2>
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogTrigger asChild>
            <Button onClick={handleAddVisa}>
              <Plus className="h-4 w-4 mr-2" /> Add Visa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <EmployeeVisaForm 
              onSuccess={handleFormSuccess}
              initialData={editVisa}
              employeeId={employeeId}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Loading visa data...</p>
      ) : visas.length === 0 ? (
        <p>No visas found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {showEmployee && <TableHead>Employee</TableHead>}
              <TableHead>Visa Type</TableHead>
              <TableHead>Document Number</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visas.map((visa) => (
              <TableRow key={visa.id}>
                {showEmployee && <TableCell>{visa.employee_name}</TableCell>}
                <TableCell>{visa.type} - {visa.country_name}</TableCell>
                <TableCell>{visa.document_number || 'N/A'}</TableCell>
                <TableCell>{visa.issue_date ? format(parseISO(visa.issue_date), 'MMM d, yyyy') : 'N/A'}</TableCell>
                <TableCell>{visa.expiry_date ? format(parseISO(visa.expiry_date), 'MMM d, yyyy') : 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(visa.status, visa.expiry_date)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleEditVisa(visa)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <EmployeeVisaForm 
                        onSuccess={handleFormSuccess}
                        initialData={visa}
                        employeeId={employeeId}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this visa record. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteVisa(visa.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default EmployeeVisaList;