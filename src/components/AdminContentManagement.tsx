import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Editor from '@monaco-editor/react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Eye, 
  FileText, 
  Mail, 
  Bell, 
  Image, 
  Code,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContentTemplate {
  id: string;
  name: string;
  type: 'email' | 'notification' | 'media';
  category: 'manual' | 'ai';
  title: string;
  description?: string;
  html_content?: string;
  variables?: string[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

const AdminContentManagement = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [htmlContent, setHtmlContent] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    type: 'email' as 'email' | 'notification' | 'media',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  // Mock data for now - will be replaced with Supabase integration
  const mockTemplates: ContentTemplate[] = [
    {
      id: '1',
      name: 'welcome_email',
      type: 'email',
      category: 'manual',
      title: 'Welcome Email Template',
      description: 'Welcome email sent to new users',
      html_content: `<!DOCTYPE html>
<html>
<head>
    <title>Welcome to Harmony Shield</title>
</head>
<body>
    <h1>Welcome {{user_name}}!</h1>
    <p>Thank you for joining Harmony Shield. Your digital protection starts now.</p>
</body>
</html>`,
      variables: ['user_name'],
      status: 'published',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'threat_alert',
      type: 'notification',
      category: 'manual',
      title: 'Threat Alert Notification',
      description: 'Notification for detected threats',
      html_content: `<!DOCTYPE html>
<html>
<head>
    <title>Security Alert</title>
</head>
<body>
    <div style="background: #fee2e2; padding: 16px; border-radius: 8px;">
        <h2 style="color: #dc2626;">Security Alert Detected</h2>
        <p>We detected a potential threat: {{threat_type}}</p>
        <p>Risk Level: {{risk_level}}</p>
    </div>
</body>
</html>`,
      variables: ['threat_type', 'risk_level'],
      status: 'published',
      created_at: '2024-01-16T14:30:00Z',
      updated_at: '2024-01-16T14:30:00Z'
    }
  ];

  useEffect(() => {
    setTemplates(mockTemplates);
  }, []);

  const filteredTemplates = templates.filter(template => template.type === activeTab);

  const handleCreateTemplate = () => {
    setIsCreating(true);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      title: '',
      description: '',
      type: activeTab as 'email' | 'notification' | 'media',
      status: 'draft'
    });
    setHtmlContent('<!DOCTYPE html>\n<html>\n<head>\n    <title></title>\n</head>\n<body>\n    \n</body>\n</html>');
  };

  const handleEditTemplate = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setFormData({
      name: template.name,
      title: template.title,
      description: template.description || '',
      type: template.type,
      status: template.status
    });
    setHtmlContent(template.html_content || '');
  };

  const handleSaveTemplate = () => {
    // Mock save functionality
    const templateData = {
      ...formData,
      html_content: htmlContent,
      updated_at: new Date().toISOString(),
      id: selectedTemplate?.id || Math.random().toString(36).substr(2, 9),
      category: 'manual' as const,
      variables: extractVariables(htmlContent)
    };

    if (isCreating) {
      setTemplates(prev => [...prev, { 
        ...templateData, 
        created_at: new Date().toISOString() 
      } as ContentTemplate]);
      toast({
        title: "Template Created",
        description: "Content template has been created successfully."
      });
    } else {
      setTemplates(prev => prev.map(t => 
        t.id === selectedTemplate?.id ? { ...t, ...templateData } : t
      ));
      toast({
        title: "Template Updated",
        description: "Content template has been updated successfully."
      });
    }

    setIsCreating(false);
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const extractVariables = (html: string): string[] => {
    const matches = html.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : [];
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({
      title: "Template Deleted",
      description: "Content template has been deleted successfully."
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'notification': return <Bell className="h-4 w-4" />;
      case 'media': return <Image className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage email templates, notification templates, and media content for Harmony Shield
          </p>
        </div>
        <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="notification" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Templates
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Media Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(template.type)}
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(template.status)}>
                      {template.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Code className="h-3 w-3" />
                    {template.name}
                  </div>
                  
                  {template.variables && template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(template.updated_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Preview: {template.title}</DialogTitle>
                            <DialogDescription>
                              HTML preview of the template content
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="h-96 w-full border rounded-md p-4">
                            <div 
                              dangerouslySetInnerHTML={{ __html: template.html_content || '' }}
                              className="prose max-w-none"
                            />
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Template Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedTemplate(null);
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create New Template' : 'Edit Template'}
            </DialogTitle>
            <DialogDescription>
              {isCreating ? 'Create a new content template' : 'Edit the existing template'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
            {/* Form Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="template_name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Display Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Template Display Title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Template description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Template Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'email' | 'notification' | 'media') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Template</SelectItem>
                    <SelectItem value="notification">Notification Template</SelectItem>
                    <SelectItem value="media">Media Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'draft' | 'published' | 'archived') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Variables Found</Label>
                <div className="flex flex-wrap gap-1">
                  {extractVariables(htmlContent).map((variable) => (
                    <Badge key={variable} variant="outline" className="text-xs">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveTemplate} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? 'Create Template' : 'Update Template'}
              </Button>
            </div>

            {/* HTML Editor Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <Label>HTML Content</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Editor
                  height="400px"
                  defaultLanguage="html"
                  value={htmlContent}
                  onChange={(value) => setHtmlContent(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    automaticLayout: true
                  }}
                />
              </div>
              
              <div className="mt-4">
                <Label className="mb-2 block">Live Preview</Label>
                <ScrollArea className="h-32 w-full border rounded-md p-4 bg-background">
                  <div 
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    className="prose max-w-none text-sm"
                  />
                </ScrollArea>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContentManagement;