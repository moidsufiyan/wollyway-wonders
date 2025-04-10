
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
    bio?: string;
  };
  category: string;
  tags: string[];
  publishedDate: string;
  readTime: number; // in minutes
  featured?: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}
