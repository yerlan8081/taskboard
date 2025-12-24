(()=>{var e={};e.id=822,e.ids=[822],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},5646:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>n.a,__next_app__:()=>p,originalPathname:()=>c,pages:()=>u,routeModule:()=>m,tree:()=>d}),r(7223),r(4752),r(5866);var s=r(3191),a=r(8716),i=r(7922),n=r.n(i),o=r(5231),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);r.d(t,l);let d=["",{children:["boards",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,7223)),"D:\\code\\MEAN\\FinalProjectMERN2\\taskboard\\client\\app\\boards\\page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,4752)),"D:\\code\\MEAN\\FinalProjectMERN2\\taskboard\\client\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,5866,23)),"next/dist/client/components/not-found-error"]}],u=["D:\\code\\MEAN\\FinalProjectMERN2\\taskboard\\client\\app\\boards\\page.tsx"],c="/boards/page",p={require:r,loadChunk:()=>Promise.resolve()},m=new s.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/boards/page",pathname:"/boards",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},1058:(e,t,r)=>{Promise.resolve().then(r.bind(r,5715))},8539:(e,t,r)=>{Promise.resolve().then(r.bind(r,9083))},1961:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,2994,23)),Promise.resolve().then(r.t.bind(r,6114,23)),Promise.resolve().then(r.t.bind(r,9727,23)),Promise.resolve().then(r.t.bind(r,9671,23)),Promise.resolve().then(r.t.bind(r,1868,23)),Promise.resolve().then(r.t.bind(r,4759,23))},5715:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>u});var s=r(326),a=r(1615),i=r(8466),n=r(434);r(7577);var o=r(5047),l=r(8977),d=r(5653);function u(){let e=(0,d.t)(e=>e.token);(0,d.t)(e=>e.setToken);let t=(0,d.t)(e=>e.clearAuth),r=(0,o.useRouter)(),{data:u,loading:c,error:p,refetch:m}=(0,a.aM)(l.mL,{skip:!e}),[x,{loading:b,error:h}]=(0,i.D)(l.V_,{onCompleted:()=>m()}),g=async e=>{let t=String(e.get("title")||"").trim();t&&await x({variables:{input:{title:t,visibility:"PRIVATE"}}})};return e?(0,s.jsxs)("main",{className:"w-full max-w-4xl space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-10 shadow-2xl backdrop-blur",children:[(0,s.jsxs)("header",{className:"flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",children:[(0,s.jsxs)("div",{children:[s.jsx("p",{className:"text-xs uppercase tracking-[0.35em] text-amber-300",children:"Boards"}),s.jsx("h1",{className:"text-3xl font-semibold text-white",children:"Your boards"})]}),(0,s.jsxs)("div",{className:"flex items-center gap-3 text-sm",children:[s.jsx(n.default,{href:"/dashboard",className:"text-amber-300 hover:text-amber-200",children:"Dashboard"}),s.jsx(n.default,{href:"/profile",className:"text-amber-300 hover:text-amber-200",children:"View profile"}),s.jsx("button",{onClick:()=>{t(),r.replace("/login")},className:"rounded-lg border border-white/20 px-3 py-1 text-slate-200 hover:border-amber-400",children:"Logout"})]})]}),(0,s.jsxs)("form",{action:g,className:"flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center",children:[s.jsx("input",{name:"title",placeholder:"New board title",className:"w-full rounded-xl border border-white/10 bg-slate-800/50 px-3 py-2 text-white focus:border-amber-400 focus:outline-none",required:!0}),s.jsx("button",{type:"submit",disabled:b,className:"rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60",children:b?"Creating...":"Create board"})]}),h&&s.jsx("p",{className:"text-sm text-red-300",children:h.message}),p&&s.jsx("p",{className:"text-sm text-red-300",children:p.message}),(0,s.jsxs)("section",{className:"space-y-3",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[s.jsx("h2",{className:"text-xl font-semibold text-white",children:"Board list"}),c&&s.jsx("span",{className:"text-xs text-slate-400",children:"Loading..."})]}),u?.boards?.length?s.jsx("div",{className:"grid gap-4 md:grid-cols-2",children:u.boards.map(e=>(0,s.jsxs)(n.default,{href:`/boards/${e.id}`,className:"rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[s.jsx("p",{className:"text-lg font-semibold text-white",children:e.title}),s.jsx("span",{className:"rounded bg-slate-800 px-2 py-0.5 text-xs uppercase text-amber-200",children:e.visibility})]}),(0,s.jsxs)("p",{className:"text-xs text-slate-400",children:["ID: ",e.id]})]},e.id))}):s.jsx("p",{className:"text-sm text-slate-400",children:"No boards yet."})]})]}):(0,s.jsxs)("main",{className:"w-full max-w-3xl space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-10 shadow-2xl backdrop-blur",children:[s.jsx("p",{className:"text-sm text-slate-300",children:"Please login to view boards."}),s.jsx(n.default,{className:"text-amber-300 hover:text-amber-200",href:"/login",children:"Go to login"})]})}},9083:(e,t,r)=>{"use strict";r.d(t,{Providers:()=>c});var s=r(326),a=r(9592),i=r(7577),n=r(4179),o=r(8164),l=(r(4308),r(8325)),d=r(126),u=(r(8809),r(5653));function c({children:e}){let t=(0,u.t)(e=>e.token);(0,u.t)(e=>e.hydrateFromStorage),(0,u.t)(e=>e.hydrated);let r=(0,i.useMemo)(()=>(function(e){let t=process.env.NEXT_PUBLIC_GRAPHQL_HTTP||"http://localhost:4000/graphql";process.env.NEXT_PUBLIC_GRAPHQL_WS||t.replace(/^http/,"ws");let r=(0,n.L)({uri:t}),s=new o.i((t,r)=>(e&&t.setContext(({headers:t={}})=>({headers:{...t,Authorization:`Bearer ${e}`}})),r?r(t):null)).concat(r);return new l.f({link:s,cache:new d.h})})(t),[t]);return s.jsx(a.e,{client:r,children:e})}},8977:(e,t,r)=>{"use strict";r.d(t,{$E:()=>x,Bv:()=>c,Jn:()=>o,Nz:()=>i,V_:()=>u,XB:()=>d,Z8:()=>m,ew:()=>p,mL:()=>n,sY:()=>l,ym:()=>a});var s=r(4293);let a=(0,s.Ps)`
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
`,d=(0,s.Ps)`
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
`;let u=(0,s.Ps)`
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
`},5047:(e,t,r)=>{"use strict";var s=r(7389);r.o(s,"useParams")&&r.d(t,{useParams:function(){return s.useParams}}),r.o(s,"useRouter")&&r.d(t,{useRouter:function(){return s.useRouter}})},5653:(e,t,r)=>{"use strict";r.d(t,{t:()=>s});let s=(0,r(114).Ue)(e=>({token:null,user:null,hydrated:!1,setToken:t=>{e({token:t})},setUser:t=>{e({user:t})},clearAuth:()=>{e({token:null,user:null})},hydrateFromStorage:()=>{}}))},7223:(e,t,r)=>{"use strict";r.r(t),r.d(t,{$$typeof:()=>n,__esModule:()=>i,default:()=>o});var s=r(8570);let a=(0,s.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\boards\page.tsx`),{__esModule:i,$$typeof:n}=a;a.default;let o=(0,s.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\boards\page.tsx#default`)},4752:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>u,metadata:()=>d});var s=r(9510);r(7272);var a=r(8570);let i=(0,a.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\providers.tsx`),{__esModule:n,$$typeof:o}=i;i.default;let l=(0,a.createProxy)(String.raw`D:\code\MEAN\FinalProjectMERN2\taskboard\client\app\providers.tsx#Providers`),d={title:"Taskboard",description:"Taskboard phase 0 skeleton"};function u({children:e}){return s.jsx("html",{lang:"en",children:s.jsx("body",{className:"min-h-screen",children:s.jsx(l,{children:s.jsx("div",{className:"flex min-h-screen items-center justify-center px-6 py-10",children:e})})})})}},7272:()=>{},4251:(e,t,r)=>{"use strict";r.d(t,{L:()=>a});var s=r(6126),a=r(1047).Nq?s.useLayoutEffect:s.useEffect},8466:(e,t,r)=>{"use strict";r.d(t,{D:()=>p});var s=r(5826),a=r(6126),i=r(4837),n=r(208),o=r(6049),l=r(7267),d=r(8571),u=r(4251),c=r(6127);function p(e,t){!1!==globalThis.__DEV__&&(0,c.G)(t||{},"ignoreResults","useMutation","If you don't want to synchronize component state with the mutation, please use the `useApolloClient` hook to get the client instance and call `client.mutate` directly.");var r=(0,d.x)(null==t?void 0:t.client);(0,o.Vp)(e,o.n_.Mutation);var p=a.useState({called:!1,loading:!1,client:r}),m=p[0],x=p[1],b=a.useRef({result:m,mutationId:0,isMounted:!0,client:r,mutation:e,options:t});(0,u.L)(function(){Object.assign(b.current,{client:r,options:t,mutation:e})});var h=a.useCallback(function(e){void 0===e&&(e={});var t=b.current,r=t.options,a=t.mutation,o=(0,s.pi)((0,s.pi)({},r),{mutation:a}),d=e.client||b.current.client;b.current.result.loading||o.ignoreResults||!b.current.isMounted||x(b.current.result={loading:!0,error:void 0,data:void 0,called:!0,client:d});var u=++b.current.mutationId,c=(0,i.J)(o,e);return d.mutate(c).then(function(t){var r,s,a=t.data,i=t.errors,o=i&&i.length>0?new l.cA({graphQLErrors:i}):void 0,p=e.onError||(null===(r=b.current.options)||void 0===r?void 0:r.onError);if(o&&p&&p(o,c),u===b.current.mutationId&&!c.ignoreResults){var m={called:!0,loading:!1,data:a,error:o,client:d};b.current.isMounted&&!(0,n.D)(b.current.result,m)&&x(b.current.result=m)}var h=e.onCompleted||(null===(s=b.current.options)||void 0===s?void 0:s.onCompleted);return o||null==h||h(t.data,c),t},function(t){if(u===b.current.mutationId&&b.current.isMounted){var r,s={loading:!1,error:t,data:void 0,called:!0,client:d};(0,n.D)(b.current.result,s)||x(b.current.result=s)}var a=e.onError||(null===(r=b.current.options)||void 0===r?void 0:r.onError);if(a)return a(t,c),{data:void 0,errors:t};throw t})},[]),g=a.useCallback(function(){if(b.current.isMounted){var e={called:!1,loading:!1,client:b.current.client};Object.assign(b.current,{mutationId:0,result:e}),x(e)}},[]);return a.useEffect(function(){var e=b.current;return e.isMounted=!0,function(){e.isMounted=!1}},[]),[h,(0,s.pi)({reset:g},m)]}}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[708,251,615],()=>r(5646));module.exports=s})();