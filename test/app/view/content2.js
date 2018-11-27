KISSY.add("app/view/content2", S => {
  const View = Magix.View;

  return View.extend({
      tmpl: ($$,$viewId)=>{let $g='',$_temp,$p='',$em={'&':'amp','<':'lt','>':'gt','"':'#34','\'':'#39','`':'#96'},$er=/[&<>"'`]/g,$n=v=>''+(v==null?'':v),$ef=m=>`&${$em[m]};`,$e=v=>$n(v).replace($er,$ef),$um={'!':'%21','\'':'%27','(':'%28',')':'%29','*':'%2A'},$uf=m=>$um[m],$uq=/[!')(*]/g,$eu=v=>encodeURIComponent($n(v)).replace($uq,$uf),$qr=/[\\'"]/g,$eq=v=>$n(v).replace($qr,'\\$&');$p+='<div mxv>content2 <input mxs="subwayb:c" type="button" class="btn" value="提交" mx-click="'+$viewId+'submit({num:2})"></div>';return $p},
      init() {
          this.updater.digest();
          this.owner.fire('content2mounted');
          setTimeout(() => {
            if (!isMagix3) {
              this.setViewHTML('<p>1111</p>');
            }
            
            this.owner.fire('content2html');
          }, 1000);

          if (isMagix3Shim) {
            setTimeout(() => {
              this.postMessageTo('mx_64', {
                action: 'reload',
                param: 1
              });
              this.owner.fire('content2postmessage');
            }, 2000);
          }
      },
      'submit<click>'(e) {
        const num = +e.params.num;
        const me = e.view;
        me.owner.num = num;
      }
  });
});
