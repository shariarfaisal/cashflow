import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  CategoryResponse,
  PaymentMethodResponse,
  CreateCategoryParams,
  CreatePaymentMethodParams,
  UpdateCategoryParams,
  UpdatePaymentMethodParams
} from '../types/transactions';
import * as App from '../../wailsjs/go/main/App';
import { Edit2, Trash2, Plus, Check, X, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function Settings() {
  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([]);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<string | null>(null);
  const [editingPaymentMethodData, setEditingPaymentMethodData] = useState<PaymentMethodResponse | null>(null);
  const [paymentMethodForm, setPaymentMethodForm] = useState<CreatePaymentMethodParams>({
    name: '',
    description: '',
    is_active: true
  });
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [showEditPaymentMethodDialog, setShowEditPaymentMethodDialog] = useState(false);

  // Categories State
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryData, setEditingCategoryData] = useState<CategoryResponse | null>(null);
  const [categoryForm, setCategoryForm] = useState<CreateCategoryParams>({
    name: '',
    type: 'expense',
    color: '#000000',
    icon: '',
    is_active: true
  });
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false);

  // Dependency check states
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    type: 'category' | 'payment_method';
    id: string;
    name: string;
    dependencyCount?: number;
  } | null>(null);

  // Load data on mount
  useEffect(() => {
    loadPaymentMethods();
    loadCategories();
  }, []);

  // Payment Methods Functions
  const loadPaymentMethods = async () => {
    try {
      const data = await App.ListPaymentMethods();
      const mappedMethods = data.map(pm => ({
        ...pm,
        created_at: pm.created_at || '',
        updated_at: pm.updated_at || ''
      }));
      setPaymentMethods(mappedMethods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      toast.error('Failed to load payment methods');
    }
  };

  const handleCreatePaymentMethod = async () => {
    try {
      await App.CreatePaymentMethod(paymentMethodForm.name, paymentMethodForm.description || '', paymentMethodForm.is_active || true);
      await loadPaymentMethods();
      setShowPaymentMethodDialog(false);
      setPaymentMethodForm({ name: '', description: '', is_active: true });
      toast.success('Payment method created successfully');
    } catch (error) {
      console.error('Failed to create payment method:', error);
      toast.error('Failed to create payment method');
    }
  };

  const handleEditPaymentMethod = (pm: PaymentMethodResponse) => {
    setEditingPaymentMethodData(pm);
    setShowEditPaymentMethodDialog(true);
  };

  const handleUpdatePaymentMethod = async () => {
    if (!editingPaymentMethodData) return;

    try {
      await App.UpdatePaymentMethod(
        editingPaymentMethodData.id,
        editingPaymentMethodData.name,
        editingPaymentMethodData.description || '',
        editingPaymentMethodData.is_active || true
      );
      await loadPaymentMethods();
      setShowEditPaymentMethodDialog(false);
      setEditingPaymentMethodData(null);
      toast.success('Payment method updated successfully');
    } catch (error) {
      console.error('Failed to update payment method:', error);
      toast.error('Failed to update payment method');
    }
  };

  const handleTogglePaymentMethodStatus = async (id: string, currentStatus: boolean) => {
    const pm = paymentMethods.find(p => p.id === id);
    if (!pm) return;

    try {
      await App.UpdatePaymentMethod(id, pm.name, pm.description || '', !currentStatus);
      await loadPaymentMethods();
      toast.success(`Payment method ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Failed to toggle payment method status:', error);
      toast.error('Failed to update payment method status');
    }
  };

  const handleDeletePaymentMethodClick = async (pm: PaymentMethodResponse) => {
    try {
      const count = await App.CheckPaymentMethodDependencies(pm.id);
      setDeleteConfirmation({
        show: true,
        type: 'payment_method',
        id: pm.id,
        name: pm.name,
        dependencyCount: count
      });
    } catch (error) {
      console.error('Failed to check dependencies:', error);
      toast.error('Failed to check dependencies');
    }
  };

  const handleConfirmDeletePaymentMethod = async () => {
    if (!deleteConfirmation) return;

    try {
      await App.DeletePaymentMethod(deleteConfirmation.id);
      await loadPaymentMethods();
      toast.success('Payment method deleted successfully');
      setDeleteConfirmation(null);
    } catch (error: any) {
      console.error('Failed to delete payment method:', error);
      if (error.toString().includes('cannot delete')) {
        toast.error(error.toString());
      } else {
        toast.error('Failed to delete payment method');
      }
    }
  };

  // Categories Functions
  const loadCategories = async () => {
    try {
      const data = await App.ListCategories();
      const mappedCategories = data.map(cat => ({
        ...cat,
        type: cat.type as 'income' | 'expense' | 'both',
        created_at: cat.created_at || '',
        updated_at: cat.updated_at || ''
      }));
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleCreateCategory = async () => {
    try {
      await App.CreateCategory({
        Name: categoryForm.name,
        Type: categoryForm.type,
        Color: categoryForm.color,
        Icon: categoryForm.icon,
        ParentID: '',
        IsActive: categoryForm.is_active || true
      });
      await loadCategories();
      setShowCategoryDialog(false);
      setCategoryForm({ name: '', type: 'expense', color: '#000000', icon: '', is_active: true });
      toast.success('Category created successfully');
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleEditCategory = (cat: CategoryResponse) => {
    setEditingCategoryData(cat);
    setShowEditCategoryDialog(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryData) return;

    try {
      await App.UpdateCategory(editingCategoryData.id, {
        Name: editingCategoryData.name,
        Type: editingCategoryData.type,
        Color: editingCategoryData.color || '',
        Icon: editingCategoryData.icon || '',
        ParentID: '',
        IsActive: editingCategoryData.is_active || true
      });
      await loadCategories();
      setShowEditCategoryDialog(false);
      setEditingCategoryData(null);
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleToggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    try {
      await App.UpdateCategory(id, {
        Name: cat.name,
        Type: cat.type,
        Color: cat.color || '',
        Icon: cat.icon || '',
        ParentID: '',
        IsActive: !currentStatus
      });
      await loadCategories();
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Failed to toggle category status:', error);
      toast.error('Failed to update category status');
    }
  };

  const handleDeleteCategoryClick = async (cat: CategoryResponse) => {
    try {
      const count = await App.CheckCategoryDependencies(cat.id);
      setDeleteConfirmation({
        show: true,
        type: 'category',
        id: cat.id,
        name: cat.name,
        dependencyCount: count
      });
    } catch (error) {
      console.error('Failed to check dependencies:', error);
      toast.error('Failed to check dependencies');
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteConfirmation) return;

    try {
      await App.DeleteCategory(deleteConfirmation.id);
      await loadCategories();
      toast.success('Category deleted successfully');
      setDeleteConfirmation(null);
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      if (error.toString().includes('cannot delete')) {
        toast.error(error.toString());
      } else {
        toast.error('Failed to delete category');
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'expense':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'both':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="payment-methods" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage payment methods for transactions</CardDescription>
                </div>
                <Dialog open={showPaymentMethodDialog} onOpenChange={setShowPaymentMethodDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Payment Method</DialogTitle>
                      <DialogDescription>Add a new payment method for transactions</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="pm-name">Name</Label>
                        <Input
                          id="pm-name"
                          value={paymentMethodForm.name}
                          onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, name: e.target.value })}
                          placeholder="Enter payment method name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="pm-description">Description</Label>
                        <Textarea
                          id="pm-description"
                          value={paymentMethodForm.description}
                          onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, description: e.target.value })}
                          placeholder="Enter description (optional)"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="pm-active"
                          checked={paymentMethodForm.is_active}
                          onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, is_active: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="pm-active">Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPaymentMethodDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePaymentMethod}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    !pm.is_active && "opacity-60"
                  )}>
                    <div className="flex-1">
                      <h3 className="font-medium">{pm.name}</h3>
                      {pm.description && <p className="text-sm text-muted-foreground">{pm.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePaymentMethodStatus(pm.id, pm.is_active)}
                        title={pm.is_active ? "Deactivate" : "Activate"}
                      >
                        {pm.is_active ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPaymentMethod(pm)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeletePaymentMethodClick(pm)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Manage transaction categories</CardDescription>
                </div>
                <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Category</DialogTitle>
                      <DialogDescription>Add a new category for transactions</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cat-name">Name</Label>
                        <Input
                          id="cat-name"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          placeholder="Enter category name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cat-type">Type</Label>
                        <Select
                          value={categoryForm.type}
                          onValueChange={(value: 'income' | 'expense' | 'both') => setCategoryForm({ ...categoryForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cat-color">Color</Label>
                        <Input
                          id="cat-color"
                          type="color"
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="cat-active"
                          checked={categoryForm.is_active}
                          onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="cat-active">Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCategory}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    !cat.is_active && "opacity-60"
                  )}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {cat.color && (
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                        )}
                        <h3 className="font-medium">{cat.name}</h3>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          getTypeColor(cat.type)
                        )}>
                          {cat.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleCategoryStatus(cat.id, cat.is_active)}
                        title={cat.is_active ? "Deactivate" : "Activate"}
                      >
                        {cat.is_active ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditCategory(cat)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCategoryClick(cat)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Payment Method Dialog */}
      <Dialog open={showEditPaymentMethodDialog} onOpenChange={setShowEditPaymentMethodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>Update payment method details</DialogDescription>
          </DialogHeader>
          {editingPaymentMethodData && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-pm-name">Name</Label>
                <Input
                  id="edit-pm-name"
                  value={editingPaymentMethodData.name}
                  onChange={(e) => setEditingPaymentMethodData({ ...editingPaymentMethodData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-pm-description">Description</Label>
                <Textarea
                  id="edit-pm-description"
                  value={editingPaymentMethodData.description || ''}
                  onChange={(e) => setEditingPaymentMethodData({ ...editingPaymentMethodData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-pm-active"
                  checked={editingPaymentMethodData.is_active}
                  onChange={(e) => setEditingPaymentMethodData({ ...editingPaymentMethodData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-pm-active">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditPaymentMethodDialog(false);
              setEditingPaymentMethodData(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePaymentMethod}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditCategoryDialog} onOpenChange={setShowEditCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details</DialogDescription>
          </DialogHeader>
          {editingCategoryData && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-cat-name">Name</Label>
                <Input
                  id="edit-cat-name"
                  value={editingCategoryData.name}
                  onChange={(e) => setEditingCategoryData({ ...editingCategoryData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-cat-type">Type</Label>
                <Select
                  value={editingCategoryData.type}
                  onValueChange={(value: 'income' | 'expense' | 'both') => setEditingCategoryData({ ...editingCategoryData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-cat-color">Color</Label>
                <Input
                  id="edit-cat-color"
                  type="color"
                  value={editingCategoryData.color || '#000000'}
                  onChange={(e) => setEditingCategoryData({ ...editingCategoryData, color: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-cat-active"
                  checked={editingCategoryData.is_active}
                  onChange={(e) => setEditingCategoryData({ ...editingCategoryData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-cat-active">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditCategoryDialog(false);
              setEditingCategoryData(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmation?.show || false} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {deleteConfirmation?.dependencyCount && deleteConfirmation.dependencyCount > 0 ? (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Cannot Delete {deleteConfirmation.type === 'category' ? 'Category' : 'Payment Method'}
                </>
              ) : (
                <>Confirm Delete</>
              )}
            </DialogTitle>
            <DialogDescription>
              {deleteConfirmation?.dependencyCount && deleteConfirmation.dependencyCount > 0 ? (
                <div className="space-y-2">
                  <p className="font-medium text-foreground">
                    Cannot delete "{deleteConfirmation.name}"
                  </p>
                  <p className="text-yellow-600 dark:text-yellow-400">
                    This {deleteConfirmation.type === 'category' ? 'category' : 'payment method'} is currently used in {deleteConfirmation.dependencyCount} transaction{deleteConfirmation.dependencyCount > 1 ? 's' : ''}.
                  </p>
                  <p className="text-sm">
                    Please remove or reassign these transactions before deleting this {deleteConfirmation.type === 'category' ? 'category' : 'payment method'}.
                  </p>
                </div>
              ) : (
                <p>
                  Are you sure you want to delete "{deleteConfirmation?.name}"? This action cannot be undone.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {deleteConfirmation?.dependencyCount && deleteConfirmation.dependencyCount > 0 ? (
              <Button onClick={() => setDeleteConfirmation(null)}>Close</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteConfirmation?.type === 'category' ? handleConfirmDeleteCategory : handleConfirmDeletePaymentMethod}
                >
                  Delete
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}