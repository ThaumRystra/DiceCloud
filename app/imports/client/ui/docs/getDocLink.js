export default function getDocLink(doc, urlName) {
  if (!urlName) urlName = doc.urlName;
  const address = ['/docs'];
  doc.ancestors?.forEach(a => {
    address.push(a.urlName);
  });
  address.push(urlName);
  return address.join('/');
}