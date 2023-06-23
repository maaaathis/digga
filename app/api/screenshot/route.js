import captureWebsite from 'capture-website';

export async function GET(req, res) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  // Create a screenshot buffer of the url
  // Use the new headless mode
  const screenshot = await captureWebsite.buffer(url, {
    launchOptions: { headless: 'new' },
    disableAnimations: true,
    width: 426,
    height: 240,
  });

  // Convert the screenshot buffer to a base64 string
  const screenshotBase64 = screenshot.toString('base64');

  return new Response(
    JSON.stringify({
      screenshot: screenshotBase64,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
