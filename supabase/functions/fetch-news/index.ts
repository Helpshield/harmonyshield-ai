import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  category: 'fraud' | 'scam' | 'cybersecurity' | 'phishing' | 'crypto' | 'identity_theft' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// RSS feed parser utility
async function parseRSSFeed(url: string, source: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(url);
    const xmlText = await response.text();
    
    // Simple XML parsing - looking for item tags
    const items = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
    
    return items.slice(0, 10).map((item, index) => {
      const titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const descMatch = item.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
      const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const pubDateMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
      
      const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : 'No title';
      const description = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '').trim() : '';
      const url = linkMatch ? linkMatch[1].trim() : '';
      const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();
      
      return {
        id: `rss-${source.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
        title,
        description: description.slice(0, 300),
        url,
        source,
        publishedAt: pubDate,
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop',
        category: categorizeArticle(title + ' ' + description),
        severity: assessSeverity(title + ' ' + description)
      };
    });
  } catch (error) {
    console.error(`Error parsing RSS feed ${url}:`, error);
    return [];
  }
}

// Fetch from reliable RSS sources
async function fetchRSSFeeds(): Promise<NewsArticle[]> {
  const rssSources = [
    { url: 'https://www.scamwatch.gov.au/news-alerts/scam-alerts.xml', name: 'Scamwatch Australia' },
    { url: 'https://www.ftc.gov/news-events/news/rss', name: 'FTC Consumer Alerts' },
    { url: 'https://www.cisa.gov/cybersecurity-advisories/rss.xml', name: 'CISA Security Alerts' },
    { url: 'https://krebsonsecurity.com/feed/', name: 'Krebs on Security' },
    { url: 'https://www.bleepingcomputer.com/feed/', name: 'BleepingComputer' }
  ];

  try {
    const results = await Promise.allSettled(
      rssSources.map(source => parseRSSFeed(source.url, source.name))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<NewsArticle[]> => result.status === 'fulfilled')
      .flatMap(result => result.value)
      .filter(article => article.title && article.url);
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    return [];
  }
}

// Fetch government fraud alerts
async function fetchGovernmentAlerts(): Promise<NewsArticle[]> {
  const alerts: NewsArticle[] = [];
  
  try {
    // Simulate fetching from government sources (these would be actual API calls in production)
    const mockAlerts = [
      {
        id: 'gov-alert-1',
        title: 'IRS Warning: Tax Season Phishing Scams on the Rise',
        description: 'The IRS warns taxpayers about increasing phishing attempts targeting tax refund information.',
        url: 'https://www.irs.gov/newsroom/tax-scams-consumer-alerts',
        source: 'IRS',
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        category: 'phishing' as const,
        severity: 'high' as const,
        imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop'
      },
      {
        id: 'gov-alert-2',
        title: 'FBI IC3: Romance Scam Losses Exceed $1.3 Billion in 2023',
        description: 'FBI Internet Crime Complaint Center reports record-breaking losses from romance scams.',
        url: 'https://www.ic3.gov/Media/Y2024/PSA240201',
        source: 'FBI IC3',
        publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        category: 'scam' as const,
        severity: 'critical' as const,
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=200&fit=crop'
      }
    ];
    
    alerts.push(...mockAlerts);
  } catch (error) {
    console.error('Error fetching government alerts:', error);
  }
  
  return alerts;
}

async function fetchHackerNewsArticles(): Promise<NewsArticle[]> {
  try {
    // Fetch top stories from Hacker News
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds = await response.json();
    
    // Get first 10 stories
    const stories = await Promise.all(
      storyIds.slice(0, 15).map(async (id: number) => {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return storyResponse.json();
      })
    );
    
    // Filter for fraud/security related stories
    const relevantStories = stories.filter(story => {
      const title = story.title?.toLowerCase() || '';
      return title.includes('scam') || title.includes('fraud') || title.includes('phishing') || 
             title.includes('security') || title.includes('hack') || title.includes('breach') ||
             title.includes('crypto') || title.includes('ransomware');
    });
    
    return relevantStories.map((story, index) => ({
      id: `hn-${story.id}`,
      title: story.title,
      description: story.text || 'Security and fraud-related discussion from Hacker News community',
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      source: 'Hacker News',
      publishedAt: new Date(story.time * 1000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop',
      category: categorizeArticle(story.title),
      severity: assessSeverity(story.title)
    }));
  } catch (error) {
    console.error('Error fetching from Hacker News:', error);
    return [];
  }
}

async function fetchRedditSecurityPosts(): Promise<NewsArticle[]> {
  try {
    // Fetch from r/security and r/scams (public JSON endpoints)
    const [securityResponse, scamsResponse] = await Promise.all([
      fetch('https://www.reddit.com/r/security/hot.json?limit=10'),
      fetch('https://www.reddit.com/r/scams/hot.json?limit=10')
    ]);
    
    const [securityData, scamsData] = await Promise.all([
      securityResponse.json(),
      scamsResponse.json()
    ]);
    
    const allPosts = [
      ...(securityData.data?.children || []),
      ...(scamsData.data?.children || [])
    ];
    
    return allPosts
      .filter(post => !post.data.stickied && post.data.title) // Filter out stickied posts
      .map((post, index) => ({
        id: `reddit-${post.data.id}`,
        title: post.data.title,
        description: post.data.selftext?.slice(0, 200) || 'Community discussion about security and fraud prevention',
        url: `https://reddit.com${post.data.permalink}`,
        source: `Reddit r/${post.data.subreddit}`,
        publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=200&fit=crop',
        category: categorizeArticle(post.data.title + ' ' + (post.data.selftext || '')),
        severity: assessSeverity(post.data.title + ' ' + (post.data.selftext || ''))
      }))
      .slice(0, 8); // Limit results
  } catch (error) {
    console.error('Error fetching from Reddit:', error);
    return [];
  }
}

