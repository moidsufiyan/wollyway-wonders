
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import BlogList from '@/components/blog/BlogList';
import { BlogPost } from '@/types/blog';

// Sample blog data
const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Art of Knot Tying: Creating Beautiful Bracelets',
    slug: 'art-of-knot-tying',
    excerpt: "Learn the ancient techniques of knot tying and how they're applied to create our beautiful handcrafted bracelets.",
    content: `<p>Knot tying is an ancient art that has been practiced across cultures for centuries. From sailors to artisans, knot tying has served both practical and decorative purposes.</p>
    <p>In this article, we'll explore the history of decorative knot tying and share some basic techniques that you can try at home.</p>
    <h2>The History of Decorative Knotting</h2>
    <p>Decorative knot tying can be traced back thousands of years, with evidence found in ancient Chinese, Egyptian, and Celtic artifacts...</p>`,
    coverImage: 'https://images.unsplash.com/photo-1516962126636-27bf9e1e5e46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Emma Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'Master artisan with 15 years of experience in handcrafted jewelry.'
    },
    category: 'Crafting Guides',
    tags: ['knot tying', 'bracelets', 'DIY', 'crafting'],
    publishedDate: '2023-10-15T10:30:00Z',
    readTime: 8,
    featured: true
  },
  {
    id: '2',
    title: 'Customization Ideas for Your Friendship Bracelets',
    slug: 'customization-ideas-friendship-bracelets',
    excerpt: 'Explore creative ways to personalize friendship bracelets and make them extra special for your loved ones.',
    content: `<p>Friendship bracelets are more than just accessories; they're tokens of connection and affection.</p>
    <p>Making them personal adds another layer of meaning. Here are some ideas to customize your friendship bracelets...</p>`,
    coverImage: 'https://images.unsplash.com/photo-1531169509526-f8f1fdaa4a67?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Alex Chen',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    category: 'DIY Projects',
    tags: ['customization', 'friendship', 'DIY', 'gift ideas'],
    publishedDate: '2023-09-22T14:15:00Z',
    readTime: 5
  },
  {
    id: '3',
    title: 'From Pop Culture to Wrists: Our Design Inspiration',
    slug: 'pop-culture-design-inspiration',
    excerpt: 'Discover how our designers draw inspiration from movies, comics, and pop culture to create unique bracelet designs.',
    content: `<p>Pop culture has always been a rich source of inspiration for artists and designers across all mediums.</p>
    <p>In this article, we pull back the curtain on our design process and show how we transform beloved pop culture elements into wearable art.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Maya Patel',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    category: 'Behind the Scenes',
    tags: ['design', 'pop culture', 'inspiration', 'creativity'],
    publishedDate: '2023-08-30T09:45:00Z',
    readTime: 7
  },
  {
    id: '4',
    title: 'The Meaning Behind Different Bracelet Patterns and Colors',
    slug: 'meaning-bracelet-patterns-colors',
    excerpt: 'Understanding the symbolism and cultural significance of different patterns, knots, and color combinations in bracelets.',
    content: `<p>Colors and patterns in jewelry have carried symbolic meanings throughout human history.</p>
    <p>From ancient civilizations to modern fashion, these visual elements communicate messages that transcend language barriers...</p>`,
    coverImage: 'https://images.unsplash.com/photo-1563293815-7b6842f61b0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Jordan Taylor',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    category: 'Cultural Insights',
    tags: ['symbolism', 'colors', 'patterns', 'culture'],
    publishedDate: '2023-07-15T16:20:00Z',
    readTime: 6
  }
];

const categories = ['Crafting Guides', 'DIY Projects', 'Behind the Scenes', 'Cultural Insights', 'Stories', 'News'];
const featuredPost = blogPosts.find(post => post.featured);

const Blog = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the stories behind our products, crafting tips, and the latest trends in handmade accessories.
          </p>
        </div>
        
        <Separator className="mb-12" />
        
        {/* Blog Content */}
        <BlogList 
          posts={blogPosts} 
          categories={categories}
          featuredPost={featuredPost}
        />
        
        {/* Newsletter Signup */}
        <div className="mt-16 bg-primary/10 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">Stay in the Loop</h3>
          <p className="mb-6 max-w-xl mx-auto">
            Subscribe to our newsletter for the latest blog posts, crafting tips, and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2 rounded-md border border-border"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
