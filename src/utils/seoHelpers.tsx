import { useEffect } from 'react';

interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

export const useSEOMeta = ({
  title,
  description,
  keywords,
  ogImage = '/harmony-shield-logo.png',
  ogType = 'website',
  canonicalUrl
}: SEOMetaProps) => {
  useEffect(() => {
    // Update title
    document.title = `${title} | Harmony Shield`;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:site_name', 'Harmony Shield', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Canonical URL
    if (canonicalUrl) {
      let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute('href', canonicalUrl);
    }

    return () => {
      // Cleanup is optional for meta tags as they'll be updated on next page
    };
  }, [title, description, keywords, ogImage, ogType, canonicalUrl]);
};

export const generateStructuredData = (type: 'Organization' | 'WebSite' | 'Article', data: any) => {
  const baseUrl = window.location.origin;
  
  const schemas: Record<string, any> = {
    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Harmony Shield',
      url: baseUrl,
      logo: `${baseUrl}/harmony-shield-logo.png`,
      description: 'Advanced AI-powered platform for social media fraud protection',
      sameAs: [
        // Add social media links when available
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: 'support@harmonyshield.com'
      }
    },
    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Harmony Shield',
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    },
    Article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      ...data
    }
  };

  return schemas[type] || schemas.Organization;
};