function categorizeArticle(content: string): NewsArticle['category'] {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('crypto') || lowerContent.includes('bitcoin') || lowerContent.includes('cryptocurrency')) {
    return 'crypto';
  }
  if (lowerContent.includes('phishing') || lowerContent.includes('email scam')) {
    return 'phishing';
  }
  if (lowerContent.includes('identity theft') || lowerContent.includes('identity fraud')) {
    return 'identity_theft';
  }
  if (lowerContent.includes('romance scam') || lowerContent.includes('investment scam')) {
    return 'scam';
  }
  if (lowerContent.includes('cybersecurity') || lowerContent.includes('data breach')) {
    return 'cybersecurity';
  }
  if (lowerContent.includes('fraud')) {
    return 'fraud';
  }
  return 'general';
}

function assessSeverity(content: string): NewsArticle['severity'] {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('critical') || lowerContent.includes('urgent') || lowerContent.includes('millions') || lowerContent.includes('widespread')) {
    return 'critical';
  }
  if (lowerContent.includes('major') || lowerContent.includes('significant') || lowerContent.includes('thousands')) {
    return 'high';
  }
  if (lowerContent.includes('moderate') || lowerContent.includes('hundreds')) {
    return 'medium';
  }
  return 'low';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting news fetch process...');
    
    // Fetch from all available sources
    const [rssArticles, govAlerts, hackerNewsArticles, redditArticles] = await Promise.all([
      fetchRSSFeeds(),
      fetchGovernmentAlerts(),
      fetchHackerNewsArticles(),
      fetchRedditSecurityPosts()
    ]);

    console.log(`Fetched: ${rssArticles.length} RSS, ${govAlerts.length} gov alerts, ${hackerNewsArticles.length} HN, ${redditArticles.length} Reddit`);

    // Combine all articles
    const allArticles = [...rssArticles, ...govAlerts, ...hackerNewsArticles, ...redditArticles];
    
    // Remove duplicates based on title similarity
    const uniqueArticles = allArticles.filter((article, index, arr) => {
      return index === arr.findIndex(a => 
        a.title.toLowerCase().slice(0, 50) === article.title.toLowerCase().slice(0, 50)
      );
    });

    console.log(`${uniqueArticles.length} unique articles after deduplication`);

    // Sort by publication date (newest first)
    uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Store articles in database
    const articlesToStore = uniqueArticles.slice(0, 50).map(article => ({
      title: article.title,
      description: article.description || '',
      url: article.url,
      source_name: article.source,
      published_at: article.publishedAt,
      image_url: article.imageUrl,
      category: article.category,
      severity: article.severity,
      content: article.description
    }));

    // Insert/update articles in database (upsert based on URL)
    const { data: insertedData, error: insertError } = await supabase
      .from('news_articles')
      .upsert(articlesToStore, { 
        onConflict: 'url',
        ignoreDuplicates: false 
      });

    if (insertError) {
      console.error('Error inserting articles:', insertError);
    } else {
      console.log(`Successfully stored ${articlesToStore.length} articles in database`);
    }

    // Return articles for immediate use
    return new Response(
      JSON.stringify({ 
        success: true, 
        articles: uniqueArticles.slice(0, 50),
        stored: articlesToStore.length,
        sources: [...new Set(uniqueArticles.map(a => a.source))],
        lastUpdated: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in fetch-news function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch news',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});