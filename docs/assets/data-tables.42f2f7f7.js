import{f as h,g as s,G as o}from"./vendor.9cbaf9a0.js";import{H as d,z as g,Q as b,e as N,r as T}from"./index.00feedab.js";const c=N("vui-data-table-prefetch",async({getQuery:t})=>{const a=t("limit",Number,20),e=t("page",Number,1),i=(e-1)*a,n=236-i,u=n<1?0:Math.min(a,n);await new Promise(l=>setTimeout(l,1e3));const r=T(u,i+1).map(l=>({id:String(l),name:`\u9805\u76EE${l}`,test:"\u3053\u308C\u306F\u30C7\u30FC\u30BF\u3067\u3059",column1:"This is Nagai text. This is Nagai text.",column2:"This is Nagai text. This is Nagai text.",column3:"This is Nagai text. This is Nagai text.",column4:"This is Nagai text. This is Nagai text.",column5:"This is Nagai text. This is Nagai text."}));return{page:e,limit:a,items:r,total:236}});var p=h({prefetch:c,setup(){const t=c.inject();return{stack:d(),result:t,headers:[{key:"id",label:"ID",cell:e=>e.item.id,sortQuery:"id"},{key:"name",label:"\u540D\u524D",cell:e=>e.item.name},{key:"test",label:"\u30C6\u30B9\u30C8",cell:e=>e.item.test},{key:"column1",label:"Column1",cell:e=>e.item.column1},{key:"column2",label:"Column2",cell:e=>e.item.column2},{key:"column3",label:"Column3",cell:e=>e.item.column3},{key:"column4",label:"Column4",cell:e=>e.item.column4},{key:"column5",label:"Column5",cell:e=>e.item.column5}]}},render(){return s("div",{class:"pg-docs-components-icons"},[s(g,null,{default:()=>[o("Data tables")]}),s("h2",null,[o("Basic")]),s(b,{headers:this.headers,items:this.result.items,total:this.result.total,fixedHeader:!0},null)])}});export{p as default};