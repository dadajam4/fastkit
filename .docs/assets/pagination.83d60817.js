import{f as l,a as o,g as e,G as r}from"./vendor.9cbaf9a0.js";import{u,H as i,a1 as a}from"./index.9239fa07.js";import{D as n}from"./DocsSection.6aba4d47.js";var g=l({setup(){const t=o(1),s=u();return{page1:t,stack:s}},render(){return e("div",{class:"pg-docs-components-icons"},[e(i,null,{default:()=>[r("Pagination")]}),e(n,{title:"Basic"},{default:()=>[e(a,{length:"32",modelValue:this.page1,"onUpdate:modelValue":t=>this.page1=t},null),e("div",null,[`\u73FE\u5728 ${this.page1} \u30DA\u30FC\u30B8\u76EE\u3067\u3059`])]}),e(n,{title:"Dense"},{default:()=>[e(a,{dense:!0,length:"32"},null)]}),e(n,{title:"Routings"},{default:()=>[e(a,{dense:!0,length:"32",routeQuery:"page"},null)]}),e(n,{title:"Guard"},{default:()=>[e(a,{dense:!0,length:"32",beforeChange:async t=>{if(!await this.stack.confirm(`${t}\u30DA\u30FC\u30B8\u3078\u5909\u66F4\u3057\u3066\u826F\u3044\u3067\u3059\u304B\uFF1F`))return this.stack.alert("\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F"),!1}},null)]})])}});export{g as default};
