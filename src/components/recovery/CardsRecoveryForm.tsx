import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { CreditCard, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

const cardsRecoverySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  amountLost: z.string().min(1, 'Amount is required'),
  currency: z.string().min(1, 'Currency is required'),
  cardType: z.string().min(1, 'Card type is required'),
  cardIssuer: z.string().min(1, 'Card issuer is required'),
  lastFourDigits: z.string().min(4, 'Last four digits are required').max(4, 'Only last four digits'),
  fraudType: z.string().min(1, 'Fraud type is required'),
  transactionDetails: z.string().optional(),
  merchantName: z.string().optional(),
  disputeFiled: z.boolean().default(false),
  disputeReference: z.string().optional(),
  contactMethod: z.string().min(1, 'Preferred contact method is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(1, 'Phone number is required'),
  policeReport: z.string().optional(),
  evidenceDescription: z.string().optional(),
});

type CardsRecoveryFormData = z.infer<typeof cardsRecoverySchema>;

interface CardsRecoveryFormProps {
  onSubmitSuccess: () => void;
}

const CardsRecoveryForm = ({ onSubmitSuccess }: CardsRecoveryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CardsRecoveryFormData>({
    resolver: zodResolver(cardsRecoverySchema),
    defaultValues: {
      currency: 'USD',
      contactMethod: 'email',
      disputeFiled: false,
    },
  });

  const watchDisputeFiled = form.watch('disputeFiled');

  const onSubmit = async (data: CardsRecoveryFormData) => {
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase.from('recovery_requests').insert({
        user_id: session.user.id,
        recovery_type: 'cards',
        title: data.title,
        description: data.description,
        incident_date: new Date(data.incidentDate).toISOString(),
        amount_lost: parseFloat(data.amountLost),
        currency: data.currency,
        card_details: {
          card_type: data.cardType,
          card_issuer: data.cardIssuer,
          fraud_type: data.fraudType,
          merchant_name: data.merchantName,
          transaction_details: data.transactionDetails,
          dispute_filed: data.disputeFiled,
          dispute_reference: data.disputeReference,
        },
        last_four_digits: data.lastFourDigits,
        contact_method: data.contactMethod,
        contact_details: {
          email: data.contactEmail,
          phone: data.contactPhone,
        },
        admin_notes: data.policeReport ? `Police Report: ${data.policeReport}` : '',
        evidence_files: data.evidenceDescription ? [data.evidenceDescription] : [],
      });

      if (error) throw error;

      toast({
        title: "Recovery Request Submitted",
        description: "Your cards recovery request has been submitted successfully. Our team will review it shortly.",
      });

      form.reset();
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
          <CreditCard className="h-6 w-6 text-blue-600" />
          <span>Cards Recovery Request</span>
        </CardTitle>
        <CardDescription>
          Submit a request to recover funds lost through card fraud, skimming, or unauthorized transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Contact your card issuer immediately to report fraud and cancel compromised cards. 
            This form helps coordinate additional recovery efforts.
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
                      <Input placeholder="Brief description of the card fraud incident" {...field} />
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
                        placeholder="Describe how the fraud occurred, where you used your card, and any suspicious activities you noticed"
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

            {/* Card Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Card Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cardType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select card type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="credit">Credit Card</SelectItem>
                          <SelectItem value="debit">Debit Card</SelectItem>
                          <SelectItem value="prepaid">Prepaid Card</SelectItem>
                          <SelectItem value="business">Business Card</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardIssuer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Issuer</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Chase, Bank of America" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastFourDigits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last 4 Digits</FormLabel>
                      <FormControl>
                        <Input placeholder="1234" maxLength={4} {...field} />
                      </FormControl>
                      <FormDescription>Last 4 digits of the compromised card</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fraudType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Fraud</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fraud type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="skimming">Card Skimming</SelectItem>
                        <SelectItem value="online_fraud">Online Fraud</SelectItem>
                        <SelectItem value="stolen_card">Physical Card Theft</SelectItem>
                        <SelectItem value="identity_theft">Identity Theft</SelectItem>
                        <SelectItem value="phishing">Phishing/Social Engineering</SelectItem>
                        <SelectItem value="merchant_fraud">Merchant Fraud</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="merchantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merchant Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Where the fraudulent transaction occurred" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transactionDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Transaction ID or reference number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dispute Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dispute Status</h3>
              
              <FormField
                control={form.control}
                name="disputeFiled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I have filed a dispute with my card issuer</FormLabel>
                      <FormDescription>
                        Check this if you have already contacted your bank to dispute the charges
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {watchDisputeFiled && (
                <FormField
                  control={form.control}
                  name="disputeReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dispute Reference Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Reference number from your bank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
                        placeholder="Describe any evidence you have (bank statements, receipts, photos, emails, etc.)"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export default CardsRecoveryForm;