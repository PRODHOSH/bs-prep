
export default function cloudinaryLoader({ src, width, quality }) {
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`].join(',');
  return `https://res.cloudinary.com/ddn6tl045/image/fetch/${params}/${encodeURIComponent(src)}`;
}
