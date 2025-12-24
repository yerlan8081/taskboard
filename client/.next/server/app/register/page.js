(()=>{var e={};e.id=11,e.ids=[11],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},5201:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>n.a,__next_app__:()=>p,originalPathname:()=>c,pages:()=>d,routeModule:()=>m,tree:()=>u}),r(7203),r(4752),r(5866);var s=r(3191),a=r(8716),i=r(7922),n=r.n(i),o=r(5231),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);r.d(t,l);let u=["",{children:["register",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,7203)),"D:\\code\\MEAN\\FinalProjectMERN2\\taskboard\\client\\app\\register\\page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,4752)),"D:\\code\\MEAN\\FinalProjectMERN2\\taskboard\\client\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,5866,23)),"next/dist/client/components/not-found-error"]}],d=["D:\\code\\MEAN\\FinalProjectMERN2\\taskboard\\client\\app\\register\\page.tsx"],c="/register/page",p={require:r,loadChunk:()=>Promise.resolve()},m=new s.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/register/page",pathname:"/register",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:u}})},8539:(e,t,r)=>{Promise.resolve().then(r.bind(r,9083))},1679:(e,t,r)=>{Promise.resolve().then(r.bind(r,1472))},1961:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,2994,23)),Promise.resolve().then(r.t.bind(r,6114,23)),Promise.resolve().then(r.t.bind(r,9727,23)),Promise.resolve().then(r.t.bind(r,9671,23)),Promise.resolve().then(r.t.bind(r,1868,23)),Promise.resolve().then(r.t.bind(r,4759,23))},9083:(e,t,r)=>{"use strict";r.d(t,{Providers:()=>c});var s=r(326),a=r(9592),i=r(7577),n=r(4179),o=r(8164),l=(r(4308),r(8325)),u=r(126),d=(r(8809),r(5653));function c({children:e}){let t=(0,d.t)(e=>e.token);(0,d.t)(e=>e.hydrateFromStorage),(0,d.t)(e=>e.hydrated);let r=(0,i.useMemo)(()=>(function(e){let t=process.env.NEXT_PUBLIC_GRAPHQL_HTTP||"http://localhost:4000/graphql";process.env.NEXT_PUBLIC_GRAPHQL_WS||t.replace(/^http/,"ws");let r=(0,n.L)({uri:t}),s=new o.i((t,r)=>(e&&t.setContext(({headers:t={}})=>({headers:{...t,Authorization:`Bearer ${e}`}})),r?r(t):null)).concat(r);return new l.f({link:s,cache:new u.h})})(t),[t]);return s.jsx(a.e,{client:r,children:e})}},1472:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>d});var s=r(326),a=r(8466),i=r(434),n=r(5047),o=r(7577),l=r(8977),u=r(5653);function d(){let e=(0,n.useRouter)();(0,u.t)(e=>e.token);let t=(0,u.t)(e=>e.setToken),r=(0,u.t)(e=>e.setUser),[d,c]=(0,o.useState)(""),[p,m]=(0,o.useState)(""),[x,h]=(0,o.useState)(""),[b,g]=(0,o.useState)(""),[v,f]=(0,o.useState)(null),[y,{loading:P}]=(0,a.D)(l.Nz,{onCompleted:s=>{let a=s?.register;a?.token&&(t(a.token),r(a.user),e.push("/boards"))},onError:e=>{f(e.message)}});return(0,s.jsxs)("main",{className:"w-full max-w-xl space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-10 shadow-2xl backdrop-blur",children:[(0,s.jsxs)("header",{className:"space-y-2",children:[s.jsx("p",{className:"text-xs uppercase tracking-[0.35em] text-amber-300",children:"Taskboard"}),s.jsx("h1",{className:"text-3xl font-semibold text-white",children:"Register"}),s.jsx("p",{className:"text-sm text-slate-400",children:"Create an account to start using Taskboard."})]}),(0,s.jsxs)("form",{onSubmit:e=>{if(e.preventDefault(),d.trim().length<2){f("Name should be at least 2 characters");return}if(!p.includes("@")){f("Please enter a valid email");return}if(x.length<6){f("Password must be at least 6 characters");return}if(x!==b){f("Passwords do not match");return}f(null),y({variables:{input:{name:d.trim(),email:p.trim(),password:x}}})},className:"space-y-4",children:[(0,s.jsxs)("div",{className:"space-y-2",children:[s.jsx("label",{className:"text-sm text-slate-300",children:"Name"}),s.jsx("input",{value:d,onChange:e=>c(e.target.value),className:"w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-amber-400 focus:outline-none",type:"text",placeholder:"Your name",required:!0})]}),(0,s.jsxs)("div",{className:"space-y-2",children:[s.jsx("label",{className:"text-sm text-slate-300",children:"Email"}),s.jsx("input",{value:p,onChange:e=>m(e.target.value),className:"w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-amber-400 focus:outline-none",type:"email",placeholder:"you@example.com",required:!0})]}),(0,s.jsxs)("div",{className:"space-y-2",children:[s.jsx("label",{className:"text-sm text-slate-300",children:"Password"}),s.jsx("input",{value:x,onChange:e=>h(e.target.value),className:"w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-amber-400 focus:outline-none",type:"password",placeholder:"At least 6 characters",required:!0})]}),(0,s.jsxs)("div",{className:"space-y-2",children:[s.jsx("label",{className:"text-sm text-slate-300",children:"Confirm Password"}),s.jsx("input",{value:b,onChange:e=>g(e.target.value),className:"w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-amber-400 focus:outline-none",type:"password",placeholder:"Repeat password",required:!0})]}),v&&s.jsx("p",{className:"text-sm text-red-300",children:v}),s.jsx("button",{type:"submit",disabled:P,className:"w-full rounded-xl bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60",children:P?"Registering...":"Register"})]}),(0,s.jsxs)("div",{className:"text-sm text-slate-400",children:["Already have an account?"," ",s.jsx(i.default,{href:"/login",className:"text-amber-300 hover:text-amber-200",children:"Go to login"})]})]})}},8977:(e,t,r)=>{"use strict";r.d(t,{$E:()=>x,Bv:()=>c,Jn:()=>o,Nz:()=>i,V_:()=>d,XB:()=>u,Z8:()=>m,ew:()=>p,mL:()=>n,sY:()=>l,ym:()=>a});var s=r(4293);let a=(0,s.Ps)`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
        status
      }
    }
  }
