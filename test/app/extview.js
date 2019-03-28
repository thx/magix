KISSY.add("app/extview", (S, Magix) => {
  S.mix(Magix.View.prototype, {
    setViewPagelet () {}
  });
}, { requires: ["magix"] })