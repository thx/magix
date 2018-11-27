KISSY.add("app/view/p2", function (S) {
    const View = Magix.View;

    return View.extend({
        tmpl: ($$,$viewId)=>{let $g='',$_temp,$p='',$em={'&':'amp','<':'lt','>':'gt','"':'#34','\'':'#39','`':'#96'},$er=/[&<>"'`]/g,$n=v=>''+(v==null?'':v),$ef=m=>`&${$em[m]};`,$e=v=>$n(v).replace($er,$ef),$um={'!':'%21','\'':'%27','(':'%28',')':'%29','*':'%2A'},$uf=m=>$um[m],$uq=/[!')(*]/g,$eu=v=>encodeURIComponent($n(v)).replace($uq,$uf),$qr=/[\\'"]/g,$eq=v=>$n(v).replace($qr,'\\$&');$p+='<div mxs="subwayb:a">p111</div>';return $p},
        events: {
            click: {
                a: function () {
                    return 'a2'
                },
                d: function () {
                    return 'd2'
                }
            }
        }
    });
});
