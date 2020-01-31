export default {
  join: (...args) => {
    const separator = "/";
    args = args.map((part, index) => {
      if (index) {
        part = part.replace(new RegExp("^" + separator), "");
      }
      if (index !== args.length - 1) {
        part = part.replace(new RegExp(separator + "$"), "");
      }
      return part;
    });
    return args.join(separator);
  }
};
