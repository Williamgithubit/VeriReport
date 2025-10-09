import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FileUp, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  const features = [
    {
      icon: <FileUp className="h-10 w-10 text-primary" />,
      title: 'Seamless Uploads',
      description: 'Admins and teachers can effortlessly upload report cards in various formats (PDF, Excel, Images).',
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: 'Unique Verification',
      description: 'Each report card gets a unique verification ID and QR code, ensuring tamper-proof authenticity.',
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-primary" />,
      title: 'Instant Verification',
      description: 'Anyone can instantly verify a report card\'s authenticity through our public portal or by scanning the QR code.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 bg-card">
        <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 items-center gap-8">
          <div className="flex flex-col items-start space-y-6">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              The Future of Academic Verification is Here.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              VeriReport provides a secure, reliable, and user-friendly platform to verify academic report cards, eliminating fraud and building trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/verify">Verify a Report</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/login">Portal Login</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-2xl">
           {heroImage && <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              style={{ objectFit: 'cover' }}
              data-ai-hint={heroImage.imageHint}
              className="transform hover:scale-105 transition-transform duration-300"
            />}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">Why Choose VeriReport?</h2>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Our platform is built on security, efficiency, and accessibility for everyone involved in the academic journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0 mb-4">
                  {feature.icon}
                </CardHeader>
                <CardContent className="p-0">
                  <CardTitle className="font-headline text-xl mb-2">{feature.title}</CardTitle>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
