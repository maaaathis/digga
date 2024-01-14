import { XOctagon } from 'lucide-react';
import { type FC } from 'react';

import StyledError from '@/components/StyledError';

const LookupNotFound: FC = () => (
  <div className="my-16 flex h-full w-full">
    <div className="m-auto flex flex-col items-center gap-2">
      <StyledError
        title="404 - Not Found"
        description="That's not a valid domain."
        icon={<XOctagon className="h-16 w-16" />}
      />
    </div>
  </div>
);

export default LookupNotFound;
