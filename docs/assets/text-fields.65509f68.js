import{f as p,a as s,g as t,K as a,i as h}from"./vendor.b2c83758.js";import{E as f,a3 as V,h as n,s as b,a4 as x,a2 as y,G as T,C as _,J as d}from"./index.900ff698.js";import{D as o}from"./DocsSection.b754179a.js";function S(l){return typeof l=="function"||Object.prototype.toString.call(l)==="[object Object]"&&!h(l)}var g=p({setup(){const l=s(""),e=s("md"),i=s("flat"),u=s(!1),r=s(!1),m=s({}),c=s(100);return{text1:l,size:e,variant:i,disabled:u,readonly:r,typedInputs:m,num:c}},render(){let l;return t("div",{class:"pg-docs-components-icons"},[t(f,null,{default:()=>[a("Text fields")]}),t(o,{title:"Basic"},{default:()=>[t("div",null,[`${typeof this.num} ${this.num}`]),t("button",{type:"button",onClick:e=>{this.text1="\u3042\u3042\u3042"}},[a("xxxxx")]),t(V,{label:"\u6570\u5B57\u5165\u529B",modelValue:this.num,"onUpdate:modelValue":e=>this.num=e},null),t(n,{label:"\u6C0F\u540D",modelValue:this.text1,"onUpdate:modelValue":e=>this.text1=e,required:!0,hint:"\u3053\u308C\u306F\u5165\u529B\u30D2\u30F3\u30C8\u30C6\u30AD\u30B9\u30C8\u3067\u3059\u3002",counter:!0,maxlength:"10",endAdornment:t(b,{name:"mdi-access-point"},null)},{error:e=>{if(e.name==="required")return"\u5FC5\u9808\u9805\u76EE\u3067\u3059\u3002"}})]}),t(o,{title:"Types"},S(l=x.map(e=>t("div",null,[t(n,{label:e,type:e,modelValue:this.typedInputs[e],"onUpdate:modelValue":i=>this.typedInputs[e]=i,required:!0,hint:"This is hint."},null),t("div",null,[this.typedInputs[e]])])))?l:{default:()=>[l]}),t(o,{title:"Styles"},{default:()=>[t("div",{class:"pg-columns"},[t("div",{class:"pg-columns__main"},[y.map(e=>t(n,{label:e,required:!0,placeholder:"\u30D7\u30EC\u30FC\u30B9\u30DB\u30EB\u30C0\u30FC",hint:"\u3053\u308C\u306F\u5165\u529B\u30D2\u30F3\u30C8\u30C6\u30AD\u30B9\u30C8\u3067\u3059\u3002",counter:!0,maxlength:"10",size:this.size,disabled:this.disabled,readonly:this.readonly,variant:e},null))]),t("div",{class:"pg-columns__sub"},[t(T,{label:"size",size:"sm",modelValue:this.size,"onUpdate:modelValue":e=>this.size=e,items:_.map(e=>({value:e,label:e}))},null),t(d,{size:"sm",modelValue:this.disabled,"onUpdate:modelValue":e=>this.disabled=e},{default:()=>[a("Disabled")]}),t(d,{size:"sm",modelValue:this.readonly,"onUpdate:modelValue":e=>this.readonly=e},{default:()=>[a("Readonly")]})])])]})])}});export{g as default};
