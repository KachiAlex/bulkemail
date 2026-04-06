(async () => {
  const url = 'https://pandicrm.onrender.com/api/auth/register';
  const origin = 'https://pandicrm.netlify.app';

  const toObj = (headers) => Object.fromEntries([...headers.entries()]);

  try {
    console.log('---OPTIONS---');
    const opt = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization'
      }
    });
    console.log('Status:', opt.status);
    console.log('Headers:', toObj(opt.headers));
  } catch (e) {
    console.error('OPTIONS Error:', e.message);
  }

  try {
    console.log('\n---POST---');
    const post = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({ email: 'cors-test+node@pandicrm.test', password: 'Passw0rd!' })
    });
    console.log('Status:', post.status);
    console.log('Headers:', toObj(post.headers));
    const text = await post.text();
    console.log('Body:', text.slice(0, 2000));
  } catch (e) {
    console.error('POST Error:', e.message);
  }

  try {
    console.log('\n---HEAD /api---');
    const head = await fetch('https://pandicrm.onrender.com/api', { method: 'HEAD', headers: { Origin: origin } });
    console.log('Status:', head.status);
    console.log('Headers:', toObj(head.headers));
  } catch (e) {
    console.error('HEAD Error:', e.message);
  }
})();
