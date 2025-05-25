import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import FeedbackForm from "@/components/FeedbackForm";
import { 
  Utensils, 
  Clock, 
  Truck, 
  Shield, 
  Star,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Coffee,
  Salad,
  Pizza,
  Soup,
  Quote
} from "lucide-react";

// Add fade-out animation styles
const fadeOutAnimation = `
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // Add console logging to debug
  console.log('Current User:', currentUser);
  console.log('User Name:', currentUser?.displayName || currentUser?.email?.split('@')[0]);

  const handleOrderNow = () => {
    if (currentUser) {
      navigate("/menu");
    } else {
      navigate("/auth");
    }
  };

  const handleLearnMore = () => {
    navigate("/subscription");
  };

  const handleGetStarted = () => {
    navigate("/menu");
  };

  const features = [
    {
      icon: Utensils,
      title: "Campus Dining Made Easy",
      description: "Order your favorite meals from campus restaurants with just a few taps."
    },
    {
      icon: Clock,
      title: "Quick Delivery",
      description: "Get your food delivered to your location within minutes."
    },
    {
      icon: Truck,
      title: "Campus-Wide Delivery",
      description: "We deliver to all major locations across the campus."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and secure payment options with our token system."
    }
  ];

  const popularItems = [
    {
      name: "Gourmet Burgers",
      description: "Juicy, flame-grilled burgers with premium ingredients",
      icon: Pizza,
      color: "bg-red-100 text-red-600"
    },
    {
      name: "Pasta Corner",
      description: "Authentic Italian pasta dishes made fresh daily",
      icon: Utensils,
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      name: "Asian Fusion",
      description: "Delicious Asian-inspired dishes with a modern twist",
      icon: Soup,
      color: "bg-purple-100 text-purple-600"
    },
    {
      name: "Dessert Delights",
      description: "Sweet treats and decadent desserts to satisfy your cravings",
      icon: Coffee,
      color: "bg-pink-100 text-pink-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      comment: "The food delivery service is amazing! I can focus on my studies while getting delicious meals delivered right to my dorm.",
      rating: 5,
      image: "/testimonial-1.jpg"
    },
    {
      name: "Michael Chen",
      role: "Engineering Student",
      comment: "As a busy engineering student, this service has been a lifesaver. The food is always fresh and delivered on time.",
      rating: 5,
      image: "/testimonial-2.jpg"
    },
    {
      name: "Emily Davis",
      role: "Business Student",
      comment: "The variety of food options is incredible. I love how I can order different cuisines throughout the week.",
      rating: 5,
      image: "/testimonial-3.jpg"
    }
  ];

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4CAE4F] via-[#45a049] to-[#3d8b40]">
      <style>{fadeOutAnimation}</style>
      
      {/* Welcome Message Below Navbar */}
      {showWelcome && currentUser && (
        <div className="w-full bg-white/90 backdrop-blur-sm py-3 animate-slideIn">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <span className="text-[#4CAE4F] text-lg font-medium">
                Welcome back, {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
        <div className="container mx-auto px-6 py-24 sm:py-32 md:py-40 relative">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/20 rounded-full mb-8">
              <span className="text-white text-sm font-medium">
                Welcome to Campus Kitchen
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 sm:mb-10 leading-tight tracking-tight text-white">
              Delicious Meals Delivered to Your Campus
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl mb-10 sm:mb-12 text-white/90 max-w-2xl font-light">
              Order your favorite meals and get them delivered right to your doorstep.
              Fast, reliable, and delicious!
            </p>
            {!isAdmin && (
              <Button 
                size="lg" 
                onClick={handleOrderNow} 
                className="text-lg bg-white text-[#4CAE4F] hover:bg-gray-100 px-10 py-7 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Order Now
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Popular Items
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Discover our most loved dishes, crafted with care and delivered with passion
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {popularItems.map((item) => (
              <Card key={item.name} className="overflow-hidden hover:shadow-xl transition-all duration-300 rounded-xl border-0 bg-white/10 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className={`p-4 rounded-xl ${item.color} w-fit mb-6`}>
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">{item.name}</h3>
                  <p className="text-white/90 text-lg">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-[#45a049]/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Why Choose Campus Kitchen?
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Experience the best campus dining service with our unique features
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {features.map((feature) => (
              <Card key={feature.title} className="p-8 hover:shadow-xl transition-all duration-300 rounded-xl border-0 bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-6 mb-6">
                  <div className="p-4 bg-white/20 rounded-xl">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-white/90 text-lg">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Student Feedback Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              What Our Students Say
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Hear from our satisfied students about their experience with Campus Kitchen
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="p-8 hover:shadow-xl transition-all duration-300 rounded-xl border-0 bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Quote className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{testimonial.name}</h3>
                    <p className="text-white/80">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-white/90 text-lg mb-4">{testimonial.comment}</p>
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Section - Only show for non-admin users */}
      {!isAdmin && (
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Share Your Experience
              </h2>
              <p className="text-white/90 text-lg max-w-2xl mx-auto">
                Help us improve our service by sharing your feedback
              </p>
            </div>
            <FeedbackForm />
          </div>
        </section>
      )}

      {/* CTA Section - Only show for non-admin users */}
      {!isAdmin && (
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-6">
            <Card className="bg-gradient-to-br from-[#4CAE4F] to-[#45a049] text-white overflow-hidden rounded-2xl border-0 shadow-2xl">
              <CardContent className="p-16 text-center">
                <h2 className="text-4xl sm:text-5xl font-bold mb-8">
                  Ready to Order?
                </h2>
                <p className="text-xl sm:text-2xl mb-10 text-white/90 max-w-3xl mx-auto font-light">
                  Join thousands of students who enjoy delicious meals delivered right to their campus.
                </p>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  onClick={handleOrderNow}
                  className="text-lg bg-white text-[#4CAE4F] hover:bg-gray-100 px-10 py-7 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Order Now
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home; 