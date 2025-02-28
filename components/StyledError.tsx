'use client';

import { AlertTriangle } from 'lucide-react';
import { FC, ReactElement } from 'react';

interface Props {
  title: string;
  description: string | ReactElement;
  icon?: ReactElement;
}

const StyledError: FC<Props> = (props): ReactElement => (
  <div className="mt-12 flex flex-col items-center gap-2">
    {props.icon ? props.icon : <AlertTriangle className="h-16 w-16" />}
    <h2 className="font-clash mt-4 text-2xl font-bold tracking-wide">
      {props.title}
    </h2>
    <p className="text-muted-foreground mt-2 text-center text-lg">
      {props.description}
    </p>
  </div>
);

export default StyledError;
