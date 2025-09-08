import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AppLayout } from './AppLayout';

interface BotPackage {
  id: string;
  name: string;
  description: string;
  features: string[];
  price_monthly: number;
  price_yearly: number;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const AdminBotManagement = () => {
  const [packages, setPackages] = useState<BotPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<BotPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    features: '',
    price_monthly: '',
    price_yearly: '',
    image_url: '',
    is_active: true,
    sort_order: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    loadBotPackages();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    if (!roleData || roleData.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
  };

  const loadBotPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_packages')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      
      const processedPackages = (data || []).map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : 
                 typeof pkg.features === 'string' ? JSON.parse(pkg.features) : []
      }));
      
      setPackages(processedPackages);
    } catch (error) {
      console.error('Error loading bot packages:', error);
      toast({
        title: "Error",
        description: "Failed to load bot packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePackage = async () => {
    try {
      const features = formData.features.split('\n').filter(f => f.trim());
      
      const packageData = {
        name: formData.name,
        description: formData.description,
        features: JSON.stringify(features),
        price_monthly: parseFloat(formData.price_monthly),
        price_yearly: parseFloat(formData.price_yearly),
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order
      };

      let error;
      if (editingPackage) {
        ({ error } = await supabase
          .from('bot_packages')
          .update(packageData)
          .eq('id', editingPackage.id));
      } else {
        ({ error } = await supabase
          .from('bot_packages')
          .insert(packageData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Bot package ${editingPackage ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      resetForm();
      loadBotPackages();
    } catch (error) {
      console.error('Error saving bot package:', error);
      toast({
        title: "Error",
        description: "Failed to save bot package",
        variant: "destructive"
      });
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bot package?')) return;

    try {
      const { error } = await supabase
        .from('bot_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bot package deleted successfully",
      });

      loadBotPackages();
    } catch (error) {
      console.error('Error deleting bot package:', error);
      toast({
        title: "Error",
        description: "Failed to delete bot package",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('bot_packages')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Bot package ${!isActive ? 'activated' : 'deactivated'}`,
      });

      loadBotPackages();
    } catch (error) {
      console.error('Error toggling package status:', error);
      toast({
        title: "Error",
        description: "Failed to update package status",
        variant: "destructive"
      });
    }
  };

  const handleEditPackage = (pkg: BotPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      features: pkg.features.join('\n'),
      price_monthly: pkg.price_monthly.toString(),
      price_yearly: pkg.price_yearly.toString(),
      image_url: pkg.image_url || '',
      is_active: pkg.is_active,
      sort_order: pkg.sort_order
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      description: '',
      features: '',
      price_monthly: '',
      price_yearly: '',
      image_url: '',
      is_active: true,
      sort_order: 0
    });
  };

  const handleNewPackage = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bot Package Management
            </h1>
            <p className="text-muted-foreground">
              Manage AI bot packages, pricing, and features
            </p>
          </div>
          <Button onClick={handleNewPackage} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Bot Package
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{packages.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {packages.filter(p => p.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Monthly Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${packages.length > 0 
                  ? (packages.reduce((sum, p) => sum + p.price_monthly, 0) / packages.length).toFixed(2)
                  : '0.00'
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Packages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bot Packages</CardTitle>
            <CardDescription>
              Manage your AI bot protection packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {pkg.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${pkg.price_monthly}/month</div>
                        <div className="text-sm text-muted-foreground">
                          ${pkg.price_yearly}/year
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {pkg.features.length} features
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={pkg.is_active}
                          onCheckedChange={() => handleToggleActive(pkg.id, pkg.is_active)}
                        />
                        <Badge variant={pkg.is_active ? "default" : "secondary"}>
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{pkg.sort_order}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPackage(pkg)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Edit Bot Package' : 'Create New Bot Package'}
              </DialogTitle>
              <DialogDescription>
                Configure the bot package details, pricing, and features.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Neon S.8 Bot"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the bot package"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="features" className="text-right">
                  Features
                </Label>
                <Textarea
                  id="features"
                  className="col-span-3"
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  placeholder="One feature per line"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price_monthly" className="text-right">
                  Monthly Price
                </Label>
                <Input
                  id="price_monthly"
                  type="number"
                  step="0.01"
                  className="col-span-3"
                  value={formData.price_monthly}
                  onChange={(e) => setFormData({...formData, price_monthly: e.target.value})}
                  placeholder="9.99"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price_yearly" className="text-right">
                  Yearly Price
                </Label>
                <Input
                  id="price_yearly"
                  type="number"
                  step="0.01"
                  className="col-span-3"
                  value={formData.price_yearly}
                  onChange={(e) => setFormData({...formData, price_yearly: e.target.value})}
                  placeholder="99.99"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sort_order" className="text-right">
                  Sort Order
                </Label>
                <Input
                  id="sort_order"
                  type="number"
                  className="col-span-3"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_active" className="text-right">
                  Active
                </Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePackage}>
                {editingPackage ? 'Update Package' : 'Create Package'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminBotManagement;