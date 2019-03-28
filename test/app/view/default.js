KISSY.add("app/view/default", (S, View) => {
    const $ = S.all;

    return View.extend({
        tmpl: ($$,$viewId)=>{let $g='',$_temp,$p='',$em={'&':'amp','<':'lt','>':'gt','"':'#34','\'':'#39','`':'#96'},$er=/[&<>"'`]/g,$n=v=>''+(v==null?'':v),$ef=m=>`&${$em[m]};`,$e=v=>$n(v).replace($er,$ef),$um={'!':'%21','\'':'%27','(':'%28',')':'%29','*':'%2A'},$uf=m=>$um[m],$uq=/[!')(*]/g,$eu=v=>encodeURIComponent($n(v)).replace($uq,$uf),$qr=/[\\'"]/g,$eq=v=>$n(v).replace($qr,'\\$&');$p+='<div>Updater Demo<div mxs="subway_:b" id="mx_64" mx-view="app/view/content1"></div><div mxs="subway_:c" id="mx_65" mx-view="app/view/content2"></div><span mxa="subway_:_" id="loc-param">'+$e( $$.locparam)+'</span><span mxa="subway_:a" id="state-param">'+$e( $$.stateparam)+'</span></div>';return $p},
        init() {
            this.updater.set({
                locparam: 'loc',
                stateparam: 'state'
            }).digest();
            this.observeLocation('locparam');
            this.observeState('stateparam');
            Magix.Vframe.fire('mounted');
            this.owner.fire('mounted');
        },
        render() {
            try {
                const loc = Magix.Router.parse();
                const locParam = Magix.State.get('locparam') || loc.get('locparam') || 'loc';
                const stateParam = Magix.State.get('stateparam') || loc.get('stateparam') || 'state';
        
                this.updater.set({
                    locparam: locParam,
                    stateparam: stateParam
                }).digest();
                this.owner.fire('canTest');
            } catch (err) {
                throw err;
            }
        },
        'fold<click>'(e) {
            console.log('xx');
        },
        events: {
            click: {
                a() {
                    return 'a0'
                }
            }
        }
    });
}, {
    requires: [
        'app/view/p1'
    ]
});
