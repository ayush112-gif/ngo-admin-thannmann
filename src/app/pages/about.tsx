import { Link } from '@/app/components/router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Target, Eye, Heart, Users, Award, Globe, Shield, TrendingUp } from 'lucide-react';

export function AboutPage() {
  const values = [
    { icon: Heart, title: 'Compassion', description: 'We lead with empathy and understanding' },
    { icon: Shield, title: 'Transparency', description: 'Open and honest in all our operations' },
    { icon: Users, title: 'Community', description: 'People at the heart of everything' },
    { icon: Award, title: 'Excellence', description: 'Committed to highest quality impact' },
    { icon: Globe, title: 'Sustainability', description: 'Building long-term solutions' },
    { icon: TrendingUp, title: 'Impact', description: 'Measurable positive change' },
  ];
  
  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#050B1F] text-white py-16">
        <div className="absolute inset-0 soft-glow opacity-85" />
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            About Thannmanngaadi Foundation
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Empowering communities through sustainable development and compassionate action
          </p>
        </div>
      </section>
      
      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8 border-2 border-[#1D4ED8]">
              <CardContent className="p-0">
                <div className="w-16 h-16 rounded-full bg-[#1D4ED8]/10 flex items-center justify-center mb-6">
                  <Target className="text-[#1D4ED8]" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Our Mission
                </h2>
                <p className="text-gray-700 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                  To create sustainable positive change in communities through education, health support, skill development, and environmental initiatives that empower individuals to build better futures.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8 border-2 border-[#38BDF8]">
              <CardContent className="p-0">
                <div className="w-16 h-16 rounded-full bg-[#38BDF8]/10 flex items-center justify-center mb-6">
                  <Eye className="text-[#38BDF8]" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Our Vision
                </h2>
                <p className="text-gray-700 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                  A world where every individual has access to opportunities for growth, where communities thrive through collaboration, and where sustainable development creates lasting positive impact for future generations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Values */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-4xl font-bold text-[#0F172A] text-center mb-12" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-all">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 rounded-full bg-[#1D4ED8]/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="text-[#1D4ED8]" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {value.title}
                    </h3>
                    <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="relative overflow-hidden bg-[#050B1F] text-white py-16">
        <div className="absolute inset-0 soft-glow opacity-85" />
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Join Us in Making a Difference
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#38BDF8] text-white hover:bg-[#0ea5e9] rounded-full">
              <Link href="/volunteer">Become a Volunteer</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8] hover:text-white rounded-full">
              <Link href="/internships">Apply for Internship</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}