import { Cookie, Shield, Settings, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppLayout } from "./AppLayout";

const CookiePolicyPage = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">← Back to Home</Button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground">Last Updated: January 2024</p>
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">What Are Cookies?</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files stored on your device when you visit our website. They help us provide you with
                a better experience by remembering your preferences and enabling essential functionality.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Info className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Types of Cookies We Use</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Essential Cookies</h3>
                  <p className="text-muted-foreground mb-2">
                    Required for the website to function properly. Cannot be disabled.
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Authentication and session management</li>
                    <li>• Security and fraud prevention</li>
                    <li>• Load balancing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Functional Cookies</h3>
                  <p className="text-muted-foreground mb-2">
                    Enable enhanced functionality and personalization.
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Language preferences</li>
                    <li>• Theme selection (dark/light mode)</li>
                    <li>• User interface customization</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Analytics Cookies</h3>
                  <p className="text-muted-foreground mb-2">
                    Help us understand how visitors interact with our website.
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Page views and navigation patterns</li>
                    <li>• Performance metrics</li>
                    <li>• Error tracking and diagnostics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Marketing Cookies</h3>
                  <p className="text-muted-foreground mb-2">
                    Used to deliver relevant advertisements and measure campaign effectiveness.
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Ad targeting and personalization</li>
                    <li>• Campaign tracking</li>
                    <li>• Conversion measurement</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Settings className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Managing Your Cookie Preferences</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can control and manage cookies in various ways:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Use our cookie consent banner to select your preferences</li>
                <li>• Adjust browser settings to block or delete cookies</li>
                <li>• Opt out of third-party advertising cookies</li>
                <li>• Use browser privacy modes (incognito/private browsing)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Note: Disabling essential cookies may affect website functionality.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Third-Party Cookies</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use services from trusted third-party providers that may set cookies:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Google Analytics (website analytics)</li>
                <li>• Authentication providers (secure login)</li>
                <li>• Content delivery networks (performance)</li>
              </ul>
            </section>

            <section className="border-t border-border pt-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Questions About Cookies?</h2>
              <p className="text-muted-foreground">
                Contact us at: <a href="mailto:privacy@harmonyshield.com" className="text-primary hover:underline">privacy@harmonyshield.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CookiePolicyPage;
