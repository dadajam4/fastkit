import{f as n,g as e,G as t,R as l}from"./vendor.9cbaf9a0.js";import{r as u,e as i}from"./index.00feedab.js";const r=i("xxx",async a=>{throw await new Promise(o=>setTimeout(o,10)),new Error("hoge")});var p=n({prefetch:r,setup(){return{hoge:r.inject()}},render(){return e("div",null,[e("h1",null,[t("Page2")]),e("div",null,[JSON.stringify(this.hoge)]),e("ul",null,[e("li",null,[e(l,{to:"/"},{default:()=>[t("Home")]})]),e("li",null,[e(l,{to:"/page2"},{default:()=>[t("page2")]})]),e("li",null,[e(l,{to:"/page3"},{default:()=>[t("page3")]})]),e("li",null,[e(l,{to:"/page3/child"},{default:()=>[t("page3/child")]})])]),u(100,1).map(a=>e("p",{key:a},[`This is Text.${a}`]))])}});export{p as default};