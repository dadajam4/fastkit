import{f as v,c,g as e,G as r,R as f,p as b,j as k}from"./vendor.9cbaf9a0.js";import{k as w,m as d,d as u,s as x,a as h,g as S,p as g,V,t as I,v as m,w as C}from"./index.00feedab.js";import{u as D}from"./composables.35cdd074.js";const A=v({name:"VDocsLayout",props:{title:{type:String,required:!0},home:{type:String,required:!0},package:[String,Object],github:String},setup(o,a){const i=D(),s=()=>i("lg"),n=c(()=>{let{package:t="fastkit"}=o;typeof t=="string"&&(t={name:t});const{name:l}=t,{displayName:p=l}=t,y=`https://github.com/dadajam4/fastkit${l==="fastkit"?"":`/tree/main/packages/${l}#readme`}`;return{name:l,displayName:p,github:y}});return()=>e(C,{class:"v-docs-layout",header:{fixed:!0},footer:{spacer:!0},drawerStatic:s},{header:({control:t})=>e(w,null,{default:()=>[!t.drawerIsStatic&&e(d,{edge:"start",class:"mr-0"},{default:()=>[e(u,{icon:"mdi-menu",size:"lg",rounded:!0,onClick:()=>{t.toggleDrawer()}},null)]}),!t.drawerIsStatic&&e(x,{to:"/",class:"v-docs-layout__home"},{default:()=>[e(h,{class:"v-docs-layout__home__icon",src:"/logo.svg",alt:"",width:24,height:24},null),e("span",{class:"docs-theme-font v-docs-layout__home__label"},[r("fastkit")])]}),e(S,{style:{marginLeft:"auto"},hiddenInfo:!0,placeholder:`Search ${n.value.displayName}`,startAdornment:()=>e(g,{name:"mdi-magnify"},null)},null),e(d,{edge:"end",style:{marginLeft:"0"}},{default:()=>[e(u,{href:n.value.github,target:"_blank",title:n.value.name,rounded:!0,icon:"mdi-github",size:"lg"},null)]})]}),default:()=>e(V,null,{default:()=>[a.slots.default&&a.slots.default()]}),drawer:()=>e(I,{class:"v-docs-layout__drawer",color:"secondary"},{default:()=>[e(m,{caption:"\u672C\u4F53\u306B\u623B\u308B",items:[{key:"fastkit",label:"HOME",startIcon:"mdi-home",to:"/"}]},null),e(m,{caption:"\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8",items:[{key:"home",label:"HOME",to:"/vui",exactMatch:!0},{key:"test",label:"Test",to:"/vui/test",startIcon:"mdi-toggle-switch-off-outline",children:[{key:"child1",label:"child1",to:"/vui/test/child1"},{key:"child2",label:"child2",to:"/vui/test/child2",nested:!0,startIcon:"mdi-toggle-switch-off-outline",children:[{key:"index",label:"index",to:"/vui/test/child2",startIcon:"mdi-toggle-switch-off-outline"},{key:"child1",label:"child1",to:"/vui/test/child2/child1"}]}]},{key:"components",label:"Components",to:"/vui/components",startIcon:"mdi-toggle-switch-off-outline",children:[{key:"usage",label:"Usage",to:"/vui/components"},{key:"buttons",label:"Buttons",to:"/vui/components/buttons"},{key:"icons",label:"Icons",to:"/vui/components/icons"},{key:"loadings",label:"Loadings",to:"/vui/components/loadings"},{key:"avatars",label:"Avatars",to:"/vui/components/avatars"},{key:"chips",label:"Chips",to:"/vui/components/chips"},{key:"cards",label:"Cards",to:"/vui/components/cards"},{key:"text-fields",label:"Text fields",to:"/vui/components/text-fields"},{key:"textareas",label:"Textareas",to:"/vui/components/textareas"},{key:"wysiwygs",label:"Wysiwygs",to:"/vui/components/wysiwygs"},{key:"selects",label:"Selects",to:"/vui/components/selects"},{key:"checkboxes",label:"Checkboxes",to:"/vui/components/checkboxes"},{key:"radio-buttons",label:"Radio buttons",to:"/vui/components/radio-buttons"},{key:"switches",label:"Switches",to:"/vui/components/switches"},{key:"forms",label:"Forms",to:"/vui/components/forms"},{key:"pagination",label:"Pagination",to:"/vui/components/pagination"},{key:"data-tables",label:"Data tables",to:"/vui/components/data-tables"},{key:"tabs",label:"Tabs",to:"/vui/components/tabs"},{key:"breadcrumbs",label:"Breadcrumbs",to:"/vui/components/breadcrumbs"}]}]},null)],header:()=>e(f,{class:"v-docs-layout__drawer__header",to:"/"},{default:()=>[e(h,{class:"v-docs-layout__drawer__header__icon",src:"/logo.svg",alt:"",width:24,height:24},null),r("fastkit")]})})})}});const _=Symbol();function $(){return k(_,null)}function L(o){return b(_,o)}const T=/[\s\t\n\r]+/g,N=/[\!\?]/g;function M(o){return o.trim().toLowerCase().replace(T,"-").replace(N,"")}class B{constructor(a){const i=$();this.parent=i,this.settings=a,this._level=c(()=>{const s=a.level();if(s)return s;const n=i&&i.level();return n==null?2:n===4?4:n+1}),this._id=c(()=>{const s=i&&i.id(),n=s?`${s}_`:"";let t=a.id();return t||(t=M(a.title())),`${n}${t}`}),this.id=this.id.bind(this),this.level=this.level.bind(this)}id(){return this._id.value}level(){return this._level.value}}function E(o){const a=new B(o);return L(a),a}const q=v({name:"VDocsSection",props:{level:Number,title:{type:String,required:!0},id:String},setup(o,a){const{id:i,level:s}=E({level:()=>o.level,title:()=>o.title,id:()=>o.id}),n=`h${s()}`;return()=>e("section",{id:i(),class:["v-docs-section",`v-docs-section--${s()}`]},[e(n,{class:["v-docs-section__heading",`v-docs-section__heading--${s()}`]},{default:()=>[e("a",{class:"v-docs-section__heading__anchor",href:`#${i()}`},[e(g,{class:"v-docs-section__heading__anchor__icon",name:"mdi-link"},null)]),o.title]}),a.slots.default&&a.slots.default()])}});export{A as V,q as a};