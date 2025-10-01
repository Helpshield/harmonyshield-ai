import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/shared/Logo';
import { Shield, ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center max-w-7xl mx-auto border-b border-border/40">
        <Logo variant="default" size="md" linkTo="/" />
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </nav>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last Updated: January 2024</p>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-sm max-w-none pt-6">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
              <p className="text-muted-foreground mb-4">
                Harmony Shield ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media fraud detection platform.
              </p>
              <p className="text-muted-foreground">
                By accessing or using Harmony Shield, you agree to the terms of this Privacy Policy. If you do not agree with the terms, please do not access the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Account credentials (username, email address, password)</li>
                <li>Profile information (name, profile picture)</li>
                <li>Contact information for recovery and support purposes</li>
                <li>Payment information for premium subscriptions (processed securely through third-party payment processors)</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Scam and Threat Data</h3>
              <p className="text-muted-foreground mb-4">
                To provide fraud detection services, we collect:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>URLs and links submitted for scanning</li>
                <li>Screenshots and images of suspected scams (submitted voluntarily)</li>
                <li>Report details about suspected fraud attempts</li>
                <li>Social media profiles and posts flagged as suspicious</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent on platform)</li>
                <li>Log data and analytics information</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Provide, maintain, and improve our fraud detection services</li>
                <li>Analyze URLs, messages, and content for potential fraud indicators</li>
                <li>Train and improve our AI-powered detection algorithms</li>
                <li>Send security alerts and notifications about threats</li>
                <li>Process transactions and manage subscriptions</li>
                <li>Respond to support requests and communicate with users</li>
                <li>Detect and prevent fraudulent activities and abuse</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Generate anonymized statistics and reports about fraud trends</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">Community Protection</h3>
              <p className="text-muted-foreground mb-4">
                Anonymized threat intelligence data is shared within the Harmony Shield community to protect all users from emerging scams and fraud patterns.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">Service Providers</h3>
              <p className="text-muted-foreground mb-4">
                We work with trusted third-party service providers who assist us in operating our platform, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Cloud hosting providers (Supabase, Netlify)</li>
                <li>Analytics services</li>
                <li>Payment processors</li>
                <li>Email and notification services</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Legal Requirements</h3>
              <p className="text-muted-foreground mb-4">
                We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., court orders, law enforcement requests regarding criminal investigations).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>End-to-end encryption for sensitive data transmission</li>
                <li>Secure password hashing (bcrypt with salt)</li>
                <li>Regular security audits and penetration testing</li>
                <li>Role-based access controls</li>
                <li>Secure data centers with physical security measures</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
              <p className="text-muted-foreground">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. Specifically:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Account information: Until you request deletion or account closure</li>
                <li>Scam reports: Retained indefinitely for community protection and threat analysis</li>
                <li>Analytics data: Aggregated and anonymized data may be retained indefinitely</li>
                <li>Legal compliance data: Retained as required by applicable laws</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your Privacy Rights</h2>
              <p className="text-muted-foreground mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Withdrawal of Consent:</strong> Withdraw consent for data processing</li>
              </ul>
              <p className="text-muted-foreground">
                To exercise these rights, please contact us at privacy@harmonyshield.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards, including Standard Contractual Clauses approved by the European Commission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground">
                Harmony Shield is not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our platform</li>
                <li>Improve user experience and platform performance</li>
                <li>Deliver personalized security alerts</li>
              </ul>
              <p className="text-muted-foreground">
                You can manage cookie preferences through your browser settings. Note that disabling cookies may affect platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-foreground mb-2"><strong>Email:</strong> privacy@harmonyshield.com</p>
                <p className="text-foreground mb-2"><strong>Support:</strong> support@harmonyshield.com</p>
                <p className="text-foreground"><strong>Response Time:</strong> We aim to respond within 48 hours</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
