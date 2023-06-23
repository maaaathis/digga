'use client';

import { XSquareIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DomainNotRegistered = () => (
  <Alert variant="destructive">
    <XSquareIcon className="h-6 w-6" />
    <AlertTitle>Not registered</AlertTitle>
    <AlertDescription>
      This Domain is currently not registered.
    </AlertDescription>
  </Alert>
);

export default DomainNotRegistered;
