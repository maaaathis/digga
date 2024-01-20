'use client';

import { FC, ReactElement } from 'react';

import IpLink from '@/app/lookup/[domain]/dns/_components/IpLink';

type RecordListProps = {
  record: string;
};

const RecordList: FC<RecordListProps> = ({ record }): ReactElement => {
  return <IpLink value={record} />;
};

export default RecordList;
