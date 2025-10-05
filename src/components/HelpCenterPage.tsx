import { BookOpen, Video, FileText, MessageCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicLayout } from "./PublicLayout";

const HelpCenterPage = () => {
  const helpCategories = [
    {
      icon: BookOpen,
      title: "Getting Started Guide",
      description: "Learn the basics and set up your account",
      articles: [
        "Creating your first account",
        "Setting up security features",
        "Understanding the dashboard",
        "Configuring notifications"
      ]
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      articles: [
        "How to scan URLs for threats",
        "Using Deep Search effectively",
        "Reporting scams properly",
        "Managing your profile"
      ]
    },
    {
      icon: FileText,
      title: "Feature Documentation",
      description: "Detailed guides for all features",
      articles: [
        "AI Scam Detection explained",
        "Smart Feeds customization",
        "Recovery service process",
        "Browser extension usage"
      ]
    },
    {
      icon: MessageCircle,
      title: "Common Issues",
      description: "Troubleshooting and solutions",
      articles: [
        "Login problems",
        "Notification not working",
        "Scanner errors",
        "Payment issues"
      ]
    }
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="mb-12 text-center">
            <Link to="/">
              <Button variant="ghost" className="mb-4">← Back to Home</Button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
            <p className="text-muted-foreground mb-8">
              Everything you need to know about using Harmony Shield
            </p>
            
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help articles..."
                className="pl-12 py-6 text-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {helpCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{category.title}</CardTitle>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article, aIdx) => (
                        <li key={aIdx}>
                          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                            → {article}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Browse FAQ</CardTitle>
                <CardDescription>Quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/faq">
                  <Button variant="outline" className="w-full">View FAQs</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Get help from our team</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/contact-support">
                  <Button variant="outline" className="w-full">Contact Us</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle>Community Forum</CardTitle>
                <CardDescription>Connect with other users</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Join Forum</Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 p-8 bg-muted rounded-lg text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Need Immediate Assistance?</h2>
            <p className="text-muted-foreground mb-4">
              Our support team is available 24/7 to help you
            </p>
            <div className="flex justify-center gap-4">
              <Button>Live Chat</Button>
              <Button variant="outline">Call Support</Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default HelpCenterPage;
