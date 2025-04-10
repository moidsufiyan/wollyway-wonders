
import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '@/types/blog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BlogPostCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured';
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, variant = 'default' }) => {
  const isFeatured = variant === 'featured';
  
  return (
    <Link to={`/blog/${post.slug}`} className="block transition-transform hover:scale-[1.02]">
      <Card className={`h-full overflow-hidden ${isFeatured ? 'shadow-lg' : ''}`}>
        <div className={`relative ${isFeatured ? 'aspect-[2/1]' : 'aspect-[3/2]'}`}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          {post.featured && (
            <Badge variant="secondary" className="absolute top-3 left-3 bg-primary text-white">
              Featured
            </Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center text-xs text-muted-foreground mb-1">
            <Badge variant="outline" className="mr-2">{post.category}</Badge>
            <span className="flex items-center">
              <Calendar size={14} className="mr-1" />
              {formatDistanceToNow(new Date(post.publishedDate), { addSuffix: true })}
            </span>
          </div>
          <CardTitle className="text-xl leading-tight line-clamp-2">
            {post.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <CardDescription className="line-clamp-3">
            {post.excerpt}
          </CardDescription>
        </CardContent>
        
        <CardFooter className="pt-0 flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span>{post.author.name}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{post.readTime} min read</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default BlogPostCard;
