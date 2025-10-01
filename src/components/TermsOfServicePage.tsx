import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/shared/Logo';
import { FileText, ArrowLeft } from 'lucide-react';

const TermsOfServicePage = () => {
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
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last Updated: January 2024</p>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-sm max-w-none pt-6">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground mb-4">
                These Terms of Service ("Terms") govern your access to and use of Harmony Shield's fraud detection platform, including our website, browser extension, and all related services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
              </p>
              <p className="text-muted-foreground">
                If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Eligibility</h2>
              <p className="text-muted-foreground mb-4">
                To use Harmony Shield, you must:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Be at least 13 years of age (or the age of majority in your jurisdiction)</li>
                <li>Have the legal capacity to enter into a binding agreement</li>
                <li>Not be prohibited from using the Service under applicable laws</li>
                <li>Provide accurate and complete registration information</li>
              </ul>
              <p className="text-muted-foreground">
                If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">Account Creation</h3>
              <p className="text-muted-foreground mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Account Security</h3>
              <p className="text-muted-foreground">
                You are responsible for maintaining the security of your account credentials. Harmony Shield will not be liable for any loss or damage arising from your failure to protect your account information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptable Use Policy</h2>
              <p className="text-muted-foreground mb-4">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Submit false or misleading reports</li>
                <li>Harass, threaten, or harm other users</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Remove or modify any proprietary notices or labels</li>
                <li>Upload viruses, malware, or malicious code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Service Features and Limitations</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">Fraud Detection Services</h3>
              <p className="text-muted-foreground mb-4">
                Harmony Shield provides AI-powered fraud detection, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>URL and link scanning for malicious content</li>
                <li>Social media profile analysis</li>
                <li>Scam pattern recognition and alerts</li>
                <li>Community-driven threat intelligence</li>
                <li>Browser extension for real-time protection</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Service Limitations</h3>
              <p className="text-muted-foreground mb-4">
                You acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>No fraud detection system is 100% accurate</li>
                <li>False positives and false negatives may occur</li>
                <li>The Service provides informational alerts, not legal advice</li>
                <li>You are responsible for your own decisions and actions</li>
                <li>We do not guarantee prevention of all fraud or financial loss</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Subscription and Payment</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">Free and Premium Tiers</h3>
              <p className="text-muted-foreground mb-4">
                Harmony Shield offers both free and premium subscription tiers. Premium features may include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Advanced fraud detection algorithms</li>
                <li>Priority support and faster response times</li>
                <li>Extended scan history and detailed reports</li>
                <li>API access for developers</li>
                <li>Custom alert configurations</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Billing and Renewals</h3>
              <p className="text-muted-foreground mb-4">
                For premium subscriptions:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Subscriptions automatically renew unless cancelled</li>
                <li>You authorize us to charge your payment method</li>
                <li>Prices are subject to change with 30 days notice</li>
                <li>No refunds for partial subscription periods</li>
                <li>You can cancel anytime from your account settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">User Content and Reports</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">Your Submissions</h3>
              <p className="text-muted-foreground mb-4">
                When you submit scam reports, screenshots, or other content ("User Content"), you grant Harmony Shield a worldwide, non-exclusive, royalty-free license to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Use, reproduce, and analyze your submissions</li>
                <li>Share anonymized data with the community</li>
                <li>Improve our fraud detection algorithms</li>
                <li>Generate threat intelligence reports</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Content Standards</h3>
              <p className="text-muted-foreground mb-4">
                You represent that your User Content:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Does not violate any laws or third-party rights</li>
                <li>Is accurate and submitted in good faith</li>
                <li>Does not contain malware or malicious code</li>
                <li>Does not infringe on intellectual property rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property Rights</h2>
              <p className="text-muted-foreground mb-4">
                The Service and its original content, features, and functionality are owned by Harmony Shield and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-muted-foreground">
                You may not copy, modify, distribute, sell, or lease any part of our Service without explicit written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services and Links</h2>
              <p className="text-muted-foreground mb-4">
                The Service may contain links to third-party websites or services that are not owned or controlled by Harmony Shield. We have no control over, and assume no responsibility for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Content, privacy policies, or practices of third-party sites</li>
                <li>Products or services offered by third parties</li>
                <li>Any damages resulting from use of third-party services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Disclaimer of Warranties</h2>
              <p className="text-muted-foreground mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties of uninterrupted or error-free service</li>
                <li>Warranties regarding accuracy or reliability of results</li>
                <li>Warranties that defects will be corrected</li>
              </ul>
              <p className="text-muted-foreground">
                You use the Service at your own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, HARMONY SHIELD SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                <li>Financial losses resulting from fraud or scams</li>
                <li>Damages resulting from unauthorized access to your account</li>
                <li>Damages arising from third-party conduct or content</li>
              </ul>
              <p className="text-muted-foreground">
                Our total liability shall not exceed the amount you paid us in the past 12 months, or $100, whichever is greater.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify, defend, and hold harmless Harmony Shield and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mt-4 space-y-2">
                <li>Your violation of these Terms</li>
                <li>Your use of the Service</li>
                <li>Your User Content submissions</li>
                <li>Your violation of any third-party rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Termination</h2>
              <p className="text-muted-foreground mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Requests by law enforcement or government agencies</li>
                <li>Extended periods of inactivity</li>
                <li>Technical or security reasons</li>
              </ul>
              <p className="text-muted-foreground">
                Upon termination, your right to use the Service will immediately cease. All provisions that should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Dispute Resolution</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">Informal Resolution</h3>
              <p className="text-muted-foreground mb-4">
                Before filing a claim, you agree to contact us at legal@harmonyshield.com to attempt to resolve the dispute informally. We commit to good-faith negotiations for at least 30 days.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">Arbitration</h3>
              <p className="text-muted-foreground mb-4">
                Any disputes not resolved informally will be resolved through binding arbitration in accordance with applicable arbitration rules, rather than in court, except that you may assert claims in small claims court if they qualify.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these Terms at any time. If we make material changes, we will:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Notify you via email or through the Service</li>
                <li>Update the "Last Updated" date</li>
                <li>Provide at least 30 days notice before changes take effect</li>
              </ul>
              <p className="text-muted-foreground">
                Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Harmony Shield operates, without regard to conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Severability</h2>
              <p className="text-muted-foreground">
                If any provision of these Terms is held to be invalid or unenforceable, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-foreground mb-2"><strong>Legal Inquiries:</strong> legal@harmonyshield.com</p>
                <p className="text-foreground mb-2"><strong>General Support:</strong> support@harmonyshield.com</p>
                <p className="text-foreground mb-2"><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p className="text-foreground"><strong>Response Time:</strong> We aim to respond within 48-72 hours</p>
              </div>
            </section>

            <section>
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>Effective Date:</strong> These Terms of Service are effective as of the date you first use the Service.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