`,i=(0,s.Ps)`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
        status
      }
    }
  }
`;(0,s.Ps)`
  query Me {
    me {
      id
      email
      name
      role
      status
    }
  }
`;let n=(0,s.Ps)`
  query Boards {
    boards {
      id
      title
      visibility
    }
  }
`,o=(0,s.Ps)`
  query Board($id: ID!) {
    board(id: $id) {
      id
      title
      visibility
      ownerId
    }
  }
`,l=(0,s.Ps)`
  query Lists($boardId: ID!) {
    lists(boardId: $boardId) {
      id
      title
      order
      color
    }
  }
`,u=(0,s.Ps)`
  query Tasks($listId: ID!) {
    tasks(listId: $listId) {
      id
      listId
      title
      description
      status
      priority
      tags
    }
  }
`;(0,s.Ps)`
  query Task($id: ID!) {
    task(id: $id) {
      id
      listId
      title
      description
      status
      priority
      tags
      assigneeId
      dueDate
    }
  }
`;let d=(0,s.Ps)`
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id
      title
      visibility
    }
  }
`,c=(0,s.Ps)`
  mutation CreateList($input: CreateListInput!) {
    createList(input: $input) {
      id
      title
      order
      boardId
    }
  }
`,p=(0,s.Ps)`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      listId
      status
      priority
      tags
    }
  }
`,m=(0,s.Ps)`
  mutation UpdateTaskStatus($id: ID!, $status: TaskStatus!) {
    updateTaskStatus(id: $id, status: $status) {
      id
      title
      listId
      status
      priority
      tags
    }
  }
`,x=(0,s.Ps)`
  subscription TaskUpdated($boardId: ID!) {
    taskUpdated(boardId: $boardId) {
      type
      task {
        id
        listId
        title
        status
        priority
        tags
      }
    }
  }
