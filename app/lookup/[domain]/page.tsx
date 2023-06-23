import DnsTable from '@/components/DnsTable';
import DomainNotRegistered from '@/components/DomainNotRegistered';
import { isAvailable } from '@/lib/whois';
import DnsLookup from '@/utils/DnsLookup';

type LookupDomainProps = {
  params: { domain: string };
};

export const fetchCache = 'default-no-store';

const LookupDomain = async ({ params: { domain } }: LookupDomainProps) => {
  const records = await DnsLookup.resolveAllRecords(domain);

  if ((await isAvailable(domain)) !== 'registered') {
    return <DomainNotRegistered />;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-3">
          <div className="h-56 rounded-xl bg-slate-100 dark:bg-slate-950 px-8 py-5">
            <div>
              <span className="text-sm font-extrabold uppercase text-slate-950">
                Domain Owner
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-950">
                Whois Privacy, Private by Design, LLC
              </p>

              <div className="mt-3">
                <p>info 1</p>
                <p>info 2</p>
                <p>info 3</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-full">
          <img
            src="https://www.stuttgarter-nachrichten.de/media.media.129d97af-13ca-4d8b-a2e5-5f0e21903ff0.original1024.jpg"
            className="h-56 rounded-xl"
            alt=""
          />

          <div className="absolute top-0 flex h-56 w-full rounded-xl bg-orange-500 bg-opacity-40">
            <img
              className="m-auto h-16"
              src="https://companieslogo.com/img/orig/NET_BIG-03fc28ae.png?t=1647436387"
              alt=""
            />
          </div>

          <button className="absolute top-0 flex w-full cursor-pointer p-2">
            <img
              className="ml-auto h-6 w-6"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Infobox_info_icon.svg/480px-Infobox_info_icon.svg.png"
              alt=""
            />
          </button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <div
          className="relative h-72 w-full bg-cover md:col-span-2"
          style={{
            backgroundImage:
              "url('https://helios-i.mashable.com/imagery/articles/06CN9HpdYJ3zWr2vUfYDFBG/hero-image.fill.size_1248x702.v1623387368.png')",
          }}
        ></div>
        <div className="md:col-span-3">
          <div className="h-72 rounded-xl bg-slate-100 dark:bg-slate-950 px-8 py-5">
            <div>
              <span className="text-sm font-extrabold uppercase text-slate-950">
                Preview
              </span>
            </div>
            <div className="mt-16">
              <p className="text-xl font-bold text-slate-950">
                Youtube &middot; Deine Pornoseite
              </p>

              <div className="mt-3">
                <p>https://youtube.porn/</p>
                <p>22 Archive.org snapshots found</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LookupDomain;
