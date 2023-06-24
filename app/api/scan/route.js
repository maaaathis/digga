import https from 'https';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const file = searchParams.get('file');

  async function checkFile(domain, file) {
    return new Promise((resolve, reject) => {
      const url = `${domain}/${file}`;
      https
        .get(url, (res) => {
          resolve(res.statusCode);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  if (!domain) {
    return new Response(
      JSON.stringify({
        error: true,
        message: '"domain" param missing or invalid',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  let targetHSTS;
  https
    .get(domain, (res) => {
      const hsts = res.headers['strict-transport-security'];
      if (hsts) {
        targetHSTS = hsts;
      } else {
        targetHSTS = false;
      }
    })
    .on('error', (err) => {
      console.error('Fehler:', err.message);
      targetHSTS = false;
    });

  return new Response(
    JSON.stringify({
      fileResponse: await checkFile(domain, file),
      hsts: targetHSTS,
      file: file,
      domain: domain,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
