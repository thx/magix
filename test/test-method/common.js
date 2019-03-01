function iniMagix() {
  return new Promise(resolve => {
    const magixPath = isMagix1 ? 'magix/magix, magix/vframe, magix/router, magix/event' : 'magix';

    KISSY.use(magixPath + ', sizzle', (S, M, Vframe, Router, Event) => {
      if (isMagix1) {
        M.Vframe = Vframe;
        M.Router = Router;
        M.Event = Event;
      }

      window.Magix = M;
      resolve();
    });
  });
}