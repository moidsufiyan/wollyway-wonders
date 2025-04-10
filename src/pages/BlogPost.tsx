
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { format } from 'date-fns';

// Mock data - in a real app, you'd fetch this from an API
const blogPost = {
  id: '1',
  title: 'The Art of Knot Tying: Creating Beautiful Bracelets',
  slug: 'art-of-knot-tying',
  excerpt: "Learn the ancient techniques of knot tying and how they're applied to create our beautiful handcrafted bracelets.",
  content: `<p>Knot tying is an ancient art that has been practiced across cultures for centuries. From sailors to artisans, knot tying has served both practical and decorative purposes.</p>
  <p class="mb-4">In this article, we'll explore the history of decorative knot tying and share some basic techniques that you can try at home.</p>
  <h2 class="text-2xl font-bold mt-8 mb-4">The History of Decorative Knotting</h2>
  <p class="mb-4">Decorative knot tying can be traced back thousands of years, with evidence found in ancient Chinese, Egyptian, and Celtic artifacts. In China, decorative knotting evolved from a practical method of securing objects to an art form used in clothing, jewelry, and home décor.</p>
  <p class="mb-4">Celtic knotwork, with its intricate interlaced patterns, symbolized the interconnectedness of life and eternity. These knots were used not only in jewelry but also in illuminated manuscripts and stone carvings.</p>
  <p class="mb-4">Sailors developed their own knot tying traditions, creating practical knots that could be easily untied even when wet. Many of these nautical knots have found their way into modern jewelry making.</p>
  <h2 class="text-2xl font-bold mt-8 mb-4">Basic Techniques</h2>
  <p class="mb-4">If you're new to knot tying for bracelets, here are a few basic techniques to get started:</p>
  <h3 class="text-xl font-semibold mt-6 mb-3">The Square Knot</h3>
  <p class="mb-4">The square knot (also known as the reef knot) is one of the fundamental knots in bracelet making. It's created by tying a left-hand knot followed by a right-hand knot, or vice versa.</p>
  <ol class="list-decimal pl-6 mb-4">
    <li class="mb-2">Take two strands of thread or cord.</li>
    <li class="mb-2">Cross the right strand over the left.</li>
    <li class="mb-2">Bring the right strand under the left and back up.</li>
    <li class="mb-2">Cross the left strand over the right.</li>
    <li class="mb-2">Bring the left strand under the right and back up.</li>
    <li>Pull tight to complete the square knot.</li>
  </ol>
  <h3 class="text-xl font-semibold mt-6 mb-3">The Spiral Knot</h3>
  <p class="mb-4">The spiral knot creates a twisted, rope-like appearance:</p>
  <ol class="list-decimal pl-6 mb-4">
    <li class="mb-2">Start as you would for a square knot, crossing the right strand over the left.</li>
    <li class="mb-2">Bring the right strand under the left and back up.</li>
    <li class="mb-2">Repeat these steps, always starting with the right strand.</li>
    <li>Continue until you achieve your desired length.</li>
  </ol>
  <h2 class="text-2xl font-bold mt-8 mb-4">Choosing the Right Materials</h2>
  <p class="mb-4">The type of cord or thread you choose will significantly impact the look and feel of your bracelet:</p>
  <ul class="list-disc pl-6 mb-4">
    <li class="mb-2"><strong>Embroidery Floss:</strong> Perfect for delicate, colorful designs.</li>
    <li class="mb-2"><strong>Paracord:</strong> Durable and great for chunkier, outdoor-friendly bracelets.</li>
    <li class="mb-2"><strong>Waxed Cotton Cord:</strong> Holds knots well and has a polished look.</li>
    <li><strong>Hemp:</strong> Creates a natural, bohemian aesthetic.</li>
  </ul>
  <h2 class="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
  <p>With these basic techniques and materials, you can begin creating your own handcrafted bracelets. As you become more comfortable with the basics, you can explore more complex patterns and designs to create truly unique pieces.</p>
  <p>Remember, the beauty of handcrafted jewelry lies in its imperfections and the personal touch that mass-produced items lack. Happy knotting!</p>`,
  coverImage: 'https://images.unsplash.com/photo-1516962126636-27bf9e1e5e46?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
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
};

// Related posts would typically be fetched based on category, tags, etc.
const relatedPosts = [
  {
    id: '2',
    title: 'Customization Ideas for Your Friendship Bracelets',
    slug: 'customization-ideas-friendship-bracelets',
    coverImage: 'https://images.unsplash.com/photo-1531169509526-f8f1fdaa4a67?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'DIY Projects',
    publishedDate: '2023-09-22T14:15:00Z',
  },
  {
    id: '3',
    title: 'From Pop Culture to Wrists: Our Design Inspiration',
    slug: 'pop-culture-design-inspiration',
    coverImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Behind the Scenes',
    publishedDate: '2023-08-30T09:45:00Z',
  }
];

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  // In a real app, you would fetch the specific post based on slug
  
  // If the post doesn't exist, show a not found message
  if (!blogPost) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-6">Post Not Found</h1>
          <p className="mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft size={16} className="mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Back Link */}
        <div className="container mx-auto px-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/blog">
              <ArrowLeft size={16} className="mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
        
        {/* Featured Image */}
        <div className="w-full h-[30vh] md:h-[50vh] mb-8 relative">
          <img 
            src={blogPost.coverImage} 
            alt={blogPost.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
        
        {/* Article Content */}
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Category & Date */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {blogPost.category}
              </span>
              <span className="flex items-center text-muted-foreground text-sm">
                <Calendar size={14} className="mr-1" />
                {format(new Date(blogPost.publishedDate), 'MMMM dd, yyyy')}
              </span>
              <span className="flex items-center text-muted-foreground text-sm">
                <Clock size={14} className="mr-1" />
                {blogPost.readTime} min read
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {blogPost.title}
            </h1>
            
            {/* Author */}
            <div className="flex items-center mb-8">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={blogPost.author.avatar} alt={blogPost.author.name} />
                <AvatarFallback>{blogPost.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{blogPost.author.name}</div>
                {blogPost.author.bio && (
                  <div className="text-sm text-muted-foreground">{blogPost.author.bio}</div>
                )}
              </div>
              <div className="ml-auto space-x-2">
                <Button size="sm" variant="ghost">
                  <Share2 size={16} className="mr-1" />
                  Share
                </Button>
                <Button size="sm" variant="ghost">
                  <Bookmark size={16} className="mr-1" />
                  Save
                </Button>
              </div>
            </div>
            
            <Separator className="mb-8" />
            
            {/* Article Body */}
            <article className="prose prose-sm md:prose-base lg:prose-lg max-w-none mb-12">
              <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
            </article>
            
            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.map(tag => (
                  <Link 
                    key={tag} 
                    to={`/blog?tag=${tag}`}
                    className="px-3 py-1 bg-secondary/50 rounded-full text-sm hover:bg-secondary/80 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
            
            <Separator className="my-12" />
            
            {/* Related Posts */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map(post => (
                  <Link 
                    key={post.id} 
                    to={`/blog/${post.slug}`}
                    className="group block"
                  >
                    <div className="rounded-lg overflow-hidden mb-3">
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full aspect-[3/2] object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        {post.category} • {format(new Date(post.publishedDate), 'MMM dd, yyyy')}
                      </span>
                      <h3 className="font-semibold group-hover:text-primary transition-colors mt-1">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
