'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MessageCircle, Linkedin, Building, MapPin, Globe, Instagram, Twitter, Facebook } from 'lucide-react';

interface OpportunityHeaderProps {
  leadSnapshot: {
    firstName: string;
    lastName: string;
    company?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  priority: string;
  status: string;
  probability: number;
}

export default function OpportunityHeader({ leadSnapshot, priority, status, probability }: OpportunityHeaderProps) {
  const getInitials = () => {
    return `${leadSnapshot.firstName.charAt(0)}${leadSnapshot.lastName?.charAt(0) || ''}`;
  };
  
  const getContactBadges = () => {
    const badges = [];
    
    if (leadSnapshot.email) {
      badges.push({
        icon: <Mail className="h-4 w-4" />,
        label: 'Email',
        href: `mailto:${leadSnapshot.email}`,
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
      });
    }
    
    if (leadSnapshot.phone) {
      badges.push({
        icon: <Phone className="h-4 w-4" />,
        label: leadSnapshot.phone,
        className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      });
      
      badges.push({
        icon: <MessageCircle className="h-4 w-4" />,
        label: 'WhatsApp',
        href: `https://wa.me/${leadSnapshot.phone.replace(/\D/g, '')}`,
        className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
      });
    }
    
    if (leadSnapshot.linkedin) {
      badges.push({
        icon: <Linkedin className="h-4 w-4" />,
        label: 'LinkedIn',
        href: leadSnapshot.linkedin.startsWith('http') ? leadSnapshot.linkedin : `https://${leadSnapshot.linkedin}`,
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
      });
    }
    
    if (leadSnapshot.instagram) {
      badges.push({
        icon: <Instagram className="h-4 w-4" />,
        label: 'Instagram',
        href: leadSnapshot.instagram.startsWith('http') ? leadSnapshot.instagram : `https://instagram.com/${leadSnapshot.instagram.replace('@', '')}`,
        className: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50'
      });
    }
    
    if (leadSnapshot.twitter) {
      badges.push({
        icon: <Twitter className="h-4 w-4" />,
        label: 'Twitter',
        href: leadSnapshot.twitter.startsWith('http') ? leadSnapshot.twitter : `https://twitter.com/${leadSnapshot.twitter.replace('@', '')}`,
        className: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50'
      });
    }
    
    if (leadSnapshot.facebook) {
      badges.push({
        icon: <Facebook className="h-4 w-4" />,
        label: 'Facebook',
        href: leadSnapshot.facebook.startsWith('http') ? leadSnapshot.facebook : `https://facebook.com/${leadSnapshot.facebook}`,
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
      });
    }
    
    if (leadSnapshot.website) {
      badges.push({
        icon: <Globe className="h-4 w-4" />,
        label: 'Sitio web',
        href: leadSnapshot.website.startsWith('http') ? leadSnapshot.website : `https://${leadSnapshot.website}`,
        className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      });
    }
    
    return badges;
  };
  
  const getLocation = () => {
    const parts = [
      leadSnapshot.address,
      leadSnapshot.city,
      leadSnapshot.state,
      leadSnapshot.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const contactBadges = getContactBadges();
  const location = getLocation();
  
  return (
    <Card className="overflow-hidden border">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-900/40 px-6 py-4 border-b dark:border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
            {getInitials()}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">{leadSnapshot.firstName} {leadSnapshot.lastName}</h2>
            <div className="flex flex-wrap items-center gap-2">
              {leadSnapshot.company && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building className="h-3.5 w-3.5" />
                  <span>{leadSnapshot.company}</span>
                </div>
              )}
              
              {location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {contactBadges.length > 0 && (
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            {contactBadges.map((badge, index) => (
              badge.href ? (
                <a
                  key={index}
                  href={badge.href}
                  target={badge.href.startsWith('mailto:') ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full transition-colors text-sm ${badge.className}`}
                >
                  {badge.icon}
                  {badge.label}
                </a>
              ) : (
                <span
                  key={index}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${badge.className}`}
                >
                  {badge.icon}
                  {badge.label}
                </span>
              )
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
} 