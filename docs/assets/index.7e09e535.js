import{f as i,g as e,G as o,R as n}from"./vendor.9cbaf9a0.js";import{k as c,m as a,d as s,s as r,V as u,f as d,t as p,v as l,w as m}from"./index.00feedab.js";import{u as b}from"./composables.35cdd074.js";var f=i({setup(){return{mm:b()}},render(){return e(m,{class:"pg-vui-root",header:{fixed:!0},footer:{spacer:!0},drawerStatic:()=>this.mm("lg")},{header:({control:t})=>e(c,null,{default:()=>[!t.drawerIsStatic&&e(a,{edge:"start"},{default:()=>[e(s,{icon:"mdi-menu",size:"lg",onClick:()=>{t.toggleDrawer()}},null)]}),e(r,{to:"/vui"},{default:()=>[o("HOME")]}),e(a,{edge:"end"},{default:()=>[e(s,{icon:"mdi-account-circle",size:"lg"},null)]})]}),default:()=>e(u,null,{default:()=>[e(d,null,null)]}),drawer:()=>e(p,{color:"secondary"},{default:()=>[e(l,{caption:"\u672C\u4F53\u306B\u623B\u308B",items:[{key:"fastkit",label:"HOME",startIcon:"mdi-home",to:"/"}]},null),e(l,{caption:"\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8",items:[{key:"home",label:"HOME",to:"/vui",exactMatch:!0},{key:"test",label:"Test",to:"/vui/test",startIcon:"mdi-toggle-switch-off-outline",children:[{key:"child1",label:"child1",to:"/vui/test/child1"},{key:"child2",label:"child2",to:"/vui/test/child2",nested:!0,startIcon:"mdi-toggle-switch-off-outline",children:[{key:"index",label:"index",to:"/vui/test/child2",startIcon:"mdi-toggle-switch-off-outline"},{key:"child1",label:"child1",to:"/vui/test/child2/child1"}]}]},{key:"components",label:"Components",to:"/vui/components",startIcon:"mdi-toggle-switch-off-outline",children:[{key:"usage",label:"Usage",to:"/vui/components"},{key:"buttons",label:"Buttons",to:"/vui/components/buttons"},{key:"icons",label:"Icons",to:"/vui/components/icons"},{key:"loadings",label:"Loadings",to:"/vui/components/loadings"},{key:"avatars",label:"Avatars",to:"/vui/components/avatars"},{key:"chips",label:"Chips",to:"/vui/components/chips"},{key:"cards",label:"Cards",to:"/vui/components/cards"},{key:"text-fields",label:"Text fields",to:"/vui/components/text-fields"},{key:"textareas",label:"Textareas",to:"/vui/components/textareas"},{key:"wysiwygs",label:"Wysiwygs",to:"/vui/components/wysiwygs"},{key:"selects",label:"Selects",to:"/vui/components/selects"},{key:"checkboxes",label:"Checkboxes",to:"/vui/components/checkboxes"},{key:"radio-buttons",label:"Radio buttons",to:"/vui/components/radio-buttons"},{key:"switches",label:"Switches",to:"/vui/components/switches"},{key:"forms",label:"Forms",to:"/vui/components/forms"},{key:"pagination",label:"Pagination",to:"/vui/components/pagination"},{key:"data-tables",label:"Data tables",to:"/vui/components/data-tables"},{key:"tabs",label:"Tabs",to:"/vui/components/tabs"},{key:"breadcrumbs",label:"Breadcrumbs",to:"/vui/components/breadcrumbs"}]}]},null)],header:()=>e(n,{class:"pg-vui-root__header",to:"/vui"},{default:()=>[o("Vui")]})})})}});export{f as default};