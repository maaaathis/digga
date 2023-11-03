'use client';

import IpLink from '@/components/IpLink';

const RecordList = ({ record }) => {
  return (
    <>
      <IpLink value={record} />
    </>
  );
};

export default RecordList;
