import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUpload from '../FileUpload';

const cashRecoverySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  amountLost: z.string().min(1, 'Amount is required'),
  currency: z.string().min(1, 'Currency is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  transactionReference: z.string().optional(),
  sortCode: z.string().optional(),
  swiftCode: z.string().optional(),
  contactMethod: z.string().min(1, 'Preferred contact method is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(1, 'Phone number is required'),
  policeReport: z.string().optional(),
  evidenceDescription: z.string().optional(),
  evidenceFiles: z.array(z.string()).optional(),
});

type CashRecoveryFormData = z.infer<typeof cashRecoverySchema>;

interface CashRecoveryFormProps {
  onSubmitSuccess: () => void;
}

const CashRecoveryForm = ({ onSubmitSuccess }: CashRecoveryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);

  const form = useForm<CashRecoveryFormData>({
    resolver: zodResolver(cashRecoverySchema),
    defaultValues: {
      currency: 'USD',
      contactMethod: 'email',
    },
  });

  const onSubmit = async (data: CashRecoveryFormData) => {
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase.from('recovery_requests').insert({
        user_id: session.user.id,
        recovery_type: 'cash',
        title: data.title,
        description: data.description,
        incident_date: new Date(data.incidentDate).toISOString(),
        amount_lost: parseFloat(data.amountLost),
        currency: data.currency,
        bank_details: {
          bank_name: data.bankName,
          account_number: data.accountNumber,
          sort_code: data.sortCode,
          swift_code: data.swiftCode,
        },
        transaction_reference: data.transactionReference,
        contact_method: data.contactMethod,
        contact_details: {
          email: data.contactEmail,
          phone: data.contactPhone,
        },
        admin_notes: data.policeReport ? `Police Report: ${data.policeReport}` : '',
        evidence_files: evidenceFiles,
      });

      if (error) throw error;

      // Send confirmation email and create notification
      try {
        await supabase.functions.invoke('send-recovery-email', {
          body: {
            type: 'confirmation',
            userEmail: session.user.email,
            userName: session.user.user_metadata?.full_name || session.user.email,
            requestId: 'new-request',
            requestTitle: data.title,
            requestType: 'cash',
          }
        });

        await supabase.from('notifications').insert({
          user_id: session.user.id,
          title: 'Recovery Request Submitted',
          message: `Your cash recovery request "${data.title}" has been submitted and is pending review.`,
          type: 'success'
        });
      } catch (emailError) {
        console.error('Error sending confirmation:', emailError);
      }

      toast({
        title: "Recovery Request Submitted",
        description: "Your cash recovery request has been submitted successfully. Our team will review it shortly.",
      });

      form.reset();
      setEvidenceFiles([]);
      onSubmitSuccess();

    } catch (error) {
      console.error('Error submitting recovery request:', error);
      toast({
        title: "Error",
        description: "Failed to submit recovery request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          <span>Cash Recovery Request</span>
        </CardTitle>
        <CardDescription>
          Submit a request to recover funds lost through bank fraud, unauthorized transfers, or payment scams
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Before proceeding:</strong> Ensure you have reported this incident to your bank and local authorities. 
            This form helps us coordinate recovery efforts but does not replace official reporting.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Incident Details</h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the incident" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a detailed description of what happened, including dates, times, and any relevant circumstances"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="incidentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="amountLost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Lost</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Bank Account Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your bank name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Account number (last 4 digits only)" {...field} />
                      </FormControl>
                      <FormDescription>For security, only provide the last 4 digits</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sortCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="XX-XX-XX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transactionReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Reference number if available" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              
              <FormField
                control={form.control}
                name="contactMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Contact Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="both">Both Email and Phone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <FormField
                control={form.control}
                name="policeReport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Police Report Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Police report reference number if filed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="evidenceDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evidence Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe any evidence you have (screenshots, emails, documents, etc.)"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-6">
                <FileUpload
                  onFilesChange={setEvidenceFiles}
                  label="Evidence Files"
                  description="Upload bank statements, screenshots, emails, or other supporting documents"
                  maxFiles={10}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset Form
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Recovery Request'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CashRecoveryForm;