`},5047:(e,t,r)=>{"use strict";var s=r(7389);r.o(s,"useParams")&&r.d(t,{useParams:function(){return s.useParams}}),r.o(s,"useRouter")&&r.d(t,{useRouter:function(){return s.useRouter}})},5653:(e,t,r)=>{"use strict";r.d(t,{t:()=>s});let s=(0,r(114).Ue)(e=>({token:null,user:null,hydrated:!1,setToken:t=>{e({token:t})},setUser:t=>{e({user:t})},clearAuth:()=>{e({token:null,user:null})},hydrateFromStorage:()=>{}}))},4752:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>d,metadata:()=>u});var s=r(9510);r(7272);var a=r(8570);let i=(0,a.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\providers.tsx`),{__esModule:n,$$typeof:o}=i;i.default;let l=(0,a.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\providers.tsx#Providers`),u={title:"Taskboard",description:"Taskboard phase 0 skeleton"};function d({children:e}){return s.jsx("html",{lang:"en",children:s.jsx("body",{className:"min-h-screen",children:s.jsx(l,{children:s.jsx("div",{className:"flex min-h-screen items-center justify-center px-6 py-10",children:e})})})})}},7203:(e,t,r)=>{"use strict";r.r(t),r.d(t,{$$typeof:()=>n,__esModule:()=>i,default:()=>o});var s=r(8570);let a=(0,s.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\register\page.tsx`),{__esModule:i,$$typeof:n}=a;a.default;let o=(0,s.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\register\page.tsx#default`)},7272:()=>{},4251:(e,t,r)=>{"use strict";r.d(t,{L:()=>a});var s=r(6126),a=r(1047).Nq?s.useLayoutEffect:s.useEffect},8466:(e,t,r)=>{"use strict";r.d(t,{D:()=>p});var s=r(5826),a=r(6126),i=r(4837),n=r(208),o=r(6049),l=r(7267),u=r(8571),d=r(4251),c=r(6127);function p(e,t){!1!==globalThis.__DEV__&&(0,c.G)(t||{},"ignoreResults","useMutation","If you don't want to synchronize component state with the mutation, please use the `useApolloClient` hook to get the client instance and call `client.mutate` directly.");var r=(0,u.x)(null==t?void 0:t.client);(0,o.Vp)(e,o.n_.Mutation);var p=a.useState({called:!1,loading:!1,client:r}),m=p[0],x=p[1],h=a.useRef({result:m,mutationId:0,isMounted:!0,client:r,mutation:e,options:t});(0,d.L)(function(){Object.assign(h.current,{client:r,options:t,mutation:e})});var b=a.useCallback(function(e){void 0===e&&(e={});var t=h.current,r=t.options,a=t.mutation,o=(0,s.pi)((0,s.pi)({},r),{mutation:a}),u=e.client||h.current.client;h.current.result.loading||o.ignoreResults||!h.current.isMounted||x(h.current.result={loading:!0,error:void 0,data:void 0,called:!0,client:u});var d=++h.current.mutationId,c=(0,i.J)(o,e);return u.mutate(c).then(function(t){var r,s,a=t.data,i=t.errors,o=i&&i.length>0?new l.cA({graphQLErrors:i}):void 0,p=e.onError||(null===(r=h.current.options)||void 0===r?void 0:r.onError);if(o&&p&&p(o,c),d===h.current.mutationId&&!c.ignoreResults){var m={called:!0,loading:!1,data:a,error:o,client:u};h.current.isMounted&&!(0,n.D)(h.current.result,m)&&x(h.current.result=m)}var b=e.onCompleted||(null===(s=h.current.options)||void 0===s?void 0:s.onCompleted);return o||null==b||b(t.data,c),t},function(t){if(d===h.current.mutationId&&h.current.isMounted){var r,s={loading:!1,error:t,data:void 0,called:!0,client:u};(0,n.D)(h.current.result,s)||x(h.current.result=s)}var a=e.onError||(null===(r=h.current.options)||void 0===r?void 0:r.onError);if(a)return a(t,c),{data:void 0,errors:t};throw t})},[]),g=a.useCallback(function(){if(h.current.isMounted){var e={called:!1,loading:!1,client:h.current.client};Object.assign(h.current,{mutationId:0,result:e}),x(e)}},[]);return a.useEffect(function(){var e=h.current;return e.isMounted=!0,function(){e.isMounted=!1}},[]),[b,(0,s.pi)({reset:g},m)]}}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[708,251],()=>r(5201));module.exports=s})();