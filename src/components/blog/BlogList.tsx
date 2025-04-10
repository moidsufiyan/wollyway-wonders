
import React, { useState } from 'react';
import { BlogPost } from '@/types/blog';
import BlogPostCard from './BlogPostCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface BlogListProps {
  posts: BlogPost[];
  categories?: string[];
  featuredPost?: BlogPost;
}

const BlogList: React.FC<BlogListProps> = ({ posts, categories = [], featuredPost }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="space-y-8">
      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="search"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={!selectedCategory ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={category === selectedCategory ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {/* Featured Post */}
      {featuredPost && !searchTerm && !selectedCategory && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Featured Article</h2>
          <BlogPostCard post={featuredPost} variant="featured" />
        </div>
      )}
      
      {/* Post List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Latest Articles</h2>
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found matching your search.</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
