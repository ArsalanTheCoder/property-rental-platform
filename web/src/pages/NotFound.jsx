import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { Button } from '../components/common/Button';
import { SearchEmptyIllustration } from '../components/illustrations/SearchEmptyIllustration';

export const NotFound = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center px-4 text-center">
      <div className="flex flex-col items-center max-w-md">
        <SearchEmptyIllustration />
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-6 mb-2">404 - Page Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
          The property route or page you are searching for does not exist or has been relocated.
        </p>
        <div className="flex gap-3">
          <Link to="/">
            <Button variant="primary" icon={Home}>Return Home</Button>
          </Link>
          <Link to="/properties">
            <Button variant="outline" icon={Compass}>Explore Properties</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
