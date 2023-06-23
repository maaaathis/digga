
"use client"
import Image from 'next/image';
import useSWR from 'swr';

// Define a custom fetcher function that calls the API route
const fetcher = (url) => fetch(url).then((res) => res.json());

export default async function PageScreenshotter({ url }) {
    console.log('URL'.url);
    // Use useSWR to fetch the screenshot data from the API route
    const { data, error } = useSWR(`/api/screenshot?url=${url}`, fetcher);
    
    console.log(data)

  // Return a JSX element that renders the screenshot or a loading message
  return (
    <div>
      {data ? (
        // Use next/image to display the screenshot base64 string as an image
        <Image src={`data:image/png;base64,${data.screenshot}`} alt="Screenshot" width={800} height={600} />
      ) : (
        // Display a loading message while the screenshot is being fetched
        <p>Loading screenshot...</p>
      )}
    </div>
  );
}