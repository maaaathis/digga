'use client';

import Image from 'next/image';
import useSWR from 'swr';

// Define a custom fetcher function that calls the API route
const fetcher = (url) => {
  // Gib die axios-Anfrage zurück
  return axios
    .get(url)
    .then((res) => res.json())
    .catch((err) => console.error(err));
};

export default async function PageScreenshotter({ url }) {
  console.log('URL' + url);
  // Use useSWR to fetch the screenshot data from the API route
  const { data, error } = useSWR(`/api/screenshot?url=${url}`, fetcher);

  console.log(data);

  // Return a JSX element that renders the screenshot or a loading message
  return (
    <div>
      {error && <p>Es gab einen Fehler beim Laden des Screenshots.</p>}
      {data ? (
        // Verwende next/image, um den Screenshot base64-String als Bild anzuzeigen
        <Image
          src={`data:image/png;base64,${data.screenshot}`}
          alt="Screenshot"
          width={800}
          height={600}
        />
      ) : (
        // Zeige eine Lademeldung an, während der Screenshot geholt wird
        <p>Lade Screenshot...</p>
      )}
    </div>
  );
}
