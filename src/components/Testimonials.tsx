import React from "react";
import { Star } from "lucide-react";

const reviewsData = [
  {
    id: 1,
    name: "Emma Thompson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "Absolutely love my custom band! Quality is exceptional.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    text: "Amazing attention to detail in these handcrafted pieces.",
    rating: 5,
  },
  {
    id: 3,
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    text: "Unique and beautiful! Colors are vibrant and durable.",
    rating: 4,
  },
  {
    id: 4,
    name: "David Wilson",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "Perfect gift! My partner loves the keychain.",
    rating: 5,
  },
  {
    id: 5,
    name: "Lisa Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    text: "Fast shipping and excellent customer service.",
    rating: 5,
  },
  {
    id: 6,
    name: "James Parker",
    avatar: "https://randomuser.me/api/portraits/men/54.jpg",
    text: "Best handmade accessories I've ever bought!",
    rating: 5,
  },
  {
    id: 7,
    name: "Sophie Anderson",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    text: "Love the pop culture designs. So creative!",
    rating: 4,
  },
  {
    id: 8,
    name: "Ryan Martinez",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    text: "Great value for money. Will order again!",
    rating: 5,
  },
];

const ReviewCard = ({ review }: { review: (typeof reviewsData)[0] }) => {
  return (
    <div className="flex-shrink-0 w-80 mx-4 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-wolly-pink/20 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center mb-4">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{review.name}</h4>
          <div className="flex mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < review.rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">"{review.text}"</p>
    </div>
  );
};

const Testimonials = () => {
  // Duplicate the reviews array to create seamless loop
  const duplicatedReviews = [...reviewsData, ...reviewsData];
  const duplicatedReviewsReverse = [...reviewsData, ...reviewsData].reverse();

  return (
    <section className="section-container py-20 relative overflow-hidden">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 bg-wolly-pink/10 text-wolly-magenta rounded-full text-sm font-medium mb-4">
          Customer Love
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          What Our Customers Say
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Don't just take our word for it. Hear from our happy customers about
          their Wollyway experience.
        </p>
      </div>

      {/* Infinite Review Cards */}
      <div className="relative">
        {/* First layer - moving left to right */}
        <div className="relative mb-6 overflow-hidden">
          <div className="flex animate-scroll-right">
            {duplicatedReviews.map((review, index) => (
              <ReviewCard key={`${review.id}-${index}`} review={review} />
            ))}
          </div>
        </div>

        {/* Second layer - moving right to left */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-left">
            {duplicatedReviewsReverse.map((review, index) => (
              <ReviewCard
                key={`reverse-${review.id}-${index}`}
                review={review}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
