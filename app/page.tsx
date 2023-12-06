import { FC, ReactElement } from 'react';

import { Card } from '@/components/ui/card';

import BookmarkletLink from '@/components/BookmarkletLink';
import SearchForm from '@/components/SearchForm';

const Home: FC = (): ReactElement => {
  return (
    <div className="flex h-[calc(100vh-50px)] w-full flex-col justify-center">
      <div className="flex w-full flex-row justify-center">
        <div className="w-2/4">
          <SearchForm autofocus={true} className="bg-background p-5 text-2xl" />
        </div>
      </div>

      <Card className="mx-auto my-16 max-w-lg p-6 text-foreground">
        <h2 className="mb-5 text-center text-xl font-semibold tracking-tight sm:text-2xl">
          Quick Inspect Bookmarklet
        </h2>

        <p className="mb-5 mt-2 text-center text-sm text-muted-foreground">
          Drag this link to your bookmarks bar to quickly go to the results page
          for the site you are currently on!
        </p>

        <BookmarkletLink />
      </Card>
    </div>
  );
};

export default Home;
