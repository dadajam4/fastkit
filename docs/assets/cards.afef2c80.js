import{f as u,a as r,g as l,L as e}from"./vendor.a37b5c2e.js";import{y as c,s as f,q as o,D as t,L as m,b as d,N as p}from"./index.b0592674.js";import{D as s}from"./DocsSection.01ad6050.js";var V=u({setup(){const i=c().options.colorScheme.scopeNames,n=r(!1);return{colors:i,disabled:n}},render(){return l("div",{class:"pg-docs-components-buttons"},[l(f,null,{default:()=>[e("Cards")]}),l(s,{title:"Basic"},{default:()=>[l(o,null,{default:()=>[l(t,null,{default:()=>[e("Hello world")]})]})]}),l(s,{title:"With actions"},{default:()=>[l(o,null,{default:()=>[l(t,null,{default:()=>[e("Hello world")]}),l(m,null,{default:()=>[l(d,{size:"sm",color:"accent",endIcon:"mdi-book"},{default:()=>[e("Book")]}),l(d,{size:"sm",endIcon:"mdi-cancel"},{default:()=>[e("Cancel")]}),l(d,{size:"sm",color:"primary",endIcon:"mdi-send",spacer:"left"},{default:()=>[e("Book")]})]})]})]}),l(s,{title:"Colors"},{default:()=>[l("div",null,[this.colors.map(a=>l(o,{color:a,style:{marginTop:"10px"}},{default:()=>[l(t,null,{default:()=>[e("Hello world")]})]}))])]}),l(s,{title:"Link & Clickable"},{default:()=>[l("div",null,[l(p,{modelValue:this.disabled,"onUpdate:modelValue":a=>this.disabled=a},{default:()=>[e("disabled")]}),l(o,{class:"my-2",href:"https://google.com",target:"_blank",disabled:this.disabled},{default:()=>[l(t,null,{default:()=>[e("This is link")]})]}),l(o,{class:"my-2",color:"primary",onClick:a=>{console.log(a)},disabled:this.disabled},{default:()=>[l(t,null,{default:()=>[e("Clickable")]})]})])]})])}});export{V as default};
