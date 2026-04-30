import { useState } from "react";
import { toast } from "sonner";
import { useCustomers } from "@/hooks/customers/useCustomers";
import { useDeleteCustomer } from "@/hooks/customers/useDeleteCustomer";
import { CustomerFormDialog } from "./CustomerFormDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Plus, Users } from "lucide-react";
import type { Customer } from "@shared/schema";

export default function CustomersPage() {
  const { data: customers = [], isLoading } = useCustomers();
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | undefined>(undefined);

  function openAdd() {
    setEditingCustomer(undefined);
    setFormOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  function handleFormDone() {
    setFormOpen(false);
    setEditingCustomer(undefined);
  }

  function confirmDelete() {
    if (!deletingCustomer) return;
    deleteCustomer(deletingCustomer.id, {
      onSuccess: () => {
        toast.success(`${deletingCustomer.name} deleted`);
        setDeletingCustomer(undefined);
      },
      onError: () => toast.error("Failed to delete customer"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Customers</h1>
          <p className="text-neutral-500 mt-1">{customers.length} total</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add customer
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Users className="w-10 h-10 text-neutral-300" />
            <div>
              <p className="font-medium text-neutral-700">No customers yet</p>
              <p className="text-sm text-neutral-500 mt-1">
                Add your first customer to get started
              </p>
            </div>
            <Button onClick={openAdd} variant="outline" size="sm" className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Add customer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="text-neutral-500">
                    {customer.email ? (
                      <a
                        href={`mailto:${customer.email}`}
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {customer.email}
                      </a>
                    ) : (
                      <span className="text-neutral-300">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {customer.phone ?? <span className="text-neutral-300">—</span>}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(customer)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeletingCustomer(customer)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
        onDone={handleFormDone}
      />

      <AlertDialog
        open={!!deletingCustomer}
        onOpenChange={(open) => !open && setDeletingCustomer(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingCustomer?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this customer. Invoices referencing this customer cannot
              be deleted until those invoices are removed first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
