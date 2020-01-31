function rgb2hsv(r255, g255, b255) {
  const [r, g, b] = [r255, g255, b255].map(i => i / 255);
  let v = Math.max(r, g, b),
    n = v - Math.min(r, g, b);
  let h =
    n && (v == r ? (g - b) / n : v == g ? 2 + (b - r) / n : 4 + (r - g) / n);
  return [60 * (h < 0 ? h + 6 : h), v && n / v, v];
}

const toMatrix = (arr, width) =>
  arr.reduce(
    (rows, key, index) =>
      (index % width == 0
        ? rows.push([key])
        : rows[rows.length - 1].push(key)) && rows,
    []
  );

const mean = matrix =>
  matrix
    .reduce((acc, cur) => {
      cur.forEach((e, i) => (acc[i] = acc[i] ? acc[i] + e : e));
      return acc;
    }, [])
    .map(e => e / matrix.length);

const meanColor = (image, size = 10) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, size, size);
  const matrix = toMatrix(ctx.getImageData(0, 0, size, size).data, 4);
  const rgb = mean(matrix);
  return { rgb, hsv: rgb2hsv(...rgb) };
};

export default meanColor;
export { rgb2hsv };
