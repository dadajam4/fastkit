export function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = document.createElement('img');
    image.onload = () => {
      resolve(image);
    };
    image.onerror = (ev) => {
      reject(ev);
    };
    image.src = url;
  });
}
